import Link from 'next/link'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { formatNGN, formatDateShort } from '@/lib/format'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import {
  OrderRowActions,
  OrderAutoOpener,
} from '@/components/admin/order-row-actions'
import { AdminHeaderToolbar } from '@/components/admin/admin-header-toolbar'
import { AdminSearchTrigger } from '@/components/admin/admin-search-trigger'
import type { OrderWithDetails } from '@/components/admin/order-detail-dialog'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Orders',
  robots: { index: false, follow: false },
}

const STATUS_TABS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'READY_FOR_DISPATCH', label: 'Ready' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; order?: string }>
}) {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { status, order: focusOrder } = await searchParams
  const admin = await requireAdmin()
  const myNotifications = await db.notification.findMany({
    where: { recipientId: admin.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, type: true, title: true, body: true, link: true, read: true, createdAt: true },
  })
  const notifs = myNotifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))
  const activeStatus = (status ?? 'ALL').toUpperCase()

  const orders = await db.order.findMany({
    where: activeStatus !== 'ALL' ? { status: activeStatus as any } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
    take: 200,
  })

  const serializedOrders: OrderWithDetails[] = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    statusHistory: o.statusHistory.map((h) => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
    })),
  }))

  const focusOrderObj = focusOrder
    ? serializedOrders.find((o) => o.orderNumber === focusOrder.toUpperCase()) ?? null
    : null

  // Status counts for tab badges
  const statusCounts = await db.order.groupBy({
    by: ['status'],
    _count: true,
  })
  const countMap = new Map(statusCounts.map((s) => [s.status, s._count]))

  return (
    <AdminLayout
      title="Orders"
      description={`${orders.length} order${orders.length === 1 ? '' : 's'}`}
      permissions={perms}
      headerExtras={
        <div className="flex items-center gap-1">
          <AdminSearchTrigger />
          <AdminHeaderToolbar notifications={notifs} />
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.value
            const href =
              tab.value === 'ALL'
                ? '/admin/orders'
                : `/admin/orders?status=${tab.value}`
            const count =
              tab.value === 'ALL'
                ? orders.length
                : countMap.get(tab.value as any) ?? 0
            return (
              <Button
                key={tab.value}
                asChild
                variant={isActive ? 'default' : 'outline'}
                size="sm"
              >
                <Link href={href}>
                  {tab.label}
                  <span
                    className={
                      'ml-1.5 text-xs ' +
                      (isActive ? 'text-background/70' : 'text-muted-foreground')
                    }
                  >
                    {count}
                  </span>
                </Link>
              </Button>
            )
          })}
        </div>

        {/* Orders table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center text-muted-foreground">
                      No orders{activeStatus !== 'ALL' ? ` with status "${activeStatus}"` : ''} yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o, i) => (
                    <TableRow key={o.id}>
                      <TableCell className="pl-6 font-medium">
                        {o.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{o.customerName}</span>
                          <span className="text-xs text-muted-foreground">{o.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {o.items.length}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNGN(o.total)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                          {o.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDateShort(o.createdAt)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <OrderRowActions order={serializedOrders[i]} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {focusOrderObj && <OrderAutoOpener order={focusOrderObj} />}
      </div>
    </AdminLayout>
  )
}
