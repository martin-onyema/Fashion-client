import Link from 'next/link'
import { Plus } from 'lucide-react'
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
import { BrandActions } from '@/components/admin/brand-actions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Brands',
  robots: { index: false, follow: false },
}

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { q } = await searchParams

  const brands = await db.brand.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { slug: { contains: q } },
          ],
        }
      : undefined,
    orderBy: [{ name: 'asc' }],
    include: {
      _count: { select: { products: true } },
    },
  })

  const activeCount = brands.filter((b) => b.active).length

  return (
    <AdminLayout
      title="Brands"
      description={`${brands.length} brand${brands.length === 1 ? '' : 's'} · ${activeCount} active`}
      permissions={perms}
      actions={
        <Button asChild size="sm">
          <Link href="/admin/brands/new">
            <Plus className="size-4" />
            New Brand
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
              placeholder="Search by name or slug…"
              className="pl-3"
            />
          </div>
          <Button type="submit" variant="outline" size="default">Search</Button>
          {q && (
            <Button asChild variant="ghost" size="default">
              <Link href="/admin/brands">Clear</Link>
            </Button>
          )}
        </form>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 w-[72px]">Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        {q ? `No brands match "${q}".` : 'No brands yet.'}
                      </p>
                      <Button asChild size="sm">
                        <Link href="/admin/brands/new">
                          <Plus className="size-4" />
                          New Brand
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  brands.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="pl-6">
                        {b.logoUrl ? (
                          <img
                            src={b.logoUrl}
                            alt={b.name}
                            className="size-8 rounded object-contain bg-secondary"
                          />
                        ) : (
                          <div className="size-8 rounded bg-secondary" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{b.name}</span>
                          {b.description && (
                            <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                              {b.description.slice(0, 80)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {b.slug}
                      </TableCell>
                      <TableCell className="text-sm">
                        {b.country ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {b._count.products}
                      </TableCell>
                      <TableCell>
                        {b.active ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-secondary text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <BrandActions brand={{ id: b.id, name: b.name, slug: b.slug }} />
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
