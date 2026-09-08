import { CheckCheck, BellRing } from 'lucide-react'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'
import { NotificationItem } from '@/components/admin/notification-item'
import { MarkAllReadButton } from '@/components/admin/notification-item'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Notifications',
  robots: { index: false, follow: false },
}

export default async function AdminNotificationsPage() {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()

  const notifications = await db.notification.findMany({
    where: { recipientId: admin.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <AdminLayout
      title="Notifications"
      description={`${notifications.length} notification${notifications.length === 1 ? '' : 's'} · ${unreadCount} unread`}
      permissions={perms}
      actions={unreadCount > 0 ? <MarkAllReadButton /> : null}
    >
      <div className="flex flex-col gap-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BellRing className="size-8 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                You have no notifications yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                New orders, low inventory, refunds, and review activity will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={{
                id: n.id,
                type: n.type,
                title: n.title,
                body: n.body,
                link: n.link,
                read: n.read,
                createdAt: n.createdAt.toISOString(),
              }}
            />
          ))
        )}
      </div>
    </AdminLayout>
  )
}
