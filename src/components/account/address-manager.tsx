'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Pencil, Trash2, Check, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { NIGERIAN_STATES } from '@/lib/format'
import { saveAddress, deleteAddress } from '@/actions/store'
import { toast } from 'sonner'

type Address = {
  id: string
  fullName: string
  phone: string
  state: string
  city: string
  address: string
  landmark?: string | null
  isDefault: boolean
}

type FormState = {
  id?: string
  fullName: string
  phone: string
  state: string
  city: string
  address: string
  landmark: string
  isDefault: boolean
}

const EMPTY_FORM: FormState = {
  fullName: '',
  phone: '',
  state: '',
  city: '',
  address: '',
  landmark: '',
  isDefault: false,
}

export function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Keep state in sync if server revalidates and re-passes props
  useEffect(() => {
    setAddresses(initialAddresses)
  }, [initialAddresses])

  const openAdd = () => {
    setEditing({ ...EMPTY_FORM, isDefault: addresses.length === 0 })
    setDialogOpen(true)
  }

  const openEdit = (addr: Address) => {
    setEditing({
      id: addr.id,
      fullName: addr.fullName,
      phone: addr.phone,
      state: addr.state,
      city: addr.city,
      address: addr.address,
      landmark: addr.landmark ?? '',
      isDefault: addr.isDefault,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing.fullName || !editing.phone || !editing.state || !editing.city || !editing.address) {
      toast.error('Please complete all required fields.')
      return
    }
    setSaving(true)
    const fd = new FormData()
    if (editing.id) fd.set('id', editing.id)
    fd.set('fullName', editing.fullName)
    fd.set('phone', editing.phone)
    fd.set('state', editing.state)
    fd.set('city', editing.city)
    fd.set('address', editing.address)
    fd.set('landmark', editing.landmark)
    fd.set('isDefault', editing.isDefault ? 'true' : 'false')
    const res = await saveAddress(fd)
    setSaving(false)
    if (!res.ok) {
      toast.error(res.error || 'Could not save address.')
      return
    }
    toast.success(editing.id ? 'Address updated' : 'Address added')
    setDialogOpen(false)
    // Optimistic update — server will revalidate the page anyway
    if (editing.id) {
      setAddresses((prev) =>
        prev
          .map((a) =>
            a.id === editing.id
              ? {
                  ...a,
                  fullName: editing.fullName,
                  phone: editing.phone,
                  state: editing.state,
                  city: editing.city,
                  address: editing.address,
                  landmark: editing.landmark || null,
                  isDefault: editing.isDefault,
                }
              : editing.isDefault ? { ...a, isDefault: false } : a,
          )
          .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
      )
    } else {
      // Just optimistically clear and let server revalidate
      setAddresses((prev) =>
        [
          ...prev.map((a) => (editing.isDefault ? { ...a, isDefault: false } : a)),
        ].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
      )
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    const res = await deleteAddress(deletingId)
    if (!res.ok) {
      toast.error(res.error || 'Could not delete address.')
      setDeletingId(null)
      return
    }
    setAddresses((prev) => prev.filter((a) => a.id !== deletingId))
    toast.success('Address removed')
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
        </p>
        <Button onClick={openAdd} size="sm">
          <Plus className="size-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="border border-border rounded-lg p-10 md:p-16 text-center bg-card">
          <MapPin className="size-10 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
          <h2 className="font-display text-2xl md:text-3xl mb-2">No saved addresses</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Save your delivery details for faster checkout. You can store multiple addresses — home, office, and more.
          </p>
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="relative border border-border rounded-lg p-5 bg-card flex flex-col"
            >
              {addr.isDefault && (
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.18em] bg-foreground text-background px-2 py-1">
                  Default
                </span>
              )}
              <div className="flex items-start gap-3 mb-3">
                <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
                <div className="min-w-0">
                  <p className="font-medium">{addr.fullName}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{addr.phone}</p>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-foreground/90 flex-1">
                <p>{addr.address}</p>
                <p>
                  {addr.city}
                  {addr.landmark ? `, ${addr.landmark}` : ''}
                </p>
                <p>{addr.state}</p>
                <p className="text-muted-foreground mt-1">Nigeria</p>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(addr)}
                  className="flex-1"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(addr.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing.id ? 'Edit Address' : 'Add Address'}
            </DialogTitle>
            <DialogDescription>
              {editing.id
                ? 'Update the delivery details for this address.'
                : 'Save a delivery address for faster checkout.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName" className="label-uppercase text-muted-foreground">
                Full Name *
              </Label>
              <Input
                id="fullName"
                value={editing.fullName}
                onChange={(e) => setEditing({ ...editing, fullName: e.target.value })}
                required
                disabled={saving}
                placeholder="Recipient full name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone" className="label-uppercase text-muted-foreground">
                Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                required
                disabled={saving}
                placeholder="+234 800 000 0000"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="state" className="label-uppercase text-muted-foreground">
                  State *
                </Label>
                <Select
                  value={editing.state}
                  onValueChange={(v) => setEditing({ ...editing, state: v })}
                  disabled={saving}
                >
                  <SelectTrigger id="state" className="w-full">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {NIGERIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="city" className="label-uppercase text-muted-foreground">
                  City *
                </Label>
                <Input
                  id="city"
                  value={editing.city}
                  onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                  required
                  disabled={saving}
                  placeholder="e.g. Ikeja"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address" className="label-uppercase text-muted-foreground">
                Street Address *
              </Label>
              <Textarea
                id="address"
                value={editing.address}
                onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                required
                disabled={saving}
                placeholder="House number, street, area"
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="landmark" className="label-uppercase text-muted-foreground">
                Landmark <span className="text-muted-foreground/60 normal-case tracking-normal">(optional)</span>
              </Label>
              <Input
                id="landmark"
                value={editing.landmark}
                onChange={(e) => setEditing({ ...editing, landmark: e.target.value })}
                disabled={saving}
                placeholder="e.g. Opposite the mall"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={editing.isDefault}
                onCheckedChange={(v) => setEditing({ ...editing, isDefault: v === true })}
                disabled={saving}
              />
              <span className="text-sm">Set as default delivery address</span>
            </label>
            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    {editing.id ? 'Save Changes' : 'Add Address'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this address?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The address will be permanently removed from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
