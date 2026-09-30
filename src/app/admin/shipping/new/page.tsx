import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ShippingZoneForm } from '@/components/admin/forms/shipping-zone-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'New Shipping Zone',
  robots: { index: false, follow: false },
}

export default async function NewShippingZonePage() {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  return (
    <AdminLayout
      title="New Shipping Zone"
      description="Define a delivery region."
      permissions={perms}
    >
      <ShippingZoneForm />
    </AdminLayout>
  )
}
