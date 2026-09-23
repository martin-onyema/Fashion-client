import Link from 'next/link'
import { db } from '@/lib/db'
import { formatNGN, whatsappLink } from '@/lib/format'
import { GiftCardCompact } from '@/components/gift-card/gc-compact'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function SuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const orderNumber = typeof sp.order === 'string' ? sp.order : null
  const method = typeof sp.method === 'string' ? sp.method : 'whatsapp'

  // Fetch order + settings (for bank transfer details and WhatsApp number)
  const [order, settings] = await Promise.all([
    orderNumber ? db.order.findUnique({ where: { orderNumber }, include: { items: true } }) : null,
    db.adminSettings.findUnique({ where: { id: 'singleton' } }),
  ])

  const whatsappNumber = settings?.whatsappNumber || '2348026133770'
  const hasBankDetails = settings?.bankName && settings?.bankAccountName && settings?.bankAccountNumber

  // Build a WhatsApp proof-of-payment message for bank transfer orders
  const bankWhatsappMsg = order
    ? `Hello Wardrobecare, I've made payment for order *${order.orderNumber}*.\n\nAmount: ${formatNGN(order.total)}\n\nPlease confirm receipt. Thank you!`
    : `Hello Wardrobecare, I'd like to confirm payment for my order.`

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-foreground text-background flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Order Received
          </p>
          <h1 className="font-display text-4xl md:text-5xl tracking-[-0.02em] mb-4">
            Thank you for your order.
          </h1>
          {method === 'whatsapp' ? (
            <p className="text-sm text-muted-foreground mb-2">
              We&apos;ve opened WhatsApp with your order details pre-filled. Our team will confirm availability and guide you through payment.
            </p>
          ) : method === 'bank' ? (
            <p className="text-sm text-muted-foreground mb-2">
              We&apos;ve received your order. Please make payment to the account below and send proof via WhatsApp for confirmation.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mb-2">
              We&apos;ve received your order and our team is preparing it for dispatch.
            </p>
          )}
          {orderNumber && (
            <p className="text-xs text-muted-foreground mb-8 mt-4">
              Order reference: <span className="font-mono">{orderNumber}</span>
            </p>
          )}
        </div>

        {/* Bank transfer details */}
        {method === 'bank' && hasBankDetails && (
          <div className="bg-secondary/40 p-6 mb-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-4 pb-3 border-b border-border">
              Payment Details
            </p>
            <div className="space-y-3">
              <BankRow label="Bank" value={settings!.bankName!} />
              <BankRow label="Account Name" value={settings!.bankAccountName!} />
              <BankRow label="Account Number" value={settings!.bankAccountNumber!} mono />
              {settings!.bankSortCode && (
                <BankRow label="Sort Code" value={settings!.bankSortCode!} mono />
              )}
            </div>
            {order && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Due</span>
                  <span className="tabular-nums font-medium">{formatNGN(order.total)}</span>
                </div>
              </div>
            )}
            {settings?.bankTransferInstructions && (
              <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                {settings.bankTransferInstructions}
              </p>
            )}
            <a
              href={whatsappLink(whatsappNumber, bankWhatsappMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-foreground text-background py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
            >
              Send Payment Proof via WhatsApp
            </a>
          </div>
        )}

        {/* Order summary (for all methods when order exists) */}
        {order && (
          <div className="bg-secondary/40 p-6 mb-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-4 pb-3 border-b border-border">
              Order Summary
            </p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {item.productName} {item.size && `(${item.size})`} × {item.quantity}
                  </span>
                  <span className="tabular-nums">{formatNGN(item.totalPrice)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm font-medium">
              <span>Total</span>
              <span className="tabular-nums">{formatNGN(order.total)}</span>
            </div>
          </div>
        )}

        {/* Gift card upsell (artifact gc-compact — order-confirmation placement) */}
        <div className="mb-6">
          <GiftCardCompact />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/track-order?order=${orderNumber ?? ''}`}
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

function BankRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className={`text-sm ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
