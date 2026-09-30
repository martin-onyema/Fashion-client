import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TrackingForm } from '@/components/admin/forms/tracking-form'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { formatNGN, formatDate, formatDateShort } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Order Detail',
  robots: { index: false, follow: false },
}

const REFUND_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-900 border-amber-200',
  SUCCESS: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  FAILED: 'bg-red-50 text-red-900 border-red-200',
  PARTIAL: 'bg-stone-100 text-stone-800 border-stone-200',
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { id } = await params

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'desc' } },
      refunds: { orderBy: { createdAt: 'desc' } },
      user: { select: { id: true, name: true, email: true, phone: true } },
      coupon: { select: { id: true, code: true, type: true, value: true } },
    },
  })

  if (!order) notFound()

  const reversedHistory = [...order.statusHistory].reverse()

  return (
    <AdminLayout
      title={order.orderNumber}
      description={`${order.customerName} · ${formatNGN(order.total)} · placed ${formatDateShort(order.createdAt)}`}
      permissions={perms}
      actions={
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/orders">Back to orders</Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Status</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <OrderStatusBadge status={order.status} />
              <Badge variant="outline" className="capitalize">
                {order.paymentStatus.toLowerCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Payment method: {order.paymentMethod.replace(/_/g, ' ')}
            </p>
          </Card>
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Placed</p>
            <p className="font-display text-base mt-2">{formatDate(order.createdAt)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(order.createdAt).toLocaleTimeString('en-NG', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </Card>
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Total</p>
            <p className="font-display text-2xl mt-2">{formatNGN(order.total)}</p>
          </Card>
        </div>

        {/* Customer + Shipping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-1 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-muted-foreground">{order.email}</p>
              {order.phone && <p className="text-muted-foreground">{order.phone}</p>}
              {order.whatsappNumber && (
                <p className="text-muted-foreground">WhatsApp: {order.whatsappNumber}</p>
              )}
              {order.user && (
                <Link
                  href={`/admin/customers/${order.user.id}`}
                  className="text-xs underline mt-2"
                >
                  View customer record →
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-sm flex flex-col gap-1">
              <p>{order.address}</p>
              <p className="text-muted-foreground">
                {order.city}, {order.state}
              </p>
              {order.deliveryInstructions && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  "{order.deliveryInstructions}"
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tracking form */}
        <TrackingForm
          orderId={order.id}
          initial={{
            trackingNumber: order.trackingNumber,
            trackingUrl: order.trackingUrl,
            carrier: order.carrier,
            internalNotes: order.internalNotes,
          }}
        />

        {/* Items */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-base">Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Product</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit price</TableHead>
                  <TableHead className="pr-6 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="pl-6">
                      <div className="flex flex-col">
                        <span className="font-medium">{it.productName}</span>
                        {it.productSlug && (
                          <Link
                            href={`/shop/${it.productSlug}`}
                            className="text-xs text-muted-foreground hover:underline font-mono"
                            target="_blank"
                          >
                            {it.productSlug}
                          </Link>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{it.size ?? '—'}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {it.sku ?? '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{it.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNGN(it.unitPrice)}
                    </TableCell>
                    <TableCell className="pr-6 text-right tabular-nums font-medium">
                      {formatNGN(it.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-base">Totals</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-2 text-sm">
            <Row label="Subtotal" value={formatNGN(order.subtotal)} />
            <Row label="Delivery fee" value={formatNGN(order.deliveryFee)} />
            {order.discount > 0 && (
              <Row
                label={
                  order.coupon
                    ? `Coupon ${order.coupon.code}`
                    : 'Discount'
                }
                value={'− ' + formatNGN(order.discount)}
              />
            )}
            {order.tax > 0 && <Row label="Tax" value={formatNGN(order.tax)} />}
            <div className="border-t border-border mt-2 pt-2 flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="font-display text-lg">{formatNGN(order.total)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status history */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-base">Status History</CardTitle>
              <CardDescription>Reverse chronological — newest first.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ol className="relative border-l border-border pl-4 flex flex-col gap-3">
                {reversedHistory.length === 0 ? (
                  <li className="text-sm text-muted-foreground">No status updates recorded.</li>
                ) : (
                  reversedHistory.map((h) => (
                    <li key={h.id} className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-foreground -ml-[1.31rem] border border-background" />
                        <OrderStatusBadge status={h.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(h.createdAt)} ·{' '}
                        {new Date(h.createdAt).toLocaleTimeString('en-NG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {h.note && <p className="text-sm text-muted-foreground">{h.note}</p>}
                    </li>
                  ))
                )}
              </ol>
            </CardContent>
          </Card>

          {/* Refunds */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-base">Refunds</CardTitle>
              <CardDescription>
                {order.refunds.length} refund{order.refunds.length === 1 ? '' : 's'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {order.refunds.length === 0 ? (
                <p className="text-sm text-muted-foreground">No refunds issued.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {order.refunds.map((r) => (
                    <div key={r.id} className="border border-border rounded-md p-3 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{formatNGN(r.amount)}</span>
                        <Badge variant="outline" className={'text-[10px] ' + (REFUND_STATUS_STYLES[r.status] ?? '')}>
                          {r.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.reason}</p>
                      {r.note && <p className="text-xs text-muted-foreground italic">"{r.note}"</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        Ref: <span className="font-mono">{r.reference}</span> · {formatDateShort(r.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}
