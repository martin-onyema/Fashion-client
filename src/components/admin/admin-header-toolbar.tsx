'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BellRing, Search, Check, X, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { adminMarkAllNotificationsRead, adminMarkNotificationRead, adminDeleteNotification } from '@/actions/admin'

type AdminNotification = {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  createdAt: string
}

const TYPE_LABELS: Record<string, string> = {
  NEW_ORDER: 'New order',
  PAYMENT_FAILED: 'Payment failed',
  LOW_INVENTORY: 'Low inventory',
  OUT_OF_STOCK: 'Out of stock',
  NEW_CUSTOMER: 'New customer',
  NEW_REVIEW: 'New review',
  REFUND_ISSUED: 'Refund',
  REFUND_FAILED: 'Refund failed',
  COUPON_LIMIT: 'Coupon limit',
  CAMPAIGN_STARTED: 'Campaign started',
  CAMPAIGN_ENDED: 'Campaign ended',
  STAFF_INVITE: 'Staff invite',
  SYSTEM: 'System',
}

const TYPE_TONES: Record<string, string> = {
  NEW_ORDER: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  PAYMENT_FAILED: 'bg-red-50 text-red-900 border-red-200',
  LOW_INVENTORY: 'bg-amber-50 text-amber-900 border-amber-200',
  OUT_OF_STOCK: 'bg-red-50 text-red-900 border-red-200',
  NEW_CUSTOMER: 'bg-blue-50 text-blue-900 border-blue-200',
  NEW_REVIEW: 'bg-blue-50 text-blue-900 border-blue-200',
  REFUND_ISSUED: 'bg-purple-50 text-purple-900 border-purple-200',
  REFUND_FAILED: 'bg-red-50 text-red-900 border-red-200',
  SYSTEM: 'bg-secondary text-muted-foreground',
}

export function AdminHeaderToolbar({
  notifications,
  searchTrigger,
}: {
  notifications: AdminNotification[]
  searchTrigger?: React.ReactNode
}) {
  const router = useRouter()
  const [busy, startMark] = useTransition()
  const [localNotifs, setLocalNotifs] = useState(notifications)
  const unreadCount = localNotifs.filter((n) => !n.read).length

  // Keep local state in sync if server notifications change
  useEffect(() => {
    setLocalNotifs(notifications)
  }, [notifications])

  function markAllRead() {
    startMark(async () => {
      const r = await adminMarkAllNotificationsRead()
      if (r.ok) {
        setLocalNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
        router.refresh()
        toast.success('All notifications marked as read')
      } else {
        toast.error(r.error ?? 'Could not mark as read')
      }
    })
  }

  function markOneRead(id: string) {
    startMark(async () => {
      const r = await adminMarkNotificationRead(id)
      if (r.ok) {
        setLocalNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
        router.refresh()
      }
    })
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    startMark(async () => {
      const r = await adminDeleteNotification(id)
      if (r.ok) {
        setLocalNotifs((prev) => prev.filter((n) => n.id !== id))
        router.refresh()
      }
    })
  }

  function handleClickNotif(n: AdminNotification) {
    if (!n.read) markOneRead(n.id)
    if (n.link) router.push(n.link)
  }

  return (
    <div className="flex items-center gap-1">
      {searchTrigger}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="relative inline-flex size-9 items-center justify-center rounded-md hover:bg-secondary transition-colors"
            aria-label="Notifications"
          >
            <BellRing className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-2 rounded-full bg-red-500" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={busy}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {localNotifs.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              localNotifs.slice(0, 20).map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => handleClickNotif(n)}
                  className="flex items-start gap-2 py-3 px-3 cursor-pointer"
                >
                  {!n.read && (
                    <span className="mt-1.5 size-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                  {n.read && <span className="mt-1.5 size-2 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {n.body}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {TYPE_LABELS[n.type] ?? n.type} · {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(n.id, e)}
                    className="shrink-0 text-muted-foreground hover:text-red-600"
                    aria-label="Delete notification"
                  >
                    <X className="size-3.5" />
                  </button>
                </DropdownMenuItem>
              ))
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin/notifications" className="text-center text-xs">
              View all notifications
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
