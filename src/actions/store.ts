'use server'

import { db } from '@/lib/db'
import { generateOrderNumber, calculateDeliveryFee } from '@/lib/format'
import { initializePaystackTransaction, verifyPaystackTransaction } from '@/lib/paystack/server'
import { getSession } from '@/lib/session'
import { requireStaffWithPermission } from '@/lib/permissions'
import { auditLog, diffChangedFields, describeChanges } from '@/lib/audit'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// ============================================================
// CART — server-side line persistence (used after server verification)
// ============================================================

export type CartLineInput = {
  productId: string
  variantId?: string | null
  size?: string | null
  quantity: number
}

export async function getCartLinesWithProducts(lines: CartLineInput[]) {
  if (!lines.length) return []
  const products = await db.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) } },
    include: {
      images: { orderBy: { position: 'asc' }, take: 1 },
      variants: true,
      category: true,
    },
  })
  return lines
    .map((line) => {
      const p = products.find((p) => p.id === line.productId)
      if (!p) return null
      const variant = line.variantId ? p.variants.find((v) => v.id === line.variantId) : undefined
      const price = variant?.price ?? p.salePrice ?? p.price
      return {
        ...line,
        name: p.name,
        slug: p.slug,
        price,
        originalPrice: p.salePrice && p.salePrice < p.price ? p.price : undefined,
        image: p.images[0]?.url,
        sku: variant?.sku ?? p.sku,
        inStock: variant ? variant.stock > 0 : p.variants.some((v) => v.stock > 0),
        maxQuantity: variant?.stock ?? Math.max(...p.variants.map((v) => v.stock), 0),
        categoryId: p.categoryId,
        categoryName: p.category.name,
      }
    })
    .filter(Boolean) as any[]
}

// ============================================================
// NEWSLETTER
// ============================================================

const newsletterSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export async function subscribeToNewsletter(formData: FormData) {
  const parsed = newsletterSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name') || undefined,
  })
  if (!parsed.success) {
    return { ok: false, error: 'Please enter a valid email.' }
  }
  try {
    await db.newsletterSubscriber.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      update: { active: true },
      create: {
        email: parsed.data.email.toLowerCase(),
        name: parsed.data.name,
        source: 'footer',
      },
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: 'Could not subscribe. Try again.' }
  }
}

// ============================================================
// CHECKOUT — server-side order creation with server-calculated totals
// ============================================================

const checkoutSchema = z.object({
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  whatsappNumber: z.string().optional(),
  state: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(5),
  deliveryInstructions: z.string().optional(),
  lines: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().nullable().optional(),
      size: z.string().nullable().optional(),
      quantity: z.number().int().min(1).max(99),
    }),
  ),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['PAYSTACK', 'WHATSAPP', 'BANK_TRANSFER']).default('PAYSTACK'),
})

export type CheckoutResult =
  | { ok: true; orderNumber: string; authorizationUrl?: string; reference: string; total: number }
  | { ok: false; error: string }

