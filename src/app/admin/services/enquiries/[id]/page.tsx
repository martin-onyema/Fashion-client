import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireStaffWithPermission } from '@/lib/permissions'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ServiceEnquiryActions } from '@/components/admin/service-enquiry-actions'
import { formatNGN } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Service Enquiry Detail',
  robots: { index: false, follow: false },
}

type Params = Promise<{ id: string }>

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-amber-100 text-amber-800',
  SCHEDULED: 'bg-purple-100 text-purple-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default async function AdminServiceEnquiryDetailPage({ params }: { params: Params }) {
  const admin = await requireStaffWithPermission('service.enquiry.view')
  const perms = await getMyPermissionCodes()
  const { id } = await params

  const enquiry = await db.serviceEnquiry.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  })

  if (!enquiry) notFound()

  const staffUsers = await db.user.findMany({
    where: { role: { not: 'CUSTOMER' }, active: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  })

  return (
    <AdminLayout
      title={enquiry.enquiryNumber}
      description={`${enquiry.serviceName} · ${enquiry.customerName}`}
      permissions={perms}
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: enquiry details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Name</p>
                  <p className="font-medium mt-1">{enquiry.customerName}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Email</p>
                  <p className="font-medium mt-1">
                    <a href={`mailto:${enquiry.email}`} className="text-foreground hover:underline">
                      {enquiry.email}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Phone</p>
                  <p className="font-medium mt-1">
                    <a href={`tel:${enquiry.phone}`} className="text-foreground hover:underline">
                      {enquiry.phone}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">WhatsApp</p>
                  <p className="font-medium mt-1">{enquiry.whatsappNumber || '—'}</p>
                </div>
              </div>
              {enquiry.user && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Linked to user:{' '}
                    <Link href={`/admin/customers/${enquiry.user.id}`} className="text-foreground hover:underline">
                      {enquiry.user.email}
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Service Requested
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Service</p>
                  <p className="font-medium mt-1">
                    <Link
                      href={`/services/${enquiry.serviceSlug}`}
                      className="text-foreground hover:underline"
                      target="_blank"
                    >
                      {enquiry.serviceName} ↗
                    </Link>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Occasion</p>
                  <p className="font-medium mt-1">{enquiry.occasion || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Preferred Date</p>
                  <p className="font-medium mt-1">
                    {enquiry.preferredDate
                      ? new Date(enquiry.preferredDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Preferred Time</p>
                  <p className="font-medium mt-1">{enquiry.preferredTime || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Location</p>
                  <p className="font-medium mt-1">{enquiry.location || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Budget</p>
                  <p className="font-medium mt-1">{enquiry.budget || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Clothing Size</p>
                  <p className="font-medium mt-1">{enquiry.clothingSize || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{enquiry.message}</p>
            </CardContent>
          </Card>

          {/* Internal notes */}
          {enquiry.internalNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                  Internal Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {enquiry.internalNotes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: workflow */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Current Status</p>
                <span className={`inline-block px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${STATUS_COLORS[enquiry.status] || 'bg-gray-100 text-gray-800'}`}>
                  {enquiry.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Submitted: {new Date(enquiry.createdAt).toLocaleString('en-GB')}</p>
                <p className="mt-1">Last updated: {new Date(enquiry.updatedAt).toLocaleString('en-GB')}</p>
              </div>
              {enquiry.assignedTo && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1">Assigned to</p>
                  <p className="font-medium">{enquiry.assignedTo.name}</p>
                  <p className="text-xs text-muted-foreground">{enquiry.assignedTo.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <ServiceEnquiryActions
            enquiryId={enquiry.id}
            currentStatus={enquiry.status}
            currentNotes={enquiry.internalNotes || ''}
            currentAssigneeId={enquiry.assignedToId || ''}
            staffUsers={staffUsers.map((s) => ({ id: s.id, name: s.name || s.email, role: s.role }))}
          />

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Quick Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <a
                href={`https://wa.me/${enquiry.whatsappNumber?.replace(/[^0-9]/g, '') || enquiry.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 bg-green-50 hover:bg-green-100 text-green-800 text-xs uppercase tracking-[0.15em]"
              >
                WhatsApp →
              </a>
              <a
                href={`mailto:${enquiry.email}?subject=Your enquiry ${enquiry.enquiryNumber}&body=Hi ${enquiry.customerName},%0D%0A%0D%0AThank you for your enquiry about ${enquiry.serviceName}.`}
                className="block px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs uppercase tracking-[0.15em]"
              >
                Email →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
