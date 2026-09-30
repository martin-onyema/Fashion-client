import { verifyPayment } from '@/actions/store'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function VerifyPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const reference = typeof sp.reference === 'string' ? sp.reference : null
  const orderNumber = typeof sp.order === 'string' ? sp.order : null

  if (!reference) {
    redirect('/shop')
  }

  const result = await verifyPayment(reference)

  if (!result.ok) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="h-12 w-12 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-xl">✕</span>
          </div>
          <h1 className="font-display text-3xl mb-3">Payment verification failed</h1>
          <p className="text-sm text-muted-foreground mb-2">{result.error}</p>
          {orderNumber && (
            <p className="text-xs text-muted-foreground mb-8">
              Order reference: <span className="font-mono">{orderNumber}</span>
            </p>
          )}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  // Fetch order details for confirmation page
  const order = await db.order.findUnique({
    where: { orderNumber: result.orderNumber },
    include: { items: true },
  })

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-20">
      <div className="text-center max-w-lg">
        <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-foreground text-background flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Payment Confirmed
        </p>
        <h1 className="font-display text-4xl md:text-5xl tracking-[-0.02em] mb-4">
          Thank you for your order.
        </h1>
        <p className="text-sm text-muted-foreground mb-2">
          We&apos;ve received your payment and our team is preparing your order.
        </p>
        <p className="text-xs text-muted-foreground mb-8">
          A confirmation email is on its way to {order?.email}.
        </p>

        {order && (
          <div className="bg-secondary/40 p-6 mb-8 text-left">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Order Number</p>
                <p className="font-mono text-sm mt-1">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Total Paid</p>
                <p className="text-sm tabular-nums mt-1">₦{order.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {item.productName} {item.size && `(${item.size})`} × {item.quantity}
                  </span>
                  <span className="tabular-nums">₦{item.totalPrice.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/track-order?order=${result.orderNumber}`}
            className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 border border-foreground px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
