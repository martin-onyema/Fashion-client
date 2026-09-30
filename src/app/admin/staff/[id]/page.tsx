import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { StaffForm } from '@/components/admin/forms/staff-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Staff',
  robots: { index: false, follow: false },
}

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { id } = await params

  const staff = await db.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true,
      phone: true, jobTitle: true, department: true, active: true,
    },
  })
  if (!staff) notFound()
  // Only allow editing staff (not customers)
  if (staff.role === 'CUSTOMER') notFound()

  const canAssignAdmin = admin.role === 'ADMIN'

  return (
    <AdminLayout
      title={`Edit · ${staff.name ?? staff.email}`}
      description="Modify staff details."
      permissions={perms}
    >
      <StaffForm staff={staff} canAssignAdmin={canAssignAdmin} />
    </AdminLayout>
  )
}