export async function createOrder(formData: FormData | Record<string, any>): Promise<CheckoutResult> {
  // Accept either FormData or a plain object (called from client)
  const input: Record<string, any> =
    formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData
  // lines may arrive as JSON string from FormData
  if (typeof input.lines === 'string') {
    try { input.lines = JSON.parse(input.lines) } catch { input.lines = [] }
  }
  // Coerce quantity to number
  if (Array.isArray(input.lines)) {
    input.lines = input.lines.map((l: any) => ({ ...l, quantity: Number(l.quantity) }))
  }
  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid checkout data.' }
  }
  const data = parsed.data

  if (!data.lines.length) {
    return { ok: false, error: 'Your bag is empty.' }
  }

  // Fetch products server-side to recompute totals — never trust client prices
  const products = await db.product.findMany({
    where: { id: { in: data.lines.map((l) => l.productId) } },
    include: { variants: true, category: true, images: { take: 1, orderBy: { position: 'asc' } } },
  })

  let subtotal = 0
  const orderItemsData: any[] = []
  for (const line of data.lines) {
    const p = products.find((p) => p.id === line.productId)
    if (!p) continue
    const variant = line.variantId ? p.variants.find((v) => v.id === line.variantId) : undefined
    // stock check
    if (variant) {
      if (variant.stock < line.quantity) {
        return { ok: false, error: `Insufficient stock for ${p.name} (${variant.size}).` }
      }
    } else {
      const totalStock = p.variants.reduce((s, v) => s + v.stock, 0)
      if (totalStock < line.quantity) {
        return { ok: false, error: `Insufficient stock for ${p.name}.` }
      }
    }
    const unitPrice = variant?.price ?? p.salePrice ?? p.price
    const totalPrice = unitPrice * line.quantity
    subtotal += totalPrice
    orderItemsData.push({
      productId: p.id,
      variantId: variant?.id,
      productName: p.name,
      productSlug: p.slug,
      productImage: p.images[0]?.url,
      size: line.size ?? variant?.size,
      color: variant?.color,
      sku: variant?.sku ?? p.sku,
      unitPrice,
      quantity: line.quantity,
      totalPrice,
    })
  }

  if (!orderItemsData.length) {
    return { ok: false, error: 'No valid items in your bag.' }
  }

  // Apply coupon if provided
  let discount = 0
  if (data.couponCode) {
    const coupon = await db.coupon.findUnique({ where: { code: data.couponCode.toUpperCase() } })
    if (coupon && coupon.active && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      if (coupon.minOrder && subtotal < coupon.minOrder) {
        return { ok: false, error: `Coupon requires a minimum order of ₦${coupon.minOrder.toLocaleString()}.` }
      }
      if (coupon.type === 'PERCENTAGE') {
        discount = (subtotal * coupon.value) / 100
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
      } else {
        discount = coupon.value
      }
    }
  }

  // Delivery fee
  const settings = await db.adminSettings.findUnique({ where: { id: 'singleton' } })
  const deliveryFee = calculateDeliveryFee(
    subtotal - discount,
    settings?.defaultDeliveryFee ?? 2500,
    settings?.freeDeliveryThreshold ?? 50000,
  )

  const total = Math.max(0, subtotal - discount + deliveryFee)

  // Create order
  const session = await getSession()
  const orderNumber = generateOrderNumber()
  const reference = `${orderNumber}-${Date.now().toString(36)}`

  const order = await db.order.create({
    data: {
      orderNumber,
      userId: session?.user?.id,
      customerName: data.customerName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      whatsappNumber: data.whatsappNumber,
      state: data.state,
      city: data.city,
      address: data.address,
      deliveryInstructions: data.deliveryInstructions,
      subtotal,
      deliveryFee,
      discount,
      total,
      couponCode: data.couponCode,
      paymentMethod: data.paymentMethod,
      status: data.paymentMethod === 'WHATSAPP' ? 'PENDING' : 'PENDING',
      paymentStatus: 'PENDING',
      items: { create: orderItemsData },
      statusHistory: {
        create: { status: 'PENDING', note: 'Order received' },
      },
      payments: data.paymentMethod === 'PAYSTACK' ? {
        create: {
          provider: 'PAYSTACK',
          reference,
          amount: total,
          status: 'PENDING',
        },
      } : undefined,
    },
    include: { items: true },
  })

  // For WhatsApp orders, return the order number so the client can compose a
  // WhatsApp message. No payment initialization needed.
  if (data.paymentMethod === 'WHATSAPP') {
    return {
      ok: true,
      orderNumber: order.orderNumber,
      reference,
      total,
    }
  }

  // For Paystack: initialize transaction
  const callbackUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/checkout/verify?order=${order.orderNumber}`
  const init = await initializePaystackTransaction({
    email: data.email,
    amount: total,
    reference,
    callback_url: callbackUrl,
    metadata: {
      order_id: order.id,
      order_number: order.orderNumber,
      customer_name: data.customerName,
      custom_fields: [
        { display_name: 'Order Number', variable_name: 'order_number', value: order.orderNumber },
        { display_name: 'Items', variable_name: 'items', value: `${orderItemsData.length} item(s)` },
      ],
    },
  })

  if (!init.status) {
    return { ok: false, error: init.message || 'Could not initialise payment.' }
  }

  return {
    ok: true,
    orderNumber: order.orderNumber,
    authorizationUrl: init.data.authorization_url,
    reference,
    total,
  }
}

// ============================================================
// PAYMENT VERIFICATION (called from /checkout/verify)
// ============================================================

export type VerifyResult =
  | { ok: true; orderNumber: string; status: string; total: number }
  | { ok: false; error: string }

export async function verifyPayment(reference: string): Promise<VerifyResult> {
  if (!reference) return { ok: false, error: 'Missing payment reference.' }

  const payment = await db.payment.findUnique({
    where: { reference },
    include: { order: { include: { items: true } } },
  })
  if (!payment) return { ok: false, error: 'Payment not found.' }

  if (payment.verified) {
    return { ok: true, orderNumber: payment.order.orderNumber, status: payment.order.status, total: payment.order.total }
  }

  const verifyResp = await verifyPaystackTransaction(reference)
  if (!verifyResp || !verifyResp.status) {
    return { ok: false, error: 'Payment verification failed.' }
  }

  const isMock = process.env.PAYSTACK_SECRET_KEY === 'sk_test_x' || !process.env.PAYSTACK_SECRET_KEY
  const paidAmount = verifyResp.data.amount / 100 // kobo → naira

  // Verify amount matches (skip for mock)
  if (!isMock && Math.abs(paidAmount - payment.amount) > 1) {
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        rawResponse: JSON.stringify(verifyResp),
      },
    })
    return { ok: false, error: 'Payment amount mismatch.' }
  }

  if (verifyResp.data.status !== 'success' && !isMock) {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED', rawResponse: JSON.stringify(verifyResp) },
    })
    return { ok: false, error: 'Payment was not successful.' }
  }

  // Mark payment verified — THIS is the only place an order becomes paid
  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        verified: true,
        paidAt: new Date(),
        rawResponse: JSON.stringify(verifyResp),
      },
    })

    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'PAID',
        paymentStatus: 'SUCCESS',
        statusHistory: {
          create: { status: 'PAID', note: 'Payment confirmed' },
        },
      },
    })

    // Decrement stock for each order item
    for (const item of payment.order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      }
    }
  })

  return { ok: true, orderNumber: payment.order.orderNumber, status: 'PAID', total: payment.order.total }
}

// ============================================================
// TRACK ORDER (public)
// ============================================================

export async function trackOrder(orderNumber: string) {
  if (!orderNumber) return null
  const order = await db.order.findUnique({
    where: { orderNumber: orderNumber.trim().toUpperCase() },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  })
  return order
}

// ============================================================
// ADMIN: PRODUCT CRUD
// ============================================================

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  features: z.string().optional(),
  material: z.string().optional(),
  fit: z.string().optional(),
  care: z.string().optional(),
  sku: z.string().min(2),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().optional(),
  costPrice: z.coerce.number().optional(),
  categoryId: z.string().min(1),
  brandId: z.string().optional().nullable(),
  tags: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  published: z.coerce.boolean().optional(),
  // Physical
  weightKg: z.coerce.number().optional(),
  lengthCm: z.coerce.number().optional(),
  widthCm: z.coerce.number().optional(),
  heightCm: z.coerce.number().optional(),
  // Shipping
  freeShipping: z.coerce.boolean().optional(),
  shippingClass: z.string().optional(),
  // SEO
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  images: z.array(z.string()).min(1),
  variants: z.array(z.object({
    id: z.string().optional(),
    size: z.string(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    price: z.coerce.number().optional(),
    stock: z.coerce.number().int().min(0),
    lowStockThreshold: z.coerce.number().int().min(0).optional(),
    imageUrl: z.string().optional(),
    weightKg: z.coerce.number().optional(),
  })),
})

export async function adminCreateProduct(input: Record<string, any>) {
  // Auth + permission gate
  const user = await requireStaffWithPermission('product.create')

  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }
  const data = parsed.data
  try {
    const created = await db.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        features: data.features,
        material: data.material,
        fit: data.fit,
        care: data.care,
        sku: data.sku,
        price: data.price,
        salePrice: data.salePrice,
        costPrice: data.costPrice,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        tags: data.tags,
        featured: data.featured ?? false,
        published: data.published ?? true,
        weightKg: data.weightKg,
        lengthCm: data.lengthCm,
        widthCm: data.widthCm,
        heightCm: data.heightCm,
        freeShipping: data.freeShipping,
        shippingClass: data.shippingClass,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        images: {
          create: data.images.map((url, i) => ({ url, altText: data.name, position: i })),
        },
        variants: {
          create: data.variants.map((v) => ({
            size: v.size,
            sku: v.sku ?? `${data.sku}-${v.size}`,
            barcode: v.barcode,
            price: v.price,
            stock: v.stock,
            lowStockThreshold: v.lowStockThreshold ?? 5,
            imageUrl: v.imageUrl,
            weightKg: v.weightKg,
          })),
        },
      },
      include: { images: true, variants: true },
    })

    // Audit log
    await auditLog({
      actorId: user.id,
      action: 'product.create',
      entityType: 'Product',
      entityId: created.id,
      after: { name: created.name, slug: created.slug, sku: created.sku, price: created.price, salePrice: created.salePrice },
      description: `Created product "${created.name}" (SKU ${created.sku}, ₦${created.price.toLocaleString()})`,
    })

    revalidatePath('/shop')
    revalidatePath('/admin/products')
    return { ok: true, id: created.id }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Could not create product' }
  }
}

export async function adminUpdateProduct(id: string, input: Record<string, any>) {
  // Auth + permission gate
  const user = await requireStaffWithPermission('product.update')

  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }
  const data = parsed.data
  try {
    // Fetch existing for audit diff
    const before = await db.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    })

    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          features: data.features,
          material: data.material,
          fit: data.fit,
          care: data.care,
          sku: data.sku,
          price: data.price,
          salePrice: data.salePrice,
          costPrice: data.costPrice,
          categoryId: data.categoryId,
          brandId: data.brandId || null,
          tags: data.tags,
          featured: data.featured ?? false,
          published: data.published ?? true,
          weightKg: data.weightKg,
          lengthCm: data.lengthCm,
          widthCm: data.widthCm,
          heightCm: data.heightCm,
          freeShipping: data.freeShipping,
          shippingClass: data.shippingClass,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          seoKeywords: data.seoKeywords,
        },
      })
      // Replace images
      await tx.productImage.deleteMany({ where: { productId: id } })
      await tx.productImage.createMany({
        data: data.images.map((url, i) => ({ url, altText: data.name, position: i, productId: id })),
      })
      // Replace variants (simple approach — could be improved for diffing)
      await tx.productVariant.deleteMany({ where: { productId: id } })
      await tx.productVariant.createMany({
        data: data.variants.map((v) => ({
          productId: id,
          size: v.size,
          sku: v.sku ?? `${data.sku}-${v.size}`,
          barcode: v.barcode,
          price: v.price,
          stock: v.stock,
          lowStockThreshold: v.lowStockThreshold ?? 5,
          imageUrl: v.imageUrl,
          weightKg: v.weightKg,
        })),
      })
    })

    // Audit log
    if (before) {
      const changes = diffChangedFields(
        { name: before.name, price: before.price, salePrice: before.salePrice, featured: before.featured, published: before.published, sku: before.sku },
        { name: data.name, price: data.price, salePrice: data.salePrice, featured: data.featured, published: data.published, sku: data.sku },
      )
      const desc = Object.keys(changes).length > 0
        ? `Updated product "${data.name}" — ${describeChanges(changes, { name: 'name', price: 'price', salePrice: 'salePrice', featured: 'featured', published: 'published', sku: 'SKU' })}`
        : `Updated product "${data.name}" (images/variants refreshed)`
      await auditLog({
        actorId: user.id,
        action: 'product.update',
        entityType: 'Product',
        entityId: id,
        before: { name: before.name, sku: before.sku, price: before.price },
        after: { name: data.name, sku: data.sku, price: data.price },
        description: desc,
      })
    }

    revalidatePath('/shop')
    revalidatePath('/admin/products')
    revalidatePath(`/product/${data.slug}`)
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Could not update product' }
  }
}

export async function adminDeleteProduct(id: string) {
  const user = await requireStaffWithPermission('product.delete')
  try {
    const product = await db.product.findUnique({ where: { id }, select: { name: true, sku: true, slug: true } })
    if (!product) return { ok: false, error: 'Product not found' }

    await db.product.delete({ where: { id } })

    await auditLog({
      actorId: user.id,
      action: 'product.delete',
      entityType: 'Product',
      entityId: id,
      before: product,
      description: `Deleted product "${product.name}" (SKU ${product.sku})`,
    })

    revalidatePath('/shop')
    revalidatePath('/admin/products')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// ADMIN: ORDER MANAGEMENT
// ============================================================

export async function adminUpdateOrderStatus(orderId: string, status: any, note?: string, trackingNumber?: string, trackingUrl?: string) {
  // Permission: cancel/refund have stricter requirements than status update
  const permCode = status === 'CANCELLED' || status === 'REFUNDED' || status === 'PARTIALLY_REFUNDED'
    ? 'order.refund'
    : 'order.update_status'
  const user = await requireStaffWithPermission(permCode)

  try {
    const before = await db.order.findUnique({
      where: { id: orderId },
      select: { orderNumber: true, status: true, trackingNumber: true, customerName: true },
    })
    if (!before) return { ok: false, error: 'Order not found' }

    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(trackingNumber !== undefined ? { trackingNumber } : {}),
          ...(trackingUrl !== undefined ? { trackingUrl } : {}),
          // Set timestamps for shipped/delivered/cancelled
          ...(status === 'SHIPPED' ? { shippedAt: new Date() } : {}),
          ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
          ...(status === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
          statusHistory: { create: { status, note } },
        },
      })
    })

    await auditLog({
      actorId: user.id,
      action: 'order.update_status',
      entityType: 'Order',
      entityId: orderId,
      before: { status: before.status, trackingNumber: before.trackingNumber },
      after: { status, trackingNumber, note },
      description: `Updated order ${before.orderNumber} status: ${before.status} → ${status}${note ? ` (${note})` : ''}`,
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// ADMIN: SETTINGS
// ============================================================

export async function adminUpdateSettings(input: Record<string, any>) {
  const user = await requireStaffWithPermission('settings.manage')
  try {
    const before = await db.adminSettings.findUnique({ where: { id: 'singleton' } })
    await db.adminSettings.upsert({
      where: { id: 'singleton' },
      update: input,
      create: { id: 'singleton', ...input },
    })
    await auditLog({
      actorId: user.id,
      action: 'settings.update',
      entityType: 'AdminSettings',
      entityId: 'singleton',
      before,
      after: input,
      description: 'Updated store settings',
    })
    revalidatePath('/admin/settings')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function adminUpdateHomepageContent(input: Record<string, any>) {
  const user = await requireStaffWithPermission('cms.manage')
  try {
    const before = await db.homepageContent.findUnique({ where: { id: 'singleton' } })
    await db.homepageContent.upsert({
      where: { id: 'singleton' },
      update: input,
      create: { id: 'singleton', ...input },
    })
    await auditLog({
      actorId: user.id,
      action: 'cms.update',
      entityType: 'HomepageContent',
      entityId: 'singleton',
      before,
      after: input,
      description: 'Updated homepage content',
    })
    revalidatePath('/')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

// ============================================================
// AUTH: REGISTER / RESET
// ============================================================

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
})

export async function registerUser(formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }
  const { name, email, password, phone } = parsed.data
  const bcrypt = await import('bcryptjs')
  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) {
    return { ok: false, error: 'An account with this email already exists.' }
  }
  const passwordHash = await bcrypt.hash(password, 10)
  await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      role: 'CUSTOMER',
    },
  })
  return { ok: true }
}

// ============================================================
// ACCOUNT: ADDRESS MANAGEMENT
// ============================================================

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  state: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(5),
  landmark: z.string().optional(),
  isDefault: z.coerce.boolean().optional(),
})

export async function saveAddress(formData: FormData) {
  const session = await getSession()
  if (!session?.user?.id) return { ok: false, error: 'Not authenticated' }
  const parsed = addressSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message }
  const data = parsed.data
  const id = formData.get('id') as string | null
  try {
    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      })
    }
    if (id) {
      await db.address.update({ where: { id }, data })
    } else {
      await db.address.create({ data: { ...data, userId: session.user.id } })
    }
    revalidatePath('/account/addresses')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message }
  }
}

export async function deleteAddress(id: string) {
  const session = await getSession()
  if (!session?.user?.id) return { ok: false, error: 'Not authenticated' }
  await db.address.deleteMany({ where: { id, userId: session.user.id } })
  revalidatePath('/account/addresses')
  return { ok: true }
}

// ============================================================
// ACCOUNT: PROFILE MANAGEMENT
// ============================================================

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Phone number must be at least 7 characters'),
  whatsappNumber: z.string().optional(),
})

export async function updateProfile(formData: FormData) {
  const session = await getSession()
  if (!session?.user?.id) return { ok: false, error: 'Not authenticated' }
  const parsed = profileSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }
  const { name, phone, whatsappNumber } = parsed.data
  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        whatsappNumber: whatsappNumber || null,
      },
    })
    revalidatePath('/account')
    revalidatePath('/account/profile')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Could not update profile' }
  }
}

// ============================================================
// SERVICES — service enquiry submission (public, guest-friendly)
// ============================================================

const serviceEnquirySchema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  whatsappNumber: z.string().optional(),
  serviceSlug: z.string().min(1, 'Please select a service'),
  serviceName: z.string().min(1),
  occasion: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  location: z.string().optional(),
  budget: z.string().optional(),
  clothingSize: z.string().optional(),
  message: z.string().min(5, 'Please tell us a bit more about what you need'),
})

export async function submitServiceEnquiry(formData: FormData) {
  const parsed = serviceEnquirySchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form and try again.' }
  }
  const d = parsed.data

  // Optional: link to authenticated user if logged in
  const session = await getSession()
  const userId = session?.user?.id || null

  // Generate enquiry number: SVC-YYYY-NNNN
  const year = new Date().getFullYear()
  const count = await db.serviceEnquiry.count()
  const enquiryNumber = `SVC-${year}-${String(count + 1).padStart(4, '0')}`

  try {
    const created = await db.serviceEnquiry.create({
      data: {
        enquiryNumber,
        userId,
        customerName: d.name,
        email: d.email.toLowerCase(),
        phone: d.phone,
        whatsappNumber: d.whatsappNumber || null,
        serviceSlug: d.serviceSlug,
        serviceName: d.serviceName,
        occasion: d.occasion || null,
        preferredDate: d.preferredDate ? new Date(d.preferredDate) : null,
        preferredTime: d.preferredTime || null,
        location: d.location || null,
        budget: d.budget || null,
        clothingSize: d.clothingSize || null,
        message: d.message,
      },
    })
    revalidatePath('/admin/services/enquiries')
    return { ok: true, enquiryNumber: created.enquiryNumber }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Could not submit enquiry. Please try again.' }
  }
}
