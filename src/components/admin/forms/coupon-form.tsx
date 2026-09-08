'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Save, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from '@/actions/admin'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type Coupon = {
  id: string
  code: string
  description: string | null
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING'
  value: number
  minOrder: number | null
  maxDiscount: number | null
  usageLimit: number | null
  perCustomerLimit: number | null
  active: boolean
  startsAt: Date | string | null
  endsAt: Date | string | null
  freeShipping: boolean
}

function toDateInput(d: Date | string | null): string {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  // Local-time input value: YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

export function CouponForm({ coupon }: { coupon?: Coupon | null }) {
  const router = useRouter()
  const [saving, startSave] = useTransition()
  const [deleting, startDelete] = useTransition()
  const isEdit = !!coupon

  const [code, setCode] = useState(coupon?.code ?? '')
  const [description, setDescription] = useState(coupon?.description ?? '')
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING'>(
    coupon?.type ?? 'PERCENTAGE',
  )
  const [value, setValue] = useState<number>(coupon?.value ?? 0)
  const [minOrder, setMinOrder] = useState<string>(
    coupon?.minOrder != null ? String(coupon.minOrder) : '',
  )
  const [maxDiscount, setMaxDiscount] = useState<string>(
    coupon?.maxDiscount != null ? String(coupon.maxDiscount) : '',
  )
  const [usageLimit, setUsageLimit] = useState<string>(
    coupon?.usageLimit != null ? String(coupon.usageLimit) : '',
  )
  const [perCustomerLimit, setPerCustomerLimit] = useState<string>(
    coupon?.perCustomerLimit != null ? String(coupon.perCustomerLimit) : '',
  )
  const [active, setActive] = useState(coupon?.active ?? true)
  const [startsAt, setStartsAt] = useState(toDateInput(coupon?.startsAt ?? null))
  const [endsAt, setEndsAt] = useState(toDateInput(coupon?.endsAt ?? null))
  const [freeShipping, setFreeShipping] = useState(
    coupon?.freeShipping ?? coupon?.type === 'FREE_SHIPPING' ?? false,
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startSave(async () => {
      const payload = {
        code: code.toUpperCase(),
        description: description || undefined,
        type,
        value: Number(value),
        minOrder: minOrder ? Number(minOrder) : undefined,
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
        perCustomerLimit: perCustomerLimit ? parseInt(perCustomerLimit, 10) : undefined,
        active,
        startsAt: startsAt || null,
        endsAt: endsAt || null,
        freeShipping,
      }
      const r = isEdit
        ? await adminUpdateCoupon(coupon!.id, payload)
        : await adminCreateCoupon(payload)
      if (r.ok) {
        toast.success(isEdit ? 'Coupon updated' : 'Coupon created')
        router.push('/admin/coupons')
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not save')
      }
    })
  }

  function handleDelete() {
    startDelete(async () => {
      const r = await adminDeleteCoupon(coupon!.id)
      if (r.ok) {
        toast.success('Coupon deleted')
        router.push('/admin/coupons')
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not delete')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Basics</CardTitle>
            <CardDescription>Code, type, value, description.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                placeholder="SUMMER25"
                className="font-mono uppercase"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Internal note about this coupon"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed amount</SelectItem>
                    <SelectItem value="FREE_SHIPPING">Free shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="value">Value {type === 'PERCENTAGE' ? '(%)' : '(NGN)'}</Label>
                <Input
                  id="value"
                  type="number"
                  min={0}
                  step={type === 'PERCENTAGE' ? 1 : 100}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Limits</CardTitle>
            <CardDescription>Restrict usage and order totals.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="minOrder">Min order (NGN)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  min={0}
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="maxDiscount">Max discount (NGN)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  min={0}
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder="No cap"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="usageLimit">Total usage limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min={1}
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="No limit"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="perCustomerLimit">Per-customer limit</Label>
                <Input
                  id="perCustomerLimit"
                  type="number"
                  min={1}
                  value={perCustomerLimit}
                  onChange={(e) => setPerCustomerLimit(e.target.value)}
                  placeholder="No limit"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Schedule</CardTitle>
            <CardDescription>Optional start/end window.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startsAt">Starts at</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endsAt">Ends at</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Visibility</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Active</Label>
                <p className="text-xs text-muted-foreground">Inactive coupons can't be redeemed.</p>
              </div>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="freeShipping">Free shipping flag</Label>
                <p className="text-xs text-muted-foreground">Grants free shipping on top of discount.</p>
              </div>
              <Switch id="freeShipping" checked={freeShipping} onCheckedChange={setFreeShipping} />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isEdit ? 'Save changes' : 'Create coupon'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/coupons">Cancel</Link>
          </Button>
        </div>

        {isEdit && (
          <Card className="border-red-200">
            <CardHeader className="border-b border-red-100">
              <CardTitle className="font-display text-lg text-red-700">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-700 border-red-200 hover:bg-red-50">
                    <Trash className="size-4" />
                    Delete coupon
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this coupon?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete coupon{' '}
                      <span className="font-mono font-medium">{coupon!.code}</span>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deleting ? 'Deleting…' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </form>
  )
}
