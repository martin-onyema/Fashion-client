import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AccountShell } from '@/components/account/account-shell'
import { AddressManager } from '@/components/account/address-manager'
import { requireUser } from '@/lib/session'
import { db } from '@/lib/db'

export const metadata: Metadata = {
  title: 'My Addresses',
  robots: { index: false, follow: false },
}

export default async function AddressesPage() {
  const user = await requireUser()

  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  // Pass plain serializable objects
  const serializable = addresses.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    phone: a.phone,
    state: a.state,
    city: a.city,
    address: a.address,
    landmark: a.landmark,
    isDefault: a.isDefault,
  }))

  return (
    <>
      <Navbar />
      <AccountShell
        title="Addresses"
        description="Saved delivery details for faster checkout."
      >
        <AddressManager initialAddresses={serializable} />
      </AccountShell>
      <Footer />
    </>
  )
}
