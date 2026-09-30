'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type WishlistLine = {
  productId: string
  variantId?: string
  size?: string
  name?: string
  slug?: string
  price?: number
  image?: string
  addedAt: number
}

type WishlistState = {
  lines: WishlistLine[]
  hydrated: boolean
  add: (line: Omit<WishlistLine, 'addedAt'>) => void
  remove: (productId: string) => void
  has: (productId: string) => boolean
  toggle: (line: Omit<WishlistLine, 'addedAt'>) => void
  clear: () => void
  setHydrated: (v: boolean) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      lines: [],
      hydrated: false,
      add: (line) => {
        if (get().has(line.productId)) return
        set((state) => ({
          lines: [...state.lines, { ...line, addedAt: Date.now() }],
        }))
      },
      remove: (productId) => {
        set((state) => ({
          lines: state.lines.filter((l) => l.productId !== productId),
        }))
      },
      has: (productId) => get().lines.some((l) => l.productId === productId),
      toggle: (line) => {
        if (get().has(line.productId)) {
          get().remove(line.productId)
        } else {
          get().add(line)
        }
      },
      clear: () => set({ lines: [] }),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: 'wc-wishlist',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
