import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { getHomepageContent } from '@/lib/queries'
import { AdminLayout } from '@/components/admin/admin-layout'
import { CmsForm } from '@/components/admin/cms-form'
import { AdminHeaderToolbar } from '@/components/admin/admin-header-toolbar'
import { AdminSearchTrigger } from '@/components/admin/admin-search-trigger'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'CMS',
  robots: { index: false, follow: false },
}

export default async function AdminCmsPage() {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const content = await getHomepageContent()

  const myNotifications = await db.notification.findMany({
    where: { recipientId: admin.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      link: true,
      read: true,
      createdAt: true,
    },
  })
  const notifs = myNotifications.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }))

  return (
    <AdminLayout
      title="Content Management"
      description="Edit homepage hero, featured collection, Instagram block"
      permissions={perms}
      headerExtras={
        <div className="flex items-center gap-1">
          <AdminSearchTrigger />
          <AdminHeaderToolbar notifications={notifs} />
        </div>
      }
    >
      <CmsForm initial={content} />
    </AdminLayout>
  )
}
