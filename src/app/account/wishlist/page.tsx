import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AccountShell } from '@/components/account/account-shell'
import { WishlistView } from '@/components/account/wishlist-view'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = {
  title: 'My Wishlist',
  robots: { index: false, follow: false },
}

export default async function WishlistPage() {
  await requireUser()

  return (
    <>
      <Navbar />
      <AccountShell
        title="Wishlist"
        description="Pieces you've saved for later."
      >
        <WishlistView />
      </AccountShell>
      <Footer />
    </>
  )
}
