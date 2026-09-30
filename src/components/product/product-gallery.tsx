'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'

export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; altText?: string | null }[]
  name: string
}) {
  const [active, setActive] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length)
  const next = () => setActive((i) => (i + 1) % images.length)

  if (!images.length) {
    return <div className="aspect-[4/5] bg-muted" />
  }

  return (
    <>
      <div className="grid lg:grid-cols-[80px_1fr] gap-4">
        {/* Thumbnails (desktop vertical, mobile horizontal) */}
        <div className="order-2 lg:order-1 flex lg:flex-col gap-3 overflow-x-auto hide-scroll">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'relative w-16 h-20 lg:w-full lg:h-24 flex-shrink-0 overflow-hidden bg-muted border transition-colors',
                active === i ? 'border-foreground' : 'border-transparent hover:border-border',
              )}
            >
              <Image
                src={img.url}
                alt={img.altText ?? name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div className="order-1 lg:order-2 relative aspect-[4/5] bg-muted overflow-hidden group">
          <Image
            src={images[active].url}
            alt={images[active].altText ?? name}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
            className="object-cover"
          />
          <button
            onClick={() => setZoomOpen(true)}
            className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            aria-label="Zoom image"
          >
            <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* Mobile prev/next */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={next}
                className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 text-xs text-background bg-foreground/60 backdrop-blur-sm px-2.5 py-1 tabular-nums">
              {active + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Zoom modal */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4"
          onClick={() => setZoomOpen(false)}
        >
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute top-6 right-6 p-2 hover:bg-muted transition-colors"
            aria-label="Close zoom"
          >
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>
          <div className="relative w-full max-w-4xl aspect-[4/5]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[active].url}
              alt={images[active].altText ?? name}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 hover:bg-muted transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 hover:bg-muted transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
