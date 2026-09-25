'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'

const EASE = [0.16, 1, 0.3, 1] as const

type Product = {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number | null
  images: { url: string; altText?: string | null }[]
  variants?: { size: string; stock: number }[]
  category?: { name: string } | null
}

export function NewArrivals({ products }: { products: Product[] }) {
  if (!products.length) return null

  return (
    <section className="bg-secondary/40 py-20 md:py-28">
      <div className="container-editorial">
        {/* Heading */}
        <div className="flex items-end justify-between gap-4 mb-10 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <p className="eyebrow text-foreground/50 mb-4">Just Landed</p>
            <h2 className="font-display text-4xl md:text-5xl leading-[1.02] tracking-[-0.015em]">
              New Arrivals
            </h2>
            <p className="text-sm text-foreground/55 mt-4 max-w-sm leading-relaxed">
              Pieces worth making room for.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          >
            <Link
              href="/shop?sort=newest"
              className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] link-underline whitespace-nowrap pb-1"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Grid — 4 up desktop, 2 up mobile, per reference */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-5">
          {products.slice(0, 8).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: Math.min(i * 0.06, 0.3), ease: EASE }}
            >
              <ProductCard product={p} priority={i < 2} />
            </motion.div>
          ))}
        </div>

        {/* Bottom link — mobile only */}
        <div className="mt-12 text-center lg:hidden">
          <Link
            href="/shop?sort=newest"
            className="group inline-flex items-center justify-center gap-2.5 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
          >
            Shop All New Arrivals
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
