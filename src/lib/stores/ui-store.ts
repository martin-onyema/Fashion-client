'use client'

import { create } from 'zustand'

type UIState = {
  cartOpen: boolean
  wishlistOpen: boolean
  searchOpen: boolean
  mobileMenuOpen: boolean
  quickViewProductId: string | null
  setCartOpen: (v: boolean) => void
  setWishlistOpen: (v: boolean) => void
  setSearchOpen: (v: boolean) => void
  setMobileMenuOpen: (v: boolean) => void
  setQuickView: (id: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  wishlistOpen: false,
  searchOpen: false,
  mobileMenuOpen: false,
  quickViewProductId: null,
  setCartOpen: (v) => set({ cartOpen: v }),
  setWishlistOpen: (v) => set({ wishlistOpen: v }),
  setSearchOpen: (v) => set({ searchOpen: v }),
  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
  setQuickView: (id) => set({ quickViewProductId: id }),
}))
