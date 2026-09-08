import Link from 'next/link'
import { Plus, SlidersHorizontal } from 'lucide-react'
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
import { AdjustStockDialog } from '@/components/admin/inventory-actions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Inventory',
  robots: { index: false, follow: false },
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { q, status } = await searchParams

  const variants = await db.productVariant.findMany({
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ product: { name: 'asc' } }, { size: 'asc' }],
    take: 500,
  })

  // Filter in memory so we can use computed stock status
  let rows = variants.map((v) => {
    const isOut = v.stock <= 0
    const isLow = !isOut && v.stock <= v.lowStockThreshold
    const status: 'in' | 'low' | 'out' = isOut ? 'out' : isLow ? 'low' : 'in'
    return { v, status }
  })

  if (q) {
    const needle = q.toLowerCase()
    rows = rows.filter(
      ({ v }) =>
        v.product.name.toLowerCase().includes(needle) ||
        (v.sku ?? '').toLowerCase().includes(needle),
    )
  }

  if (status && status !== 'all') {
    rows = rows.filter((r) => r.status === status)
  }

  const inStock = rows.filter((r) => r.status === 'in').length
  const lowStock = rows.filter((r) => r.status === 'low').length
  const outStock = rows.filter((r) => r.status === 'out').length

  return (
    <AdminLayout
      title="Inventory"
      description={`${rows.length} variant${rows.length === 1 ? '' : 's'} · ${inStock} in stock · ${lowStock} low · ${outStock} out`}
      permissions={perms}
      actions={
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            New Product
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <form className="flex flex-wrap gap-2" role="search">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Search by product name or SKU…"
              className="pl-3"
            />
          </div>
          <input type="hidden" name="status" value={status ?? ''} />
          <Button type="submit" variant="outline" size="default">
            <SlidersHorizontal className="size-4" />
            Search
          </Button>
          {(q || status) && (
            <Button asChild variant="ghost" size="default">
              <Link href="/admin/inventory">Clear</Link>
            </Button>
          )}
          <div className="flex flex-wrap gap-1.5 ml-auto">
            <Button asChild variant={status === 'low' ? 'default' : 'outline'} size="sm">
              <Link href={buildQuery(q, 'low')}>Low ({lowStock})</Link>
            </Button>
            <Button asChild variant={status === 'out' ? 'default' : 'outline'} size="sm">
              <Link href={buildQuery(q, 'out')}>Out ({outStock})</Link>
            </Button>
            <Button asChild variant={status === 'in' ? 'default' : 'outline'} size="sm">
              <Link href={buildQuery(q, 'in')}>In ({inStock})</Link>
            </Button>
            <Button asChild variant={!status || status === 'all' ? 'default' : 'outline'} size="sm">
              <Link href={buildQuery(q, '')}>All ({rows.length})</Link>
            </Button>
          </div>
        </form>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Product</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Adjust</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                      No variants match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map(({ v, status: s }) => (
                    <TableRow key={v.id}>
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <Link
                            href={`/admin/products/${v.product.id}`}
                            className="font-medium hover:underline"
                          >
                            {v.product.name}
                          </Link>
                          <span className="text-xs text-muted-foreground font-mono">
                            {v.product.slug}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{v.size ?? '—'}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {v.sku ?? '—'}
                      </TableCell>
                      <TableCell
                        className={
                          'text-right tabular-nums font-medium ' +
                          (s === 'out'
                            ? 'text-red-600'
                            : s === 'low'
                              ? 'text-amber-600'
                              : '')
                        }
                      >
                        {v.stock}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {v.lowStockThreshold}
                      </TableCell>
                      <TableCell>
                        {s === 'out' ? (
                          <Badge variant="outline" className="bg-red-50 text-red-900 border-red-200">
                            Out of stock
                          </Badge>
                        ) : s === 'low' ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200">
                            Low
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-200">
                            In stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <AdjustStockDialog
                          variant={{
                            id: v.id,
                            stock: v.stock,
                            lowStockThreshold: v.lowStockThreshold,
                            size: v.size,
                            sku: v.sku,
                            product: { name: v.product.name, slug: v.product.slug },
                          }}
                        />
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

function buildQuery(q: string | undefined, status: string) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (status) params.set('status', status)
  const s = params.toString()
  return s ? `/admin/inventory?${s}` : '/admin/inventory'
}
