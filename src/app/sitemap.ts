import { db } from '@/lib/db'
import { SERVICES } from '@/lib/services-data'

// The sitemap must never break a deploy or a request. If the database is
// unreachable (e.g. during provisioning), we still return the static +
// service pages and simply omit catalogue URLs until the DB is back.
export const dynamic = 'force-dynamic'

export default async function sitemap() {
  const baseUrl = 'https://wardrobecare.com.ng'

  const staticPages = [
    '', '/shop', '/services', '/about', '/faq', '/shipping', '/returns', '/track-order',
    '/account/login', '/account/register',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
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

  let products: { slug: string; updatedAt: Date }[] = []
  let categories: { slug: string }[] = []

  try {
    ;[products, categories] = await Promise.all([
      db.product.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      db.category.findMany({
        where: { parentId: null },
        select: { slug: true },
      }),
    ])
  } catch (error) {
    console.error('[sitemap] Database unavailable — serving static routes only:', error)
  }

  const productPages = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const categoryPages = categories.map((c) => ({
    url: `${baseUrl}/shop?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...servicePages, ...productPages, ...categoryPages]
}
