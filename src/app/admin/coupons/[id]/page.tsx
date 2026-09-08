import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { CouponForm } from '@/components/admin/forms/coupon-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Coupon',
  robots: { index: false, follow: false },
}

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { id } = await params

  const coupon = await db.coupon.findUnique({
    where: { id },
    select: {
      id: true, code: true, description: true, type: true, value: true,
      minOrder: true, maxDiscount: true, usageLimit: true, perCustomerLimit: true,
      active: true, startsAt: true, endsAt: true, freeShipping: true,
    },
  })
  if (!coupon) notFound()

  return (
    <AdminLayout
      title={`Edit · ${coupon.code}`}
      description="Modify coupon details."
      permissions={perms}
    >
      <CouponForm coupon={coupon} />
    </AdminLayout>
  )
}
