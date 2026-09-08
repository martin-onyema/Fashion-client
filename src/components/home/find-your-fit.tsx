'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

const FIT_CATEGORIES = [
  { name: 'Shirts', slug: 'shirts', desc: 'Formal, casual, Oxford, linen' },
  { name: 'Polos', slug: 'polos', desc: 'Piqué, structured, essential' },
  { name: 'Trousers', slug: 'trousers', desc: 'Chinos, formal, tailored' },
  { name: 'Jeans', slug: 'jeans', desc: 'Slim, straight, stretch' },
  { name: 'Shoes', slug: 'footwear', desc: 'Loafers, dress, sneakers' },
  { name: 'Accessories', slug: 'accessories', desc: 'Belts, ties, sunglasses' },
  { name: 'Fragrance', slug: 'fragrance-grooming', desc: 'EDP, oud, grooming' },
]

export function FindYourFit() {
  return (
    <section className="py-20 md:py-32 bg-foreground text-background">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left intro */}
          <div className="lg:col-span-4">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[11px] uppercase tracking-[0.25em] text-background/60 mb-3"
            >
              04 · Discovery
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1] tracking-[-0.02em]"
            >
              Find<br />Your Fit
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-sm text-background/70 mt-6 max-w-xs leading-relaxed"
            >
              Tell us what you&apos;re looking for. We&apos;ll take you to the right room of the wardrobe.
            </motion.p>
          </div>

          {/* Right — list */}
          <div className="lg:col-span-8">
            <ul>
              {FIT_CATEGORIES.map((c, i) => (
                <motion.li
                  key={c.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className="group flex items-center justify-between py-6 md:py-8 border-b border-background/15 hover:border-background/40 transition-colors"
                  >
                    <div className="flex items-baseline gap-6 md:gap-10">
                      <span className="text-[11px] tabular-nums text-background/40">
                        0{i + 1}
                      </span>
                      <div>
                        <h3 className="font-display text-2xl md:text-4xl lg:text-5xl leading-tight group-hover:translate-x-2 transition-transform duration-500">
                          {c.name}
                        </h3>
                        <p className="text-xs text-background/50 mt-1">{c.desc}</p>
                      </div>
                    </div>
                    <ArrowUpRight
                      className="h-6 w-6 md:h-8 md:w-8 text-background/60 group-hover:text-background group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300"
                      strokeWidth={1}
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
