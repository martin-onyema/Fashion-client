import Link from 'next/link'
import { UserPlus, Pencil } from 'lucide-react'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
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
  title: 'Staff',
  robots: { index: false, follow: false },
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-stone-100 text-stone-900 border-stone-300',
  MANAGER: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  SALES: 'bg-teal-50 text-teal-900 border-teal-200',
  INVENTORY_MANAGER: 'bg-amber-50 text-amber-900 border-amber-200',
  CUSTOMER_SUPPORT: 'bg-violet-50 text-violet-900 border-violet-200',
  CONTENT_MANAGER: 'bg-rose-50 text-rose-900 border-rose-200',
}

export default async function AdminStaffPage() {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()

  const staff = await db.user.findMany({
    where: { role: { not: 'CUSTOMER' } },
    include: {
      _count: { select: { orders: true, auditLogs: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const activeCount = staff.filter((s) => s.active).length

  return (
    <AdminLayout
      title="Staff"
      description={`${staff.length} staff member${staff.length === 1 ? '' : 's'} · ${activeCount} active`}
      permissions={perms}
      actions={
        <Button asChild size="sm">
          <Link href="/admin/staff/new">
            <UserPlus className="size-4" />
            Invite Staff
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
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Audit Actions</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="pr-6 text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-16 text-center">
                      <p className="text-sm text-muted-foreground mb-4">No staff users yet.</p>
                      <Button asChild size="sm">
                        <Link href="/admin/staff/new">
                          <UserPlus className="size-4" />
                          Invite Staff
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            {s.image ? <AvatarImage src={s.image} alt={s.name ?? ''} /> : null}
                            <AvatarFallback>
                              {(s.name ?? s.email ?? '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{s.name ?? '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{s.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ROLE_STYLES[s.role] ?? ''}>
                          {s.role.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {s.department ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.lastLoginAt ? formatDateShort(s.lastLoginAt) : '—'}
                      </TableCell>
                      <TableCell>
                        {s.active ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-secondary text-muted-foreground">
                            Disabled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {s._count.auditLogs}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(s.createdAt)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button asChild variant="ghost" size="sm" className="size-8 p-0">
                          <Link href={`/admin/staff/${s.id}`}>
                            <Pencil className="size-3.5" />
                          </Link>
                        </Button>
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
