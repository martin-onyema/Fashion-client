'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HUBS } from '@/lib/category-hubs'

const EASE = [0.16, 1, 0.3, 1] as const

type World = {
  name: string
  slug: string
  image: string
  description: string
  children: { name: string; slug: string }[]
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=1600&auto=format&fit=crop'

export function ShopByWorld({ worlds }: { worlds: World[] }) {
  const railRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const goToSubcategory = (slug: string) => {
    router.push(`/shop?category=${slug}`)
  }

  const scrollBy = (dir: 'left' | 'right') => {
    const el = railRef.current
    if (!el) return
    const amount = el.clientWidth * 0.7 * (dir === 'left' ? -1 : 1)
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  if (!worlds.length) return null

  return (
    <section className="bg-background pb-20 md:pb-28">
      <div className="container-editorial">
        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <p className="eyebrow text-foreground/50 mb-4">Categories</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.02] tracking-[-0.015em]">
              Shop by World
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="flex items-end gap-6"
          >
            <p className="text-sm text-foreground/55 max-w-xs leading-relaxed hidden md:block">
              Each world is a curated edit — browse the rooms of the Wardrobecare wardrobe.
            </p>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scrollBy('left')}
                className="p-2.5 border border-foreground/15 hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => scrollBy('right')}
                className="p-2.5 border border-foreground/15 hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Rail — image cards with editorial overlay */}
      <div className="pl-5 sm:pl-8 lg:pl-14">
        <div
          ref={railRef}
          className="flex gap-4 md:gap-5 overflow-x-auto hide-scroll snap-x snap-mandatory pr-5 sm:pr-8 lg:pr-14 pb-2"
        >
          {worlds.map((w, i) => (
            <motion.div
              key={w.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, delay: Math.min(i * 0.07, 0.35), ease: EASE }}
              className="snap-start flex-shrink-0 w-[72vw] sm:w-[42vw] md:w-[31vw] lg:w-[23.4vw] max-w-[420px]"
            >
              <Link
                href={HUBS[w.slug] ? `/${HUBS[w.slug].route}` : `/shop?category=${w.slug}`}
                className="group block relative aspect-[3/4] overflow-hidden bg-muted"
              >
                <Image
                  src={w.image || FALLBACK_IMAGE}
                  alt={w.name}
                  fill
                  sizes="(max-width: 640px) 72vw, (max-width: 1024px) 42vw, 24vw"
                  className="object-cover img-editorial transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                />
                {/* Monochrome scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                {/* Overlay content — bottom left, per reference */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-7 text-white">
                  <h3 className="font-display text-2xl md:text-[1.7rem] leading-tight">
                    {w.name}
                  </h3>
                  <p className="text-[11px] md:text-xs text-white/70 mt-1.5 leading-relaxed">
                    {w.description}
                  </p>

                  {/* Subcategory chips — reveal on hover */}
                  {w.children.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 overflow-hidden transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 mt-3">
                      {w.children.slice(0, 5).map((c) => (
                        <button
                          key={c.slug}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            goToSubcategory(c.slug)
                          }}
                          className="text-[9px] uppercase tracking-[0.15em] bg-white/15 backdrop-blur-sm border border-white/30 px-2.5 py-1 hover:bg-white hover:text-foreground transition-colors"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/85">
                    <span className="link-underline">Shop {w.name}</span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
