import Link from 'next/link'
import { Plus, Star, MoreHorizontal } from 'lucide-react'
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
import { CategoryActions } from '@/components/admin/category-actions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Categories',
  robots: { index: false, follow: false },
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { q } = await searchParams

  const categories = await db.category.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { slug: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : undefined,
    orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
    include: {
      parent: { select: { name: true, slug: true } },
      _count: { select: { products: true, children: true } },
    },
  })

  const topLevelCount = categories.filter((c) => !c.parentId).length
  const featuredCount = categories.filter((c) => c.featured).length

  return (
    <AdminLayout
      title="Categories"
      description={`${categories.length} categor${categories.length === 1 ? 'y' : 'ies'} · ${topLevelCount} top-level · ${featuredCount} featured`}
      permissions={perms}
      actions={
        <Button asChild size="sm">
          <Link href="/admin/categories/new">
            <Plus className="size-4" />
            New Category
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
              placeholder="Search by name, slug, description…"
              className="pl-3"
            />
          </div>
          <Button type="submit" variant="outline" size="default">Search</Button>
          {q && (
            <Button asChild variant="ghost" size="default">
              <Link href="/admin/categories">Clear</Link>
            </Button>
          )}
        </form>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 w-[60px]">Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Children</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        {q ? `No categories match "${q}".` : 'No categories yet.'}
                      </p>
                      <Button asChild size="sm">
                        <Link href="/admin/categories/new">
                          <Plus className="size-4" />
                          New Category
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="pl-6 tabular-nums text-muted-foreground">
                        {c.order}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {c.image && (
                            <div className="size-8 shrink-0 rounded bg-secondary overflow-hidden" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">{c.name}</span>
                            {c.description && (
                              <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                                {c.description.slice(0, 80)}
                              </span>
                            )}
                          </div>
                          {c.featured && (
                            <Badge variant="secondary" className="ml-1 text-[10px]">
                              <Star className="size-3 mr-1" /> Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {c.slug}
                      </TableCell>
                      <TableCell className="text-sm">
                        {c.parent ? c.parent.name : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {c._count.products}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {c._count.children}
                      </TableCell>
                      <TableCell>
                        {c.active ? (
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
                        <CategoryActions category={c} />
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
