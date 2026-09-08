'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode } from 'react'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { SearchOverlay } from '@/components/shop/search-overlay'
import { QuickViewDrawer } from '@/components/shop/quick-view'
import { MobileMenu } from '@/components/shop/mobile-menu'
import { WishlistDrawer } from '@/components/shop/wishlist-drawer'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <CartDrawer />
        <WishlistDrawer />
        <SearchOverlay />
        <QuickViewDrawer />
        <MobileMenu />
      </QueryClientProvider>
    </SessionProvider>
  )
}
