import { notFound } from 'next/navigation'
import { Phone, Mail, MapPin } from 'lucide-react'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { CustomerNotes } from '@/components/admin/customer-notes'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { formatNGN, formatDate, formatDateShort } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Customer',
  robots: { index: false, follow: false },
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { id } = await params

  const [customer, auditEntries] = await Promise.all([
    db.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: { take: 1 },
          },
          orderBy: { createdAt: 'desc' },
        },
        addresses: { orderBy: { createdAt: 'desc' } },
        reviews: {
          include: { product: { select: { id: true, name: true, slug: true } } },
          orderBy: { createdAt: 'desc' },
        },
        customerNotes: {
          include: { author: { select: { name: true } } },
          orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        },
      },
    }),
    db.auditLog.findMany({
      where: { entityType: 'User', entityId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { actor: { select: { name: true, role: true } } },
    }),
  ])

  if (!customer) notFound()

  const validOrders = customer.orders.filter((o) => o.status !== 'CANCELLED')
  const lifetimeSpend = validOrders.reduce((s, o) => s + o.total, 0)
  const lastOrder = customer.orders[0] ?? null

  const serializedNotes = customer.customerNotes.map((n) => ({
    id: n.id,
    body: n.body,
    pinned: n.pinned,
    authorName: n.author?.name ?? 'Unknown',
    createdAt: n.createdAt.toISOString(),
  }))

  return (
    <AdminLayout
      title={customer.name ?? customer.email}
      description={customer.email}
      permissions={perms}
    >
      <div className="flex flex-col gap-6">
        {/* Customer info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Lifetime Spend</p>
            <p className="font-display text-3xl mt-2">{formatNGN(lifetimeSpend)}</p>
          </Card>
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Total Orders</p>
            <p className="font-display text-3xl mt-2">{customer.orders.length}</p>
          </Card>
          <Card className="p-4">
            <p className="label-uppercase text-muted-foreground">Last Order</p>
            <p className="font-display text-base mt-2">
              {lastOrder ? formatDateShort(lastOrder.createdAt) : '—'}
            </p>
            {lastOrder && (
              <p className="text-xs text-muted-foreground mt-1">
                {lastOrder.orderNumber} · {formatNGN(lastOrder.total)}
              </p>
            )}
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Contact</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="label-uppercase text-[10px] text-muted-foreground/70">Name</p>
              <p className="text-sm font-medium">{customer.name ?? '—'}</p>
            </div>
            <div>
              <p className="label-uppercase text-[10px] text-muted-foreground/70 flex items-center gap-1">
                <Mail className="size-3" /> Email
              </p>
              <p className="text-sm font-medium truncate">{customer.email}</p>
            </div>
            <div>
              <p className="label-uppercase text-[10px] text-muted-foreground/70 flex items-center gap-1">
                <Phone className="size-3" /> Phone
              </p>
              <p className="text-sm font-medium">{customer.phone ?? '—'}</p>
            </div>
            <div>
              <p className="label-uppercase text-[10px] text-muted-foreground/70">Joined</p>
              <p className="text-sm font-medium">{formatDate(customer.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="orders">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="orders">Orders ({customer.orders.length})</TabsTrigger>
            <TabsTrigger value="addresses">Addresses ({customer.addresses.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({customer.reviews.length})</TabsTrigger>
            <TabsTrigger value="notes">Notes ({customer.customerNotes.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity ({auditEntries.length})</TabsTrigger>
          </TabsList>

          {/* Orders */}
          <TabsContent value="orders">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Order</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-6 text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                          No orders yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      customer.orders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="pl-6 font-mono text-sm">{o.orderNumber}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {o.items.length}
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
          </TabsContent>

          {/* Addresses */}
          <TabsContent value="addresses">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.addresses.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <MapPin className="size-6 mx-auto mb-2 opacity-50" />
                    No saved addresses.
                  </CardContent>
                </Card>
              ) : (
                customer.addresses.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="p-4 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{a.fullName}</span>
                        {a.isDefault && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-200">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{a.phone}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.address}{a.landmark ? `, ${a.landmark}` : ''}<br />
                        {a.city}, {a.state}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews">
            <div className="flex flex-col gap-3">
              {customer.reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No reviews yet.
                  </CardContent>
                </Card>
              ) : (
                customer.reviews.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="p-4 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{r.product.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {r.rating} ★
                        </Badge>
                      </div>
                      {r.title && <p className="text-sm font-medium">{r.title}</p>}
                      {r.comment && (
                        <p className="text-sm text-muted-foreground">{r.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateShort(r.createdAt)}
                        {r.verified ? ' · verified' : ''}
                        {!r.published ? ' · hidden' : ''}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes">
            <CustomerNotes customerId={customer.id} notes={serializedNotes} />
          </TabsContent>

          {/* Activity */}
          <TabsContent value="activity">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Time</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="pr-6">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                          No activity recorded.
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditEntries.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="pl-6 text-sm">
                            <div className="flex flex-col">
                              <span>{formatDateShort(l.createdAt)}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(l.createdAt).toLocaleTimeString('en-NG', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {l.actor?.name ?? 'Unknown'}
                            {l.actor?.role && (
                              <Badge variant="outline" className="ml-1.5 text-[10px]">
                                {l.actor.role}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-secondary">
                              {l.action}
                            </span>
                          </TableCell>
                          <TableCell className="pr-6 text-sm text-muted-foreground">
                            {l.description}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
