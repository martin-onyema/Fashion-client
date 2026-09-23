'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { effectivePrice, formatNGN } from '@/lib/format'
import type { HubConfig } from '@/lib/category-hubs'
import type { HubData, HubSection } from '@/lib/queries'

/**
 * Category hub page — the dedicated landing behind each main retail nav item
 * (Clothing / Footwear / Accessories / Fragrance & Grooming). Organises the
 * category's sub-menu into its own editorial sections, each with a product
 * rail, in the site's monochrome editorial design language.
 */

const EASE = [0.16, 1, 0.3, 1] as const

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Small product thumbnail used inside an edit row. */
function RowThumb({ product }: { product: HubSection['products'][number] }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group/thumb block w-[76px] md:w-[92px] flex-shrink-0"
      title={product.name}
    >
      <div className="relative aspect-[3/4] overflow-hidden border border-border/60 bg-card">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="92px"
            className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/thumb:scale-[1.06]"
          />
        ) : null}
      </div>
      <p className="mt-1.5 text-[10px] leading-tight text-muted-foreground truncate group-hover/thumb:text-foreground transition-colors">
        {product.name}
      </p>
      <p className="text-[10px] tabular-nums text-foreground/70">
        {formatNGN(effectivePrice(product.price, product.salePrice))}
      </p>
    </Link>
  )
}

/**
 * One subcategory — a full-width editorial "edit row":
 * index + name + description on the left, product thumbnails in the
 * middle, and the count + shop-all action on the right.
 */
