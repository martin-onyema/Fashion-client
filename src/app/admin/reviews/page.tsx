import Link from 'next/link'
import { Star } from 'lucide-react'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ReviewsActions } from '@/components/admin/reviews-actions'
import { formatDateShort } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Reviews',
  robots: { index: false, follow: false },
}

type StatusFilter = 'pending' | 'published' | 'rejected' | 'all'

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { status } = await searchParams
  const statusFilter = (status ?? 'pending') as StatusFilter

  const where = (() => {
    switch (statusFilter) {
      case 'pending':
        return { published: true, verified: false }
      case 'published':
        return { published: true, verified: true }
      case 'rejected':
        return { rejected: true }
      default:
        return undefined
    }
  })()

  const reviews = await db.review.findMany({
    where,
    include: {
      product: { select: { id: true, name: true, slug: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const counts = await db.review.groupBy({
    by: ['published', 'verified', 'rejected'],
    _count: true,
  })

  const pendingCount = counts
    .filter((c) => c.published && !c.verified && !c.rejected)
    .reduce((s, c) => s + c._count, 0)
  const publishedCount = counts
    .filter((c) => c.published && c.verified && !c.rejected)
    .reduce((s, c) => s + c._count, 0)
  const rejectedCount = counts
    .filter((c) => c.rejected)
    .reduce((s, c) => s + c._count, 0)
  const totalCount = counts.reduce((s, c) => s + c._count, 0)

  const tabs: { value: StatusFilter; label: string; count: number }[] = [
    { value: 'pending', label: 'Pending', count: pendingCount },
    { value: 'published', label: 'Published', count: publishedCount },
    { value: 'rejected', label: 'Rejected', count: rejectedCount },
    { value: 'all', label: 'All', count: totalCount },
  ]

  return (
    <AdminLayout
      title="Reviews"
      description={`${reviews.length} review${reviews.length === 1 ? '' : 's'} in current view`}
      permissions={perms}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const isActive = statusFilter === t.value
            return (
              <Button
                key={t.value}
                asChild
                variant={isActive ? 'default' : 'outline'}
                size="sm"
              >
                <Link href={`/admin/reviews?status=${t.value}`}>
                  {t.label}
                  <span
                    className={
                      'ml-1.5 text-xs ' +
                      (isActive ? 'text-background/70' : 'text-muted-foreground')
                    }
                  >
                    {t.count}
                  </span>
                </Link>
              </Button>
            )
          })}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Product</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="max-w-xs">Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                      No reviews to show in this view.
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((r) => {
                    const statusBadge = !r.published && r.rejected
                      ? 'bg-red-50 text-red-900 border-red-200'
                      : r.published && r.verified
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        : !r.published && !r.rejected
                          ? 'bg-stone-100 text-stone-700 border-stone-200'
                          : 'bg-amber-50 text-amber-900 border-amber-200'
                    const statusLabel = !r.published && r.rejected
                      ? 'Rejected'
                      : r.published && r.verified
                        ? 'Approved'
                        : !r.published && !r.rejected
                          ? 'Hidden'
                          : 'Pending'
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="pl-6">
                          <div className="flex flex-col">
                            <Link
                              href={`/admin/products/${r.product.id}`}
                              className="font-medium hover:underline"
                            >
                              {r.product.name}
                            </Link>
                            <span className="text-xs text-muted-foreground font-mono">
                              {r.product.slug}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {r.authorName}
                            </span>
                            {r.user?.email && (
                              <span className="text-xs text-muted-foreground">
                                {r.user.email}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={
                                  'size-3.5 ' +
                                  (i < r.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-muted-foreground/40')
                                }
                              />
                            ))}
                            <span className="ml-1.5 text-xs text-muted-foreground">
                              {r.rating}/5
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {r.title && (
                            <p className="text-sm font-medium truncate">{r.title}</p>
                          )}
                          {r.comment && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {r.comment}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusBadge}>
                            {statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateShort(r.createdAt)}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <ReviewsActions
                            review={{
                              id: r.id,
                              rating: r.rating,
                              productName: r.product.name,
                            }}
                          />
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
