import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { AdminLayout } from '@/components/admin/admin-layout'
import { BannerForm } from '@/components/admin/forms/banner-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'New Banner',
  robots: { index: false, follow: false },
}

export default async function NewBannerPage() {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  return (
    <AdminLayout
      title="New Banner"
      description="Create a promotional banner."
      permissions={perms}
    >
      <BannerForm banner={null} />
    </AdminLayout>
  )
}