function EditRow({ section, index }: { section: HubSection; index: number }) {
  return (
    <Reveal>
      <section
        id={section.slug}
        className="scroll-mt-32 border-t border-foreground/10 py-8 md:py-10 group/row transition-colors hover:bg-secondary/40"
        aria-label={`${section.name} edit`}
      >
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start px-5 sm:px-0 -mx-5 sm:mx-0">
          {/* Index + name + description */}
          <div className="lg:col-span-5">
            <div className="flex items-baseline gap-4">
              <span className="text-[11px] text-foreground/35 tabular-nums flex-shrink-0">
                {String(index).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-2xl md:text-[1.7rem] leading-tight tracking-[-0.01em]">
                    <Link
                      href={`/shop?category=${section.slug}`}
                      className="link-underline"
                    >
                      {section.name}
                    </Link>
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground whitespace-nowrap">
                    {section.count} {section.count === 1 ? 'piece' : 'pieces'}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-md">
                  {section.description}
                </p>
              </div>
            </div>
          </div>

          {/* Product thumbnails */}
          <div className="lg:col-span-4">
            {section.products.length > 0 ? (
              <ul className="flex gap-3 md:gap-4">
                {section.products.slice(0, 4).map((p) => (
                  <li key={p.id} className="min-w-0">
                    <RowThumb product={p} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed border border-dashed border-foreground/20 px-4 py-3.5 max-w-xs">
                The {section.name.toLowerCase()} edit is being restocked — new
                pieces land weekly. Ask us on WhatsApp for first pick.
              </p>
            )}
          </div>

          {/* Shop-all action */}
          <div className="lg:col-span-3 lg:text-right">
            <Link
              href={`/shop?category=${section.slug}`}
              className="group/link inline-flex items-center gap-2.5 border border-foreground/25 px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-foreground hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
            >
              Shop all {section.name}
              <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </Reveal>
  )
}

export function CategoryHubContent({
  hub,
  data,
}: {
  hub: HubConfig
  data: HubData
}) {
  const sectionOffset = (() => {
    let n = 0
    const offsets: number[] = []
    for (const g of data.groups) {
      offsets.push(n)
      n += g.sections.length
    }
    return offsets
  })()

  return (
    <main className="bg-background min-h-screen">
      {/* ─── Hero — light editorial text hero ─── */}
      <section className="container-editorial pt-14 md:pt-20 pb-14 md:pb-20">
        <Reveal>
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-foreground/45">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-foreground/80">{hub.navLabel}</li>
            </ol>
          </nav>
        </Reveal>

        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <Reveal>
              <p className="eyebrow text-foreground/50 mb-5">{hub.eyebrow}</p>
              <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-[-0.02em] text-balance">
                {hub.h1}
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-7 max-w-2xl">
                {hub.heroLede}
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a
                  href="#edits"
                  className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
                >
                  Browse the Edits
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link
                  href={`/shop?category=${hub.rootSlug}`}
                  className="text-[11px] uppercase tracking-[0.18em] text-foreground link-underline px-1 py-2"
                >
                  Or shop everything in one grid →
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Stats — right rail */}
          <Reveal delay={0.2} className="lg:col-span-3 lg:col-start-10">
            <dl className="border-t border-foreground/15 divide-y divide-foreground/10">
              <div className="py-4 flex items-baseline justify-between gap-4">
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Pieces in stock
                </dt>
                <dd className="font-display text-2xl tabular-nums">{data.totalProducts}</dd>
              </div>
              <div className="py-4 flex items-baseline justify-between gap-4">
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Edits below
                </dt>
                <dd className="font-display text-2xl tabular-nums">{data.totalCategories}</dd>
              </div>
              <div className="py-4 flex items-baseline justify-between gap-4">
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Delivery
                </dt>
                <dd className="text-sm text-foreground/80">Lagos 1–24h · Nationwide</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ─── Index band — jump chips per group ─── */}
      <section id="edits" className="scroll-mt-24 border-y border-foreground/10 bg-secondary/50">
        <div className="container-editorial py-8 md:py-10 space-y-5">
          {data.groups.map((group, gi) => (
            <Reveal key={group.label} delay={gi * 0.06}>
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 md:w-32 flex-shrink-0">
                  {group.label}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {group.sections.map((s) => (
                    <li key={s.slug}>
                      <a
                        href={`#${s.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[10px] uppercase tracking-[0.14em] border border-foreground/20 text-foreground/75 hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
                      >
                        {s.name}
                        {s.count > 0 && <span className="tabular-nums opacity-60">{s.count}</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Edit rows, grouped like the mega menu ─── */}
      {data.groups.map((group, gi) => (
        <div key={group.label} className={gi > 0 ? 'border-t border-foreground/10' : ''}>
          <div className="container-editorial py-14 md:py-20">
            <Reveal className="mb-2">
              <div className="flex items-center gap-5">
                <p className="eyebrow text-foreground/50 whitespace-nowrap">
                  {String(gi + 1).padStart(2, '0')} — {group.label}
                </p>
                <div className="h-px bg-foreground/15 flex-1" />
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground whitespace-nowrap">
                  {group.sections.length} {group.sections.length === 1 ? 'edit' : 'edits'}
                </p>
              </div>
            </Reveal>
            {group.sections.map((s, si) => (
              <EditRow key={s.slug} section={s} index={sectionOffset[gi] + si + 1} />
            ))}
          </div>
        </div>
      ))}

      {/* ─── Dark services CTA band ─── */}
      <section className="bg-foreground text-background">
        <div className="container-editorial py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="text-[10px] uppercase tracking-[0.25em] text-background/60 mb-5">
                  Wardrobecare Services
                </p>
                <h2 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-[-0.015em] text-balance">
                  Prefer we do the shopping?
                </h2>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="text-sm md:text-base text-background/75 leading-relaxed mt-6 max-w-xl">
                  Our stylists source, shortlist and deliver — you approve the final pick.
                  Or book a wardrobe consultation and build a system around the pieces on
                  these shelves.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.12} className="lg:col-span-4 lg:col-start-9">
              <div className="flex flex-col gap-3">
                <Link
                  href="/services/personal-shopping"
                  className="group inline-flex items-center justify-between gap-3 bg-background text-foreground px-7 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-background/90 transition-colors"
                >
                  Book Personal Shopping
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-3 border border-background/30 px-7 py-4 text-[11px] uppercase tracking-[0.2em] text-background/85 hover:border-background/70 hover:text-background transition-colors"
                >
                  Explore All Services
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
