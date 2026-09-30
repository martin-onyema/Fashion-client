import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { AdminLayout } from '@/components/admin/admin-layout'
import { CouponForm } from '@/components/admin/forms/coupon-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'New Coupon',
  robots: { index: false, follow: false },
}

export default async function NewCouponPage() {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  return (
    <AdminLayout
      title="New Coupon"
      description="Create a discount coupon."
      permissions={perms}
    >
      <CouponForm coupon={null} />
    </AdminLayout>
  )
}
