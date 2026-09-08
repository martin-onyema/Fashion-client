import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { AdminLayout } from '@/components/admin/admin-layout'
import { StaffForm } from '@/components/admin/forms/staff-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'New Staff',
  robots: { index: false, follow: false },
}

export default async function NewStaffPage() {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const canAssignAdmin = admin.role === 'ADMIN'

  return (
    <AdminLayout
      title="New Staff"
      description="Add a new staff member."
      permissions={perms}
    >
      <StaffForm staff={null} canAssignAdmin={canAssignAdmin} />
    </AdminLayout>
  )
}
