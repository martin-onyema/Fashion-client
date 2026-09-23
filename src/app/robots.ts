import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/account', '/api', '/checkout', '/gift-card/checkout', '/services/personal-shopping/book', '/services/personal-shopping/confirmed'],
    },
    sitemap: 'https://wardrobecare.com.ng/sitemap.xml',
  }
}
