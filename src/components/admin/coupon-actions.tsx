'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { adminDeleteCoupon } from '@/actions/admin'

type Coupon = { id: string; code: string }

export function CouponActions({ coupon }: { coupon: Coupon }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    setBusy(true)
    const r = await adminDeleteCoupon(coupon.id)
    if (r.ok) {
      toast.success('Coupon deleted')
      router.refresh()
    } else {
      toast.error(r.error ?? 'Could not delete')
    }
    setBusy(false)
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild variant="ghost" size="sm" className="size-8 p-0">
        <Link href={`/admin/coupons/${coupon.id}`}>
          <Pencil className="size-3.5" />
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="size-8 p-0 text-red-600 hover:text-red-700">
            <Trash2 className="size-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete coupon <span className="font-mono font-medium">{coupon.code}</span>.
              Past orders that used this coupon will keep their discount snapshots.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={busy}
            >
              {busy ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
