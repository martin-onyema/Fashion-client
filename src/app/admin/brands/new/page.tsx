import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { AdminLayout } from '@/components/admin/admin-layout'
import { BrandForm } from '@/components/admin/forms/brand-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'New Brand',
  robots: { index: false, follow: false },
}

export default async function NewBrandPage() {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  return (
    <AdminLayout
      title="New Brand"
      description="Add a new brand to the catalogue."
      permissions={perms}
    >
      <BrandForm brand={null} />
    </AdminLayout>
  )
}
