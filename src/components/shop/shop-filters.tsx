'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useMemo } from 'react'
import { SlidersHorizontal, X, Check, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

type FilterProps = {
  categories: { name: string; slug: string; children: { name: string; slug: string }[] }[]
  sizes: string[]
  priceRange: [number, number]
  productCount?: number
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

export function ShopFilters({ categories, sizes, priceRange, productCount }: FilterProps) {
  const router = useRouter()
  const params = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const updateParam = (key: string, value: string | null) => {
    const sp = new URLSearchParams(params.toString())
    if (value === null || value === '') sp.delete(key)
    else sp.set(key, value)
    router.push(`/shop?${sp.toString()}`, { scroll: false })
  }

  const activeCategory = params.get('category') || ''
  const activeSize = params.get('size') || ''
  const activeSort = params.get('sort') || 'featured'
  const activeMin = params.get('minPrice') ? Number(params.get('minPrice')) : null
  const activeMax = params.get('maxPrice') ? Number(params.get('maxPrice')) : null

  const activeCount = useMemo(() => {
    let n = 0
    if (activeCategory) n++
    if (activeSize) n++
    if (activeMin !== null) n++
    if (activeMax !== null) n++
    if (activeSort !== 'featured') n++
    return n
  }, [activeCategory, activeSize, activeMin, activeMax, activeSort])

  const activeCategoryLabel = useMemo(() => {
    if (!activeCategory) return null
    for (const c of categories) {
      if (c.slug === activeCategory) return c.name
      const child = c.children.find((ch) => ch.slug === activeCategory)
      if (child) return child.name
    }
    return null
  }, [activeCategory, categories])

  const clearAll = () => router.push('/shop', { scroll: false })

  const filterContent = (
    <div className="space-y-8">
      {/* Sort */}
      <div>
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Sort</h3>
        <div className="space-y-2">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => updateParam('sort', s.value)}
              className={cn(
                'flex items-center justify-between w-full text-sm py-1.5 hover:text-foreground transition-colors',
                activeSort === s.value ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {s.label}
              {activeSort === s.value && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Category</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam('category', null)}
            className={cn(
              'flex items-center justify-between w-full text-sm py-1 hover:text-foreground transition-colors',
              !activeCategory ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            All Products
            {!activeCategory && <Check className="h-3.5 w-3.5" />}
          </button>
          {categories.map((c) => (
            <div key={c.slug}>
              <button
                onClick={() => updateParam('category', c.slug)}
                className={cn(
                  'flex items-center justify-between w-full text-sm py-1.5 hover:text-foreground transition-colors font-medium',
                  activeCategory === c.slug ? 'text-foreground' : 'text-foreground/80',
                )}
              >
                {c.name}
                {activeCategory === c.slug && <Check className="h-3.5 w-3.5" />}
              </button>
              {activeCategory === c.slug && c.children.length > 0 && (
                <div className="ml-3 mt-1 space-y-1 border-l border-border pl-3">
                  {c.children.map((ch) => (
                    <button
                      key={ch.slug}
                      onClick={() => updateParam('category', ch.slug)}
                      className="block w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      {ch.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => updateParam('size', activeSize === s ? null : s)}
              className={cn(
                'min-w-[2.5rem] px-3 py-1.5 text-xs border transition-colors',
                activeSize === s
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <select
            value={activeMin ?? ''}
            onChange={(e) => updateParam('minPrice', e.target.value || null)}
            className="text-xs border border-border px-2 py-1.5 bg-background flex-1 min-w-0"
          >
            <option value="">Min</option>
            <option value="0">₦0</option>
            <option value="10000">₦10,000</option>
            <option value="20000">₦20,000</option>
            <option value="40000">₦40,000</option>
            <option value="60000">₦60,000</option>
          </select>
          <span className="text-muted-foreground flex-shrink-0">—</span>
          <select
            value={activeMax ?? ''}
            onChange={(e) => updateParam('maxPrice', e.target.value || null)}
            className="text-xs border border-border px-2 py-1.5 bg-background flex-1 min-w-0"
          >
            <option value="">Max</option>
            <option value="15000">₦15,000</option>
            <option value="25000">₦25,000</option>
            <option value="50000">₦50,000</option>
            <option value="100000">₦100,000</option>
            <option value="200000">₦200,000</option>
          </select>
        </div>
      </div>

      {(activeCategory || activeSize || activeMin || activeMax) && (
        <button
          onClick={clearAll}
          className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar — sticky on left, visible lg+ */}
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-32 self-start max-h-[calc(100vh-9rem)] overflow-y-auto thin-scroll pr-4">
        {filterContent}
      </aside>

      {/* Mobile / Tablet sticky control bar — visible below lg breakpoint.
          Single row, no overflow, no second row of chips — keeps the bar short
          and reliable on small screens. */}
      <div className="lg:hidden sticky top-14 sm:top-20 z-20 -mx-4 sm:-mx-6 mb-4 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 sm:px-6 py-2.5 flex items-center gap-2">
          {/* Filter button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="relative flex items-center gap-2 px-3 py-2 border border-border text-[11px] uppercase tracking-[0.18em] flex-shrink-0"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>Filter</span>
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-foreground text-background text-[9px] font-medium rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {/* Active filter pill or product count */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {activeCategoryLabel ? (
              <button
                onClick={() => updateParam('category', null)}
                className="flex items-center gap-1 text-xs text-foreground whitespace-nowrap max-w-full"
              >
                <span className="font-medium truncate">{activeCategoryLabel}</span>
                <X className="h-3 w-3 flex-shrink-0" strokeWidth={2} />
              </button>
            ) : activeSize ? (
              <button
                onClick={() => updateParam('size', null)}
                className="flex items-center gap-1 text-xs text-foreground whitespace-nowrap"
              >
                <span className="font-medium">Size {activeSize}</span>
                <X className="h-3 w-3 flex-shrink-0" strokeWidth={2} />
              </button>
            ) : (
              <span className="text-xs text-muted-foreground">
                {productCount !== undefined
                  ? `${productCount} ${productCount === 1 ? 'item' : 'items'}`
                  : 'All Products'}
              </span>
            )}
          </div>

          {/* Sort dropdown (compact) */}
          <div className="relative flex-shrink-0">
            <select
              value={activeSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 border border-border text-[11px] uppercase tracking-[0.15em] bg-background cursor-pointer"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Mobile filter Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-full sm:max-w-sm p-0 flex flex-col bg-background">
          <SheetHeader className="px-6 py-5 border-b border-border flex-row items-center justify-between space-y-0">
            <div>
              <SheetTitle className="font-display text-lg">Filters</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {productCount !== undefined ? `${productCount} ${productCount === 1 ? 'product' : 'products'}` : 'Refine your search'}
              </p>
            </div>
            <button onClick={() => setMobileOpen(false)} aria-label="Close" className="p-1 -mr-1">
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </SheetHeader>
          <SheetDescription className="sr-only">Filter products</SheetDescription>
          <div className="flex-1 overflow-y-auto thin-scroll px-6 py-6">
            {filterContent}
          </div>
          {/* Sticky footer with apply/clear */}
          <div className="border-t border-border px-6 py-4 flex items-center gap-3 bg-background">
            <button
              onClick={clearAll}
              className="flex-1 py-2.5 text-[11px] uppercase tracking-[0.18em] border border-border hover:border-foreground transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex-1 py-2.5 text-[11px] uppercase tracking-[0.18em] bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Show {productCount !== undefined ? productCount : 'Results'}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
