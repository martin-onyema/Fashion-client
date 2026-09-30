import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CouponActions } from '@/components/admin/coupon-actions'
import { formatDate, formatNGN } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Coupons',
  robots: { index: false, follow: false },
}

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { q } = await searchParams

  const coupons = await db.coupon.findMany({
    where: q ? { code: { contains: q.toUpperCase() } } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const now = new Date()
  const activeCount = coupons.filter((c) => c.active && (!c.endsAt || new Date(c.endsAt) > now) && (!c.startsAt || new Date(c.startsAt) <= now)).length
  const expiredCount = coupons.filter((c) => c.endsAt && new Date(c.endsAt) <= now).length

  return (
    <AdminLayout
      title="Coupons"
      description={`${coupons.length} coupon${coupons.length === 1 ? '' : 's'} · ${activeCount} active · ${expiredCount} expired`}
      permissions={perms}
      actions={
        <Button asChild size="sm">
          <Link href="/admin/coupons/new">
            <Plus className="size-4" />
            New Coupon
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <form className="flex gap-2" role="search">
          <div className="relative flex-1 max-w-md">
            <Input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Search by code…"
              className="pl-3"
            />
          </div>
          <Button type="submit" variant="outline" size="default">Search</Button>
          {q && (
            <Button asChild variant="ghost" size="default">
              <Link href="/admin/coupons">Clear</Link>
            </Button>
          )}
        </form>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Min Order</TableHead>
                  <TableHead className="text-right">Max Discount</TableHead>
                  <TableHead className="text-right">Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        {q ? `No coupons match "${q}".` : 'No coupons yet.'}
                      </p>
                      <Button asChild size="sm">
                        <Link href="/admin/coupons/new">
                          <Plus className="size-4" />
                          New Coupon
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((c) => {
                    const isExpired = c.endsAt ? new Date(c.endsAt) <= now : false
                    const isScheduled = c.startsAt ? new Date(c.startsAt) > now : false
                    const status = !c.active
                      ? 'Inactive'
                      : isExpired
                        ? 'Expired'
                        : isScheduled
                          ? 'Scheduled'
                          : 'Active'
                    const statusBadge =
                      status === 'Active'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        : status === 'Expired'
                          ? 'bg-red-50 text-red-900 border-red-200'
                          : status === 'Scheduled'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-secondary text-muted-foreground'
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="pl-6 font-mono font-medium uppercase">
                          {c.code}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {c.type === 'PERCENTAGE'
                              ? `${c.value}%`
                              : c.type === 'FIXED'
                                ? formatNGN(c.value)
                                : 'Free shipping'}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1.5">
                            {c.type === 'FREE_SHIPPING' ? '' : c.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {c.minOrder ? formatNGN(c.minOrder) : '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {c.maxDiscount ? formatNGN(c.maxDiscount) : '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span className="font-medium">{c.usedCount}</span>
                          <span className="text-muted-foreground"> / {c.usageLimit ?? '∞'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusBadge}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(c.createdAt)}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <CouponActions coupon={{ id: c.id, code: c.code }} />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
