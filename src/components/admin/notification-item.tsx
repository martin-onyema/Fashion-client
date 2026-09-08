'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCheck, Trash2, Bell, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { adminMarkNotificationRead, adminMarkAllNotificationsRead, adminDeleteNotification } from '@/actions/admin'
import { formatDate } from '@/lib/format'

type NotificationType =
  | 'NEW_ORDER' | 'PAYMENT_FAILED' | 'LOW_INVENTORY' | 'OUT_OF_STOCK'
  | 'NEW_CUSTOMER' | 'NEW_REVIEW' | 'REFUND_ISSUED' | 'REFUND_FAILED'
  | 'COUPON_LIMIT' | 'CAMPAIGN_STARTED' | 'CAMPAIGN_ENDED'
  | 'STAFF_INVITE' | 'SYSTEM'

const TYPE_BADGES: Partial<Record<NotificationType, string>> = {
  NEW_ORDER: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  PAYMENT_FAILED: 'bg-red-50 text-red-900 border-red-200',
  LOW_INVENTORY: 'bg-amber-50 text-amber-900 border-amber-200',
  OUT_OF_STOCK: 'bg-red-50 text-red-900 border-red-200',
  NEW_CUSTOMER: 'bg-teal-50 text-teal-900 border-teal-200',
  NEW_REVIEW: 'bg-violet-50 text-violet-900 border-violet-200',
  REFUND_ISSUED: 'bg-stone-100 text-stone-800 border-stone-200',
  REFUND_FAILED: 'bg-red-50 text-red-900 border-red-200',
  COUPON_LIMIT: 'bg-amber-50 text-amber-900 border-amber-200',
  CAMPAIGN_STARTED: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  CAMPAIGN_ENDED: 'bg-stone-100 text-stone-800 border-stone-200',
  STAFF_INVITE: 'bg-violet-50 text-violet-900 border-violet-200',
  SYSTEM: 'bg-secondary text-muted-foreground',
}

export type Notification = {
  id: string
  type: NotificationType
  title: string
  body: string | null
  link: string | null
  read: boolean
  createdAt: string
}

export function MarkAllReadButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        const r = await adminMarkAllNotificationsRead()
        if (r.ok) {
          toast.success('All notifications marked as read')
          router.refresh()
        } else {
          toast.error(r.error ?? 'Could not mark all as read')
        }
        setBusy(false)
      }}
    >
      <CheckCheck className="size-4" />
      Mark all read
    </Button>
  )
}

export function NotificationItem({ notification }: { notification: Notification }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    if (!notification.read) {
      setBusy(true)
      await adminMarkNotificationRead(notification.id)
      setBusy(false)
    }
    if (notification.link) {
      router.push(notification.link)
    } else {
      router.refresh()
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setBusy(true)
    const r = await adminDeleteNotification(notification.id)
    if (r.ok) {
      toast.success('Notification deleted')
      router.refresh()
    } else {
      toast.error(r.error ?? 'Could not delete')
    }
    setBusy(false)
  }

  return (
    <Card
      className={
        'cursor-pointer transition-colors hover:bg-secondary/40 ' +
        (notification.read ? 'opacity-70' : 'border-l-4 border-l-foreground')
      }
      onClick={handleClick}
    >
      <CardContent className="p-4 flex items-start gap-3">
        <div className="mt-0.5 size-8 shrink-0 rounded-full bg-secondary flex items-center justify-center">
          {notification.read ? (
            <Check className="size-4 text-muted-foreground" />
          ) : (
            <Bell className="size-4 text-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{notification.title}</span>
            <Badge variant="outline" className={'text-[10px] ' + (TYPE_BADGES[notification.type] ?? '')}>
              {notification.type.replace(/_/g, ' ').toLowerCase()}
            </Badge>
            {!notification.read && (
              <span className="size-2 rounded-full bg-emerald-500" aria-label="Unread" />
            )}
          </div>
          {notification.body && (
            <p className="text-xs text-muted-foreground line-clamp-2">{notification.body}</p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1">
            {formatDate(notification.createdAt)}
            {notification.link && (
              <>
                {' · '}
                <span className="font-mono">{notification.link}</span>
              </>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="size-8 p-0 text-muted-foreground hover:text-red-600 shrink-0"
          disabled={busy}
          onClick={handleDelete}
          aria-label="Delete notification"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}
