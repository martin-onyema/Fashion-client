'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type CartLineInput = {
  productId: string
  variantId?: string
  size?: string
  quantity: number
}

// Full cart line — includes display data so the cart drawer/page/checkout can
// render immediately from the store without an async fetch round-trip.
export type CartLine = CartLineInput & {
  name?: string
  slug?: string
  price?: number
  image?: string
  sku?: string
  originalPrice?: number
}

type CartState = {
  lines: CartLine[]
  hydrated: boolean
  // Adds that happened BEFORE persist hydration completed. We replay these
  // after onRehydrateStorage fires so they aren't clobbered by the merge.
  pendingAdds: CartLine[]
  add: (line: CartLine) => void
  remove: (productId: string, variantId?: string) => void
  setQuantity: (productId: string, variantId: string | undefined, qty: number) => void
  clear: () => void
  setHydrated: (v: boolean) => void
  flushPending: () => void
}

function mergeLineInto(lines: CartLine[], line: CartLine): CartLine[] {
  const existing = lines.find(
    (l) =>
      l.productId === line.productId &&
      l.variantId === line.variantId &&
      l.size === line.size,
  )
  if (existing) {
    return lines.map((l) =>
      l === existing ? { ...l, quantity: l.quantity + line.quantity } : l,
    )
  }
  return [...lines, line]
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      hydrated: false,
      pendingAdds: [],

      add: (line) => {
        // If persist hasn't finished rehydrating yet, queue the add. Otherwise
        // the async rehydration can clobber the in-memory update — that's the
        // bug that was making the cart show empty right after adding an item.
        if (!get().hydrated) {
          set((state) => ({ pendingAdds: [...state.pendingAdds, line] }))
          return
        }
        set((state) => ({ lines: mergeLineInto(state.lines, line) }))
      },

      remove: (productId, variantId) => {
        if (!get().hydrated) return // ignore removes during hydration
        set((state) => ({
          lines: state.lines.filter(
            (l) =>
              !(
                l.productId === productId &&
                (variantId === undefined || l.variantId === variantId)
              ),
          ),
        }))
      },

      setQuantity: (productId, variantId, qty) => {
        if (!get().hydrated) return // ignore qty changes during hydration
        if (qty < 1) {
          get().remove(productId, variantId)
          return
        }
        set((state) => ({
          lines: state.lines.map((l) =>
            l.productId === productId &&
            (variantId === undefined || l.variantId === variantId)
              ? { ...l, quantity: qty }
              : l,
          ),
        }))
      },

      clear: () => {
        if (!get().hydrated) return
        set({ lines: [], pendingAdds: [] })
      },

      setHydrated: (v) => set({ hydrated: v }),

      // Called by onRehydrateStorage AFTER localStorage has been merged in.
      // Replays any add() calls that arrived during the hydration race window.
      flushPending: () => {
        const { pendingAdds, lines } = get()
        if (pendingAdds.length === 0) return
        let next = lines
        for (const line of pendingAdds) {
          next = mergeLineInto(next, line)
        }
        set({ lines: next, pendingAdds: [] })
      },
    }),
    {
      name: 'wc-cart',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Hydration finished — flag the store and replay any queued adds
        // so user interactions during the race window aren't lost.
        state?.setHydrated(true)
        state?.flushPending()
      },
      // Don't persist the hydrated flag or pendingAdds — they should reset
      // on every page load.
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
)
