import Link from 'next/link'
import {
  TrendingUp,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Package,
  AlertTriangle,
  Users,
  UserPlus,
  ArrowRight,
  XCircle,
  RotateCcw,
  Wallet,
  Activity,
} from 'lucide-react'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import {
  getAdminStats,
  getTopProducts,
  getRevenueTrend,
} from '@/lib/queries'
import { formatNGN, formatDateShort } from '@/lib/format'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { RevenueAreaChart } from '@/components/admin/charts/revenue-area-chart'
import { DateRangeTabs } from '@/components/admin/date-range-tabs'
import { AdminHeaderToolbar } from '@/components/admin/admin-header-toolbar'
import { AdminSearchTrigger } from '@/components/admin/admin-search-trigger'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

const RANGE_DAYS: Record<string, number> = {
  today: 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  year: 365,
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { range = '30d' } = await searchParams
  const daysBack = RANGE_DAYS[range] ?? 30

  const [stats, topProducts, revenueTrend, myNotifications] = await Promise.all([
    getAdminStats(daysBack),
    getTopProducts(5, daysBack),
    getRevenueTrend(daysBack),
    db.notification.findMany({
      where: { recipientId: admin.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true, type: true, title: true, body: true,
        link: true, read: true, createdAt: true,
      },
    }),
  ])

  // Serialize for client
  const notifs = myNotifications.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }))

  const revenue = stats.revenue
  const netRevenue = stats.netRevenue
  const aov = stats.avgOrderValue

  return (
    <AdminLayout
      title={`Welcome, ${admin.name?.split(' ')[0] ?? 'Admin'}`}
      description="Store performance at a glance."
      permissions={perms}
      headerExtras={
        <div className="flex items-center gap-1">
          <AdminSearchTrigger />
          <AdminHeaderToolbar notifications={notifs} />
          <DateRangeTabs currentRange={range} />
        </div>
      }
      actions={
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/products">Manage Products</Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Revenue hero */}
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="size-4" />
                  <span className="label-uppercase">Total Revenue · last {daysBack} days</span>
                </div>
                <p className="font-display text-5xl md:text-6xl leading-none">
                  {formatNGN(revenue)}
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-3 text-sm text-muted-foreground">
                  <span>
                    Net:{' '}
                    <span className="text-foreground font-medium">
                      {formatNGN(netRevenue)}
                    </span>
                  </span>
                  <span>
                    Refunds:{' '}
                    <span className="text-foreground font-medium">
                      {formatNGN(stats.refunds)}
                    </span>
                  </span>
                  <span>
                    From{' '}
                    <span className="text-foreground font-medium">
                      {stats.completedOrders}
                    </span>{' '}
                    delivered orders
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/analytics">
                    View Analytics
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/admin/orders">View Orders</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat tiles row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatTile
            label="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            icon={<ShoppingCart className="size-4" />}
            href="/admin/orders"
          />
          <StatTile
            label="Pending"
            value={stats.pendingOrders.toLocaleString()}
            icon={<Clock className="size-4" />}
            href="/admin/orders?status=PENDING"
          />
          <StatTile
            label="Delivered"
            value={stats.completedOrders.toLocaleString()}
            icon={<CheckCircle2 className="size-4" />}
            href="/admin/orders?status=DELIVERED"
          />
          <StatTile
            label="Cancelled"
            value={stats.cancelledOrders.toLocaleString()}
            icon={<XCircle className="size-4" />}
            href="/admin/orders?status=CANCELLED"
            tone="danger"
          />
          <StatTile
            label="Avg Order Value"
            value={formatNGN(aov)}
            icon={<Wallet className="size-4" />}
            href="/admin/analytics"
          />
          <StatTile
            label="Refunds"
            value={formatNGN(stats.refunds)}
            icon={<RotateCcw className="size-4" />}
            href="/admin/orders"
            tone="warning"
          />
        </div>

        {/* Secondary tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatTile
            label="Products"
            value={stats.totalProducts.toLocaleString()}
            icon={<Package className="size-4" />}
            href="/admin/products"
          />
          <StatTile
            label="Low Stock"
            value={stats.lowStockProducts.toLocaleString()}
            icon={<AlertTriangle className="size-4" />}
            href="/admin/inventory?status=low"
            tone="warning"
          />
          <StatTile
            label="Out of Stock"
            value={stats.outOfStockProducts.toLocaleString()}
            icon={<XCircle className="size-4" />}
            href="/admin/inventory?status=out"
            tone="danger"
          />
          <StatTile
            label="All Customers"
            value={stats.customers.toLocaleString()}
            icon={<Users className="size-4" />}
            href="/admin/customers"
          />
          <StatTile
            label="New Customers"
            value={stats.newCustomers.toLocaleString()}
            icon={<UserPlus className="size-4" />}
            href="/admin/customers?filter=new"
          />
          <StatTile
            label="Returning"
            value={stats.returningCustomers.toLocaleString()}
            icon={<Activity className="size-4" />}
            href="/admin/customers?filter=returning"
          />
        </div>

        {/* Chart + Top products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-lg">Sales Overview</CardTitle>
              <CardDescription>Revenue trend over the last {daysBack} days</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <RevenueAreaChart data={revenueTrend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-lg">Top Products</CardTitle>
              <CardDescription>Best sellers by units sold</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {topProducts.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground text-center">
                  No sales recorded yet in this period.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {topProducts.map((p, i) => (
                    <li
                      key={p.productId}
                      className="flex items-center gap-3 px-6 py-3"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {p.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p._sum.quantity} sold · {p._count} orders
                        </p>
                      </div>
                      <span className="text-sm font-medium tabular-nums">
                        {formatNGN(p._sum.totalPrice)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent orders */}
        <Card>
          <CardHeader className="border-b border-border flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg">Recent Orders</CardTitle>
              <CardDescription>Latest customer orders in this period</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders">
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      No orders yet in this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recentOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="pl-6 font-medium">
                        <Link
                          href={`/admin/orders?order=${o.orderNumber}`}
                          className="hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{o.customerName}</span>
                          <span className="text-xs text-muted-foreground">{o.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNGN(o.total)}
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="pr-6 text-right text-sm text-muted-foreground">
                        {formatDateShort(o.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

function StatTile({
  label,
  value,
  icon,
  href,
  tone = 'default',
}: {
  label: string
  value: string
  icon: React.ReactNode
  href: string
  tone?: 'default' | 'warning' | 'danger'
}) {
  const iconColor =
    tone === 'warning' ? 'text-amber-700'
    : tone === 'danger' ? 'text-red-700'
    : 'text-muted-foreground group-hover:text-foreground'
  return (
    <Link
      href={href}
      className="group bg-card border border-border rounded-lg p-4 hover:border-foreground/30 transition-colors flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="label-uppercase text-muted-foreground">{label}</span>
        <span className={iconColor}>{icon}</span>
      </div>
      <span className="font-display text-3xl leading-none">{value}</span>
    </Link>
  )
}
