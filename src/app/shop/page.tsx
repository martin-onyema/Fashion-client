import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/product/product-card'
import { ShopFilters } from '@/components/shop/shop-filters'
import { getProducts, getCategories } from '@/lib/queries'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Shop All',
  description: 'Browse the full Wardrobecare collection — premium men\'s fashion curated for everyday confidence.',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38', '40', '41', '42', '43', '44', '45', 'OS']

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const category = typeof sp.category === 'string' ? sp.category : undefined
  const search = typeof sp.search === 'string' ? sp.search : undefined
  const sort = typeof sp.sort === 'string' ? sp.sort : 'featured'
  const size = typeof sp.size === 'string' ? sp.size : undefined
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined

  const [products, categories] = await Promise.all([
    getProducts({ category, search, sort, size, minPrice, maxPrice, limit: 100 }),
    getCategories(),
  ])

  // Root categories plus their children, so subcategory slugs (e.g. chinos)
  // resolve to a proper page title.
  const activeCat = categories
    .flatMap((c) => [c, ...c.children])
    .find((c) => c.slug === category)
  const title = activeCat?.name ?? (search ? `Results for "${search}"` : 'All Products')

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="border-b border-border">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-12 md:py-20">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
              The Wardrobecare Edit
            </p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1] tracking-[-0.02em]">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground mt-4 max-w-xl leading-relaxed">
              Premium men&apos;s fashion, curated for the modern wardrobe. From essential tees to tailored suits, fragrance to footwear.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <Suspense fallback={<div className="hidden lg:block w-64" />}>
              <ShopFilters categories={categories} sizes={ALL_SIZES} priceRange={[0, 200000]} productCount={products.length} />
            </Suspense>

            <div className="flex-1 min-w-0 w-full">
              <div className="hidden lg:flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-border">
                <p className="text-xs text-muted-foreground">
                  {products.length} {products.length === 1 ? 'product' : 'products'}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Curated by Wardrobecare
                </p>
              </div>

              {products.length === 0 ? (
                <div className="py-32 text-center">
                  <h3 className="font-display text-3xl mb-3">No products found</h3>
                  <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                    Try adjusting your filters or browse our full collection.
                  </p>
                  <a
                    href="/shop"
                    className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
                  >
                    View All Products
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
                  {products.map((p, i) => (
                    <ProductCard key={p.id} product={p} priority={i < 4} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cross-link to Services */}
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 pb-16">
          <div className="bg-secondary/60 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-border/60">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                Need help finding the right piece?
              </p>
              <h3 className="font-display text-2xl md:text-3xl tracking-tight">
                Explore our styling services.
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Personal shopping, wardrobe consultations, home fittings, and premium sourcing — built around you.
              </p>
            </div>
            <Link
              href="/services"
              className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors flex-shrink-0"
            >
              Explore Services
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
