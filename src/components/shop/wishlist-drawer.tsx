'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useUIStore } from '@/lib/stores/ui-store'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { X, Heart, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { formatNGN } from '@/lib/format'

export function WishlistDrawer() {
  const open = useUIStore((s) => s.wishlistOpen)
  const setOpen = useUIStore((s) => s.setWishlistOpen)
  const { lines, remove } = useWishlistStore()
  const { add: addToCart } = useCartStore()

  const handleMoveToCart = (line: any) => {
    addToCart({
      productId: line.productId,
      variantId: line.variantId,
      size: line.size,
      quantity: 1,
    })
    remove(line.productId)
    toast.success('Moved to bag')
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md lg:max-w-lg p-0 flex flex-col bg-background"
      >
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="font-display text-lg tracking-wide flex items-center gap-3">
            Wishlist
            <span className="text-xs text-muted-foreground font-body tracking-normal">
              {lines.length} {lines.length === 1 ? 'item' : 'items'}
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">Wishlist</SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <Heart className="h-10 w-10 text-muted-foreground/60 mb-6" strokeWidth={1} />
            <h3 className="font-display text-2xl mb-2">No saved items yet</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs">
              Tap the heart on any product to save it here for later.
            </p>
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
            >
              Discover Products
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto thin-scroll px-6">
            {lines.map((line) => (
              <div
                key={line.productId}
                className="flex gap-4 py-5 border-b border-border/60"
              >
                <Link
                  href={`/product/${line.slug}`}
                  onClick={() => setOpen(false)}
                  className="relative w-20 h-24 flex-shrink-0 bg-muted overflow-hidden"
                >
                  {line.image && (
                    <Image
                      src={line.image}
                      alt={line.name ?? ''}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${line.slug}`}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium leading-snug hover:underline line-clamp-2"
                  >
                    {line.name}
                  </Link>
                  {line.size && (
                    <p className="text-xs text-muted-foreground mt-1">Size: {line.size}</p>
                  )}
                  <p className="text-sm mt-1.5 tabular-nums">{formatNGN(line.price)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => handleMoveToCart(line)}
                      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] hover:text-foreground text-muted-foreground transition-colors"
                    >
                      <ShoppingBag className="h-3 w-3" strokeWidth={1.5} />
                      Move to Bag
                    </button>
                    <button
                      onClick={() => remove(line.productId)}
                      className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
