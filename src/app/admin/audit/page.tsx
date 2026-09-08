import Link from 'next/link'
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
import { formatDate, formatDateShort } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Audit Log',
  robots: { index: false, follow: false },
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-stone-100 text-stone-900 border-stone-300',
  MANAGER: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  SALES: 'bg-teal-50 text-teal-900 border-teal-200',
  INVENTORY_MANAGER: 'bg-amber-50 text-amber-900 border-amber-200',
  CUSTOMER_SUPPORT: 'bg-violet-50 text-violet-900 border-violet-200',
  CONTENT_MANAGER: 'bg-rose-50 text-rose-900 border-rose-200',
  CUSTOMER: 'bg-secondary text-muted-foreground',
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entityType?: string; actorId?: string }>
}) {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { action, entityType, actorId } = await searchParams

  const logs = await db.auditLog.findMany({
    where: {
      ...(action ? { action: { contains: action } } : {}),
      ...(entityType ? { entityType } : {}),
      ...(actorId ? { actorId } : {}),
    },
    include: {
      actor: { select: { name: true, email: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  // Distinct values for filters
  const distinctActions = await db.auditLog.findMany({
    distinct: ['action'],
    select: { action: true },
    take: 200,
  })
  const distinctEntities = await db.auditLog.findMany({
    distinct: ['entityType'],
    select: { entityType: true },
    take: 100,
  })

  return (
    <AdminLayout
      title="Audit Log"
      description={`${logs.length} entr${logs.length === 1 ? 'y' : 'ies'} shown`}
      permissions={perms}
    >
      <div className="flex flex-col gap-6">
        <form className="flex flex-wrap gap-2" role="search">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Input
              type="search"
              name="action"
              defaultValue={action ?? ''}
              placeholder="Action (e.g. order.refund)"
              className="pl-3"
            />
          </div>
          <div className="relative min-w-[160px]">
            <Input
              type="search"
              name="entityType"
              defaultValue={entityType ?? ''}
              placeholder="Entity (e.g. Order)"
              className="pl-3"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Input
              type="search"
              name="actorId"
              defaultValue={actorId ?? ''}
              placeholder="Actor ID"
              className="pl-3 font-mono text-xs"
            />
          </div>
          <Button type="submit" variant="outline" size="default">Filter</Button>
          {(action || entityType || actorId) && (
            <Button asChild variant="ghost" size="default">
              <Link href="/admin/audit">Clear</Link>
            </Button>
          )}
        </form>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 w-[200px]">Time</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead className="pr-6">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                      No audit entries match the filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="pl-6 text-sm">
                        <div className="flex flex-col">
                          <span className="text-foreground">{formatDateShort(l.createdAt)}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(l.createdAt).toLocaleTimeString('en-NG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {l.actor ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">{l.actor.name ?? l.actor.email}</span>
                            <Badge
                              variant="outline"
                              className={'text-[10px] w-fit ' + (ROLE_STYLES[l.actor.role] ?? '')}
                            >
                              {l.actor.role}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Deleted user</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs px-2 py-1 rounded bg-secondary">
                          {l.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        {l.entityType ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium">{l.entityType}</span>
                            {l.entityId && (
                              <span className="text-[11px] text-muted-foreground font-mono">
                                {l.entityId.slice(0, 12)}…
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-sm text-muted-foreground">
                        <span title={l.description}>{l.description}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {(distinctActions.length > 0 || distinctEntities.length > 0) && (
          <Card>
            <CardContent className="p-4 flex flex-col gap-3">
              <div>
                <p className="label-uppercase text-[10px] text-muted-foreground/70 mb-1.5">Available actions</p>
                <div className="flex flex-wrap gap-1">
                  {distinctActions.map((a) => (
                    <Link
                      key={a.action}
                      href={`/admin/audit?action=${encodeURIComponent(a.action)}`}
                      className="font-mono text-[11px] px-2 py-0.5 rounded bg-secondary hover:bg-secondary/70"
                    >
                      {a.action}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="label-uppercase text-[10px] text-muted-foreground/70 mb-1.5">Entity types</p>
                <div className="flex flex-wrap gap-1">
                  {distinctEntities.map((e) => (
                    <Link
                      key={e.entityType}
                      href={`/admin/audit?entityType=${encodeURIComponent(e.entityType)}`}
                      className="text-[11px] px-2 py-0.5 rounded bg-secondary hover:bg-secondary/70"
                    >
                      {e.entityType}
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
