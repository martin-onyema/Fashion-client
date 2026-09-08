'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useUIStore } from '@/lib/stores/ui-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatNGN, calculateDeliveryFee } from '@/lib/format'
import Image from 'next/image'

export function CartDrawer() {
  const open = useUIStore((s) => s.cartOpen)
  const setOpen = useUIStore((s) => s.setCartOpen)
  const lines = useCartStore((s) => s.lines)
  const hydrated = useCartStore((s) => s.hydrated)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)

  const subtotal = lines.reduce((sum, l) => sum + (l.price ?? 0) * l.quantity, 0)
  const deliveryFee = calculateDeliveryFee(subtotal)
  const total = subtotal + deliveryFee
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0)

  // Loading state — shown briefly while persist reads from localStorage.
  // This is what stops the user from seeing "Your bag is empty" right after
  // they added an item, which was the bug they were hitting.
  const showLoading = !hydrated

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md lg:max-w-lg p-0 flex flex-col bg-background"
      >
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="font-display text-lg tracking-wide flex items-center gap-3">
            Your Bag
            <span className="text-xs text-muted-foreground font-body tracking-normal">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">Shopping cart</SheetDescription>
        </SheetHeader>

        {showLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <Loader2 className="h-6 w-6 text-muted-foreground/60 mb-4 animate-spin" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Loading your bag…</p>
          </div>
        ) : lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/60 mb-6" strokeWidth={1} />
            <h3 className="font-display text-2xl mb-2">Your bag is empty</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs">
              Discover pieces worth making room for.
            </p>
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
            >
              Shop Collection
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto thin-scroll px-6">
              {lines.map((line) => (
                <div
                  key={`${line.productId}-${line.variantId ?? ''}-${line.size ?? ''}`}
                  className="flex gap-4 py-5 border-b border-border/60"
                >
                  <Link
                    href={`/product/${line.slug ?? ''}`}
                    onClick={() => setOpen(false)}
                    className="relative w-20 h-24 flex-shrink-0 bg-muted overflow-hidden"
                  >
                    {line.image && (
                      <Image
                        src={line.image}
                        alt={line.name ?? 'Product'}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${line.slug ?? ''}`}
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium leading-snug hover:underline line-clamp-2"
                    >
                      {line.name ?? 'Product'}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {line.size && <span>Size: {line.size}</span>}
                      {line.sku && <span className="ml-2">SKU: {line.sku}</span>}
                    </p>
                    <div className="flex items-center justify-between mt-3">
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
                      <div className="text-right">
                        <p className="text-sm font-medium tabular-nums">{formatNGN((line.price ?? 0) * line.quantity)}</p>
                        {line.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through tabular-nums">
                            {formatNGN(line.originalPrice * line.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(line.productId, line.variantId)}
                      className="mt-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={clear}
                className="mt-5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear bag
              </button>
            </div>

            <div className="border-t border-border px-6 py-5 bg-background">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatNGN(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="tabular-nums">{deliveryFee === 0 ? 'Complimentary' : formatNGN(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-base font-medium pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="tabular-nums">{formatNGN(total)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {subtotal < 50000
                  ? `Add ${formatNGN(50000 - subtotal)} more for complimentary delivery.`
                  : 'You qualify for complimentary delivery.'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/shop"
                  onClick={() => setOpen(false)}
                  className="text-center py-3 text-[11px] uppercase tracking-[0.18em] border border-foreground hover:bg-foreground hover:text-background transition-colors"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="text-center py-3 text-[11px] uppercase tracking-[0.18em] bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  Checkout
                </Link>
              </div>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="mt-3 block text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground link-underline"
              >
                View Full Bag
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
