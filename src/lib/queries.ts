import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// ============================================================
// CATALOGUE QUERIES
// ============================================================

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true
    variants: true
    category: { include: { parent: true } }
  }
}>

export async function getCategories() {
  return db.category.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    include: { children: { orderBy: { name: 'asc' } } },
  })
}

export async function getAllCategories() {
  return db.category.findMany({
    orderBy: { name: 'asc' },
    include: { parent: true },
  })
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: { parent: true, children: true },
  })
}

export async function getProducts(params: {
  category?: string
  search?: string
  sort?: string
  minPrice?: number
  maxPrice?: number
  size?: string
  limit?: number
  featuredOnly?: boolean
  publishedOnly?: boolean
}) {
  const {
    category,
    search,
    sort = 'featured',
    minPrice,
    maxPrice,
    size,
    limit = 50,
    featuredOnly,
    publishedOnly = true,
  } = params

  const where: Prisma.ProductWhereInput = {}
  if (publishedOnly) where.published = true

  if (category) {
    const cat = await db.category.findUnique({
      where: { slug: category },
      include: { children: true },
    })
    if (cat) {
      const catIds = [cat.id, ...cat.children.map((c) => c.id)]
      where.categoryId = { in: catIds }
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { tags: { contains: search } },
      { sku: { contains: search } },
    ]
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) where.price.gte = minPrice
    if (maxPrice !== undefined) where.price.lte = maxPrice
  }

  if (size) {
    where.variants = { some: { size } }
  }

  if (featuredOnly) where.featured = true

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'newest'
      ? { createdAt: 'desc' }
      : sort === 'price-asc'
        ? { price: 'asc' }
        : sort === 'price-desc'
          ? { price: 'desc' }
          : { featured: 'desc' }

  return db.product.findMany({
    where,
    orderBy,
    take: limit,
    include: {
      images: { orderBy: { position: 'asc' } },
      variants: true,
      category: { include: { parent: true } },
    },
  })
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: 'asc' } },
      variants: true,
      category: { include: { parent: true } },
      reviews: { where: { published: true }, orderBy: { createdAt: 'desc' } },
    },
  })
}

export async function getFeaturedProducts(limit = 8) {
  return db.product.findMany({
    where: { featured: true, published: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      images: { orderBy: { position: 'asc' }, take: 2 },
      variants: true,
      category: true,
    },
  })
}

export async function getNewArrivals(limit = 12) {
  return db.product.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      images: { orderBy: { position: 'asc' }, take: 2 },
      variants: true,
      category: true,
    },
  })
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  return db.product.findMany({
    where: {
      categoryId,
      published: true,
      id: { not: productId },
    },
    take: limit,
    include: {
      images: { orderBy: { position: 'asc' }, take: 1 },
      variants: true,
      category: true,
    },
  })
}

// ============================================================
// HOMEPAGE / CMS CONTENT
// ============================================================

export async function getHomepageContent() {
  const c = await db.homepageContent.findUnique({ where: { id: 'singleton' } })
  return c
}

export async function getAdminSettings() {
  const s = await db.adminSettings.findUnique({ where: { id: 'singleton' } })
  return s
}

export async function getActiveBanners() {
  const now = new Date()
  return db.promotionalBanner.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { order: 'asc' },
  })
}

export async function getFAQs(category?: string) {
  return db.fAQ.findMany({
    where: { published: true, ...(category ? { category } : {}) },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })
}

// ============================================================
// CART / WISHLIST (server-side snapshot for hydration)
// ============================================================

export async function getCartWithProducts(lines: { productId: string; variantId?: string | null; size?: string | null; quantity: number }[]) {
  if (!lines.length) return []
  const products = await db.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) } },
    include: {
      images: { orderBy: { position: 'asc' }, take: 1 },
      variants: true,
    },
  })
  return lines.map((line) => {
    const p = products.find((p) => p.id === line.productId)
    if (!p) return null
    const variant = line.variantId
      ? p.variants.find((v) => v.id === line.variantId)
      : undefined
    return {
      ...line,
      name: p.name,
      slug: p.slug,
      price: variant?.price ?? p.salePrice ?? p.price,
      originalPrice: p.salePrice ? p.price : undefined,
      image: p.images[0]?.url,
      sku: variant?.sku ?? p.sku,
      inStock: variant ? variant.stock > 0 : p.variants.some((v) => v.stock > 0),
      maxQuantity: variant?.stock ?? Math.max(...p.variants.map((v) => v.stock), 0),
    }
  }).filter(Boolean)
}

// ============================================================
// ANALYTICS (admin)
// ============================================================

