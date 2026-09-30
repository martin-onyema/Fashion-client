'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { trackOrder } from '@/actions/store'
import { formatDate } from '@/lib/format'
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const STATUS_STEPS = ['PENDING', 'PAID', 'PROCESSING', 'READY_FOR_DISPATCH', 'SHIPPED', 'DELIVERED']
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Order Received',
  PAID: 'Payment Confirmed',
  PROCESSING: 'Processing',
  READY_FOR_DISPATCH: 'Ready for Dispatch',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<TrackOrderFallback />}>
      <TrackOrderContent />
    </Suspense>
  )
}

function TrackOrderFallback() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-16 md:py-24">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Order Tracking
          </p>
          <h1 className="font-display text-4xl md:text-6xl tracking-[-0.02em] mb-4">
            Track Your Order
          </h1>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </main>
      <Footer />
    </>
  )
}

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const autoSearched = useRef(false)

  const runSearch = async (num: string) => {
    if (!num.trim()) return
    setLoading(true)
    setError('')
    const result = await trackOrder(num)
    setOrder(result)
    if (!result) setError('Order not found. Please check your order number.')
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    runSearch(orderNumber)
  }

  // Auto-search from URL ?order=... — runs once on mount
  useEffect(() => {
    if (autoSearched.current) return
    const pre = searchParams.get('order')
    if (pre) {
      autoSearched.current = true
      setOrderNumber(pre)
      runSearch(pre)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1
  const isCancelled = order?.status === 'CANCELLED' || order?.status === 'REFUNDED'

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-16 md:py-24">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Order Tracking
          </p>
          <h1 className="font-display text-4xl md:text-6xl tracking-[-0.02em] mb-4">
            Track Your Order
          </h1>
          <p className="text-sm text-muted-foreground mb-10 max-w-xl leading-relaxed">
            Enter your order number to see its current status. You&apos;ll find your order number in your confirmation email or WhatsApp message.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-12">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. WC-AB123CD"
              className="flex-1 bg-transparent border border-border px-5 py-4 text-sm outline-none focus:border-foreground transition-colors uppercase tracking-wider"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
              {loading ? 'Searching…' : 'Track'}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="border border-border p-8 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Result */}
          {order && !isCancelled && (
            <div className="space-y-12">
              {/* Order header */}
              <div className="border-y border-border py-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Order Number</p>
                  <p className="font-mono text-lg mt-1">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Placed On</p>
                  <p className="text-sm mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Total</p>
                  <p className="text-sm tabular-nums mt-1">₦{order.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                  <p className="text-sm font-medium mt-1 uppercase tracking-wide">{STATUS_LABELS[order.status] ?? order.status}</p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-8">Order Journey</h2>
                <ol className="relative">
                  {STATUS_STEPS.map((step, i) => {
                    const completed = i <= currentStepIndex
                    const current = i === currentStepIndex
                    const historyEntry = order.statusHistory?.find((h: any) => h.status === step)
                    return (
                      <li key={step} className="flex gap-6 pb-10 last:pb-0 relative">
                        {i < STATUS_STEPS.length - 1 && (
                          <span className={cn(
                            'absolute left-[14px] top-7 bottom-0 w-px',
                            completed ? 'bg-foreground' : 'bg-border',
                          )} />
                        )}
                        <div className={cn(
                          'relative z-10 flex items-center justify-center h-7 w-7 rounded-full border-2 flex-shrink-0',
                          completed ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-muted-foreground',
                        )}>
                          {completed ? (
                            <CheckCircle className="h-3.5 w-3.5" strokeWidth={2} />
                          ) : i === currentStepIndex + 1 ? (
                            <Clock className="h-3 w-3" strokeWidth={2} />
                          ) : (
                            <span className="text-[10px] tabular-nums">{i + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className={cn(
                            'text-sm font-medium',
                            completed ? 'text-foreground' : 'text-muted-foreground',
                          )}>
                            {STATUS_LABELS[step]}
                          </p>
                          {historyEntry && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(historyEntry.createdAt)}
                              {historyEntry.note && ` · ${historyEntry.note}`}
                            </p>
                          )}
                          {current && step === 'SHIPPED' && order.trackingNumber && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Tracking: <span className="font-mono">{order.trackingNumber}</span>
                              {order.trackingUrl && (
                                <a href={order.trackingUrl} target="_blank" rel="noopener" className="ml-2 underline">Track shipment</a>
                              )}
                            </p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>

              {/* Items */}
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-5">Items in This Order</h2>
                <div className="space-y-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm py-3 border-b border-border/60">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.size && `Size: ${item.size} · `}
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="tabular-nums">₦{item.totalPrice.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help */}
              <div className="border border-border p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">Need help with this order?</p>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] link-underline"
                >
                  View FAQs
                </Link>
              </div>
            </div>
          )}

          {order && isCancelled && (
            <div className="border border-border p-12 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
              <h3 className="font-display text-2xl mb-2">Order {order.status === 'CANCELLED' ? 'Cancelled' : 'Refunded'}</h3>
              <p className="text-sm text-muted-foreground">
                This order was {order.status === 'CANCELLED' ? 'cancelled' : 'refunded'}.
                {order.statusHistory?.[order.statusHistory.length - 1]?.note &&
                  ` ${order.statusHistory[order.statusHistory.length - 1].note}`}
              </p>
            </div>
          )}

          {!order && !error && !loading && (
            <div className="border border-dashed border-border p-12 text-center">
              <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">
                Your tracking details will appear here.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
