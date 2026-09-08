'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Heart, Eye, ShoppingBag } from 'lucide-react'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { formatNGN, effectivePrice, sortSizes } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const MAX_VISIBLE_SIZES = 5

type CardVariant = {
  id?: string
  size: string | null
  price?: number | null
  stock: number
}

type ProductCardProps = {
  product: {
    id: string
    name: string
    slug: string
    price: number
    salePrice?: number | null
    images: { url: string; altText?: string | null }[]
    variants?: CardVariant[]
    category?: { name: string } | null
  }
  className?: string
  priority?: boolean
  showQuickAdd?: boolean
}

export function ProductCard({ product, className, priority, showQuickAdd = true }: ProductCardProps) {
  const { toggle: toggleWishlist, has: hasWishlist } = useWishlistStore()
  const { add: addToCart } = useCartStore()
  const setQuickView = useUIStore((s) => s.setQuickView)
  const setCartOpen = useUIStore((s) => s.setCartOpen)

  const [activeSize, setActiveSize] = useState<string | null>(null)
  const [showAllSizes, setShowAllSizes] = useState(false)

  const basePrice = effectivePrice(product.price, product.salePrice)
  const inWishlist = hasWishlist(product.id)
  const image = product.images[0]?.url
  const hoverImage = product.images[1]?.url

  // Size chips — only for products that actually have size variants.
  const sizeOptions = sortSizes((product.variants ?? []).map((v) => v.size))
    .map((size) => {
      const variants = (product.variants ?? []).filter((v) => v.size === size)
      const inStock = variants.some((v) => v.stock > 0)
      const priced = variants.find((v) => v.price != null && v.price > 0)
      return { size, inStock, price: priced?.price ?? null, variant: variants.find((v) => v.stock > 0) ?? variants[0] }
    })
  const hasSizes = sizeOptions.length > 0
  const visibleSizes = showAllSizes ? sizeOptions : sizeOptions.slice(0, MAX_VISIBLE_SIZES)
  const hiddenSizeCount = sizeOptions.length - MAX_VISIBLE_SIZES

  const selected = sizeOptions.find((s) => s.size === activeSize && s.inStock)
  const displayPrice = selected?.price ?? basePrice
  const inStock = !product.variants?.length || product.variants.some((v) => v.stock > 0)

  const handleSizeClick = (e: React.MouseEvent, size: string) => {
    e.preventDefault()
    e.stopPropagation()
    const option = sizeOptions.find((s) => s.size === size)
    if (!option) return
    if (!option.inStock) {
      toast.error(`Size ${size} is sold out`)
      return
    }
    setActiveSize((cur) => (cur === size ? null : size))
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock) {
      toast.error('Out of stock')
      return
    }
    const chosen = selected ?? sizeOptions.find((s) => s.inStock)
    addToCart({
      productId: product.id,
      variantId: chosen?.variant?.id,
      size: chosen?.size ?? undefined,
      quantity: 1,
      name: product.name,
      slug: product.slug,
      price: chosen?.price ?? basePrice,
      originalPrice: product.salePrice && product.salePrice < product.price ? product.price : undefined,
      image,
    })
    toast.success(chosen?.size ? `Added to bag · Size ${chosen.size}` : 'Added to bag')
    setCartOpen(true)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: basePrice,
      image,
    })
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setQuickView(product.id)
  }

  return (
    <article className={cn('group relative', className)}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] bg-muted overflow-hidden">
          {image && (
            <Image
              src={image}
              alt={product.images[0]?.altText ?? product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              priority={priority}
              className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
            />
          )}
          {hoverImage && (
            <Image
              src={hoverImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}

          {/* Sale badge */}
          {product.salePrice && product.salePrice < product.price && (
            <span className="absolute top-3 left-3 bg-foreground text-background text-[9px] uppercase tracking-[0.15em] px-2 py-1">
              Sale
            </span>
          )}
          {!inStock && (
            <span className="absolute top-3 left-3 bg-muted text-foreground text-[9px] uppercase tracking-[0.15em] px-2 py-1">
              Sold Out
            </span>
          )}

          {/* Hover actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleWishlist}
              className="bg-background/90 backdrop-blur-sm p-2 hover:bg-background transition-colors"
              aria-label="Toggle wishlist"
            >
              <Heart
                className={cn('h-3.5 w-3.5', inWishlist && 'fill-current')}
                strokeWidth={1.5}
              />
            </button>
            <button
              onClick={handleQuickView}
              className="bg-background/90 backdrop-blur-sm p-2 hover:bg-background transition-colors"
              aria-label="Quick view"
            >
              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Quick add (desktop) */}
          {showQuickAdd && inStock && (
            <button
              onClick={handleQuickAdd}
              className="absolute bottom-0 left-0 right-0 bg-foreground text-background py-3 text-[10px] uppercase tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} />
              Quick Add
            </button>
          )}
        </div>

        <div className="pt-3 pb-1">
          {product.category && (
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              {product.category.name}
            </p>
          )}
          <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:underline underline-offset-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-sm tabular-nums">{formatNGN(displayPrice)}</span>
            {selected?.price != null && selected.price !== basePrice && (
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                {formatNGN(basePrice)}
              </span>
            )}
          </div>

          {/* Size chips — see prices per size before opening the product */}
          {hasSizes && (
            <div className="flex flex-wrap gap-1 mt-2">
              {visibleSizes.map((s) => (
                <button
                  key={s.size}
                  onClick={(e) => handleSizeClick(e, s.size)}
                  aria-pressed={activeSize === s.size}
                  aria-label={`Size ${s.size}${s.inStock ? ` — ${formatNGN(s.price ?? basePrice)}` : ' — sold out'}`}
                  className={cn(
                    'text-[10px] leading-none px-1.5 py-1 border transition-colors tabular-nums',
                    s.inStock
                      ? 'border-border text-foreground/80 hover:border-foreground hover:text-foreground cursor-pointer'
                      : 'border-border/60 text-muted-foreground/50 line-through cursor-not-allowed',
                    activeSize === s.size && s.inStock && 'border-foreground bg-foreground text-background hover:text-background',
                  )}
                >
                  {s.size}
                </button>
              ))}
              {hiddenSizeCount > 0 && !showAllSizes && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowAllSizes(true)
                  }}
                  aria-label={`Show ${hiddenSizeCount} more sizes`}
                  className="text-[10px] leading-none px-1.5 py-1 border border-transparent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  +{hiddenSizeCount}
                </button>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}
