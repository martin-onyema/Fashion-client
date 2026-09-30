import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { AdminLayout } from '@/components/admin/admin-layout'
import { FaqForm } from '@/components/admin/forms/faq-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'New FAQ',
  robots: { index: false, follow: false },
}

export default async function NewFaqPage() {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  return (
    <AdminLayout
      title="New FAQ"
      description="Add a frequently asked question."
      permissions={perms}
    >
      <FaqForm faq={null} />
    </AdminLayout>
  )
}
