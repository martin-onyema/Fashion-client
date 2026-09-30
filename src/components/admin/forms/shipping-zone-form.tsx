'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { adminCreateShippingZone } from '@/actions/admin'
import { NIGERIAN_STATES } from '@/lib/format'

export function ShippingZoneForm() {
  const router = useRouter()
  const [saving, startSave] = useTransition()
  const [name, setName] = useState('')
  const [statesText, setStatesText] = useState('')
  const [active, setActive] = useState(true)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startSave(async () => {
      const statesArr = statesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const r = await adminCreateShippingZone({
        name,
        states: JSON.stringify(statesArr.length ? statesArr : ['*']),
        active,
      })
      if (r.ok) {
        toast.success('Zone created')
        router.push('/admin/shipping')
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not create')
      }
    })
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">New shipping zone</CardTitle>
            <CardDescription>
              A zone groups Nigerian states that share shipping methods.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Lagos & South-West"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="states">States</Label>
              <Textarea
                id="states"
                value={statesText}
                onChange={(e) => setStatesText(e.target.value)}
                rows={4}
                placeholder="Lagos, Ogun, Oyo"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of Nigerian states, or use{' '}
                <button
                  type="button"
                  className="underline"
                  onClick={() => setStatesText(NIGERIAN_STATES.join(', '))}
                >
                  all states
                </button>{' '}
                or{" '*'" } to cover the whole country.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Visibility</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Active</Label>
                <p className="text-xs text-muted-foreground">Inactive zones are hidden at checkout.</p>
              </div>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Create zone
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/shipping">Cancel</Link>
          </Button>
        </div>
      </div>
    </form>
  )
}
