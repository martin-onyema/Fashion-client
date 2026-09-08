'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  MoreHorizontal,
  Check,
  X,
  BadgeCheck,
  EyeOff,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { adminModerateReview } from '@/actions/admin'

type Review = { id: string; rating: number; productName: string }

export function ReviewsActions({ review }: { review: Review }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function act(action: 'approve' | 'reject' | 'hide' | 'verify' | 'delete') {
    setBusy(action)
    const r = await adminModerateReview(review.id, action)
    if (r.ok) {
      const labels: Record<string, string> = {
        approve: 'approved',
        reject: 'rejected',
        hide: 'hidden',
        verify: 'verified',
        delete: 'deleted',
      }
      toast.success(`Review ${labels[action]}`)
      router.refresh()
    } else {
      toast.error(r.error ?? 'Could not perform action')
    }
    setBusy(null)
  }

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="size-8 p-0">
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Moderate</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => act('approve')} disabled={busy !== null}>
            <Check className="size-3.5 mr-2" /> Approve
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => act('verify')} disabled={busy !== null}>
            <BadgeCheck className="size-3.5 mr-2" /> Mark verified
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => act('reject')} disabled={busy !== null}>
            <X className="size-3.5 mr-2" /> Reject
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => act('hide')} disabled={busy !== null}>
            <EyeOff className="size-3.5 mr-2" /> Hide
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700"
                onSelect={(e) => e.preventDefault()}
                disabled={busy !== null}
              >
                <Trash2 className="size-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete review?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the {review.rating}-star review on{' '}
                  <span className="font-medium">{review.productName}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => act('delete')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
