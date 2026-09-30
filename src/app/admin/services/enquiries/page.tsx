import Link from 'next/link'
import { requireStaffWithPermission } from '@/lib/permissions'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SERVICES } from '@/lib/services-data'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Service Enquiries',
  robots: { index: false, follow: false },
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-amber-100 text-amber-800',
  SCHEDULED: 'bg-purple-100 text-purple-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

type SearchParams = Promise<{ status?: string; service?: string }>

export default async function AdminServiceEnquiriesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const admin = await requireStaffWithPermission('service.enquiry.view')
  const perms = await getMyPermissionCodes()

  const sp = await searchParams
  const statusFilter = typeof sp.status === 'string' ? sp.status : undefined
  const serviceFilter = typeof sp.service === 'string' ? sp.service : undefined

  const enquiries = await db.serviceEnquiry.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter as any } : {}),
      ...(serviceFilter ? { serviceSlug: serviceFilter } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  // Stats
  const stats = {
    total: enquiries.length,
    new: enquiries.filter((e) => e.status === 'NEW').length,
    inProgress: enquiries.filter((e) =>
      ['CONTACTED', 'SCHEDULED', 'IN_PROGRESS'].includes(e.status),
    ).length,
    completed: enquiries.filter((e) => e.status === 'COMPLETED').length,
  }

  return (
    <AdminLayout
      title="Service Enquiries"
      description={`${enquiries.length} enquiries · ${stats.new} new · ${stats.inProgress} in progress · ${stats.completed} completed`}
      permissions={perms}
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Total</p>
            <p className="font-display text-3xl mt-2">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">New</p>
            <p className="font-display text-3xl mt-2 text-blue-600">{stats.new}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">In Progress</p>
            <p className="font-display text-3xl mt-2 text-indigo-600">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Completed</p>
            <p className="font-display text-3xl mt-2 text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/services/enquiries"
          className={`px-3 py-1.5 text-xs uppercase tracking-[0.18em] border ${
            !statusFilter ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </Link>
        {['NEW', 'CONTACTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
          <Link
            key={s}
            href={`/admin/services/enquiries?status=${s}`}
            className={`px-3 py-1.5 text-xs uppercase tracking-[0.18em] border ${
              statusFilter === s ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {s.replace('_', ' ')}
          </Link>
        ))}
      </div>

      {/* Enquiries table */}
      <Card>
        <CardContent className="p-0">
          {enquiries.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No service enquiries yet. When customers submit the booking form on /services,
                their enquiries will appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Occasion</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs">{e.enquiryNumber}</TableCell>
                    <TableCell>
                      <p className="font-medium">{e.customerName}</p>
                      <p className="text-xs text-muted-foreground">{e.email}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{e.serviceName}</p>
                      <p className="text-xs text-muted-foreground">{e.budget || '—'}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      {e.preferredDate && (
                        <p className="text-xs mt-0.5">
                          Pref: {new Date(e.preferredDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{e.occasion || '—'}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] ${STATUS_COLORS[e.status] || 'bg-gray-100 text-gray-800'}`}>
                        {e.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/services/enquiries/${e.id}`}
                        className="text-[11px] uppercase tracking-[0.18em] text-foreground hover:underline"
                      >
                        Open →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
