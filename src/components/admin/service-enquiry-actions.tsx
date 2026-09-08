'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { adminUpdateServiceEnquiryStatus, adminAssignServiceEnquiry } from '@/actions/admin'

type Props = {
  enquiryId: string
  currentStatus: string
  currentNotes: string
  currentAssigneeId: string
  staffUsers: { id: string; name: string; role: string }[]
}

const STATUSES = ['NEW', 'CONTACTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export function ServiceEnquiryActions({
  enquiryId,
  currentStatus,
  currentNotes,
  currentAssigneeId,
  staffUsers,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState(currentNotes)
  const [assigneeId, setAssigneeId] = useState(currentAssigneeId || '')

  const handleSave = () => {
    startTransition(async () => {
      const r = await adminUpdateServiceEnquiryStatus(enquiryId, status, notes)
      if (r.ok) {
        toast.success('Enquiry updated')
        router.refresh()
      } else {
        toast.error(r.error || 'Could not update enquiry')
      }
    })
  }

  const handleAssign = () => {
    startTransition(async () => {
      const r = await adminAssignServiceEnquiry(enquiryId, assigneeId || null)
      if (r.ok) {
        toast.success('Assignment updated')
        router.refresh()
      } else {
        toast.error(r.error || 'Could not update assignment')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Update Enquiry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Status */}
        <div>
          <Label className="label-uppercase text-muted-foreground">Status</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={pending}
            className="mt-2 flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Assignment */}
        <div>
          <Label className="label-uppercase text-muted-foreground">Assigned To</Label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            disabled={pending}
            className="mt-2 flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Unassigned</option>
            {staffUsers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.role})
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={handleAssign}
            disabled={pending || assigneeId === currentAssigneeId}
          >
            Update Assignment
          </Button>
        </div>

        {/* Internal notes */}
        <div>
          <Label className="label-uppercase text-muted-foreground">Internal Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            disabled={pending}
            className="mt-2"
            placeholder="Add internal notes (not visible to customer)…"
          />
        </div>

        <Button onClick={handleSave} disabled={pending} className="w-full">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
