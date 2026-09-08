import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AccountShell } from '@/components/account/account-shell'
import { OrderStatusBadge } from '@/components/account/order-status-badge'
import { requireUser } from '@/lib/session'
import { db } from '@/lib/db'
import { formatNGN, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Package, ArrowRight, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Orders',
  robots: { index: false, follow: false },
}

export default async function OrdersPage() {
  const user = await requireUser()

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })

  return (
    <>
      <Navbar />
      <AccountShell
        title="My Orders"
        description={`${orders.length} ${orders.length === 1 ? 'order' : 'orders'} placed`}
      >
        {orders.length === 0 ? (
          <div className="border border-border rounded-lg p-10 md:p-16 text-center bg-card">
            <Package className="size-10 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
            <h2 className="font-display text-2xl md:text-3xl mb-2">No orders yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              When you place your first order it will appear here with full tracking details.
            </p>
            <Button asChild>
              <Link href="/shop">
                Browse the Collection
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)
              const firstItem = order.items[0]
              return (
                <div
                  key={order.id}
                  className="border border-border rounded-lg p-4 md:p-6 bg-card"
                >
                  <div className="flex flex-col gap-5">
                    {/* Header row */}
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-border">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-sm font-medium">
                            {order.orderNumber}
                          </span>
                          <OrderStatusBadge status={order.status} />
                          {order.paymentStatus === 'SUCCESS' && (
                            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                              · Paid
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Placed {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="label-uppercase text-muted-foreground mb-1">Total</p>
                        <p className="font-display text-xl tabular-nums">
                          {formatNGN(order.total)}
                        </p>
                      </div>
                    </div>

                    {/* Items summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          {firstItem?.productName ?? 'Order'}
                          {itemCount > 1 && (
                            <span className="text-muted-foreground">
                              {' '}+ {itemCount - firstItem.quantity} more item
                              {itemCount - firstItem.quantity === 1 ? '' : 's'}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          {order.couponCode && ` · Coupon ${order.couponCode}`}
                          {order.trackingNumber && ` · Tracking: ${order.trackingNumber}`}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm" className="shrink-0">
                        <Link
                          href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}
                        >
                          Track Order
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </AccountShell>
      <Footer />
    </>
  )
}
