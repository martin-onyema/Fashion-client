import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { getAdminSettings } from '@/lib/queries'
import { AdminLayout } from '@/components/admin/admin-layout'
import { SettingsForm } from '@/components/admin/settings-form'
import { AdminHeaderToolbar } from '@/components/admin/admin-header-toolbar'
import { AdminSearchTrigger } from '@/components/admin/admin-search-trigger'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Settings',
  robots: { index: false, follow: false },
}

export default async function AdminSettingsPage() {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const settings = await getAdminSettings()

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
      title="Settings"
      description="Store-wide configuration: contact, shipping, payments, social"
      permissions={perms}
      headerExtras={
        <div className="flex items-center gap-1">
          <AdminSearchTrigger />
          <AdminHeaderToolbar notifications={notifs} />
        </div>
      }
    >
      <SettingsForm initial={settings} />
    </AdminLayout>
  )
}
