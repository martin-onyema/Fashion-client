import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { HomeHero } from '@/components/home/hero'
import { HomeServices } from '@/components/home/home-services'
import { ShopIntro } from '@/components/home/shop-intro'
import { ShopByWorld } from '@/components/home/shop-by-world'
import { TheEdit } from '@/components/home/the-edit'
import { NewArrivals } from '@/components/home/new-arrivals'
import { InstagramSection } from '@/components/home/instagram-section'
import {
  getCategories,
  getNewArrivals,
  getFeaturedProducts,
  getHomepageContent,
  getAdminSettings,
} from '@/lib/queries'

export default async function HomePage() {
  const [categories, newArrivals, featured, content, settings] = await Promise.all([
    getCategories(),
    getNewArrivals(10),
    getFeaturedProducts(4),
    getHomepageContent(),
    getAdminSettings(),
  ])

  // Build "worlds" from top-level featured categories that have a usable image.
  // Image source priority: parent category's own image → first child's image → skip.
  const DESCRIPTIONS: Record<string, string> = {
    'new-arrivals': 'The latest additions to the wardrobe.',
    'mens-clothing-surulere-lagos': 'Shirts, polos, tees, blazers, suits and knitwear.',
    'clothing': 'Shirts, polos, tees, blazers, suits and knitwear.',
    'bottoms': 'Chinos, trousers, jeans, shorts and joggers.',
    'mens-fashion-accessories-in-nigeria': 'Belts, bracelets, cufflinks, ties, socks and wallets.',
    'accessories': 'Belts, ties, sunglasses, caps and wallets.',
    'fragrance-grooming': 'Eau de parfum and grooming essentials.',
    'footwear': 'Loafers, dress shoes, sneakers and drivers.',
  }
  const FALLBACK_DESC = 'A curated edit of essentials.'

  const featuredTopCats = categories.filter(
    (c) => c.featured && (c.image || c.children.some((ch) => ch.image)),
  )
  const worlds = featuredTopCats.map((c) => ({
    name: c.name,
    slug: c.slug,
    image: c.image || c.children.find((ch) => ch.image)?.image || '',
    description: DESCRIPTIONS[c.slug] ?? FALLBACK_DESC,
    children: c.children.map((ch) => ({ name: ch.name, slug: ch.slug })),
  }))

  // Parse instagram images
  const igImages = content?.instagramImages
    ? (JSON.parse(content.instagramImages) as string[])
    : []

  return (
    <>
      <Navbar />
      <main className="bg-background">
        {/* 01 — Hero: services-first brand statement */}
        <HomeHero
          title={content?.heroTitle ?? 'A service built around your style.'}
          subtitle={
            content?.heroSubtitle ??
            'Personal shopping, wardrobe consultations, home fittings and more — guided by a real stylist, built around how you live and dress.'
          }
          image={
            content?.heroImage ??
            'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=2000&auto=format&fit=crop'
          }
          primaryCta={content?.heroPrimaryCta ?? 'Explore Services'}
          primaryHref={content?.heroPrimaryHref ?? '/services'}
          secondaryCta={content?.heroSecondaryCta ?? 'Shop Pieces'}
          secondaryHref={content?.heroSecondaryHref ?? '/shop'}
        />

        {/* 02 — What we do: numbered services + editorial promos */}
        <HomeServices />

        {/* 03 — Shop divider */}
        <ShopIntro note={content?.featuredSubtitle ?? undefined} />

        {/* 04 — Categories: Shop by World rail */}
        <ShopByWorld worlds={worlds} />

        {/* 05 — Featured picks */}
        <TheEdit products={featured} />

        {/* 06 — Latest additions */}
        <NewArrivals products={newArrivals} />

        {/* 07 — Community */}
        <InstagramSection
          images={igImages}
          handle={content?.instagramHandle ?? 'wardrobecareng'}
          title={content?.instagramTitle ?? '@wardrobecareng'}
          cta={content?.instagramCta ?? 'Follow the journey'}
        />
      </main>
      <Footer />
    </>
  )
}
