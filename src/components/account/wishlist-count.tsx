'use client'

import { useWishlistStore } from '@/lib/stores/wishlist-store'

/**
 * Small client island that renders the wishlist count.
 * Uses the store's `hydrated` flag — which starts as `false` on both server
 * and first client render (so there is no hydration mismatch) and flips to
 * `true` after the persisted store rehydrates from localStorage.
 */
export function WishlistCount({ fallback = 0 }: { fallback?: number }) {
  const hydrated = useWishlistStore((s) => s.hydrated)
  const count = useWishlistStore((s) => s.lines.length)
  if (!hydrated) {
    return <span>{fallback}</span>
  }
  return <span>{count}</span>
}
