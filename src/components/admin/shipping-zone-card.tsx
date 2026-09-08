'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Plus, Pencil, Trash2, Loader2, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  adminUpdateShippingZone,
  adminDeleteShippingZone,
  adminCreateShippingMethod,
  adminUpdateShippingMethod,
  adminDeleteShippingMethod,
} from '@/actions/admin'
import { formatNGN, NIGERIAN_STATES } from '@/lib/format'

type Method = {
  id: string
  name: string
  description: string | null
  carrier: string | null
  baseCost: number
  perKgCost: number
  perItemCost: number
  freeThreshold: number | null
  estimatedDaysMin: number | null
  estimatedDaysMax: number | null
  active: boolean
}

type Zone = {
  id: string
  name: string
  states: string
  countries: string | null
  active: boolean
  ordersCount: number
  methods: Method[]
}

function parseStates(s: string | null | undefined): string[] {
  if (!s) return []
  try {
    const arr = JSON.parse(s)
    return Array.isArray(arr) ? arr.map(String) : []
  } catch {
    return []
  }
}

export function ShippingZoneCard({ zone }: { zone: Zone }) {
  const router = useRouter()
  const [editing, startEdit] = useTransition()
  const [deleting, startDelete] = useTransition()
  const [editOpen, setEditOpen] = useState(false)

  const statesArr = parseStates(zone.states)
  const allStates = statesArr.includes('*')

  const [name, setName] = useState(zone.name)
  const [statesText, setStatesText] = useState(
    statesArr.join(', '),
  )
  const [active, setActive] = useState(zone.active)

  function saveZone(e: React.FormEvent) {
    e.preventDefault()
    startEdit(async () => {
      const statesArr = statesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const r = await adminUpdateShippingZone(zone.id, {
        name,
        states: JSON.stringify(statesArr.length ? statesArr : ['*']),
        active,
      })
      if (r.ok) {
        toast.success('Zone updated')
        setEditOpen(false)
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not save')
      }
    })
  }

  function deleteZone() {
    startDelete(async () => {
      const r = await adminDeleteShippingZone(zone.id)
      if (r.ok) {
        toast.success('Zone deleted')
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not delete')
      }
    })
  }

  return (
    <Card>
      <CardHeader className="border-b border-border flex flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-display text-base flex items-center gap-2">
            {zone.name}
            {zone.active ? (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-200">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-secondary text-muted-foreground">
                Inactive
              </Badge>
            )}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {zone.ordersCount} order{zone.ordersCount === 1 ? '' : 's'} ·{' '}
            {zone.methods.length} method{zone.methods.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="size-8 p-0">
                <Pencil className="size-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit zone</DialogTitle>
                <DialogDescription>
                  States accepts a comma-separated list of Nigerian states or{" '*, '"} for all.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={saveZone} className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="states">States</Label>
                  <Textarea
                    id="states"
                    value={statesText}
                    onChange={(e) => setStatesText(e.target.value)}
                    rows={3}
                    placeholder="Lagos, Ogun, Oyo"
                  />
                  <p className="text-xs text-muted-foreground">
                    Quick add: {' '}
                    <button
                      type="button"
                      className="underline"
                      onClick={() => setStatesText(NIGERIAN_STATES.join(', '))}
                    >
                      all states
                    </button>
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Active</Label>
                  <Switch id="active" checked={active} onCheckedChange={setActive} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editing}>
                    {editing ? <Loader2 className="size-4 animate-spin" /> : null}
                    Save
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="size-8 p-0 text-red-600 hover:text-red-700">
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete zone?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes <span className="font-medium">{zone.name}</span> and its
                  shipping methods. Existing orders keep their snapshot.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteZone}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col gap-4">
        <div>
          <p className="label-uppercase text-[10px] text-muted-foreground/70 mb-1.5">States covered</p>
          {allStates ? (
            <Badge variant="secondary" className="text-[11px]">All states</Badge>
          ) : (
            <div className="flex flex-wrap gap-1">
              {statesArr.map((s, i) => (
                <Badge key={i} variant="outline" className="text-[10px] font-normal">
                  {s}
                </Badge>
              ))}
              {statesArr.length === 0 && (
                <span className="text-xs text-muted-foreground">No states</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="label-uppercase text-[10px] text-muted-foreground/70">Methods</p>
          {zone.methods.length === 0 ? (
            <p className="text-xs text-muted-foreground">No methods yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {zone.methods.map((m) => (
                <MethodRow key={m.id} zoneId={zone.id} method={m} />
              ))}
            </div>
          )}
        </div>

        <NewMethodDialog zoneId={zone.id} />
      </CardContent>
    </Card>
  )
}

function MethodRow({ zoneId, method }: { zoneId: string; method: Method }) {
  const router = useRouter()
  const [saving, startSave] = useTransition()
  const [deleting, startDelete] = useTransition()
  const [open, setOpen] = useState(false)

  const [name, setName] = useState(method.name)
  const [description, setDescription] = useState(method.description ?? '')
  const [carrier, setCarrier] = useState(method.carrier ?? '')
  const [baseCost, setBaseCost] = useState(String(method.baseCost))
  const [perKgCost, setPerKgCost] = useState(String(method.perKgCost ?? 0))
  const [perItemCost, setPerItemCost] = useState(String(method.perItemCost ?? 0))
  const [freeThreshold, setFreeThreshold] = useState(
    method.freeThreshold != null ? String(method.freeThreshold) : '',
  )
  const [estimatedDaysMin, setEstimatedDaysMin] = useState(
    method.estimatedDaysMin != null ? String(method.estimatedDaysMin) : '',
  )
  const [estimatedDaysMax, setEstimatedDaysMax] = useState(
    method.estimatedDaysMax != null ? String(method.estimatedDaysMax) : '',
  )
  const [active, setActive] = useState(method.active)

  async function toggleActive() {
    const next = !active
    setActive(next)
    const r = await adminUpdateShippingMethod(method.id, {
      zoneId,
      name,
      description: description || undefined,
      carrier: carrier || undefined,
      baseCost: Number(baseCost),
      perKgCost: Number(perKgCost) || 0,
      perItemCost: Number(perItemCost) || 0,
      freeThreshold: freeThreshold ? Number(freeThreshold) : undefined,
      estimatedDaysMin: estimatedDaysMin ? parseInt(estimatedDaysMin, 10) : undefined,
      estimatedDaysMax: estimatedDaysMax ? parseInt(estimatedDaysMax, 10) : undefined,
      active: next,
    })
    if (r.ok) {
      router.refresh()
    } else {
      setActive(!next)
      toast.error(r.error ?? 'Could not update')
    }
  }

  function save(e: React.FormEvent) {
    e.preventDefault()
    startSave(async () => {
      const r = await adminUpdateShippingMethod(method.id, {
        zoneId,
        name,
        description: description || undefined,
        carrier: carrier || undefined,
        baseCost: Number(baseCost),
        perKgCost: Number(perKgCost) || 0,
        perItemCost: Number(perItemCost) || 0,
        freeThreshold: freeThreshold ? Number(freeThreshold) : undefined,
        estimatedDaysMin: estimatedDaysMin ? parseInt(estimatedDaysMin, 10) : undefined,
        estimatedDaysMax: estimatedDaysMax ? parseInt(estimatedDaysMax, 10) : undefined,
        active,
      })
      if (r.ok) {
        toast.success('Method updated')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not save')
      }
    })
  }

  function del() {
    startDelete(async () => {
      const r = await adminDeleteShippingMethod(method.id)
      if (r.ok) {
        toast.success('Method deleted')
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not delete')
      }
    })
  }

  return (
    <div className="rounded-md border border-border p-3 flex items-start justify-between gap-3">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{method.name}</span>
          {method.carrier && (
            <Badge variant="outline" className="text-[10px]">{method.carrier}</Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatNGN(method.baseCost)}
          {method.estimatedDaysMin && method.estimatedDaysMax
            ? ` · ${method.estimatedDaysMin}–${method.estimatedDaysMax} days`
            : ''}
          {method.freeThreshold ? ` · free over ${formatNGN(method.freeThreshold)}` : ''}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={active} onCheckedChange={toggleActive} />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="size-7 p-0">
              <Pencil className="size-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit method</DialogTitle>
            </DialogHeader>
            <form onSubmit={save} className="flex flex-col gap-3 py-2">
              <MethodFields
                name={name} setName={setName}
                description={description} setDescription={setDescription}
                carrier={carrier} setCarrier={setCarrier}
                baseCost={baseCost} setBaseCost={setBaseCost}
                perKgCost={perKgCost} setPerKgCost={setPerKgCost}
                perItemCost={perItemCost} setPerItemCost={setPerItemCost}
                freeThreshold={freeThreshold} setFreeThreshold={setFreeThreshold}
                estimatedDaysMin={estimatedDaysMin} setEstimatedDaysMin={setEstimatedDaysMin}
                estimatedDaysMax={estimatedDaysMax} setEstimatedDaysMax={setEstimatedDaysMax}
              />
              <div className="flex items-center justify-between">
                <Label htmlFor="m-active">Active</Label>
                <Switch id="m-active" checked={active} onCheckedChange={setActive} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="size-7 p-0 text-red-600 hover:text-red-700">
              <X className="size-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete method?</AlertDialogTitle>
              <AlertDialogDescription>
                Removes <span className="font-medium">{method.name}</span> from this zone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={del}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function NewMethodDialog({ zoneId }: { zoneId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, startSave] = useTransition()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [carrier, setCarrier] = useState('')
  const [baseCost, setBaseCost] = useState('2500')
  const [perKgCost, setPerKgCost] = useState('0')
  const [perItemCost, setPerItemCost] = useState('0')
  const [freeThreshold, setFreeThreshold] = useState('')
  const [estimatedDaysMin, setEstimatedDaysMin] = useState('2')
  const [estimatedDaysMax, setEstimatedDaysMax] = useState('5')
  const [active, setActive] = useState(true)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startSave(async () => {
      const r = await adminCreateShippingMethod({
        zoneId,
        name,
        description: description || undefined,
        carrier: carrier || undefined,
        baseCost: Number(baseCost),
        perKgCost: Number(perKgCost) || 0,
        perItemCost: Number(perItemCost) || 0,
        freeThreshold: freeThreshold ? Number(freeThreshold) : undefined,
        estimatedDaysMin: estimatedDaysMin ? parseInt(estimatedDaysMin, 10) : undefined,
        estimatedDaysMax: estimatedDaysMax ? parseInt(estimatedDaysMax, 10) : undefined,
        active,
      })
      if (r.ok) {
        toast.success('Method created')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not create')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="size-4" />
          Add method
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New shipping method</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3 py-2">
          <MethodFields
            name={name} setName={setName}
            description={description} setDescription={setDescription}
            carrier={carrier} setCarrier={setCarrier}
            baseCost={baseCost} setBaseCost={setBaseCost}
            perKgCost={perKgCost} setPerKgCost={setPerKgCost}
            perItemCost={perItemCost} setPerItemCost={setPerItemCost}
            freeThreshold={freeThreshold} setFreeThreshold={setFreeThreshold}
            estimatedDaysMin={estimatedDaysMin} setEstimatedDaysMin={setEstimatedDaysMin}
            estimatedDaysMax={estimatedDaysMax} setEstimatedDaysMax={setEstimatedDaysMax}
          />
          <div className="flex items-center justify-between">
            <Label htmlFor="nm-active">Active</Label>
            <Switch id="nm-active" checked={active} onCheckedChange={setActive} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MethodFields(props: {
  name: string; setName: (v: string) => void
  description: string; setDescription: (v: string) => void
  carrier: string; setCarrier: (v: string) => void
  baseCost: string; setBaseCost: (v: string) => void
  perKgCost: string; setPerKgCost: (v: string) => void
  perItemCost: string; setPerItemCost: (v: string) => void
  freeThreshold: string; setFreeThreshold: (v: string) => void
  estimatedDaysMin: string; setEstimatedDaysMin: (v: string) => void
  estimatedDaysMax: string; setEstimatedDaysMax: (v: string) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="m-name">Name</Label>
        <Input id="m-name" value={props.name} onChange={(e) => props.setName(e.target.value)} required placeholder="Standard Delivery" />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="m-desc">Description</Label>
        <Input id="m-desc" value={props.description} onChange={(e) => props.setDescription(e.target.value)} placeholder="Optional" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="m-carrier">Carrier</Label>
        <Input id="m-carrier" value={props.carrier} onChange={(e) => props.setCarrier(e.target.value)} placeholder="DHL / GIG / Self" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="m-base">Base cost (NGN)</Label>
        <Input id="m-base" type="number" min={0} value={props.baseCost} onChange={(e) => props.setBaseCost(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="m-perkg">Per-kg cost</Label>
        <Input id="m-perkg" type="number" min={0} value={props.perKgCost} onChange={(e) => props.setPerKgCost(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="m-peritem">Per-item cost</Label>
        <Input id="m-peritem" type="number" min={0} value={props.perItemCost} onChange={(e) => props.setPerItemCost(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="m-free">Free threshold</Label>
        <Input id="m-free" type="number" min={0} value={props.freeThreshold} onChange={(e) => props.setFreeThreshold(e.target.value)} placeholder="0 = none" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="m-min">Estimated min days</Label>
        <Input id="m-min" type="number" min={0} value={props.estimatedDaysMin} onChange={(e) => props.setEstimatedDaysMin(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="m-max">Estimated max days</Label>
        <Input id="m-max" type="number" min={0} value={props.estimatedDaysMax} onChange={(e) => props.setEstimatedDaysMax(e.target.value)} />
      </div>
    </div>
  )
}
