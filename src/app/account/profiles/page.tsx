import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AccountShell } from '@/components/account/account-shell'
import { requireUser } from '@/lib/session'
import { db } from '@/lib/db'
import { ProfilesClient } from './profiles-client'

export const metadata: Metadata = {
  title: 'Account & Managed Profiles',
  robots: { index: false, follow: false },
}

// ─── /account/profiles — Mockup 32 structure 1:1 ─────────────────────────────
// "Shopping-for-someone-else pattern: profile switcher, retrofit checklist."

export default async function ProfilesPage() {
  const user = await requireUser()

  const [addressesCount] = await Promise.all([
    db.address.count({ where: { userId: user.id } }),
  ])
  const hasContact = Boolean(user.phone || user.whatsappNumber)
  const userName = user.name?.trim() || 'You'

  return (
    <>
      <Navbar />
      <AccountShell
        title="Account & Profiles"
        description="Shop for yourself — or for someone else — with each profile kept in its place."
      >
        <ProfilesClient
          userName={userName}
          addressesCount={addressesCount}
          hasContact={hasContact}
        />
      </AccountShell>
      <Footer />
    </>
  )
}
