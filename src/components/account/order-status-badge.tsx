import { Badge } from '@/components/ui/badge'

type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'READY_FOR_DISPATCH'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-900 border-amber-200',
  PAID: 'bg-secondary text-foreground border-border',
  PROCESSING: 'bg-stone-200 text-stone-800 border-stone-300',
  READY_FOR_DISPATCH: 'bg-orange-100 text-orange-900 border-orange-200',
  SHIPPED: 'bg-teal-100 text-teal-900 border-teal-200',
  DELIVERED: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-900 border-red-200',
  REFUNDED: 'bg-red-100 text-red-900 border-red-200',
}

export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  const s = (status as OrderStatus) ?? 'PENDING'
  return (
    <Badge variant="outline" className={`capitalize ${STATUS_STYLES[s] ?? STATUS_STYLES.PENDING}`}>
      {s.replace(/_/g, ' ').toLowerCase()}
    </Badge>
  )
}
