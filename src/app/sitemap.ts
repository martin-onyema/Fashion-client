import { db } from '@/lib/db'
import { SERVICES } from '@/lib/services-data'
import { HUB_LIST } from '@/lib/category-hubs'

/**
 * Sitemap — resilient by design.
 *
 * During `next build` this page is statically prerendered. If the database
 * is unreachable or DATABASE_URL is not configured yet (e.g. a first deploy
 * on Vercel before the env vars are pasted), the DB queries must NEVER fail
 * the build — we degrade gracefully to the static page list instead.
 */
async function dbEntries(baseUrl: string) {
  try {
    const products = await db.product.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    })

    const productPages = products.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    const categories = await db.category.findMany({
      where: { parentId: null },
      select: { slug: true },
    })

    const categoryPages = categories.map((c) => ({
      url: `${baseUrl}/shop?category=${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...productPages, ...categoryPages]
  } catch (e) {
    console.warn(
      '[sitemap] database unavailable during build — generating sitemap without products:',
      e instanceof Error ? e.message : e,
    )
    return []
  }
}

export default async function sitemap() {
  const baseUrl = 'https://wardrobecare.com.ng'

  const staticPages = [
    '', '/shop', '/services', '/about', '/faq', '/shipping', '/returns', '/track-order',
    '/privacy', '/terms', '/digital-closet', '/gift-card', '/measurement-guide',
    '/delivery-charges',
    '/account/login', '/account/register',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }))

  // Category hub pages (Clothing / Footwear / Accessories / Fragrance & Grooming)
  const hubPages = HUB_LIST.map((hub) => ({
    url: `${baseUrl}/${hub.route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Service pages
  const servicePages = [
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    ...SERVICES.map((s) => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]

  const dbPages = await dbEntries(baseUrl)

  return [...staticPages, ...hubPages, ...servicePages, ...dbPages]
}
