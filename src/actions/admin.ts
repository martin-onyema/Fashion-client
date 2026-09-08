'use server'

/**
 * Admin server actions for all NEW entities introduced in the dashboard upgrade.
 *
 * Pattern (every action):
 *   1. requireStaffWithPermission(code)  — auth + RBAC
 *   2. Validate input (zod)
 *   3. DB transaction for multi-step ops
 *   4. auditLog({...})  — always write an audit trail
 *   5. revalidatePath(...)  — refresh affected pages
 *   6. Return { ok: true } | { ok: false, error: string }
 */
import { db } from '@/lib/db'
import { requireStaffWithPermission, requireStaff, requireSuperAdmin } from '@/lib/permissions'
import { auditLog, diffChangedFields, describeChanges } from '@/lib/audit'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/format'
import { Role } from '@prisma/client'
import { randomUUID } from 'crypto'
import type { SearchResult } from '@/lib/admin-search'

// ============================================================
// GLOBAL SEARCH
// ============================================================

const LIMIT_PER_TYPE = 5

/**
 * Search across all admin entities (products, orders, customers,
 * categories, brands, coupons, reviews). Returns a flat list of
 * results grouped by type, ready for the admin search overlay.
 *
 * Server action — cannot be imported directly by client components
 * without going through the 'use server' boundary.
 */
export async function adminSearch(query: string): Promise<SearchResult[]> {
  await requireStaff()
  const q = query.trim()
  if (q.length < 2) return []

  const [
    products,
    orders,
    customers,
    categories,
    brands,
    coupons,
    reviews,
  ] = await Promise.all([
    db.product.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { sku: { contains: q } },
          { slug: { contains: q } },
          { tags: { contains: q } },
        ],
      },
      take: LIMIT_PER_TYPE,
      select: { id: true, name: true, sku: true, slug: true, price: true, salePrice: true },
    }),
    db.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: q } },
          { customerName: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ],
      },
      take: LIMIT_PER_TYPE,
      select: { id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
    }),
    db.user.findMany({
      where: {
        role: 'CUSTOMER',
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ],
      },
      take: LIMIT_PER_TYPE,
      select: { id: true, name: true, email: true, phone: true },
    }),
    db.category.findMany({
      where: {
        OR: [{ name: { contains: q } }, { slug: { contains: q } }],
      },
      take: LIMIT_PER_TYPE,
      select: { id: true, name: true, slug: true },
    }),
    db.brand.findMany({
      where: {
        OR: [{ name: { contains: q } }, { slug: { contains: q } }],
      },
      take: LIMIT_PER_TYPE,
      select: { id: true, name: true, slug: true, country: true },
    }),
    db.coupon.findMany({
      where: { code: { contains: q } },
      take: LIMIT_PER_TYPE,
      select: { id: true, code: true, type: true, value: true, active: true },
    }),
    db.review.findMany({
      where: {
        OR: [
          { authorName: { contains: q } },
          { title: { contains: q } },
          { comment: { contains: q } },
        ],
      },
      take: LIMIT_PER_TYPE,
      include: { product: { select: { name: true } } },
    }),
  ])

  const results: SearchResult[] = []

  for (const p of products) {
    results.push({
      type: 'product',
      id: p.id,
      title: p.name,
      subtitle: `${p.sku} · ₦${(p.salePrice ?? p.price).toLocaleString()}`,
      href: `/admin/products/${p.id}`,
    })
  }
  for (const o of orders) {
    results.push({
      type: 'order',
      id: o.id,
      title: o.orderNumber,
      subtitle: `${o.customerName} · ₦${o.total.toLocaleString()} · ${o.status}`,
      href: `/admin/orders/${o.id}`,
    })
  }
  for (const c of customers) {
    results.push({
      type: 'customer',
      id: c.id,
      title: c.name ?? c.email,
      subtitle: `${c.email}${c.phone ? ` · ${c.phone}` : ''}`,
      href: `/admin/customers/${c.id}`,
    })
  }
  for (const c of categories) {
    results.push({
      type: 'category',
      id: c.id,
      title: c.name,
      subtitle: c.slug,
      href: `/admin/categories/${c.id}`,
    })
  }
  for (const b of brands) {
    results.push({
      type: 'brand',
      id: b.id,
      title: b.name,
      subtitle: b.country ?? b.slug,
      href: `/admin/brands/${b.id}`,
    })
  }
  for (const c of coupons) {
    results.push({
      type: 'coupon',
      id: c.id,
      title: c.code,
      subtitle: `${c.type} ${c.value}${c.active ? '' : ' · inactive'}`,
      href: `/admin/coupons/${c.id}`,
    })
  }
  for (const r of reviews) {
    results.push({
      type: 'review',
      id: r.id,
      title: r.title ?? `Rating: ${r.rating}★`,
      subtitle: `${r.authorName} on ${r.product.name}`,
      href: `/admin/reviews`,
    })
  }

  return results
}

// ============================================================
// CATEGORIES
// ============================================================

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  order: z.coerce.number().int().optional(),
  featured: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
})

export async function adminCreateCategory(input: Record<string, any>) {
  const user = await requireStaffWithPermission('category.manage')
  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const created = await db.category.create({
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name),
        description: data.description,
        parentId: data.parentId || null,
        image: data.image,
        order: data.order ?? 0,
        featured: data.featured ?? false,
        active: data.active ?? true,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'category.create',
      entityType: 'Category',
      entityId: created.id,
      after: { name: created.name, slug: created.slug },
      description: `Created category "${created.name}"`,
    })
    revalidatePath('/admin/categories')
    return { ok: true, id: created.id }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Could not create category' }
  }
}

