'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { adminAdjustInventory } from '@/actions/admin'

type Variant = {
  id: string
  stock: number
  lowStockThreshold: number
  size: string | null
  sku?: string | null
  product: { name: string; slug?: string }
}

const REASONS = [
  { value: 'restock', label: 'Restock' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'theft', label: 'Theft / Loss' },
  { value: 'correction', label: 'Correction' },
  { value: 'return', label: 'Customer return' },
  { value: 'donation', label: 'Donation' },
]

export function AdjustStockDialog({ variant }: { variant: Variant }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, startSave] = useTransition()

  const [newQty, setNewQty] = useState(variant.stock)
  const [reason, setReason] = useState('restock')
  const [note, setNote] = useState('')
  const [reference, setReference] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startSave(async () => {
      const r = await adminAdjustInventory({
        variantId: variant.id,
        newQty,
        reason,
        note: note || undefined,
        reference: reference || undefined,
      })
      if (r.ok) {
        toast.success(
          `Stock adjusted (${variant.stock} → ${newQty}, ${newQty - variant.stock >= 0 ? '+' : ''}${newQty - variant.stock})`,
        )
        setOpen(false)
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not adjust')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="size-4" />
          Adjust
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            {variant.product.name}
            {variant.size ? ` · size ${variant.size}` : ''}
            {variant.sku ? ` · ${variant.sku}` : ''}
            <br />
            Current stock: <span className="font-medium">{variant.stock}</span>
            {variant.stock <= 0 ? (
              <span className="text-red-600"> (out of stock)</span>
            ) : variant.stock <= variant.lowStockThreshold ? (
              <span className="text-amber-600"> (low)</span>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="newQty">New quantity</Label>
            <Input
              id="newQty"
              type="number"
              min={0}
              value={newQty}
              onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Difference: {newQty - variant.stock >= 0 ? '+' : ''}
              {newQty - variant.stock}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reference">Reference (optional)</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Order number, PO, etc."
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Additional context"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save adjustment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
