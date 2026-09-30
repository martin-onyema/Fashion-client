import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AccountShell, SignOutButton } from '@/components/account/account-shell'
import { OrderStatusBadge } from '@/components/account/order-status-badge'
import { WishlistCount } from '@/components/account/wishlist-count'
import { requireUser } from '@/lib/session'
import { db } from '@/lib/db'
import { formatNGN, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Package,
  Heart,
  MapPin,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false, follow: false },
}

export default async function AccountOverviewPage() {
  const user = await requireUser()

  const [orders, addresses, orderCount, lifetimeSpend] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { items: { take: 1 } },
    }),
    db.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    }),
    db.order.count({ where: { userId: user.id } }),
    db.order.aggregate({
      where: {
        userId: user.id,
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      _sum: { total: true },
    }),
  ])

  const firstName = (user.name ?? '').split(' ')[0] || 'there'

  return (
    <>
      <Navbar />
      <AccountShell
        title={`Hello, ${firstName}`}
        description="Manage your orders, wishlist, addresses and profile."
        actions={<SignOutButton />}
      >
        <div className="space-y-10">
          {/* Quick stats */}
          <section
            aria-label="Account summary"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatCard
              label="Orders"
              value={String(orderCount)}
              icon={Package}
              href="/account/orders"
            />
            <StatCard
              label="Wishlist"
              value={<WishlistCount />}
              icon={Heart}
              href="/account/wishlist"
            />
            <StatCard
              label="Addresses"
              value={String(addresses.length)}
              icon={MapPin}
              href="/account/addresses"
            />
            <StatCard
              label="Lifetime Spend"
              value={formatNGN(lifetimeSpend._sum.total ?? 0)}
              icon={ShoppingBag}
            />
          </section>

          {/* Recent orders */}
          <section>
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="label-uppercase text-muted-foreground mb-1">Recent</p>
                <h2 className="font-display text-2xl md:text-3xl">Your Orders</h2>
              </div>
              {orders.length > 0 && (
                <Link
                  href="/account/orders"
                  className="text-xs text-muted-foreground hover:text-foreground link-underline"
                >
                  View all
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="border border-border rounded-lg p-8 md:p-12 text-center bg-card">
                <Package className="size-8 mx-auto text-muted-foreground mb-3" strokeWidth={1.5} />
                <h3 className="font-display text-xl mb-2">No orders yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  When you place your first order it will appear here for easy tracking.
                </p>
                <Button asChild>
                  <Link href="/shop">
                    Start Shopping
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const firstItem = order.items[0]
                  const itemCount = order.items.length
                  return (
                    <Link
                      key={order.id}
                      href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}
                      className="block border border-border rounded-lg p-4 md:p-5 bg-card hover:border-foreground/30 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono text-sm font-medium">
                              {order.orderNumber}
                            </span>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {formatDate(order.createdAt)} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </p>
                          {firstItem && (
                            <p className="text-sm mt-2 truncate">
                              {firstItem.productName}
                              {itemCount > 1 && (
                                <span className="text-muted-foreground"> +{itemCount - 1} more</span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                          <span className="text-sm tabular-nums font-medium">
                            {formatNGN(order.total)}
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            Track →
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

          {/* Quick links */}
          <section className="grid sm:grid-cols-3 gap-4">
            <QuickLink
              href="/account/wishlist"
              title="Your Wishlist"
              description="Saved pieces you love."
              icon={Heart}
            />
            <QuickLink
              href="/account/addresses"
              title="Addresses"
              description="Manage delivery details."
              icon={MapPin}
            />
            <QuickLink
              href="/account/profile"
              title="Profile"
              description="Update your details."
              icon={AccountIcon}
            />
          </section>
        </div>
      </AccountShell>
      <Footer />
    </>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string
  value: React.ReactNode
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  href?: string
}) {
  const inner = (
    <div className="border border-border rounded-lg p-4 md:p-5 bg-card hover:border-foreground/20 transition-colors h-full">
      <Icon className="size-4 text-muted-foreground mb-3" strokeWidth={1.5} />
      <p className="label-uppercase text-muted-foreground mb-1">{label}</p>
      <p className="font-display text-2xl md:text-3xl tabular-nums">{value}</p>
    </div>
  )
  if (href) {
    return <Link href={href}>{inner}</Link>
  }
  return inner
}

function QuickLink({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}) {
  return (
    <Link
      href={href}
      className="group border border-border rounded-lg p-5 bg-card hover:border-foreground/30 transition-colors"
    >
      <div className="flex items-start justify-between">
        <Icon className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
        <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" />
      </div>
      <h3 className="font-display text-lg mt-4">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </Link>
  )
}

// Tiny inline icon to avoid extra imports
function AccountIcon({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      className={className}
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
