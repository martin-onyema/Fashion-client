'use client'

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useUIStore } from '@/lib/stores/ui-store'
import { Search, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { getProducts } from '@/lib/queries'
import { formatNGN } from '@/lib/format'

const POPULAR_SEARCHES = ['Shirts', 'Polos', 'Jeans', 'Sneakers', 'Fragrance', 'Hoodies']

export function SearchOverlay() {
  const open = useUIStore((s) => s.searchOpen)
  const setOpen = useUIStore((s) => s.setSearchOpen)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await getProducts({ search: query.trim(), limit: 6 })
        setResults(r)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="top"
        className="h-[100vh] sm:h-[85vh] w-full p-0 border-0 bg-background"
      >
        <SheetTitle className="sr-only">Search Wardrobecare</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 lg:px-10 pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Search Wardrobecare
              </p>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-muted rounded-sm transition-colors"
                aria-label="Close search"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex items-center border-b border-foreground/30 py-4">
              <Search className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, categories…"
                className="flex-1 bg-transparent ml-4 text-2xl md:text-4xl font-display outline-none placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto thin-scroll px-6 lg:px-10 py-8">
            {!query.trim() ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-5">
                  Popular searches
                </p>
                <div className="flex flex-wrap gap-3">
                  {POPULAR_SEARCHES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-5 py-2 border border-border text-sm hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : loading ? (
              <p className="text-sm text-muted-foreground">Searching…</p>
            ) : results.length === 0 ? (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  No products found for &ldquo;{query}&rdquo;.
                </p>
                <Link
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 text-sm link-underline"
                >
                  Browse all products
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="group flex gap-4"
                  >
                    <div className="relative w-20 h-24 bg-muted flex-shrink-0 overflow-hidden">
                      {p.images[0]?.url && (
                        <Image
                          src={p.images[0].url}
                          alt={p.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {p.category?.name}
                      </p>
                      <h4 className="text-sm font-medium leading-snug mt-1 line-clamp-2 group-hover:underline">
                        {p.name}
                      </h4>
                      <p className="text-sm mt-1.5 tabular-nums">
                        {formatNGN(p.salePrice ?? p.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
