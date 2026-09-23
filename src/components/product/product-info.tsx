'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ShoppingBag, Heart, MessageCircle, Truck, RotateCcw, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNGN, effectivePrice, whatsappLink } from '@/lib/format'
import { useCartStore } from '@/lib/stores/cart-store'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { toast } from 'sonner'
import Link from 'next/link'

type Variant = {
  id: string
  size: string | null
  color: string | null
  price: number | null
  stock: number
  sku: string | null
}

type ProductInfoProps = {
  product: {
    id: string
    name: string
    slug: string
    price: number
    salePrice: number | null
    description: string
    features: string | null
    material: string | null
    fit: string | null
    care: string | null
    sku: string
    category: { name: string; slug: string; parent?: { name: string; slug: string } | null }
    variants: Variant[]
    images: { url: string }[]
  }
  settings: { whatsappNumber?: string | null } | null
}

export function ProductInfo({ product, settings }: ProductInfoProps) {
  const router = useRouter()
  // Compute initial size from product on first render — no effect needed
  const [selectedSize, setSelectedSize] = useState<string | null>(() => {
    if (product.variants.length > 0) {
      const firstAvailable = product.variants.find((v) => v.stock > 0)
      return firstAvailable?.size ?? product.variants[0]?.size ?? null
    }
    return null
  })
  const [quantity, setQuantity] = useState(1)
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  const addToCart = useCartStore((s) => s.add)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const hasWishlist = useWishlistStore((s) => s.has)
  const setCartOpen = useUIStore((s) => s.setCartOpen)

  const selectedVariant = product.variants.find((v) => v.size === selectedSize)
  const price = effectivePrice(product.price, product.salePrice)
  const isOnSale = product.salePrice && product.salePrice < product.price
  const inStock = !product.variants.length || product.variants.some((v) => v.stock > 0)
  const selectedInStock = selectedVariant ? selectedVariant.stock > 0 : inStock
  const maxQuantity = selectedVariant?.stock ?? 99
  const inWishlist = hasWishlist(product.id)

  const handleAddToCart = () => {
    if (product.variants.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }
    if (!selectedInStock) {
      toast.error('Selected size is out of stock')
      return
    }
    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id,
      size: selectedSize,
      quantity,
      name: product.name,
      slug: product.slug,
      price,
      originalPrice: isOnSale ? product.price : undefined,
      image: product.images[0]?.url,
      sku: selectedVariant?.sku ?? product.sku,
    })
    toast.success('Added to bag')
    setCartOpen(true)
  }

  const handleBuyNow = () => {
    if (product.variants.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }
    if (!selectedInStock) {
      toast.error('Selected size is out of stock')
      return
    }
    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id,
      size: selectedSize,
      quantity,
      name: product.name,
      slug: product.slug,
      price,
      originalPrice: isOnSale ? product.price : undefined,
      image: product.images[0]?.url,
      sku: selectedVariant?.sku ?? product.sku,
    })
    // Defer navigation one tick so the persist middleware commits the new cart
    // to localStorage BEFORE the route change. With router.push there is no
    // full reload, so the in-memory cart state is preserved as well.
    setTimeout(() => {
      router.push('/checkout')
    }, 50)
  }

  const handleWhatsApp = () => {
    const phone = settings?.whatsappNumber || '2348000000000'
    const msg = `Hello Wardrobecare, I'd like to order:\n\n*${product.name}*\nSize: ${selectedSize ?? 'N/A'}\nQuantity: ${quantity}\nPrice: ${formatNGN(price * quantity)}\nSKU: ${selectedVariant?.sku ?? product.sku}\n\nPlease confirm availability.`
    window.open(whatsappLink(phone, msg), '_blank')
  }

  const handleWishlist = () => {
    toggleWishlist({
      productId: product.id,
      variantId: selectedVariant?.id,
      size: selectedSize,
      name: product.name,
      slug: product.slug,
      price,
      image: product.images[0]?.url,
    })
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <div className="lg:sticky lg:top-32 lg:self-start space-y-6">
      {/* Breadcrumb */}
      <nav className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        <span className="mx-2">/</span>
        {product.category.parent && (
          <>
            <Link href={`/shop?category=${product.category.parent.slug}`} className="hover:text-foreground">
              {product.category.parent.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
      </nav>

      {/* Title + price */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-[-0.02em]">
          {product.name}
        </h1>
        <div className="flex items-baseline gap-3 mt-4">
          <span className="text-xl tabular-nums">{formatNGN(price)}</span>
          {isOnSale && (
            <>
              <span className="text-base text-muted-foreground line-through tabular-nums">
                {formatNGN(product.price)}
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] bg-foreground text-background px-2 py-0.5">
                Save {Math.round((1 - (product.salePrice! / product.price)) * 100)}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {product.description}
      </p>

      {/* Status */}
      <div className="flex items-center gap-3 text-xs">
        <span className={cn(
          'inline-flex items-center gap-1.5',
          inStock ? 'text-foreground' : 'text-muted-foreground',
        )}>
          <span className={cn(
            'h-1.5 w-1.5 rounded-full',
            inStock ? 'bg-green-600' : 'bg-muted-foreground',
          )} />
          {inStock ? 'In Stock' : 'Sold Out'}
        </span>
        <span className="text-muted-foreground">SKU: {selectedVariant?.sku ?? product.sku}</span>
      </div>

      {/* Sizes */}
      {product.variants.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Size {selectedSize && <span className="text-foreground ml-1">— {selectedSize}</span>}
            </p>
            <button
              onClick={() => setShowSizeGuide(!showSizeGuide)}
              className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedSize(v.size)}
                disabled={v.stock <= 0}
                className={cn(
                  'min-w-[3rem] px-4 py-2.5 text-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:line-through',
                  selectedSize === v.size
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border hover:border-foreground',
                )}
              >
                {v.size}
              </button>
            ))}
          </div>
          {showSizeGuide && (
            <div className="mt-4 p-4 bg-secondary/60 border border-border text-xs space-y-2">
              <p className="font-medium uppercase tracking-[0.15em] text-[10px]">Size Guide</p>
              <p className="text-muted-foreground">Chest (inches): S — 36–38, M — 38–40, L — 40–42, XL — 42–44, XXL — 44–46</p>
              <p className="text-muted-foreground">Waist (inches): 30 — 30, 32 — 32, 34 — 34, 36 — 36, 38 — 38, 40 — 40</p>
              <p className="text-muted-foreground">Shoes (EU): True to size. If between sizes, size up.</p>
              <p className="pt-2 border-t border-border/60">
                <a
                  href="/measurement-guide"
                  className="inline-flex items-center gap-1.5 text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
                >
                  Not sure how to measure yourself? See the full measurement guide
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quantity */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Quantity</p>
        <div className="inline-flex items-center border border-border">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2.5 hover:bg-muted transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="px-6 text-sm tabular-nums">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            className="px-4 py-2.5 hover:bg-muted transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
          <p className="text-xs text-amber-700 mt-2">Only {selectedVariant.stock} left in this size.</p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="w-full py-4 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
          Add to Bag
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleBuyNow}
            disabled={!inStock}
            className="py-3.5 border border-foreground text-[11px] uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Buy Now
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 py-3.5 border border-border text-[11px] uppercase tracking-[0.2em] hover:border-foreground transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
            WhatsApp
          </button>
        </div>
        <button
          onClick={handleWishlist}
          className="w-full flex items-center justify-center gap-2 py-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Heart className={cn('h-3.5 w-3.5', inWishlist && 'fill-current')} strokeWidth={1.5} />
          {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </button>
      </div>

      {/* Stylist note — cross-sell to services */}
      <div className="bg-secondary/40 border border-border/60 p-5">
        <p className="text-sm leading-relaxed">
          <span className="font-medium text-foreground">
            Not sure of your size or what pairs well with this?
          </span>{' '}
          <Link
            href="/services/style-wardrobe-consultation"
            className="link-underline text-foreground"
          >
            Book a Wardrobe &amp; Style Consultation
          </Link>{' '}
          and we&apos;ll help you decide — or{' '}
          <Link
            href="/services/personal-shopping"
            className="link-underline text-foreground"
          >
            add it to a Personal Shopping brief
          </Link>
          .
        </p>
      </div>

      {/* Reassurance */}
      <div className="pt-6 border-t border-border space-y-3 text-xs text-muted-foreground">
        <div className="flex items-start gap-3">
          <Truck className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-foreground">Nationwide Delivery</p>
            <p>Lagos from 1 hour to 24 hours · Other states 1–3 working days. Complimentary over ₦50,000.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <RotateCcw className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-foreground">48-Hour Exchanges</p>
            <p>Exchanges only — no cash refunds. Wrong size or item: 48 hours from delivery.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-foreground">Secure Payment</p>
            <p>Verified by Paystack. Server-side payment verification.</p>
          </div>
        </div>
      </div>

      {/* Details accordion */}
      <div className="pt-6 border-t border-border space-y-4">
        {product.features && (
          <DetailRow label="Features" value={product.features} />
        )}
        {product.material && (
          <DetailRow label="Material" value={product.material} />
        )}
        {product.fit && (
          <DetailRow label="Fit" value={product.fit} />
        )}
        {product.care && (
          <DetailRow label="Care" value={product.care} />
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border/60 pb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-[11px] uppercase tracking-[0.18em] text-foreground">{label}</span>
        <Plus className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-45')} strokeWidth={1.5} />
      </button>
      {open && (
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{value}</p>
      )}
    </div>
  )
}
