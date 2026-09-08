import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AccountShell } from '@/components/account/account-shell'
import { ProfileForm } from '@/components/account/profile-form'
import { requireUser } from '@/lib/session'
import { db } from '@/lib/db'

export const metadata: Metadata = {
  title: 'My Profile',
  robots: { index: false, follow: false },
}

export default async function ProfilePage() {
  const user = await requireUser()

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      whatsappNumber: true,
    },
  })

  return (
    <>
      <Navbar />
      <AccountShell
        title="Profile"
        description="Update your personal and contact details."
      >
        <ProfileForm
          initialName={dbUser?.name ?? null}
          initialEmail={dbUser?.email ?? user.email}
          initialPhone={dbUser?.phone ?? null}
          initialWhatsapp={dbUser?.whatsappNumber ?? null}
        />
      </AccountShell>
      <Footer />
    </>
  )
}
