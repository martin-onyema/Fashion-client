import Link from 'next/link'
import { Plus } from 'lucide-react'
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
import { CampaignActions } from '@/components/admin/campaign-actions'
import { formatDateShort, formatNGN } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Campaigns',
  robots: { index: false, follow: false },
}

const TYPE_STYLES: Record<string, string> = {
  PROMOTION: 'bg-stone-100 text-stone-800 border-stone-200',
  FLASH_SALE: 'bg-red-50 text-red-900 border-red-200',
  FEATURED: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  SEASONAL: 'bg-amber-50 text-amber-900 border-amber-200',
}

export default async function AdminCampaignsPage() {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()

  const campaigns = await db.campaign.findMany({
    orderBy: { startsAt: 'desc' },
    take: 200,
  })

  const now = new Date()
  const activeCount = campaigns.filter((c) => c.active && new Date(c.startsAt) <= now && new Date(c.endsAt) >= now).length
  const scheduledCount = campaigns.filter((c) => new Date(c.startsAt) > now).length
  const endedCount = campaigns.filter((c) => new Date(c.endsAt) < now).length

  return (
    <AdminLayout
      title="Campaigns"
      description={`${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'} · ${activeCount} active · ${scheduledCount} scheduled · ${endedCount} ended`}
      permissions={perms}
      actions={
        <Button asChild size="sm">
          <Link href="/admin/marketing/new">
            <Plus className="size-4" />
            New Campaign
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
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Window</TableHead>
                  <TableHead className="text-right">Usage</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <p className="text-sm text-muted-foreground mb-4">No campaigns yet.</p>
                      <Button asChild size="sm">
                        <Link href="/admin/marketing/new">
                          <Plus className="size-4" />
                          New Campaign
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((c) => {
                    const discountLabel =
                      c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% off`
                        : c.discountType === 'FIXED'
                          ? `${formatNGN(c.discountValue)} off`
                          : 'Free shipping'
                    const isActive = c.active && new Date(c.startsAt) <= now && new Date(c.endsAt) >= now
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="pl-6">
                          <div className="flex flex-col">
                            <span className="font-medium">{c.name}</span>
                            {c.description && (
                              <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                                {c.description.slice(0, 80)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={TYPE_STYLES[c.type] ?? ''}>
                            {c.type.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{discountLabel}</TableCell>
                        <TableCell>
                          {isActive ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-200">
                              Running
                            </Badge>
                          ) : !c.active ? (
                            <Badge variant="outline" className="bg-secondary text-muted-foreground">
                              Inactive
                            </Badge>
                          ) : new Date(c.startsAt) > now ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200">
                              Scheduled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-secondary text-muted-foreground">
                              Ended
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateShort(c.startsAt)} → {formatDateShort(c.endsAt)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span className="font-medium">{c.usedCount}</span>
                          <span className="text-muted-foreground"> / {c.usageLimit ?? '∞'}</span>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <CampaignActions campaign={{ id: c.id, name: c.name }} />
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
