import Link from 'next/link'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { formatNGN, formatDateShort } from '@/lib/format'
import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminHeaderToolbar } from '@/components/admin/admin-header-toolbar'
import { AdminSearchTrigger } from '@/components/admin/admin-search-trigger'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Customers',
  robots: { index: false, follow: false },
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { q } = await searchParams

  const customers = await db.user.findMany({
    where: {
      role: 'CUSTOMER',
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      orders: {
        where: { status: { notIn: ['CANCELLED'] } },
        select: { total: true, createdAt: true, orderNumber: true },
      },
    },
    take: 500,
  })

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

  const rows = customers.map((c) => {
    const ordersCount = c.orders.length
    const totalSpent = c.orders.reduce((s, o) => s + o.total, 0)
    const lastOrderDate = c.orders.reduce<Date | null>((max, o) => {
      if (!max || o.createdAt > max) return o.createdAt
      return max
    }, null)
    return {
      id: c.id,
      name: c.name ?? '—',
      email: c.email,
      phone: c.phone ?? '—',
      active: c.active,
      tags: c.tags,
      ordersCount,
      totalSpent,
      lastOrderDate,
      createdAt: c.createdAt,
    }
  })

  const totalRevenue = rows.reduce((s, r) => s + r.totalSpent, 0)
  const totalOrders = rows.reduce((s, r) => s + r.ordersCount, 0)

  return (
    <AdminLayout
      title="Customers"
      description={`${rows.length} registered customer${rows.length === 1 ? '' : 's'}`}
      permissions={perms}
      headerExtras={
        <div className="flex items-center gap-1">
          <AdminSearchTrigger />
          <AdminHeaderToolbar notifications={notifs} />
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Summary tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Total Customers</p>
            <p className="font-display text-3xl mt-2">{rows.length.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Lifetime Revenue</p>
            <p className="font-display text-3xl mt-2">{formatNGN(totalRevenue)}</p>
          </Card>
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Total Orders</p>
            <p className="font-display text-3xl mt-2">{totalOrders.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Avg. Order Value</p>
            <p className="font-display text-3xl mt-2">
              {formatNGN(totalOrders > 0 ? totalRevenue / totalOrders : 0)}
            </p>
          </Card>
        </div>

        {/* Search */}
        <form className="flex gap-2" role="search">
          <div className="relative flex-1 max-w-md">
            <input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Search by name, email, phone…"
              className="w-full h-10 rounded-md border border-border bg-background pl-3 pr-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-4 rounded-md border border-border text-sm hover:bg-secondary"
          >
            Search
          </button>
          {q && (
            <Link
              href="/admin/customers"
              className="h-10 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground flex items-center"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Customers table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center text-muted-foreground">
                      {q ? `No customers match "${q}".` : 'No registered customers yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="pl-6 font-medium">
                        <Link
                          href={`/admin/customers/${r.id}`}
                          className="hover:underline"
                        >
                          {r.name}
                        </Link>
                        {r.tags && (
                          <span className="ml-2 text-xs text-muted-foreground">· {r.tags}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{r.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.phone}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.ordersCount}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNGN(r.totalSpent)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.lastOrderDate ? formatDateShort(r.lastOrderDate) : '—'}
                      </TableCell>
                      <TableCell>
                        {r.active ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-secondary text-muted-foreground">
                            Disabled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right text-sm text-muted-foreground">
                        {formatDateShort(r.createdAt)}
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
