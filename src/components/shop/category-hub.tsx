import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CategoryHubContent } from '@/components/shop/category-hub-content'
import { getCategoryHubData } from '@/lib/queries'
import { HUBS } from '@/lib/category-hubs'

const SITE_URL = 'https://wardrobecare.com.ng'

/** Shared metadata for the four category hub pages (SEO: unique titles,
 *  descriptions and canonicals — hubs never canonicalise to /shop). */
export function hubMetadata(route: string): Metadata {
  const hub = HUBS[route]
  if (!hub) return {}
  const url = `${SITE_URL}/${hub.route}`
  return {
    title: hub.metaTitle,
    description: hub.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: hub.metaTitle,
      description: hub.metaDescription,
      url,
      siteName: 'Wardrobecare Clothing',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: hub.metaTitle,
      description: hub.metaDescription,
    },
  }
}

/**
 * Server shell for a category hub page: fetches the subcategory rails and
 * counts, emits CollectionPage + BreadcrumbList JSON-LD, and renders the
 * editorial hub content between the shared Navbar/Footer.
 */
export async function CategoryHubPage({ route }: { route: string }) {
  const hub = HUBS[route]
  if (!hub) notFound()

  const data = await getCategoryHubData(hub.rootSlug, hub.groups)
  if (!data) notFound()

  const siteName = 'Wardrobecare'
  const pageUrl = `${SITE_URL}/${hub.route}`

  // CollectionPage with an ItemList of the subcategory edits (SEO).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${hub.h1} — ${siteName}`,
    description: hub.metaDescription,
    url: pageUrl,
    isPartOf: { '@type': 'WebSite', name: siteName, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: data.groups.flatMap((g, gi) =>
        g.sections.map((s, si) => ({
          '@type': 'ListItem',
          position: gi * 100 + si + 1,
          name: s.name,
          url: `${SITE_URL}/shop?category=${s.slug}`,
        })),
      ),
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: hub.h1, item: pageUrl },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Navbar />
      <CategoryHubContent hub={hub} data={data} />
      <Footer />
    </>
  )
}