export async function adminUpdateCategory(id: string, input: Record<string, any>) {
  const user = await requireStaffWithPermission('category.manage')
  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const before = await db.category.findUnique({ where: { id } })
    if (!before) return { ok: false, error: 'Category not found' }
    await db.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name),
        description: data.description,
        parentId: data.parentId || null,
        image: data.image,
        order: data.order ?? 0,
        featured: data.featured ?? false,
        active: data.active ?? true,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'category.update',
      entityType: 'Category',
      entityId: id,
      before: { name: before.name, slug: before.slug, featured: before.featured },
      after: { name: data.name, slug: data.slug, featured: data.featured },
      description: `Updated category "${data.name}"`,
    })
    revalidatePath('/admin/categories')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Could not update category' }
  }
}

export async function adminDeleteCategory(id: string) {
  const user = await requireStaffWithPermission('category.manage')
  try {
    const cat = await db.category.findUnique({ where: { id }, select: { name: true, slug: true } })
    if (!cat) return { ok: false, error: 'Category not found' }
    // Set children's parent to null to avoid cascade delete
    await db.category.updateMany({ where: { parentId: id }, data: { parentId: null } })
    await db.category.delete({ where: { id } })
    await auditLog({
      actorId: user.id,
      action: 'category.delete',
      entityType: 'Category',
      entityId: id,
      before: cat,
      description: `Deleted category "${cat.name}"`,
    })
    revalidatePath('/admin/categories')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminReorderCategory(id: string, direction: 'up' | 'down') {
  const user = await requireStaffWithPermission('category.manage')
  try {
    const cat = await db.category.findUnique({ where: { id } })
    if (!cat) return { ok: false, error: 'Category not found' }
    const siblings = await db.category.findMany({
      where: { parentId: cat.parentId },
      orderBy: { order: 'asc' },
    })
    const idx = siblings.findIndex((s) => s.id === id)
    if (idx < 0) return { ok: false, error: 'Category not in siblings list' }
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= siblings.length) return { ok: true }
    const other = siblings[swapIdx]
    await db.$transaction([
      db.category.update({ where: { id: cat.id }, data: { order: other.order } }),
      db.category.update({ where: { id: other.id }, data: { order: cat.order } }),
    ])
    await auditLog({
      actorId: user.id,
      action: 'category.reorder',
      entityType: 'Category',
      entityId: id,
      description: `Moved category "${cat.name}" ${direction}`,
    })
    revalidatePath('/admin/categories')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// BRANDS
// ============================================================

const brandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  logoUrl: z.string().optional().nullable(),
  country: z.string().optional(),
  active: z.coerce.boolean().optional(),
})

export async function adminCreateBrand(input: Record<string, any>) {
  const user = await requireStaffWithPermission('brand.manage')
  const parsed = brandSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const created = await db.brand.create({
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name),
        description: data.description,
        logoUrl: data.logoUrl,
        country: data.country,
        active: data.active ?? true,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'brand.create',
      entityType: 'Brand',
      entityId: created.id,
      after: { name: created.name, slug: created.slug },
      description: `Created brand "${created.name}"`,
    })
    revalidatePath('/admin/brands')
    return { ok: true, id: created.id }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminUpdateBrand(id: string, input: Record<string, any>) {
  const user = await requireStaffWithPermission('brand.manage')
  const parsed = brandSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const before = await db.brand.findUnique({ where: { id } })
    if (!before) return { ok: false, error: 'Brand not found' }
    await db.brand.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name),
        description: data.description,
        logoUrl: data.logoUrl,
        country: data.country,
        active: data.active ?? true,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'brand.update',
      entityType: 'Brand',
      entityId: id,
      before: { name: before.name, slug: before.slug, active: before.active },
      after: { name: data.name, slug: data.slug, active: data.active },
      description: `Updated brand "${data.name}"`,
    })
    revalidatePath('/admin/brands')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminDeleteBrand(id: string) {
  const user = await requireStaffWithPermission('brand.manage')
  try {
    const brand = await db.brand.findUnique({ where: { id }, select: { name: true, slug: true } })
    if (!brand) return { ok: false, error: 'Brand not found' }
    // Null out brandId on products to avoid cascade delete
    await db.product.updateMany({ where: { brandId: id }, data: { brandId: null } })
    await db.brand.delete({ where: { id } })
    await auditLog({
      actorId: user.id,
      action: 'brand.delete',
      entityType: 'Brand',
      entityId: id,
      before: brand,
      description: `Deleted brand "${brand.name}"`,
    })
    revalidatePath('/admin/brands')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// INVENTORY ADJUSTMENTS
// ============================================================

const inventoryAdjustSchema = z.object({
  variantId: z.string().min(1),
  newQty: z.coerce.number().int().min(0),
  reason: z.string().min(1),
  note: z.string().optional(),
  reference: z.string().optional(),
})

export async function adminAdjustInventory(input: Record<string, any>) {
  const user = await requireStaffWithPermission('inventory.adjust')
  const parsed = inventoryAdjustSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const variant = await db.productVariant.findUnique({
      where: { id: data.variantId },
      include: { product: { select: { id: true, name: true } } },
    })
    if (!variant) return { ok: false, error: 'Variant not found' }
    const previousQty = variant.stock
    const newQty = data.newQty
    const difference = newQty - previousQty

    await db.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { id: data.variantId },
        data: { stock: newQty },
      })
      await tx.inventoryAdjustment.create({
        data: {
          productId: variant.productId,
          variantId: variant.id,
          previousQty,
          newQty,
          difference,
          reason: data.reason,
          note: data.note,
          reference: data.reference,
          authorId: user.id,
        },
      })
    })

    await auditLog({
      actorId: user.id,
      action: 'inventory.adjust',
      entityType: 'ProductVariant',
      entityId: data.variantId,
      before: { stock: previousQty },
      after: { stock: newQty },
      description: `Adjusted stock on "${variant.product.name}" (${variant.size ?? 'default'}): ${previousQty} → ${newQty} (${difference > 0 ? '+' : ''}${difference}, reason: ${data.reason})`,
    })

    // Auto-create notification if low/out of stock
    if (newQty <= 0) {
      await createSystemNotifications({
        type: 'OUT_OF_STOCK',
        title: `"${variant.product.name}" is out of stock`,
        body: `Variant ${variant.size ?? 'default'} dropped to 0 (was ${previousQty})`,
        link: `/admin/inventory?variant=${variant.id}`,
        metadata: { variantId: variant.id, productId: variant.productId },
      })
    } else if (newQty <= variant.lowStockThreshold) {
      await createSystemNotifications({
        type: 'LOW_INVENTORY',
        title: `"${variant.product.name}" is low on stock`,
        body: `Variant ${variant.size ?? 'default'} has ${newQty} units (threshold ${variant.lowStockThreshold})`,
        link: `/admin/inventory?variant=${variant.id}`,
        metadata: { variantId: variant.id, productId: variant.productId },
      })
    }

    revalidatePath('/admin/inventory')
    return { ok: true, previousQty, newQty, difference }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminBulkAdjustInventory(items: Record<string, any>[]) {
  const user = await requireStaffWithPermission('inventory.adjust')
  try {
    let processed = 0
    for (const item of items) {
      const result = await adminAdjustInventory({ ...item, _bypassAuth: true, _actorId: user.id } as any)
      if (result.ok) processed++
    }
    await auditLog({
      actorId: user.id,
      action: 'inventory.bulk_adjust',
      entityType: 'ProductVariant',
      description: `Bulk-adjusted ${processed}/${items.length} variants`,
    })
    revalidatePath('/admin/inventory')
    return { ok: true, processed }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// COUPONS
// ============================================================

const couponSchema = z.object({
  code: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']),
  value: z.coerce.number().min(0),
  minOrder: z.coerce.number().optional(),
  maxDiscount: z.coerce.number().optional(),
  usageLimit: z.coerce.number().int().optional(),
  perCustomerLimit: z.coerce.number().int().optional(),
  active: z.coerce.boolean().optional(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  appliesToProducts: z.string().optional(),
  appliesToCategories: z.string().optional(),
  freeShipping: z.coerce.boolean().optional(),
})

export async function adminCreateCoupon(input: Record<string, any>) {
  const user = await requireStaffWithPermission('coupon.manage')
  const parsed = couponSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const created = await db.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        type: data.type,
        value: data.value,
        minOrder: data.minOrder,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        perCustomerLimit: data.perCustomerLimit,
        active: data.active ?? true,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        appliesToProducts: data.appliesToProducts,
        appliesToCategories: data.appliesToCategories,
        freeShipping: data.freeShipping ?? (data.type === 'FREE_SHIPPING'),
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'coupon.create',
      entityType: 'Coupon',
      entityId: created.id,
      after: { code: created.code, type: created.type, value: created.value },
      description: `Created coupon "${created.code}" (${created.type} ${created.value})`,
    })
    revalidatePath('/admin/coupons')
    return { ok: true, id: created.id }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminUpdateCoupon(id: string, input: Record<string, any>) {
  const user = await requireStaffWithPermission('coupon.manage')
  const parsed = couponSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const before = await db.coupon.findUnique({ where: { id } })
    if (!before) return { ok: false, error: 'Coupon not found' }
    await db.coupon.update({
      where: { id },
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        type: data.type,
        value: data.value,
        minOrder: data.minOrder,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        perCustomerLimit: data.perCustomerLimit,
        active: data.active ?? true,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        appliesToProducts: data.appliesToProducts,
        appliesToCategories: data.appliesToCategories,
        freeShipping: data.freeShipping ?? (data.type === 'FREE_SHIPPING'),
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'coupon.update',
      entityType: 'Coupon',
      entityId: id,
      before: { code: before.code, value: before.value, active: before.active },
      after: { code: data.code, value: data.value, active: data.active },
      description: `Updated coupon "${data.code}"`,
    })
    revalidatePath('/admin/coupons')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminDeleteCoupon(id: string) {
  const user = await requireStaffWithPermission('coupon.manage')
  try {
    const c = await db.coupon.findUnique({ where: { id }, select: { code: true } })
    if (!c) return { ok: false, error: 'Coupon not found' }
    await db.coupon.delete({ where: { id } })
    await auditLog({
      actorId: user.id,
      action: 'coupon.delete',
      entityType: 'Coupon',
      entityId: id,
      before: c,
      description: `Deleted coupon "${c.code}"`,
    })
    revalidatePath('/admin/coupons')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// REVIEWS MODERATION
// ============================================================

export async function adminModerateReview(
  reviewId: string,
  action: 'approve' | 'reject' | 'hide' | 'delete' | 'verify',
  reply?: string,
) {
  const user = await requireStaffWithPermission('review.moderate')
  try {
    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { name: true } } },
    })
    if (!review) return { ok: false, error: 'Review not found' }

    const updateData: any = {}
    let descAction = ''
    switch (action) {
      case 'approve':
        updateData.published = true
        updateData.rejected = false
        descAction = 'approved'
        break
      case 'reject':
        updateData.published = false
        updateData.rejected = true
        descAction = 'rejected'
        break
      case 'hide':
        updateData.published = false
        descAction = 'hidden'
        break
      case 'verify':
        updateData.verified = true
        descAction = 'verified'
        break
      case 'delete':
        await db.review.delete({ where: { id: reviewId } })
        await auditLog({
          actorId: user.id,
          action: 'review.delete',
          entityType: 'Review',
          entityId: reviewId,
          description: `Deleted review on "${review.product.name}" (rating ${review.rating})`,
        })
        revalidatePath('/admin/reviews')
        return { ok: true }
    }
    if (reply !== undefined) {
      updateData.reply = reply
      updateData.replyAuthorId = user.id
      updateData.repliedAt = new Date()
    }

    await db.review.update({ where: { id: reviewId }, data: updateData })
    await auditLog({
      actorId: user.id,
      action: `review.${descAction}`,
      entityType: 'Review',
      entityId: reviewId,
      description: `${descAction.charAt(0).toUpperCase() + descAction.slice(1)} review on "${review.product.name}" (rating ${review.rating})`,
    })
    revalidatePath('/admin/reviews')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// SHIPPING ZONES + METHODS
// ============================================================

const shippingZoneSchema = z.object({
  name: z.string().min(1),
  states: z.string(), // JSON array
  countries: z.string().optional(),
  active: z.coerce.boolean().optional(),
})

export async function adminCreateShippingZone(input: Record<string, any>) {
  const user = await requireStaffWithPermission('shipping.manage')
  const parsed = shippingZoneSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const created = await db.shippingZone.create({
      data: {
        name: data.name,
        states: data.states,
        countries: data.countries,
        active: data.active ?? true,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'shipping_zone.create',
      entityType: 'ShippingZone',
      entityId: created.id,
      after: { name: created.name },
      description: `Created shipping zone "${created.name}"`,
    })
    revalidatePath('/admin/shipping')
    return { ok: true, id: created.id }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminUpdateShippingZone(id: string, input: Record<string, any>) {
  const user = await requireStaffWithPermission('shipping.manage')
  const parsed = shippingZoneSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const before = await db.shippingZone.findUnique({ where: { id } })
    if (!before) return { ok: false, error: 'Zone not found' }
    await db.shippingZone.update({
      where: { id },
      data: {
        name: data.name,
        states: data.states,
        countries: data.countries,
        active: data.active ?? true,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'shipping_zone.update',
      entityType: 'ShippingZone',
      entityId: id,
      before: { name: before.name, active: before.active },
      after: { name: data.name, active: data.active },
      description: `Updated shipping zone "${data.name}"`,
    })
    revalidatePath('/admin/shipping')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminDeleteShippingZone(id: string) {
  const user = await requireStaffWithPermission('shipping.manage')
  try {
    const zone = await db.shippingZone.findUnique({ where: { id }, select: { name: true } })
    if (!zone) return { ok: false, error: 'Zone not found' }
    await db.shippingZone.delete({ where: { id } })
    await auditLog({
      actorId: user.id,
      action: 'shipping_zone.delete',
      entityType: 'ShippingZone',
      entityId: id,
      before: zone,
      description: `Deleted shipping zone "${zone.name}"`,
    })
    revalidatePath('/admin/shipping')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

const shippingMethodSchema = z.object({
  zoneId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  carrier: z.string().optional(),
  baseCost: z.coerce.number().min(0),
  perKgCost: z.coerce.number().optional(),
  perItemCost: z.coerce.number().optional(),
  freeThreshold: z.coerce.number().optional(),
  estimatedDaysMin: z.coerce.number().int().optional(),
  estimatedDaysMax: z.coerce.number().int().optional(),
  active: z.coerce.boolean().optional(),
})

export async function adminCreateShippingMethod(input: Record<string, any>) {
  const user = await requireStaffWithPermission('shipping.manage')
  const parsed = shippingMethodSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const created = await db.shippingMethod.create({
      data: {
        zoneId: data.zoneId,
        name: data.name,
        description: data.description,
        carrier: data.carrier,
        baseCost: data.baseCost,
        perKgCost: data.perKgCost ?? 0,
        perItemCost: data.perItemCost ?? 0,
        freeThreshold: data.freeThreshold,
        estimatedDaysMin: data.estimatedDaysMin,
        estimatedDaysMax: data.estimatedDaysMax,
        active: data.active ?? true,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'shipping_method.create',
      entityType: 'ShippingMethod',
      entityId: created.id,
      after: { name: created.name, baseCost: created.baseCost },
      description: `Created shipping method "${created.name}" (₦${created.baseCost})`,
    })
    revalidatePath('/admin/shipping')
    return { ok: true, id: created.id }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminUpdateShippingMethod(id: string, input: Record<string, any>) {
  const user = await requireStaffWithPermission('shipping.manage')
  const parsed = shippingMethodSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const before = await db.shippingMethod.findUnique({ where: { id } })
    if (!before) return { ok: false, error: 'Method not found' }
    await db.shippingMethod.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        carrier: data.carrier,
        baseCost: data.baseCost,
        perKgCost: data.perKgCost ?? 0,
        perItemCost: data.perItemCost ?? 0,
        freeThreshold: data.freeThreshold,
        estimatedDaysMin: data.estimatedDaysMin,
        estimatedDaysMax: data.estimatedDaysMax,
        active: data.active ?? true,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'shipping_method.update',
      entityType: 'ShippingMethod',
      entityId: id,
      description: `Updated shipping method "${data.name}"`,
    })
    revalidatePath('/admin/shipping')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminDeleteShippingMethod(id: string) {
  const user = await requireStaffWithPermission('shipping.manage')
  try {
    const m = await db.shippingMethod.findUnique({ where: { id }, select: { name: true } })
    if (!m) return { ok: false, error: 'Method not found' }
    await db.shippingMethod.delete({ where: { id } })
    await auditLog({
      actorId: user.id,
      action: 'shipping_method.delete',
      entityType: 'ShippingMethod',
      entityId: id,
      description: `Deleted shipping method "${m.name}"`,
    })
    revalidatePath('/admin/shipping')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// CAMPAIGNS (Marketing)
// ============================================================

const campaignSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(['PROMOTION', 'FLASH_SALE', 'FEATURED', 'SEASONAL']),
  active: z.coerce.boolean().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  discountType: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']),
  discountValue: z.coerce.number().min(0),
  appliesToProducts: z.string().optional(),
  appliesToCategories: z.string().optional(),
  audienceTags: z.string().optional(),
  usageLimit: z.coerce.number().int().optional(),
  productIds: z.array(z.string()).optional(),
})

export async function adminCreateCampaign(input: Record<string, any>) {
  const user = await requireStaffWithPermission('campaign.manage')
  const parsed = campaignSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const created = await db.campaign.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        active: data.active ?? true,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        discountType: data.discountType,
        discountValue: data.discountValue,
        appliesToProducts: data.appliesToProducts,
        appliesToCategories: data.appliesToCategories,
        audienceTags: data.audienceTags,
        usageLimit: data.usageLimit,
        products: data.productIds?.length
          ? { create: data.productIds.map((pid, i) => ({ productId: pid, displayOrder: i })) }
          : undefined,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'campaign.create',
      entityType: 'Campaign',
      entityId: created.id,
      after: { name: created.name, type: created.type, discountValue: created.discountValue },
      description: `Created ${data.type} campaign "${data.name}" (${data.discountType} ${data.discountValue})`,
    })
    revalidatePath('/admin/marketing')
    return { ok: true, id: created.id }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminUpdateCampaign(id: string, input: Record<string, any>) {
  const user = await requireStaffWithPermission('campaign.manage')
  const parsed = campaignSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const before = await db.campaign.findUnique({ where: { id } })
    if (!before) return { ok: false, error: 'Campaign not found' }
    await db.$transaction(async (tx) => {
      await tx.campaign.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          type: data.type,
          active: data.active ?? true,
          startsAt: new Date(data.startsAt),
          endsAt: new Date(data.endsAt),
          discountType: data.discountType,
          discountValue: data.discountValue,
          appliesToProducts: data.appliesToProducts,
          appliesToCategories: data.appliesToCategories,
          audienceTags: data.audienceTags,
          usageLimit: data.usageLimit,
        },
      })
      // Sync products
      await tx.campaignProduct.deleteMany({ where: { campaignId: id } })
      if (data.productIds?.length) {
        await tx.campaignProduct.createMany({
          data: data.productIds.map((pid, i) => ({
            campaignId: id,
            productId: pid,
            displayOrder: i,
          })),
        })
      }
    })
    await auditLog({
      actorId: user.id,
      action: 'campaign.update',
      entityType: 'Campaign',
      entityId: id,
      description: `Updated campaign "${data.name}"`,
    })
    revalidatePath('/admin/marketing')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminDeleteCampaign(id: string) {
  const user = await requireStaffWithPermission('campaign.manage')
  try {
    const c = await db.campaign.findUnique({ where: { id }, select: { name: true, type: true } })
    if (!c) return { ok: false, error: 'Campaign not found' }
    await db.campaign.delete({ where: { id } })
    await auditLog({
      actorId: user.id,
      action: 'campaign.delete',
      entityType: 'Campaign',
      entityId: id,
      before: c,
      description: `Deleted ${c.type} campaign "${c.name}"`,
    })
    revalidatePath('/admin/marketing')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// BANNERS (CMS) + FAQs
// ============================================================

const bannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  image: z.string().optional().nullable(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  active: z.coerce.boolean().optional(),
  order: z.coerce.number().int().optional(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
})

export async function adminCreateBanner(input: Record<string, any>) {
  const user = await requireStaffWithPermission('banner.manage')
  const parsed = bannerSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const created = await db.promotionalBanner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        image: data.image,
        ctaText: data.ctaText,
        ctaHref: data.ctaHref,
        active: data.active ?? true,
        order: data.order ?? 0,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'banner.create',
      entityType: 'PromotionalBanner',
      entityId: created.id,
      description: `Created banner "${created.title}"`,
    })
    revalidatePath('/admin/banners')
    return { ok: true, id: created.id }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminUpdateBanner(id: string, input: Record<string, any>) {
  const user = await requireStaffWithPermission('banner.manage')
  const parsed = bannerSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const before = await db.promotionalBanner.findUnique({ where: { id } })
    if (!before) return { ok: false, error: 'Banner not found' }
    await db.promotionalBanner.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        image: data.image,
        ctaText: data.ctaText,
        ctaHref: data.ctaHref,
        active: data.active ?? true,
        order: data.order ?? 0,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'banner.update',
      entityType: 'PromotionalBanner',
      entityId: id,
      description: `Updated banner "${data.title}"`,
    })
    revalidatePath('/admin/banners')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminDeleteBanner(id: string) {
  const user = await requireStaffWithPermission('banner.manage')
  try {
    const b = await db.promotionalBanner.findUnique({ where: { id }, select: { title: true } })
    if (!b) return { ok: false, error: 'Banner not found' }
    await db.promotionalBanner.delete({ where: { id } })
    await auditLog({
      actorId: user.id,
      action: 'banner.delete',
      entityType: 'PromotionalBanner',
      entityId: id,
      description: `Deleted banner "${b.title}"`,
    })
    revalidatePath('/admin/banners')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

const faqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(5),
  category: z.string().default('General'),
  order: z.coerce.number().int().optional(),
  published: z.coerce.boolean().optional(),
})

export async function adminCreateFaq(input: Record<string, any>) {
  const user = await requireStaffWithPermission('faq.manage')
  const parsed = faqSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    const created = await db.fAQ.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category,
        order: data.order ?? 0,
        published: data.published ?? true,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'faq.create',
      entityType: 'FAQ',
      entityId: created.id,
      description: `Created FAQ "${data.question.slice(0, 50)}…"`,
    })
    revalidatePath('/admin/faqs')
    return { ok: true, id: created.id }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminUpdateFaq(id: string, input: Record<string, any>) {
  const user = await requireStaffWithPermission('faq.manage')
  const parsed = faqSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    await db.fAQ.update({
      where: { id },
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category,
        order: data.order ?? 0,
        published: data.published ?? true,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'faq.update',
      entityType: 'FAQ',
      entityId: id,
      description: `Updated FAQ`,
    })
    revalidatePath('/admin/faqs')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminDeleteFaq(id: string) {
  const user = await requireStaffWithPermission('faq.manage')
  try {
    await db.fAQ.delete({ where: { id } })
    await auditLog({
      actorId: user.id,
      action: 'faq.delete',
      entityType: 'FAQ',
      entityId: id,
      description: `Deleted FAQ`,
    })
    revalidatePath('/admin/faqs')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export async function adminMarkNotificationRead(id: string) {
  await requireStaff()
  try {
    await db.notification.update({ where: { id }, data: { read: true } })
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminMarkAllNotificationsRead() {
  const user = await requireStaff()
  try {
    await db.notification.updateMany({
      where: { recipientId: user.id, read: false },
      data: { read: true },
    })
    revalidatePath('/admin/notifications')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminDeleteNotification(id: string) {
  await requireStaff()
  try {
    await db.notification.delete({ where: { id } })
    revalidatePath('/admin/notifications')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

/**
 * Create notifications for all staff members with notification.view permission.
 * Used by other actions (e.g. when order created, inventory low, etc.)
 */
async function createSystemNotifications(input: {
  type: any
  title: string
  body?: string
  link?: string
  metadata?: any
}) {
  try {
    // Notify all staff (any non-CUSTOMER user) — they all have notification.view
    const staff = await db.user.findMany({
      where: { role: { not: 'CUSTOMER' }, active: true },
      select: { id: true },
    })
    if (staff.length === 0) return
    await db.notification.createMany({
      data: staff.map((s) => ({
        recipientId: s.id,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      })),
    })
  } catch (e) {
    console.error('[createSystemNotifications] failed:', e)
  }
}

// ============================================================
// STAFF MANAGEMENT
// ============================================================

const staffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'MANAGER', 'SALES', 'INVENTORY_MANAGER', 'CUSTOMER_SUPPORT', 'CONTENT_MANAGER']),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
})

export async function adminCreateStaff(input: Record<string, any>) {
  const user = await requireSuperAdmin()
  const parsed = staffSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data
  try {
    // Check for existing email
    const existing = await db.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (existing) return { ok: false, error: 'A user with that email already exists' }

    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash(data.password, 10)
    const created = await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash,
        role: data.role,
        phone: data.phone,
        jobTitle: data.jobTitle,
        department: data.department,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'staff.create',
      entityType: 'User',
      entityId: created.id,
      after: { name: created.name, email: created.email, role: created.role },
      description: `Created staff account "${created.name}" (${created.email}) with role ${created.role}`,
    })
    revalidatePath('/admin/staff')
    return { ok: true, id: created.id }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminUpdateStaff(id: string, input: Record<string, any>) {
  const user = await requireSuperAdmin()
  try {
    const before = await db.user.findUnique({ where: { id } })
    if (!before) return { ok: false, error: 'Staff not found' }

    const data: any = {
      name: input.name,
      role: input.role,
      phone: input.phone,
      jobTitle: input.jobTitle,
      department: input.department,
      active: input.active,
    }
    // If password provided, hash it
    if (input.password && input.password.length >= 8) {
      const bcrypt = await import('bcryptjs')
      data.passwordHash = await bcrypt.hash(input.password, 10)
    }
    await db.user.update({ where: { id }, data })
    await auditLog({
      actorId: user.id,
      action: 'staff.update',
      entityType: 'User',
      entityId: id,
      before: { name: before.name, role: before.role, active: before.active },
      after: { name: input.name, role: input.role, active: input.active },
      description: `Updated staff "${input.name}" (${input.email ?? before.email})`,
    })
    revalidatePath('/admin/staff')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminDeleteStaff(id: string) {
  const user = await requireSuperAdmin()
  try {
    if (id === user.id) return { ok: false, error: 'You cannot delete yourself' }
    const s = await db.user.findUnique({ where: { id }, select: { name: true, email: true, role: true } })
    if (!s) return { ok: false, error: 'Staff not found' }
    // Disable rather than hard delete to preserve audit history
    await db.user.update({ where: { id }, data: { active: false, role: 'CUSTOMER' } })
    await auditLog({
      actorId: user.id,
      action: 'staff.disable',
      entityType: 'User',
      entityId: id,
      before: s,
      description: `Disabled staff account "${s.name}" (${s.email})`,
    })
    revalidatePath('/admin/staff')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminInviteStaff(input: Record<string, any>) {
  const user = await requireSuperAdmin()
  try {
    const token = randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    const invite = await db.staffInvite.create({
      data: {
        email: input.email.toLowerCase(),
        role: input.role,
        token,
        invitedById: user.id,
        expiresAt,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'staff.invite',
      entityType: 'StaffInvite',
      entityId: invite.id,
      after: { email: input.email, role: input.role },
      description: `Invited ${input.email} as ${input.role}`,
    })
    return { ok: true, token, expiresAt: expiresAt.toISOString() }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// CUSTOMER MANAGEMENT
// ============================================================

export async function adminUpdateCustomer(id: string, input: Record<string, any>) {
  const user = await requireStaffWithPermission('customer.update')
  try {
    const before = await db.user.findUnique({ where: { id } })
    if (!before) return { ok: false, error: 'Customer not found' }
    await db.user.update({
      where: { id },
      data: {
        name: input.name,
        phone: input.phone,
        whatsappNumber: input.whatsappNumber,
        tags: input.tags,
        notes: input.notes,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'customer.update',
      entityType: 'User',
      entityId: id,
      before: { name: before.name, phone: before.phone, tags: before.tags },
      after: { name: input.name, phone: input.phone, tags: input.tags },
      description: `Updated customer "${input.name}" (${before.email})`,
    })
    revalidatePath(`/admin/customers/${id}`)
    revalidatePath('/admin/customers')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminToggleCustomerActive(id: string) {
  const user = await requireStaffWithPermission('customer.disable')
  try {
    const before = await db.user.findUnique({ where: { id }, select: { name: true, email: true, active: true } })
    if (!before) return { ok: false, error: 'Customer not found' }
    const next = !before.active
    await db.user.update({ where: { id }, data: { active: next } })
    await auditLog({
      actorId: user.id,
      action: next ? 'customer.enable' : 'customer.disable',
      entityType: 'User',
      entityId: id,
      before,
      after: { active: next },
      description: `${next ? 'Enabled' : 'Disabled'} customer "${before.name}" (${before.email})`,
    })
    revalidatePath(`/admin/customers/${id}`)
    revalidatePath('/admin/customers')
    return { ok: true, active: next }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminCreateCustomerNote(customerId: string, body: string, pinned: boolean = false) {
  const user = await requireStaffWithPermission('customer.note')
  try {
    const note = await db.customerNote.create({
      data: {
        customerId,
        authorId: user.id,
        body,
        pinned,
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'customer.note',
      entityType: 'CustomerNote',
      entityId: note.id,
      after: { customerId, body: body.slice(0, 80) },
      description: `Added note to customer`,
    })
    revalidatePath(`/admin/customers/${customerId}`)
    return { ok: true, id: note.id }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminDeleteCustomerNote(id: string) {
  await requireStaffWithPermission('customer.note')
  try {
    const note = await db.customerNote.findUnique({ where: { id } })
    if (!note) return { ok: false, error: 'Note not found' }
    await db.customerNote.delete({ where: { id } })
    revalidatePath(`/admin/customers/${note.customerId}`)
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// BULK OPERATIONS — PRODUCTS
// ============================================================

export async function adminBulkProductAction(
  action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'feature' | 'unfeature',
  productIds: string[],
) {
  const user = await requireStaffWithPermission(
    action === 'delete' ? 'product.delete' : 'product.publish',
  )
  try {
    let updated = 0
    const updateData: any = {}
    switch (action) {
      case 'publish': updateData.published = true; break
      case 'unpublish': updateData.published = false; break
      case 'feature': updateData.featured = true; break
      case 'unfeature': updateData.featured = false; break
      case 'archive':
        updateData.status = 'ARCHIVED'
        updateData.published = false
        break
    }

    if (action === 'delete') {
      // Batch delete
      const r = await db.product.deleteMany({ where: { id: { in: productIds } } })
      updated = r.count
    } else {
      const r = await db.product.updateMany({ where: { id: { in: productIds } }, data: updateData })
      updated = r.count
    }

    await auditLog({
      actorId: user.id,
      action: `product.bulk_${action}`,
      entityType: 'Product',
      after: { ids: productIds, count: updated, action },
      description: `Bulk ${action} on ${updated} product(s)`,
    })
    revalidatePath('/admin/products')
    revalidatePath('/shop')
    return { ok: true, count: updated }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// ORDER — additional actions (add tracking, internal notes)
// ============================================================

export async function adminUpdateOrderTracking(
  orderId: string,
  tracking: { trackingNumber?: string; trackingUrl?: string; carrier?: string; internalNote?: string },
) {
  const user = await requireStaffWithPermission('order.update_tracking')
  try {
    const before = await db.order.findUnique({
      where: { id: orderId },
      select: { orderNumber: true, trackingNumber: true, carrier: true, internalNotes: true },
    })
    if (!before) return { ok: false, error: 'Order not found' }
    await db.order.update({
      where: { id: orderId },
      data: {
        ...(tracking.trackingNumber !== undefined ? { trackingNumber: tracking.trackingNumber } : {}),
        ...(tracking.trackingUrl !== undefined ? { trackingUrl: tracking.trackingUrl } : {}),
        ...(tracking.carrier !== undefined ? { carrier: tracking.carrier } : {}),
        ...(tracking.internalNote !== undefined ? { internalNotes: tracking.internalNote } : {}),
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'order.update_tracking',
      entityType: 'Order',
      entityId: orderId,
      before: { trackingNumber: before.trackingNumber, carrier: before.carrier },
      after: tracking,
      description: `Updated tracking on order ${before.orderNumber}`,
    })
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// REFUNDS — full + partial, with Paystack integration
// ============================================================

const refundSchema = z.object({
  orderId: z.string().min(1),
  amount: z.coerce.number().min(1),
  reason: z.string().min(2),
  note: z.string().optional(),
  items: z.string().optional(), // JSON array of {orderItemId, qty, amount}
})

export async function adminRefundOrder(input: Record<string, any>) {
  const user = await requireStaffWithPermission('order.refund')
  const parsed = refundSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const data = parsed.data

  try {
    const order = await db.order.findUnique({
      where: { id: data.orderId },
      include: {
        payments: { where: { status: 'SUCCESS' } },
        refunds: { where: { status: { in: ['SUCCESS', 'PARTIAL', 'PENDING'] } } },
      },
    })
    if (!order) return { ok: false, error: 'Order not found' }

    const successfulPayment = order.payments[0]
    if (!successfulPayment) {
      return { ok: false, error: 'No successful payment to refund' }
    }

    // Sum already-refunded amounts
    const alreadyRefunded = order.refunds.reduce((s, r) => s + r.amount, 0)
    const refundableMax = order.total - alreadyRefunded
    if (data.amount > refundableMax) {
      return { ok: false, error: `Cannot refund more than ${refundableMax.toFixed(2)} (total minus already-refunded)` }
    }
    if (data.amount > order.total) {
      return { ok: false, error: 'Refund cannot exceed order total' }
    }

    // Generate refund reference
    const refundReference = `RFN-${order.orderNumber}-${Date.now().toString(36).toUpperCase()}`

    // Call Paystack refund API
    const { refundPaystackTransaction } = await import('@/lib/paystack/server')
    const gatewayResp = await refundPaystackTransaction({
      reference: successfulPayment.reference,
      amount: data.amount,
      merchant_note: data.reason,
    })

    if (!gatewayResp || !gatewayResp.status) {
      // Record failed refund attempt
      const failed = await db.refund.create({
        data: {
          orderId: order.id,
          reference: refundReference,
          amount: data.amount,
          reason: data.reason,
          note: data.note,
          status: 'FAILED',
          authorId: user.id,
          items: data.items,
          rawResponse: gatewayResp ? JSON.stringify(gatewayResp) : 'no response',
        },
      })
      await auditLog({
        actorId: user.id,
        action: 'order.refund_failed',
        entityType: 'Refund',
        entityId: failed.id,
        after: { amount: data.amount, reason: data.reason },
        description: `Refund attempt on order ${order.orderNumber} FAILED (₦${data.amount})`,
      })
      await createSystemNotifications({
        type: 'REFUND_FAILED',
        title: `Refund failed on order ${order.orderNumber}`,
        body: `Refund of ₦${data.amount} failed. Reason: ${data.reason}`,
        link: `/admin/orders/${order.id}`,
      })
      return { ok: false, error: gatewayResp?.message ?? 'Paystack refund failed' }
    }

    // Refund succeeded — record + update order + update inventory if full refund
    const isFull = data.amount + alreadyRefunded >= order.total
    const refundRecord = await db.refund.create({
      data: {
        orderId: order.id,
        reference: refundReference,
        amount: data.amount,
        reason: data.reason,
        note: data.note,
        status: gatewayResp.data.status === 'processed' ? 'SUCCESS' : 'PENDING',
        authorId: user.id,
        gatewayReference: gatewayResp.data.refund_reference,
        rawResponse: JSON.stringify(gatewayResp),
        processedAt: gatewayResp.data.status === 'processed' ? new Date() : null,
        items: data.items,
      },
    })

    await db.$transaction(async (tx) => {
      // Update order status + payment status
      const newStatus = isFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
      const newPaymentStatus = isFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: newStatus,
          paymentStatus: newPaymentStatus,
          // Add a status history entry
          statusHistory: {
            create: {
              status: newStatus,
              note: `Refund of ₦${data.amount} (${data.reason})`,
            },
          },
        },
      })
    })

    // If full refund, restore stock on all order items
    if (isFull) {
      const orderItems = await db.orderItem.findMany({ where: { orderId: order.id } })
      for (const item of orderItems) {
        if (item.variantId) {
          await db.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          })
          const variant = await db.productVariant.findUnique({
            where: { id: item.variantId },
            select: { productId: true, stock: true, size: true },
          })
          if (variant) {
            await db.inventoryAdjustment.create({
              data: {
                productId: variant.productId,
                variantId: variant.id,
                previousQty: variant.stock - item.quantity,
                newQty: variant.stock,
                difference: item.quantity,
                reason: 'return',
                reference: `refund:${refundReference}`,
                authorId: user.id,
              },
            })
          }
        }
      }
    }

    await auditLog({
      actorId: user.id,
      action: 'order.refund',
      entityType: 'Refund',
      entityId: refundRecord.id,
      after: { amount: data.amount, reason: data.reason, isFull },
      description: `Refunded ₦${data.amount} on order ${order.orderNumber} (${isFull ? 'full' : 'partial'} · ${data.reason})`,
    })

    await createSystemNotifications({
      type: 'REFUND_ISSUED',
      title: `Refund issued on order ${order.orderNumber}`,
      body: `₦${data.amount} (${isFull ? 'full' : 'partial'}) — reason: ${data.reason}`,
      link: `/admin/orders/${order.id}`,
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${order.id}`)
    revalidatePath(`/admin/orders?status=REFUNDED`)
    return { ok: true, refundId: refundRecord.id, status: refundRecord.status }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// SERVICES — admin actions for service enquiries
// ============================================================

export async function adminUpdateServiceEnquiryStatus(id: string, status: string, internalNotes?: string) {
  const user = await requireStaffWithPermission('service.enquiry.manage')
  try {
    const enquiry = await db.serviceEnquiry.findUnique({ where: { id } })
    if (!enquiry) return { ok: false, error: 'Enquiry not found' }

    const updated = await db.serviceEnquiry.update({
      where: { id },
      data: {
        status: status as any,
        ...(internalNotes !== undefined ? { internalNotes } : {}),
      },
    })
    await auditLog({
      actorId: user.id,
      action: 'service_enquiry.update_status',
      entityType: 'ServiceEnquiry',
      entityId: id,
      description: `Updated enquiry ${enquiry.enquiryNumber} → ${status}`,
    })
    revalidatePath('/admin/services/enquiries')
    revalidatePath(`/admin/services/enquiries/${id}`)
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminAssignServiceEnquiry(id: string, assignedToId: string | null) {
  const user = await requireStaffWithPermission('service.enquiry.manage')
  try {
    const enquiry = await db.serviceEnquiry.findUnique({ where: { id } })
    if (!enquiry) return { ok: false, error: 'Enquiry not found' }
    const updated = await db.serviceEnquiry.update({
      where: { id },
      data: { assignedToId },
    })
    await auditLog({
      actorId: user.id,
      action: 'service_enquiry.assign',
      entityType: 'ServiceEnquiry',
      entityId: id,
      description: `Assigned enquiry ${enquiry.enquiryNumber} → ${assignedToId ?? 'unassigned'}`,
    })
    revalidatePath('/admin/services/enquiries')
    revalidatePath(`/admin/services/enquiries/${id}`)
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminDeleteServiceEnquiry(id: string) {
  const user = await requireStaffWithPermission('service.enquiry.manage')
  try {
    const enquiry = await db.serviceEnquiry.findUnique({ where: { id } })
    if (!enquiry) return { ok: false, error: 'Enquiry not found' }
    await db.serviceEnquiry.delete({ where: { id } })
    await auditLog({
      actorId: user.id,
      action: 'service_enquiry.delete',
      entityType: 'ServiceEnquiry',
      entityId: id,
      description: `Deleted enquiry ${enquiry.enquiryNumber}`,
    })
    revalidatePath('/admin/services/enquiries')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}
