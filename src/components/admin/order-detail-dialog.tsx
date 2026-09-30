'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { adminUpdateOrderStatus } from '@/actions/store'
import { formatNGN, formatDate } from '@/lib/format'

export type OrderItemRow = {
  id: string
  productName: string
  productSlug: string
  productImage?: string | null
  size?: string | null
  sku?: string | null
  unitPrice: number
  quantity: number
  totalPrice: number
}

export type OrderWithDetails = {
  id: string
  orderNumber: string
  customerName: string
  email: string
  phone: string
  whatsappNumber?: string | null
  state: string
  city: string
  address: string
  deliveryInstructions?: string | null
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string
  trackingNumber?: string | null
  trackingUrl?: string | null
  notes?: string | null
  createdAt: Date | string
  items: OrderItemRow[]
  statusHistory: {
    id: string
    status: string
    note?: string | null
    createdAt: Date | string
  }[]
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'READY_FOR_DISPATCH', label: 'Ready for dispatch' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
]

export function OrderDetailDialog({
  order,
  open,
  onOpenChange,
}: {
  order: OrderWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  // Force remount of the inner content whenever the order changes so that
  // useState initialisers re-run with fresh values (avoids setState-in-effect).
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {order ? (
        <OrderDetailDialogContent
          key={order.id}
          order={order}
          onDone={() => onOpenChange(false)}
        />
      ) : (
        <DialogContent />
      )}
    </Dialog>
  )
}

function OrderDetailDialogContent({
  order,
  onDone,
}: {
  order: OrderWithDetails
  onDone: () => void
}) {
  const [status, setStatus] = useState<string>(order.status)
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? '')
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl ?? '')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const result = await adminUpdateOrderStatus(
      order.id,
      status,
      note.trim() || undefined,
      trackingNumber.trim() || undefined,
      trackingUrl.trim() || undefined,
    )
    if (!result.ok) {
      toast.error(result.error ?? 'Could not update order')
      setSaving(false)
      return
    }
    toast.success('Order updated')
    setSaving(false)
    onDone()
    // Refresh server data
    window.location.reload()
  }

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto thin-scroll">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl flex items-center gap-3">
          {order.orderNumber}
          <OrderStatusBadge status={order.status} />
        </DialogTitle>
        <DialogDescription>
          Placed {formatDate(order.createdAt)} · {order.paymentMethod}
        </DialogDescription>
      </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer */}
          <div>
            <h3 className="label-uppercase text-muted-foreground mb-2">Customer</h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-muted-foreground">{order.email}</p>
              <p className="text-muted-foreground">{order.phone}</p>
              {order.whatsappNumber && (
                <p className="text-muted-foreground">WhatsApp: {order.whatsappNumber}</p>
              )}
            </div>
          </div>

          {/* Shipping */}
          <div>
            <h3 className="label-uppercase text-muted-foreground mb-2">Shipping Address</h3>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>{order.address}</p>
              <p>
                {order.city}, {order.state}
              </p>
              {order.deliveryInstructions && (
                <p className="italic">“{order.deliveryInstructions}”</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Items */}
        <div>
          <h3 className="label-uppercase text-muted-foreground mb-3">Items</h3>
          <ul className="divide-y divide-border border border-border rounded-md">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 p-3 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.size ? `Size ${item.size} · ` : ''}
                    {item.sku ?? ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {formatNGN(item.unitPrice)}
                  </p>
                  <p className="font-medium tabular-nums">{formatNGN(item.totalPrice)}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Totals */}
          <div className="mt-3 ml-auto max-w-xs text-sm space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatNGN(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span>
                <span className="tabular-nums">−{formatNGN(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span className="tabular-nums">{formatNGN(order.deliveryFee)}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-medium text-base">
              <span>Total</span>
              <span className="tabular-nums">{formatNGN(order.total)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Update form */}
        <div>
          <h3 className="label-uppercase text-muted-foreground mb-3">Update Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
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
                placeholder="e.g. DHL-12345"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="trackingUrl">Tracking URL</Label>
              <Input
                id="trackingUrl"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://track.courier.com/..."
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="note">Internal note (optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Added to status history"
              />
            </div>
          </div>
        </div>

        {/* Status history */}
        {order.statusHistory.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="label-uppercase text-muted-foreground mb-3">Status History</h3>
              <ol className="flex flex-col gap-2">
                {order.statusHistory
                  .slice()
                  .reverse()
                  .map((h) => (
                    <li key={h.id} className="flex items-start gap-3 text-sm">
                      <span className="mt-1.5 size-1.5 rounded-full bg-foreground shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <OrderStatusBadge status={h.status} />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(h.createdAt)}
                          </span>
                        </div>
                        {h.note && <p className="text-muted-foreground mt-1">{h.note}</p>}
                      </div>
                    </li>
                  ))}
              </ol>
            </div>
          </>
        )}

        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            onClick={() => onDone()}
            type="button"
            disabled={saving}
          >
            Close
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Update
              </>
            )}
          </Button>
        </DialogFooter>
    </DialogContent>
  )
}