export async function getAdminStats(daysBack: number = 30) {
  const now = new Date()
  const since = new Date()
  since.setDate(since.getDate() - daysBack)

  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    customers,
    newCustomers,
    recentOrders,
    revenueAgg,
    refundsAgg,
    avgOrderAgg,
    cancelledOrders,
  ] = await Promise.all([
    db.order.count({
      where: { createdAt: { gte: since } },
    }),
    db.order.count({
      where: {
        createdAt: { gte: since },
        status: { in: ['PENDING', 'PAID', 'PROCESSING', 'READY_FOR_DISPATCH'] },
      },
    }),
    db.order.count({
      where: {
        createdAt: { gte: since },
        status: 'DELIVERED',
      },
    }),
    db.product.count({ where: { published: true } }),
    db.productVariant.count({ where: { stock: { lte: 5, gt: 0 } } }),
    db.productVariant.count({ where: { stock: { lte: 0 } } }),
    db.user.count({ where: { role: 'CUSTOMER' } }),
    // New customers (joined in the window)
    db.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: since },
      },
    }),
    db.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      where: { createdAt: { gte: since } },
      include: { items: true, user: true },
    }),
    db.order.aggregate({
      where: {
        createdAt: { gte: since },
        status: { in: ['DELIVERED', 'SHIPPED', 'READY_FOR_DISPATCH'] },
      },
      _sum: { total: true },
    }),
    // Refunds total in window
    db.refund.aggregate({
      where: {
        createdAt: { gte: since },
        status: { in: ['SUCCESS', 'PARTIAL'] },
      },
      _sum: { amount: true },
    }),
    // Average order value
    db.order.aggregate({
      where: {
        createdAt: { gte: since },
        status: { notIn: ['CANCELLED'] },
      },
      _avg: { total: true },
      _count: true,
    }),
    db.order.count({
      where: {
        createdAt: { gte: since },
        status: 'CANCELLED',
      },
    }),
  ])

  // Compute returning customers (ordered in this window AND had a previous order)
  // For perf, just count customers who have >1 order total. Approximate but useful.
  const returningCustomersResult = await db.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*) as count FROM (
      SELECT "userId"
      FROM "Order"
      WHERE "userId" IS NOT NULL
        AND "createdAt" >= ${since}
        AND "status" != 'CANCELLED'
      GROUP BY "userId"
      HAVING COUNT(*) > 1
    ) as sub
  `
  const returningCustomers = Number(returningCustomersResult[0]?.count ?? 0)

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    customers,
    newCustomers,
    returningCustomers,
    recentOrders,
    revenue: revenueAgg._sum.total ?? 0,
    refunds: refundsAgg._sum.amount ?? 0,
    netRevenue: (revenueAgg._sum.total ?? 0) - (refundsAgg._sum.amount ?? 0),
    avgOrderValue: avgOrderAgg._avg.total ?? 0,
    ordersForAov: avgOrderAgg._count ?? 0,
  }
}

export async function getTopProducts(limit = 5, sinceDays: number | null = null) {
  const where = sinceDays
    ? {
        order: {
          createdAt: {
            gte: new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000),
          },
          status: { notIn: ['CANCELLED'] },
        },
      }
    : {}
  const items = await db.orderItem.groupBy({
    by: ['productId', 'productName', 'productSlug', 'productImage'],
    where,
    _sum: { quantity: true, totalPrice: true },
    _count: true,
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  })
  return items
}

export async function getSalesByCategory() {
  const items = await db.orderItem.findMany({
    select: {
      quantity: true,
      totalPrice: true,
      product: { select: { category: { select: { name: true, parent: { select: { name: true } } } } } },
    },
  })
  const byCat = new Map<string, { revenue: number; quantity: number }>()
  for (const it of items) {
    const catName = it.product.category.parent?.name ?? it.product.category.name
    const existing = byCat.get(catName) ?? { revenue: 0, quantity: 0 }
    existing.revenue += it.totalPrice
    existing.quantity += it.quantity
    byCat.set(catName, existing)
  }
  return Array.from(byCat.entries()).map(([name, v]) => ({ name, ...v }))
}

export async function getRevenueTrend(days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const orders = await db.order.findMany({
    where: { createdAt: { gte: since }, status: { notIn: ['CANCELLED'] } },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: 'asc' },
  })
  // group by day
  const byDay = new Map<string, number>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    byDay.set(key, 0)
  }
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10)
    byDay.set(key, (byDay.get(key) ?? 0) + o.total)
  }
  return Array.from(byDay.entries()).map(([date, revenue]) => ({ date, revenue }))
}
