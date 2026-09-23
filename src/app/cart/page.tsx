'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, ShoppingBag, ArrowRight, Trash2, Loader2 } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart-store'
import { formatNGN, calculateDeliveryFee } from '@/lib/format'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { toast } from 'sonner'

export default function CartPage() {
  const lines = useCartStore((s) => s.lines)
  const hydrated = useCartStore((s) => s.hydrated)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)
  const [promo, setPromo] = useState('')

  const subtotal = lines.reduce((sum, l) => sum + (l.price ?? 0) * l.quantity, 0)
  const deliveryFee = calculateDeliveryFee(subtotal)
  const total = subtotal + deliveryFee
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0)

  // Loading state during the persist hydration window. Without this, on a
  // hard page load the store starts empty and the user briefly sees "Your
  // bag is empty" before localStorage is read back. Now they see a loader.
  if (!hydrated) {
    return (
      <>
        <Navbar />
        <main className="min-h-[70vh] bg-background flex items-center justify-center px-6">
          <div className="text-center">
            <Loader2 className="h-6 w-6 text-muted-foreground/60 mx-auto mb-4 animate-spin" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Loading your bag…</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (lines.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-[70vh] bg-background flex items-center justify-center px-6">
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
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-10 md:py-16">
          {/* Header */}
          <div className="mb-10">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
              Shopping Bag
            </p>
            <h1 className="font-display text-4xl md:text-5xl tracking-[-0.02em]">
              Your Bag
              <span className="ml-3 text-base font-body text-muted-foreground tracking-normal">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </h1>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-16">
            {/* Left — line items */}
            <div>
              {/* Column headers (desktop) */}
              <div className="hidden md:grid grid-cols-[1fr_140px_140px_40px] gap-4 pb-3 border-b border-border text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Product</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Subtotal</span>
                <span />
              </div>

              {lines.map((line) => (
                <div
                  key={`${line.productId}-${line.variantId ?? ''}-${line.size ?? ''}`}
                  className="grid grid-cols-[80px_1fr] md:grid-cols-[1fr_140px_140px_40px] gap-4 py-6 border-b border-border/60 items-start"
                >
                  {/* Image */}
                  <Link
                    href={`/product/${line.slug ?? ''}`}
                    className="relative w-20 h-24 md:w-24 md:h-28 bg-muted overflow-hidden col-span-1"
                  >
                    {line.image && (
                      <Image
                        src={line.image}
                        alt={line.name ?? 'Product'}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    )}
                  </Link>

                  {/* Name + meta (mobile) or Product column (desktop) */}
                  <div className="min-w-0 md:pr-4">
                    <Link
                      href={`/product/${line.slug ?? ''}`}
                      className="text-sm font-medium leading-snug hover:underline line-clamp-2"
                    >
                      {line.name ?? 'Product'}
                    </Link>
                    {line.size && (
                      <p className="text-xs text-muted-foreground mt-1">Size: {line.size}</p>
                    )}
                    {line.sku && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">SKU: {line.sku}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 md:hidden">
                      {formatNGN(line.price ?? 0)} each
                    </p>
                    {/* Mobile quantity + remove */}
                    <div className="flex items-center justify-between mt-3 md:hidden">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => setQuantity(line.productId, line.variantId, line.quantity - 1)}
                          className="p-1.5 hover:bg-muted transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-xs tabular-nums">{line.quantity}</span>
                        <button
                          onClick={() => setQuantity(line.productId, line.variantId, line.quantity + 1)}
                          className="p-1.5 hover:bg-muted transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium tabular-nums">{formatNGN((line.price ?? 0) * line.quantity)}</p>
                    </div>
                  </div>

                  {/* Desktop quantity */}
                  <div className="hidden md:flex items-center justify-center">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => setQuantity(line.productId, line.variantId, line.quantity - 1)}
                        className="p-1.5 hover:bg-muted transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 text-sm tabular-nums">{line.quantity}</span>
                      <button
                        onClick={() => setQuantity(line.productId, line.variantId, line.quantity + 1)}
                        className="p-1.5 hover:bg-muted transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop subtotal */}
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium tabular-nums">{formatNGN((line.price ?? 0) * line.quantity)}</p>
                    {line.originalPrice && (
                      <p className="text-xs text-muted-foreground line-through tabular-nums">
                        {formatNGN(line.originalPrice * line.quantity)}
                      </p>
                    )}
                  </div>

                  {/* Desktop remove */}
                  <div className="hidden md:flex justify-end">
                    <button
                      onClick={() => {
                        remove(line.productId, line.variantId)
                        toast.success('Removed from bag')
                      }}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Bag actions */}
              <div className="flex items-center justify-between mt-6">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground link-underline"
                >
                  ← Continue Shopping
                </Link>
                <button
                  onClick={() => {
                    clear()
                    toast.success('Bag cleared')
                  }}
                  className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear Bag
                </button>
              </div>
            </div>

            {/* Right — order summary */}
            <aside className="lg:sticky lg:top-32 lg:self-start">
              <div className="bg-secondary/40 p-6 md:p-8">
                <h2 className="font-display text-xl mb-5">Order Summary</h2>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({itemCount})</span>
                    <span className="tabular-nums">{formatNGN(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="tabular-nums">{deliveryFee === 0 ? 'Complimentary' : formatNGN(deliveryFee)}</span>
                  </div>
                  {subtotal < 50000 && (
                    <p className="text-[10px] text-muted-foreground pt-1">
                      Add {formatNGN(50000 - subtotal)} more for complimentary delivery.
                    </p>
                  )}
                  <div className="flex justify-between text-base font-medium pt-3 border-t border-border">
                    <span>Total</span>
                    <span className="tabular-nums">{formatNGN(total)}</span>
                  </div>
                </div>

                <div className="mt-6 flex">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Promo code"
                    aria-label="Promo code"
                    className="flex-1 min-w-0 h-11 px-3 text-sm bg-transparent border border-border border-r-0 focus:border-foreground outline-none transition-colors placeholder:text-muted-foreground/60"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const code = promo.trim()
                      if (!code) {
                        toast.error('Enter a promo code first')
                        return
                      }
                      try {
                        sessionStorage.setItem('wc_promo_code', code)
                      } catch {}
                      toast.success('Promo code saved — enter checkout to apply it')
                    }}
                    className="h-11 px-5 bg-foreground text-background text-[11px] uppercase tracking-[0.18em] hover:bg-foreground/90 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <Link
                  href="/checkout"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-foreground text-background py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <p className="text-[10px] text-muted-foreground mt-3 text-center leading-relaxed">
                  Secure checkout powered by Paystack. Server-side payment verification ensures your order is only marked paid after confirmation.
                </p>

                {/* Stylist note — cross-sell to services */}
                <div className="mt-4 border border-dashed border-foreground/40 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-foreground mb-1">
                    Buying for an event?
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Book Personal Shopping&apos;s{' '}
                    <Link href="/services/home-fitting" className="link-underline text-foreground">
                      In-Person Fitting
                    </Link>{' '}
                    and we&apos;ll make sure everything fits before it&apos;s delivered.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
