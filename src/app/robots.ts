import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/account', '/api', '/checkout'],
    },
    sitemap: 'https://wardrobecare.com.ng/sitemap.xml',
  }
}
