'use client'

import { useState, useEffect, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Package, ShoppingCart, Users, FolderTree, Ticket, Star, Flag } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { adminSearch } from '@/actions/admin'
import type { SearchResult } from '@/lib/admin-search'

const ICONS = {
  product: Package,
  order: ShoppingCart,
  customer: Users,
  category: FolderTree,
  brand: Flag,
  coupon: Ticket,
  review: Star,
}

const TYPE_LABELS = {
  product: 'Products',
  order: 'Orders',
  customer: 'Customers',
  category: 'Categories',
  brand: 'Brands',
  coupon: 'Coupons',
  review: 'Reviews',
}

export function AdminGlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, startSearch] = useTransition()

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(() => {
      startSearch(async () => {
        const r = await adminSearch(query)
        setResults(r)
      })
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  // Keyboard shortcut Cmd/Ctrl+K handled by parent
  function selectResult(r: SearchResult) {
    onOpenChange(false)
    router.push(r.href)
  }

  // Group results by type for display
  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>()
    for (const r of results) {
      const arr = map.get(r.type) ?? []
      arr.push(r)
      map.set(r.type, arr)
    }
    return Array.from(map.entries())
  }, [results])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Search admin</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <Input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, orders, customers, coupons…"
            className="border-0 shadow-none focus-visible:ring-0 px-0 h-9"
          />
          {searching && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>
        <ScrollArea className="max-h-[400px]">
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {query.trim().length < 2
                ? 'Type at least 2 characters to search…'
                : `No results for "${query}"`}
            </div>
          ) : (
            <div className="py-2">
              {grouped.map(([type, items]) => {
                const Icon = ICONS[type as keyof typeof ICONS] ?? Package
                return (
                  <div key={type} className="mb-2">
                    <p className="label-uppercase text-[10px] text-muted-foreground/70 px-4 py-1.5">
                      {TYPE_LABELS[type as keyof typeof TYPE_LABELS] ?? type}
                    </p>
                    {items.map((r) => (
                      <button
                        key={`${r.type}-${r.id}`}
                        onClick={() => selectResult(r)}
                        className={cn(
                          'w-full flex items-start gap-3 px-4 py-2.5 text-left',
                          'hover:bg-secondary transition-colors',
                        )}
                      >
                        <Icon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{r.title}</p>
                          {r.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>↑↓ to navigate · ↵ to open · Esc to close</span>
          <span>{results.length} result{results.length === 1 ? '' : 's'}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
