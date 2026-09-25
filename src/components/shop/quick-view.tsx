'use client'

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useUIStore } from '@/lib/stores/ui-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { useState, useEffect, useRef } from 'react'
import { formatNGN, effectivePrice, whatsappLink } from '@/lib/format'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Heart, ShoppingBag, MessageCircle } from 'lucide-react'

export function QuickViewDrawer() {
  const productId = useUIStore((s) => s.quickViewProductId)
  const setQuickView = useUIStore((s) => s.setQuickView)
  const open = !!productId

  return (
    <Sheet open={open} onOpenChange={(v) => !v && setQuickView(null)}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-3xl p-0 flex flex-col bg-background overflow-y-auto"
      >
        <SheetTitle className="sr-only">Product quick view</SheetTitle>
        {productId && (
          <QuickViewContent key={productId} productId={productId} onClose={() => setQuickView(null)} />
        )}
      </SheetContent>
    </Sheet>
  )
}

function QuickViewContent({ productId, onClose }: { productId: string; onClose: () => void }) {
  const { add: addToCart } = useCartStore()
  const { toggle: toggleWishlist, has: hasWishlist } = useWishlistStore()
  const [product, setProduct] = useState<any>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  // Use SWR-like effect with cleanup
  useFetchProduct(productId, (p) => {
    setProduct(p)
    setSelectedSize(p?.variants?.[0]?.size ?? null)
    setQuantity(1)
    setLoading(false)
  })

  const selectedVariant = product?.variants?.find((v: any) => v.size === selectedSize)
  const price = effectivePrice(product?.price, product?.salePrice)
  const inWishlist = product ? hasWishlist(product.id) : false

  const handleAddToCart = () => {
    if (!product) return
    if (product.variants.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }
    const isOnSale = product.salePrice && product.salePrice < product.price
    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id,
      size: selectedSize,
      quantity,
      name: product.name,
      slug: product.slug,
      price,
      originalPrice: isOnSale ? product.price : undefined,
      image: product.images?.[0]?.url,
      sku: selectedVariant?.sku ?? product.sku,
    })
    toast.success('Added to bag')
    onClose()
    setTimeout(() => useUIStore.getState().setCartOpen(true), 200)
  }

  const handleWhatsApp = async () => {
    if (!product) return
    const settings = await fetch('/api/settings').then((r) => r.json())
    const phone = settings?.whatsappNumber || '2348000000000'
    const msg = `Hello Wardrobecare, I'd like to order:\n\n*${product.name}*\nSize: ${selectedSize ?? 'N/A'}\nQuantity: ${quantity}\nPrice: ${formatNGN(price * quantity)}\n\nPlease confirm availability.`
    window.open(whatsappLink(phone, msg), '_blank')
  }

  if (loading || !product) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-sm text-muted-foreground">Loading…</div>
      </div>
    )
  }

  return (
    <>
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[4/5] md:aspect-auto bg-muted">
          {product.images[0]?.url && (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="p-6 md:p-8 flex flex-col">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
            {product.category?.name}
          </p>
          <h2 className="font-display text-2xl md:text-3xl leading-tight mb-3">
            {product.name}
          </h2>
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-lg tabular-nums">{formatNGN(price)}</span>
            {product.salePrice && (
              <span className="text-sm text-muted-foreground line-through tabular-nums">
                {formatNGN(product.price)}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-4">
            {product.description}
          </p>

          {product.variants.length > 0 && (
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                Size {selectedSize && <span className="text-foreground ml-2">— {selectedSize}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedSize(v.size)}
                    disabled={v.stock <= 0}
                    className={`min-w-[3rem] px-3 py-2 text-xs border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      selectedSize === v.size
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Quantity</p>
            <div className="inline-flex items-center border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-muted transition-colors"
              >−</button>
              <span className="px-4 text-sm tabular-nums">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-muted transition-colors"
              >+</button>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              Add to Bag
            </button>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/product/${product.slug}`}
                className="text-center py-3.5 border border-foreground text-[11px] uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors"
              >
                View Details
              </Link>
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 py-3.5 border border-border text-[11px] uppercase tracking-[0.2em] hover:border-foreground transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                WhatsApp
              </button>
            </div>
            <button
              onClick={() =>
                toggleWishlist({
                  productId: product.id,
                  variantId: selectedVariant?.id,
                  size: selectedSize,
                  name: product.name,
                  slug: product.slug,
                  price,
                  image: product.images[0]?.url,
                })
              }
              className="w-full flex items-center justify-center gap-2 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Heart className={`h-3.5 w-3.5 ${inWishlist ? 'fill-current' : ''}`} strokeWidth={1.5} />
              {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Tiny effect wrapper that fetches a product by ID and calls a callback.
 */
function useFetchProduct(productId: string, onLoaded: (p: any) => void) {
  const latestCb = useRef(onLoaded)
  useEffect(() => {
    latestCb.current = onLoaded
  })
  useEffect(() => {
    let cancelled = false
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((p) => {
        if (!cancelled) latestCb.current(p)
      })
      .catch(() => {
        if (!cancelled) latestCb.current(null)
      })
    return () => { cancelled = true }
  }, [productId])
}
