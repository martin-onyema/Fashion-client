'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { adminUpdateOrderTracking } from '@/actions/admin'

const CARRIERS = [
  { value: 'DHL', label: 'DHL' },
  { value: 'GIG', label: 'GIG Logistics' },
  { value: 'FedEx', label: 'FedEx' },
  { value: 'NIPOST', label: 'NIPOST' },
  { value: 'Gokada', label: 'Gokada' },
  { value: 'KOS', label: 'KOS Delivery' },
  { value: 'Self', label: 'Self / In-house' },
  { value: 'Other', label: 'Other' },
]

export function TrackingForm({
  orderId,
  initial,
}: {
  orderId: string
  initial: {
    trackingNumber: string | null
    trackingUrl: string | null
    carrier: string | null
    internalNotes: string | null
  }
}) {
  const router = useRouter()
  const [saving, startSave] = useTransition()
  const [trackingNumber, setTrackingNumber] = useState(initial.trackingNumber ?? '')
  const [trackingUrl, setTrackingUrl] = useState(initial.trackingUrl ?? '')
  const [carrier, setCarrier] = useState(initial.carrier ?? 'Self')
  const [internalNotes, setInternalNotes] = useState(initial.internalNotes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startSave(async () => {
      const r = await adminUpdateOrderTracking(orderId, {
        trackingNumber,
        trackingUrl,
        carrier,
        internalNote: internalNotes,
      })
      if (r.ok) {
        toast.success('Tracking updated')
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not save')
      }
    })
  }

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="font-display text-base">Shipping & Tracking</CardTitle>
        <CardDescription>Internal staff-only tracking form.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="carrier">Carrier</Label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger id="carrier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARRIERS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="trackingNumber">Tracking number</Label>
              <Input
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="WCDHL-1234567890"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="trackingUrl">Tracking URL (optional)</Label>
            <Input
              id="trackingUrl"
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://webapp.dhl.com/..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="internalNotes">Internal notes</Label>
            <Textarea
              id="internalNotes"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={3}
              placeholder="Dispatch rider contact, special delivery instructions, etc."
            />
          </div>
          <div>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save tracking
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
