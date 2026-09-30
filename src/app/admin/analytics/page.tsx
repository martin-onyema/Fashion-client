import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import {
  getAdminStats,
  getTopProducts,
  getSalesByCategory,
  getRevenueTrend,
} from '@/lib/queries'
import { formatNGN } from '@/lib/format'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RevenueAreaChart } from '@/components/admin/charts/revenue-area-chart'
import { CategoryBarChart } from '@/components/admin/charts/category-bar-chart'
import { TopProductsBarChart } from '@/components/admin/charts/top-products-bar-chart'
import { DateRangeTabs } from '@/components/admin/date-range-tabs'
import { ExportCsvButton } from '@/components/admin/export-csv-button'
import { AdminHeaderToolbar } from '@/components/admin/admin-header-toolbar'
import { AdminSearchTrigger } from '@/components/admin/admin-search-trigger'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Analytics',
  robots: { index: false, follow: false },
}

const RANGE_DAYS: Record<string, number> = {
  today: 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  year: 365,
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { range = '30d' } = await searchParams
  const daysBack = RANGE_DAYS[range] ?? 30

  const [stats, topProducts, salesByCategory, revenueTrend] = await Promise.all([
    getAdminStats(daysBack),
    getTopProducts(8, daysBack),
    getSalesByCategory(),
    getRevenueTrend(daysBack),
  ])

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

  const totalRevenue = revenueTrend.reduce((s, r) => s + r.revenue, 0)
  const avgDailyRevenue = totalRevenue / Math.max(revenueTrend.length, 1)
  const categoryCount = salesByCategory.length
  const topCategory = salesByCategory[0]?.name ?? '—'

  // CSV data for export
  const csvRows = [
    ['Date', 'Revenue (NGN)'],
    ...revenueTrend.map((r) => [r.date, r.revenue.toString()]),
  ]

  return (
    <AdminLayout
      title="Analytics"
      description={`Performance insights across products, categories and revenue · last ${daysBack} days`}
      permissions={perms}
      headerExtras={
        <div className="flex items-center gap-1">
          <AdminSearchTrigger />
          <AdminHeaderToolbar notifications={notifs} />
          <DateRangeTabs currentRange={range} />
        </div>
      }
      actions={
        <ExportCsvButton
          filename={`analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`}
          rows={csvRows}
        />
      }
    >
      <div className="flex flex-col gap-6">
        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Revenue ({daysBack}d)</p>
            <p className="font-display text-3xl mt-2">{formatNGN(totalRevenue)}</p>
          </Card>
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Avg / day</p>
            <p className="font-display text-3xl mt-2">{formatNGN(avgDailyRevenue)}</p>
          </Card>
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Total Orders</p>
            <p className="font-display text-3xl mt-2">{stats.totalOrders.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Top Category</p>
            <p className="font-display text-2xl mt-2 truncate" title={topCategory}>
              {topCategory}
            </p>
          </Card>
        </div>

        {/* Revenue trend */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Revenue Trend</CardTitle>
            <CardDescription>Last {daysBack} days · all paid &amp; shipped orders</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <RevenueAreaChart data={revenueTrend} />
          </CardContent>
        </Card>

        {/* Two-col charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-lg">Sales by Category</CardTitle>
              <CardDescription>
                Revenue across {categoryCount} categor{categoryCount === 1 ? 'y' : 'ies'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {salesByCategory.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                  No category sales yet.
                </div>
              ) : (
                <CategoryBarChart data={salesByCategory} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-lg">Top Products</CardTitle>
              <CardDescription>By units sold across all orders</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {topProducts.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                  No product sales yet.
                </div>
              ) : (
                <TopProductsBarChart data={topProducts} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top products table */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Top Sellers Detail</CardTitle>
            <CardDescription>Ranked by quantity sold</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto thin-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium px-6 py-3">#</th>
                    <th className="text-left font-medium px-6 py-3">Product</th>
                    <th className="text-right font-medium px-6 py-3">Units</th>
                    <th className="text-right font-medium px-6 py-3">Orders</th>
                    <th className="text-right font-medium px-6 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted-foreground py-12">
                        No sales recorded in this period.
                      </td>
                    </tr>
                  ) : (
                    topProducts.map((p, i) => (
                      <tr key={p.productId} className="border-b border-border last:border-0">
                        <td className="px-6 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-6 py-3 font-medium">{p.productName}</td>
                        <td className="px-6 py-3 text-right tabular-nums">{p._sum.quantity}</td>
                        <td className="px-6 py-3 text-right tabular-nums">{p._count}</td>
                        <td className="px-6 py-3 text-right tabular-nums font-medium">
                          {formatNGN(p._sum.totalPrice)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
