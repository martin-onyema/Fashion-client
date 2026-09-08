'use client'

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrderDetailDialog, type OrderWithDetails } from './order-detail-dialog'

export function OrderRowActions({ order }: { order: OrderWithDetails }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Eye className="size-4" />
        View
      </Button>
      <OrderDetailDialog order={order} open={open} onOpenChange={setOpen} />
    </>
  )
}

/**
 * Auto-opens a dialog for a specific order number on mount (used when
 * navigating from the dashboard with ?order=NUMBER).
 */
export function OrderAutoOpener({ order }: { order: OrderWithDetails }) {
  const [open, setOpen] = useState(true)
  return (
    <OrderDetailDialog order={order} open={open} onOpenChange={setOpen} />
  )
}
