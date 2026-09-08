'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ArrowRight, MessageCircle, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/stores/cart-store'
import { formatNGN, calculateDeliveryFee, NIGERIAN_STATES, whatsappLink } from '@/lib/format'
import { createOrder } from '@/actions/store'
import { toast } from 'sonner'

const DEFAULT_WHATSAPP = '2348026133770'

export default function CheckoutPage() {
  const router = useRouter()
  const lines = useCartStore((s) => s.lines)
  const hydrated = useCartStore((s) => s.hydrated)
  const clear = useCartStore((s) => s.clear)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'PAYSTACK' | 'WHATSAPP' | 'BANK_TRANSFER'>('BANK_TRANSFER')
  const [storeSettings, setStoreSettings] = useState<{ whatsappNumber?: string; paystackEnabled: boolean } | null>(null)
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    state: 'Lagos',
    city: '',
    address: '',
    deliveryInstructions: '',
    couponCode: '',
  })

  // Load store settings: WhatsApp number + whether Paystack is really configured.
  const paystackLive = Boolean(storeSettings?.paystackEnabled)
  useEffect(() => {
    let cancelled = false
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (cancelled || !s) return
        setStoreSettings(s)
        if (s.paystackEnabled) setPaymentMethod('PAYSTACK')
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Render directly from the store — the add() call now carries full display
  // data, so no async fetch is needed to show the order summary. The actual
  // prices are re-verified server-side inside createOrder() before any order
  // is committed.
  const subtotal = lines.reduce((sum, l) => sum + (l.price ?? 0) * l.quantity, 0)
  const deliveryFee = calculateDeliveryFee(subtotal)
  const total = subtotal + deliveryFee
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lines.length) {
      toast.error('Your bag is empty')
      return
    }
    setSubmitting(true)
    try {
      const result = await createOrder({
        ...form,
        lines: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId ?? null,
          size: l.size ?? null,
          quantity: l.quantity,
        })),
        paymentMethod,
      })
      if (!result.ok) {
        toast.error(result.error)
        setSubmitting(false)
        return
      }

      if (paymentMethod === 'WHATSAPP') {
        // Compose WhatsApp message
        const phone = storeSettings?.whatsappNumber || DEFAULT_WHATSAPP
        const msg = `Hello Wardrobecare, I'd like to place order *${result.orderNumber}*:\n\n${lines.map((l) => `• ${l.name ?? 'Product'} (${l.size}) × ${l.quantity} — ${formatNGN((l.price ?? 0) * l.quantity)}`).join('\n')}\n\nSubtotal: ${formatNGN(subtotal)}\nDelivery: ${deliveryFee === 0 ? 'Complimentary' : formatNGN(deliveryFee)}\nTotal: ${formatNGN(total)}\n\nName: ${form.customerName}\nPhone: ${form.phone}\nAddress: ${form.address}, ${form.city}, ${form.state}`
        window.open(whatsappLink(phone, msg), '_blank')
        clear()
        router.push(`/checkout/success?order=${result.orderNumber}&method=whatsapp`)
        return
      }

      if (paymentMethod === 'PAYSTACK' && result.authorizationUrl) {
        // Clear cart and redirect to Paystack
        clear()
        if (typeof window !== 'undefined') {
          window.location.assign(result.authorizationUrl)
        }
        return
      }

      // Bank transfer — show success with manual instructions
      clear()
      router.push(`/checkout/success?order=${result.orderNumber}&method=bank`)
    } catch (e: any) {
      toast.error(e?.message ?? 'Checkout failed')
      setSubmitting(false)
    }
  }

  // Loading state during the persist hydration window. Without this, on a
  // hard page load the store starts empty and the user briefly sees "Your
  // bag is empty" before localStorage is read back. Now they see a loader.
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="h-6 w-6 text-muted-foreground/60 mx-auto mb-4 animate-spin" strokeWidth={1.5} />
          <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Loading checkout…</p>
        </div>
      </div>
    )
  }

  if (!lines.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mx-auto mb-6" strokeWidth={1} />
          <h1 className="font-display text-4xl mb-3">Your bag is empty</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Discover pieces worth making room for.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
          >
            Shop Collection
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-base tracking-[0.18em] uppercase">
            Wardrobecare
          </Link>
          <Link href="/shop" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground link-underline">
            Continue Shopping
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10 md:py-16">
        <h1 className="font-display text-4xl md:text-5xl tracking-[-0.02em] mb-10">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-16">
          {/* Left — customer info */}
          <div className="space-y-10">
            {/* Contact */}
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-5 pb-2 border-b border-border">
                01 · Contact Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" required>
                  <input
                    required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="checkout-input"
                    placeholder="John Doe"
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="checkout-input"
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Phone" required>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="checkout-input"
                    placeholder="0803 000 0000"
                  />
                </Field>
                <Field label="WhatsApp Number">
                  <input
                    value={form.whatsappNumber}
                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                    className="checkout-input"
                    placeholder="Same as phone"
                  />
                </Field>
              </div>
            </section>

            {/* Delivery */}
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-5 pb-2 border-b border-border">
                02 · Delivery Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="State" required>
                  <select
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="checkout-input"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="City" required>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="checkout-input"
                    placeholder="Ikeja"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Address" required>
                    <input
                      required
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="checkout-input"
                      placeholder="House number, street name"
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Delivery Instructions (optional)">
                    <textarea
                      value={form.deliveryInstructions}
                      onChange={(e) => setForm({ ...form, deliveryInstructions: e.target.value })}
                      className="checkout-input min-h-[80px] resize-y"
                      placeholder="Landmark, gate code, preferred delivery time…"
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-5 pb-2 border-b border-border">
                03 · Payment Method
              </h2>
              <div className="space-y-3">
                {paystackLive && (
                  <PaymentOption
                    value="PAYSTACK"
                    selected={paymentMethod === 'PAYSTACK'}
                    onSelect={setPaymentMethod}
                    title="Pay Online (Paystack)"
                    desc="Cards, bank transfer, USSD. Secured by Paystack."
                  />
                )}
                <PaymentOption
                  value="WHATSAPP"
                  selected={paymentMethod === 'WHATSAPP'}
                  onSelect={setPaymentMethod}
                  title="Order via WhatsApp"
                  desc="Personal shopping experience. Pay after confirmation."
                />
                <PaymentOption
                  value="BANK_TRANSFER"
                  selected={paymentMethod === 'BANK_TRANSFER'}
                  onSelect={setPaymentMethod}
                  title="Bank Transfer"
                  desc="Manual bank transfer. Order held until payment confirmed."
                />
              </div>
            </section>
          </div>

          {/* Right — order summary */}
          <aside className="lg:sticky lg:top-10 lg:self-start">
            <div className="bg-secondary/40 p-6 md:p-8">
              <h2 className="font-display text-xl mb-5">Order Summary</h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto thin-scroll -mx-2 px-2">
                {lines.map((line) => (
                  <div key={`${line.productId}-${line.variantId ?? ''}-${line.size ?? ''}`} className="flex gap-3">
                    <div className="relative w-16 h-20 bg-muted flex-shrink-0 overflow-hidden">
                      {line.image && (
                        <Image src={line.image} alt={line.name ?? 'Product'} fill sizes="64px" className="object-cover" />
                      )}
                      <div className="absolute -top-2 -right-2 bg-foreground text-background text-[9px] font-medium rounded-full h-5 w-5 flex items-center justify-center">
                        {line.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-snug line-clamp-2">{line.name ?? 'Product'}</p>
                      {line.size && <p className="text-[10px] text-muted-foreground mt-0.5">Size: {line.size}</p>}
                      <p className="text-xs tabular-nums mt-1">{formatNGN((line.price ?? 0) * line.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border mt-5 pt-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({itemCount})</span>
                  <span className="tabular-nums">{formatNGN(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="tabular-nums">{deliveryFee === 0 ? 'Complimentary' : formatNGN(deliveryFee)}</span>
                </div>
                {subtotal < 50000 && (
                  <p className="text-[10px] text-muted-foreground">
                    Add {formatNGN(50000 - subtotal)} more for complimentary delivery.
                  </p>
                )}
                <div className="flex justify-between text-base font-medium pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="tabular-nums">{formatNGN(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 py-4 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  'Processing…'
                ) : paymentMethod === 'PAYSTACK' ? (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    Pay {formatNGN(total)}
                  </>
                ) : paymentMethod === 'WHATSAPP' ? (
                  <>
                    <MessageCircle className="h-3.5 w-3.5" />
                    Place Order
                  </>
                ) : (
                  'Place Order'
                )}
              </button>

              <p className="text-[10px] text-muted-foreground mt-3 text-center leading-relaxed">
                By placing this order you agree to our Terms & Privacy Policy. Server-side payment verification ensures your order is only marked paid after confirmation.
              </p>
            </div>
          </aside>
        </form>
      </div>

      <style jsx global>{`
        .checkout-input {
          width: 100%;
          background: transparent;
          border: 0;
          border-bottom: 1px solid var(--border);
          padding: 0.75rem 0;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .checkout-input:focus {
          border-bottom-color: var(--foreground);
        }
        .checkout-input::placeholder { color: var(--muted-foreground); opacity: 0.6; }
      `}</style>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground block mb-1">
        {label} {required && <span className="text-foreground">*</span>}
      </span>
      {children}
    </label>
  )
}

function PaymentOption({
  value,
  selected,
  onSelect,
  title,
  desc,
}: {
  value: 'PAYSTACK' | 'WHATSAPP' | 'BANK_TRANSFER'
  selected: boolean
  onSelect: (v: 'PAYSTACK' | 'WHATSAPP' | 'BANK_TRANSFER') => void
  title: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-full text-left p-4 border transition-colors ${
        selected ? 'border-foreground bg-secondary/40' : 'border-border hover:border-foreground/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 h-3 w-3 rounded-full border-2 flex-shrink-0 ${
          selected ? 'border-foreground bg-foreground' : 'border-muted-foreground'
        }`} />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
    </button>
  )
}
