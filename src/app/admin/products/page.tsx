import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductsTable } from '@/components/admin/products-table'
import { AdminHeaderToolbar } from '@/components/admin/admin-header-toolbar'
import { AdminSearchTrigger } from '@/components/admin/admin-search-trigger'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Products',
  robots: { index: false, follow: false },
}

const PAGE_SIZE = 25

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    page?: string
    status?: string
    stock?: string
    category?: string
  }>
}) {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { q, page, status, category } = await searchParams
  const pageNum = Math.max(1, parseInt(page ?? '1') || 1)
  const skip = (pageNum - 1) * PAGE_SIZE

  const where = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q } },
              { sku: { contains: q } },
              { slug: { contains: q } },
              { tags: { contains: q } },
            ],
          }
        : {},
      status === 'published' ? { published: true } : {},
      status === 'draft' ? { published: false } : {},
      status === 'featured' ? { featured: true } : {},
      status === 'archived' ? { status: 'ARCHIVED' } : {},
      status === 'active' ? { status: 'ACTIVE' } : {},
      category ? { categoryId: category } : {},
    ],
  }

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      include: {
        images: { orderBy: { position: 'asc' }, take: 1 },
        variants: { select: { stock: true, lowStockThreshold: true } },
        category: { include: { parent: true } },
      },
    }),
    db.product.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const categories = await db.category.findMany({
    where: { parentId: null },
    include: { children: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' },
  })

  // Flatten categories for the filter dropdown
  const categoryOptions = categories.flatMap((c) => [
    { id: c.id, name: c.name },
    ...c.children.map((ch) => ({ id: ch.id, name: `${c.name} → ${ch.name}` })),
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

  // Serialize for client
  const serialized = products.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    category: {
      name: p.category.name,
      parent: p.category.parent ? { name: p.category.parent.name } : null,
    },
    images: p.images.map((img) => ({ url: img.url })),
    variants: p.variants.map((v) => ({ stock: v.stock, lowStockThreshold: v.lowStockThreshold })),
  }))

  const emptyMsg = q
    ? `No products match "${q}".`
    : 'No products yet. Create your first product.'

  return (
    <AdminLayout
      title="Products"
      description={`${totalCount} product${totalCount === 1 ? '' : 's'} in catalogue · page ${pageNum} of ${totalPages}`}
      permissions={perms}
      headerExtras={
        <div className="flex items-center gap-1">
          <AdminSearchTrigger />
          <AdminHeaderToolbar notifications={notifs} />
        </div>
      }
      actions={
        <Button asChild size="sm">
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            Create Product
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Search + filters */}
        <form className="flex flex-wrap gap-2" role="search">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Search by name, SKU, tag…"
              className="pl-9"
            />
          </div>
          <select
            name="status"
            defaultValue={status ?? ''}
            className="border border-border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="featured">Featured</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <select
            name="category"
            defaultValue={category ?? ''}
            className="border border-border rounded-md px-3 py-2 text-sm bg-background max-w-[200px]"
          >
            <option value="">All categories</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline" size="default">
            Filter
          </Button>
          {(q || status || category) && (
            <Button asChild variant="ghost" size="default">
              <Link href="/admin/products">Clear</Link>
            </Button>
          )}
        </form>

        {/* Bulk-selectable products table */}
        <ProductsTable products={serialized} emptyMessage={emptyMsg} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pageNum} of {totalPages} · {totalCount} total
            </p>
            <div className="flex gap-2">
              {pageNum > 1 && (
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/admin/products?${new URLSearchParams({
                      ...(q ? { q } : {}),
                      ...(status ? { status } : {}),
                      ...(category ? { category } : {}),
                      page: String(pageNum - 1),
                    }).toString()}`}
                  >
                    ← Prev
                  </Link>
                </Button>
              )}
              {pageNum < totalPages && (
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/admin/products?${new URLSearchParams({
                      ...(q ? { q } : {}),
                      ...(status ? { status } : {}),
                      ...(category ? { category } : {}),
                      page: String(pageNum + 1),
                    }).toString()}`}
                  >
                    Next →
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
