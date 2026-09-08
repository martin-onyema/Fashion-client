import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
import { BannerActions } from '@/components/admin/banner-actions'
import { formatDateShort } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Banners',
  robots: { index: false, follow: false },
}

export default async function AdminBannersPage() {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()

  const banners = await db.promotionalBanner.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    take: 100,
  })

  const activeCount = banners.filter((b) => b.active).length
  const now = new Date()
  const scheduledCount = banners.filter((b) => b.startsAt && new Date(b.startsAt) > now).length

  return (
    <AdminLayout
      title="Banners"
      description={`${banners.length} banner${banners.length === 1 ? '' : 's'} · ${activeCount} active · ${scheduledCount} scheduled`}
      permissions={perms}
      actions={
        <Button asChild size="sm">
          <Link href="/admin/banners/new">
            <Plus className="size-4" />
            New Banner
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 w-[72px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>CTA</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead className="text-right">Order</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <p className="text-sm text-muted-foreground mb-4">No banners yet.</p>
                      <Button asChild size="sm">
                        <Link href="/admin/banners/new">
                          <Plus className="size-4" />
                          New Banner
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  banners.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="pl-6">
                        {b.image ? (
                          <img
                            src={b.image}
                            alt={b.title}
                            className="size-10 rounded object-cover bg-secondary"
                          />
                        ) : (
                          <div className="size-10 rounded bg-secondary" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{b.title}</span>
                          {b.subtitle && (
                            <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                              {b.subtitle}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {b.ctaText ? (
                          <div className="flex flex-col">
                            <span className="text-sm">{b.ctaText}</span>
                            {b.ctaHref && (
                              <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                                {b.ctaHref}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
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
                      <TableCell className="text-sm text-muted-foreground">
                        {b.startsAt || b.endsAt ? (
                          <>
                            {b.startsAt ? formatDateShort(b.startsAt) : '∞'}
                            {' → '}
                            {b.endsAt ? formatDateShort(b.endsAt) : '∞'}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Always</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{b.order}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <BannerActions banner={{ id: b.id, title: b.title }} />
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
