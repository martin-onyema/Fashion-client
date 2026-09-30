'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Trash2, ArrowRight, Loader2 } from 'lucide-react'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { formatNGN } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function WishlistView() {
  const lines = useWishlistStore((s) => s.lines)
  const hydrated = useWishlistStore((s) => s.hydrated)
  const remove = useWishlistStore((s) => s.remove)
  const add = useCartStore((s) => s.add)
  const setCartOpen = useUIStore((s) => s.setCartOpen)
  const [moving, setMoving] = useState<string | null>(null)

  const handleMoveToBag = (line: (typeof lines)[number]) => {
    setMoving(line.productId)
    try {
      add({
        productId: line.productId,
        variantId: line.variantId,
        size: line.size,
        quantity: 1,
        name: line.name,
        slug: line.slug,
        price: line.price,
        image: line.image,
      })
      remove(line.productId)
      toast.success('Moved to bag')
      setTimeout(() => setCartOpen(true), 200)
    } catch {
      toast.error('Could not move to bag')
    } finally {
      setMoving(null)
    }
  }

  const handleRemove = (productId: string) => {
    remove(productId)
    toast.success('Removed from wishlist')
  }

  if (!hydrated) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-secondary animate-pulse rounded-md" />
        ))}
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="border border-border rounded-lg p-10 md:p-16 text-center bg-card">
        <Heart className="size-10 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
        <h2 className="font-display text-2xl md:text-3xl mb-2">Your wishlist is empty</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Save the pieces you love by tapping the heart icon on any product. They&apos;ll appear here.
        </p>
        <Button asChild>
          <Link href="/shop">
            Browse the Collection
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {lines.length} {lines.length === 1 ? 'item' : 'items'} saved
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/shop">
            Continue Shopping
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
        {lines.map((line) => {
          const price = line.price ?? 0
          const isMoving = moving === line.productId
          return (
            <article key={line.productId} className="group relative flex flex-col">
              <Link
                href={line.slug ? `/product/${line.slug}` : '/shop'}
                className="block"
              >
                <div className="relative aspect-[4/5] bg-muted overflow-hidden rounded-md">
                  {line.image ? (
                    <Image
                      src={line.image}
                      alt={line.name ?? 'Wishlist item'}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Heart className="size-6" strokeWidth={1.5} />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRemove(line.productId)
                    }}
                    className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm p-2 hover:bg-background transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </Link>

              <div className="pt-3 flex flex-col gap-2 flex-1">
                <Link
                  href={line.slug ? `/product/${line.slug}` : '/shop'}
                  className="text-sm font-medium leading-snug line-clamp-2 hover:underline underline-offset-2"
                >
                  {line.name ?? 'Product'}
                </Link>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm tabular-nums">{formatNGN(price)}</span>
                  {line.size && (
                    <span className="text-xs text-muted-foreground">Size {line.size}</span>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="mt-auto w-full"
                  onClick={() => handleMoveToBag(line)}
                  disabled={isMoving}
                >
                  {isMoving ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Moving…
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="size-3.5" />
                      Move to Bag
                    </>
                  )}
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
