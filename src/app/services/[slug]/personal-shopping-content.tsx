'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ClipboardList,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ServiceEnquiryForm } from '@/components/services/service-enquiry-form'
import { effectivePrice, formatNGN } from '@/lib/format'
import type { Service } from '@/lib/services-data'

/** One product on the "live shortlist" shelf — a slim projection of a shop product. */
export type ShelfProduct = {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  category: string | null
  image: string | null
}

/**
 * Personal Shopping — bespoke landing page (service 01).
 *
 * A richer, more explanatory treatment than the shared [slug] template:
 * high-resolution editorial hero, step-by-step process detail, a live
 * shortlist preview wired to real shop products, sourcing categories,
 * guarantees, worked pricing examples, and the standard enquiry form.
 * Visual language = the site's monochrome editorial system.
 */

const EASE = [0.16, 1, 0.3, 1] as const

// ---------------------------------------------------------------------------
// Content data
// ---------------------------------------------------------------------------

const HERO_STATS = [
  { v: '48h', l: 'Standard shortlist turnaround' },
  { v: '04', l: 'Steps from brief to delivery' },
  { v: '5–10', l: 'Curated options per shortlist' },
  { v: '0%', l: 'Commission on items sourced' },
]

const PROCESS_STEPS = [
  {
    n: '01',
    icon: ClipboardList,
    title: 'The Brief',
    body: 'Tell us what you need in a short message — no forms to study, no account to set up. The occasion or use, your budget range, your sizes, and anything you already know you like. Five minutes of your time is enough for us to start working.',
    detail: 'You send: occasion, budget, sizes, colours you avoid, links or photos of pieces you like.',
  },
  {
    n: '02',
    icon: Search,
    title: 'The Sourcing',
    body: 'We take your brief to the market so you don\u2019t have to. Our stylists work it across our own shelves and a vetted network of suppliers in Lagos and Abuja — and internationally for pieces genuinely worth the wait. We filter out the poor value, the poor fabric, and the pieces that won\u2019t fit the brief.',
    detail: 'Where we look: our shelves, trusted Lagos & Abuja suppliers, vetted international sources.',
  },
  {
    n: '03',
    icon: BadgeCheck,
    title: 'The Shortlist',
    body: 'Within 48 hours (standard briefs), you receive a curated set of options — never an overwhelming feed. Each option comes with photos, the full price, fabric and fit notes, and one honest line on why we think it answers your brief. You review it over WhatsApp or email, wherever you are.',
    detail: 'You reply: keep, skip, or adjust — the shortlist is refined until it\u2019s right.',
  },
  {
    n: '04',
    icon: PackageCheck,
    title: 'Purchase & Delivery',
    body: 'Only what you approve gets bought — nothing else. We quality-check every piece against the shortlist before it leaves our hands, then deliver to your door in Lagos or ship nationwide. If a piece needs tailoring, we brief the tailor before it reaches you.',
    detail: 'You get: inspected pieces, delivered — with fit notes for anything you may want adjusted.',
  },
]

const SOURCE_CATS = [
  {
    title: 'Shirts & Polos',
    body: 'Office-grade cottons, casual linen blends, and polos that hold their collar — sourced by fabric first, brand second.',
  },
  {
    title: 'Tailoring & Blazers',
    body: 'Suit separates, blazers, and structured pieces — checked on shoulder, sleeve, and break before they reach your shortlist.',
  },
  {
    title: 'Trousers & Denim',
    body: 'Chinos, dress trousers, and denim with real wash integrity — cut for your build, not the mannequin\u2019s.',
  },
  {
    title: 'Footwear',
    body: 'Loafers, derbies, and sneakers that survive Lagos pavements — leather quality vetted before it\u2019s shortlisted.',
  },
  {
    title: 'Accessories & Fragrance',
    body: 'Belts, ties, watches, and scents that finish a look — matched to the outfits you already own.',
  },
  {
    title: 'Traditional Essentials',
    body: 'Caps, beads, and embroidered pieces for ceremonial briefs — coordinated with your tailor\u2019s timeline.',
  },
]

const GUARANTEES = [
  {
    title: 'You pay for keeps, not attempts',
    body: 'The styling fee covers the hunt. Items are only purchased after you approve them — you never pay for options you rejected.',
  },
  {
    title: 'No commissions, no markups',
    body: 'We don\u2019t take a cut on anything we source. Our incentive is that you come back — not that you overspend once.',
  },
  {
    title: 'Approved before bought',
    body: 'Nothing is purchased without your sign-off on the shortlist. What arrives is what you chose — inspected against its photos.',
  },
]

const EXAMPLE_BRIEFS = [
  {
    tag: 'Most requested',
    title: 'The Work Trip',
    body: 'Three days of meetings, one carry-on. We shortlist a rotation — shirt, trouser, and layer combinations that pack into a single bag and photograph well under hotel lighting.',
    line: 'Styling fee ₦45,000 + the pieces you keep',
  },
  {
    tag: 'Event brief',
    title: 'The Occasion Look',
    body: 'One wedding or ceremony, one look done properly. We coordinate the outfit end-to-end — garment, footwear, and accessories — so nothing fights for attention on the day.',
    line: 'Styling fee ₦45,000 + the pieces you keep',
  },
]

const EXTRA_FAQS = [
  {
    q: 'How fast will I see a shortlist?',
    a: 'Standard briefs are turned around within 48 hours. Lagos briefs needed sooner can often be turned same-day — say so in your brief and we\u2019ll confirm before starting. International sourcing takes longer and we\u2019ll quote the timeline up front.',
  },
  {
    q: 'How many options will I get?',
    a: 'Typically five to ten pieces per shortlist, depending on the brief — enough real choice to decide with confidence, few enough to actually decide. If nothing answers the brief, we\u2019ll tell you honestly and refine it rather than pad it.',
  },
  {
    q: 'What if I don\u2019t like anything on the shortlist?',
    a: 'You say so, and we refine — your feedback sharpens the next round. Because we only purchase what you approve, a missed shortlist costs you nothing beyond the styling fee, which covers the sourcing work itself.',
  },
]

const SOURCE_NOTES = [
  'Sourced from our current shelves',
  'Shortlist arrives with photos, prices & fit notes',
  'You approve before we purchase',
]

// ---------------------------------------------------------------------------
// Shared building blocks (site-native design language)
// ---------------------------------------------------------------------------

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

function Tag({
  children,
  tone = 'light',
}: {
  children: React.ReactNode
  tone?: 'light' | 'dark' | 'solid'
}) {
  const cls =
    tone === 'solid'
      ? 'border border-foreground bg-foreground text-background'
      : tone === 'dark'
        ? 'border border-white/25 text-white/75'
        : 'border border-foreground/25 text-foreground/60'
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] whitespace-nowrap ${cls}`}
    >
      {children}
    </span>
  )
}

function SectionHead({
  eyebrow,
  title,
  aside,
}: {
  eyebrow: string
  title: string
  aside?: string
}) {
  return (
    <Reveal>
      <div className="grid lg:grid-cols-12 gap-6 items-end mb-12 md:mb-16">
        <div className="lg:col-span-7">
          <p className="eyebrow text-foreground/50 mb-4">{eyebrow}</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.08] tracking-[-0.015em] text-balance">
            {title}
          </h2>
        </div>
        {aside && (
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-sm text-muted-foreground leading-relaxed">{aside}</p>
          </div>
        )}
      </div>
    </Reveal>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function PersonalShoppingContent({
  service,
  shelf,
  related,
}: {
  service: Service
  shelf: ShelfProduct[]
  related: Service[]
}) {
  const faqs = [...service.faqs, ...EXTRA_FAQS]

  return (
    <main className="bg-background min-h-screen">
      {/* ─── Hero — split editorial ─── */}
      <section className="border-b border-foreground/10 bg-background">
        <div className="container-editorial pt-10 md:pt-14 pb-12 md:pb-16">
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-10 md:mb-14">
              <ol className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-foreground/45">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-foreground/80">{service.name}</li>
              </ol>
            </nav>
          </Reveal>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-end">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="eyebrow text-foreground/50 mb-5">
                  Service {service.number} — {service.category}
                </p>
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.98] tracking-[-0.02em] text-balance">
                  {service.name}
                </h1>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-7 max-w-2xl">
                  Give us the brief — occasion, budget, taste — and we shop the market
                  for you. You review a curated shortlist, approve what you love, and
                  only ever pay for what you keep.
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <a
                    href="#brief"
                    className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
                  >
                    Start Your Brief
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/70">
                      {service.priceLabel}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{service.priceNote}</p>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.12} className="lg:col-span-5">
              <div className="relative aspect-[4/3] overflow-hidden border border-border/60 bg-card">
                <Image
                  src="/services/personal-shopping-hero.jpg"
                  alt="A curated rail of tailored jackets and shirts in warm neutral tones, ready for a personal shopping brief"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover img-editorial"
                />
              </div>
            </Reveal>
          </div>

          {/* Stats strip */}
          <div className="mt-12 md:mt-16 pt-8 border-t border-foreground/10 grid grid-cols-2 lg:grid-cols-4 gap-y-8">
            {HERO_STATS.map((s, i) => (
              <Reveal key={s.l} delay={0.1 + i * 0.06} className="pr-6">
                <p className="font-display text-3xl md:text-4xl tracking-tight tabular-nums">{s.v}</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mt-2 leading-relaxed">
                  {s.l}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── The Service — what personal shopping actually is ─── */}
      <section className="container-editorial py-20 md:py-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow text-foreground/50 mb-4">The service</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.08] tracking-[-0.015em] text-balance mb-8">
                Shopping, done as a service — not a sales floor.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="space-y-5 text-base text-muted-foreground leading-relaxed max-w-2xl">
                <p>
                  Most shopping fails before money changes hands — in the hours lost
                  wandering, the second-guessing, the pieces bought under pressure and
                  never worn. Personal Shopping removes all of it. You describe the
                  outcome you need; our stylists go to the market and do the filtering,
                  the vetting, and the comparing on your behalf.
                </p>
                <p>
                  What comes back is not a link dump. It is a shortlist — a small,
                  deliberate set of options chosen for your brief, each with honest
                  notes on fabric, fit, and price. You approve from your phone, on
                  your schedule. Nothing is bought, and nothing is charged, until you
                  say keep.
                </p>
                <p>
                  The result reads less like errands done for you and more like having
                  a buyer on your side of the table: someone whose only job is that the
                  pieces you receive are the ones worth owning.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.14}>
              <div className="grid sm:grid-cols-3 gap-6 mt-10 pt-10 border-t border-border/60">
                {[
                  { k: 'Who shops', v: 'Our in-house stylists, briefed on you' },
                  { k: 'Where', v: 'Lagos & Abuja networks, plus international sourcing' },
                  { k: 'How', v: 'WhatsApp & email — no shop visit required' },
                ].map((f) => (
                  <div key={f.k}>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/45 mb-2">
                      {f.k}
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">{f.v}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-5">
            <figure>
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                <Image
                  src="/services/personal-shopping-detail.jpg"
                  alt="A stylist comparing fabric swatches against a folded shirt, belt, and suede loafers"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-4 flex items-center gap-3">
                <span className="h-px w-8 bg-foreground/30" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Fabric vetted before it ever reaches a shortlist
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ─── Who it's for ─── */}
      <section className="bg-secondary/40 border-y border-border/60">
        <div className="container-editorial py-20 md:py-28">
          <SectionHead
            eyebrow="Who it's for"
            title="Built for the way you actually dress."
            aside="If any of these sound like you, the brief takes five minutes and the shortlist does the rest."
          />
          <div className="grid md:grid-cols-2 gap-x-16">
            {service.whoFor.map((item, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="flex items-start gap-5 py-7 border-t border-border/60">
                  <span className="font-display text-lg text-foreground/35 tabular-nums flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-base text-foreground leading-relaxed">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works — 4 detailed steps ─── */}
      <section className="container-editorial py-20 md:py-28">
        <SectionHead
          eyebrow="How it works"
          title="From five-minute brief to delivered pieces."
          aside="No account, no app, no deposit. The whole service runs over WhatsApp and email."
        />
        <div className="grid md:grid-cols-2 gap-x-16">
          {PROCESS_STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.06}>
              <article className="flex items-start gap-6 py-8 md:py-10 border-t border-border/60">
                <span className="font-display text-4xl md:text-5xl text-foreground/15 leading-none tabular-nums flex-shrink-0">
                  {step.n}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <step.icon className="size-4 text-foreground/60 flex-shrink-0" strokeWidth={1.5} />
                    <h3 className="font-display text-xl md:text-2xl tracking-tight leading-tight">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{step.body}</p>
                  <p className="text-xs text-foreground/60 leading-relaxed mt-4">{step.detail}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── The Shortlist — live preview with real products ─── */}
      <section className="bg-secondary/40 border-y border-border/60 overflow-hidden">
        <div className="container-editorial py-20 md:py-28">
          <SectionHead
            eyebrow="What you receive"
            title="Your shortlist looks like this."
            aside="Every option arrives with photos, the full price, and fit notes — reviewed on your phone, approved with one reply."
          />
          <Reveal>
            <ul className="flex flex-wrap gap-2.5 mb-10">
              {SOURCE_NOTES.map((n) => (
                <li key={n}>
                  <Tag>{n}</Tag>
                </li>
              ))}
            </ul>
          </Reveal>
          <div className="flex gap-5 md:gap-6 overflow-x-auto hide-scroll snap-x snap-mandatory pb-2 -mx-5 px-5 sm:mx-0 sm:px-0">
            {shelf.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05} className="flex-shrink-0">
                <Link
                  href={`/product/${p.slug}`}
                  className="group block w-[230px] md:w-[260px] snap-start"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-card border border-border/60">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="260px"
                        className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                      />
                    ) : null}
                    <div className="absolute top-3 left-3">
                      <Tag tone="light">Option {String(i + 1).padStart(2, '0')}</Tag>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5 truncate">
                        {p.category || 'From our shelves'}
                      </p>
                      <h3 className="font-display text-base leading-snug tracking-tight truncate">
                        {p.name}
                      </h3>
                    </div>
                    <p className="text-sm tabular-nums whitespace-nowrap flex-shrink-0">
                      {formatNGN(effectivePrice(p.price, p.salePrice))}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <p className="text-xs text-muted-foreground mt-6">
              Pieces shown are from our current shelves — a shortlist may also include
              sourced options from beyond the site.{' '}
              <Link href="/shop" className="text-foreground link-underline">
                Browse the full shop
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── What we source ─── */}
      <section className="container-editorial py-20 md:py-28">
        <SectionHead
          eyebrow="Scope"
          title="What we can source for you."
          aside="If it belongs in a considered wardrobe, it belongs in a brief — most categories of premium menswear covered."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {SOURCE_CATS.map((cat, i) => (
            <Reveal key={cat.title} delay={i * 0.05}>
              <article className="border border-border/60 bg-card p-8 h-full">
                <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/40 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-xl tracking-tight leading-tight mt-4">
                  {cat.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {cat.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Guarantee — dark band ─── */}
      <section className="bg-[#121110] text-[#f7f6f3]">
        <div className="container-editorial py-20 md:py-28">
          <Reveal>
            <p className="eyebrow text-white/50 mb-4">The terms</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.08] tracking-[-0.015em] text-balance max-w-3xl mb-14 md:mb-16">
              You only pay for what you keep. That is the whole deal.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            {GUARANTEES.map((g, i) => (
              <Reveal key={g.title} delay={i * 0.07}>
                <div className={i > 0 ? 'md:border-l md:border-white/15 md:pl-8' : ''}>
                  <span className="flex items-center justify-center size-10 border border-white/25 mb-6">
                    <ShieldCheck className="size-4.5" strokeWidth={1.5} />
                  </span>
                  <h3 className="font-display text-xl tracking-tight leading-snug">
                    {g.title}
                  </h3>
                  <p className="text-sm text-white/60 mt-3 leading-relaxed">{g.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="container-editorial py-20 md:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow text-foreground/50 mb-4">Pricing</p>
              <p className="font-display text-6xl md:text-7xl lg:text-8xl tracking-[-0.02em] leading-[0.9]">
                {service.priceLabel}
              </p>
              <p className="text-base text-muted-foreground mt-6">
                {service.priceUnit}
                {service.priceNote ? ` · ${service.priceNote}` : ''}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="space-y-5 text-sm text-muted-foreground leading-relaxed mt-10 pt-8 border-t border-border/60">
                <p>
                  The styling fee is flat per trip — it covers the briefing call, the
                  sourcing across our supplier network, the curation, and the quality
                  check before delivery. It does not change with the size of your
                  shortlist.
                </p>
                <p>
                  The cost of the pieces themselves is separate, quoted exactly on the
                  shortlist before you approve anything — and paid only for what you
                  keep. No deposit, no hidden margins, no commission on items sourced.
                </p>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 space-y-6">
            {EXAMPLE_BRIEFS.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.07}>
                <article className="border border-border/60 bg-card p-8 md:p-10">
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <Tag tone="solid">{b.tag}</Tag>
                    <Sparkles className="size-4 text-foreground/40" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-2xl tracking-tight">{b.title}</h3>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {b.body}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-foreground/60 mt-6 pt-5 border-t border-border/60">
                    {b.line}
                  </p>
                </article>
              </Reveal>
            ))}
            <Reveal delay={0.14}>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Working with a larger brief — a seasonal rebuild, wedding party, or
                corporate styling? Mention it in your enquiry and we&apos;ll quote a
                multi-trip arrangement.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Testimonial ─── */}
      <section className="bg-secondary/40 border-y border-border/60">
        <div className="container-editorial py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <Reveal>
              <p className="eyebrow text-foreground/50 mb-8">
                From a Wardrobecare client
              </p>
              <blockquote className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-[-0.01em] text-balance">
                &ldquo;{service.testimonial?.quote}&rdquo;
              </blockquote>
              <div className="mt-10 flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-foreground/30" />
                <div className="text-left">
                  <p className="text-sm text-foreground">{service.testimonial?.author}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {service.testimonial?.role}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="container-editorial py-20 md:py-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow text-foreground/50 mb-4">Frequently asked</p>
              <h2 className="font-display text-3xl md:text-4xl leading-[1.08] tracking-[-0.015em]">
                Questions,
                <br />
                answered.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-6">
                Anything else — ask it directly in your brief. A stylist replies, not
                a bot.
              </p>
            </Reveal>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-b border-border/60"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-display tracking-tight py-6 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-6">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ─── Brief CTA + enquiry form ─── */}
      <section id="brief" className="bg-secondary/40 border-t border-border/60 scroll-mt-20">
        <div className="container-editorial py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <p className="eyebrow text-foreground/50 mb-4">Start here</p>
                <h2 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-[-0.015em] text-balance">
                  Send us your brief — we&apos;ll do the shopping.
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed mt-8 max-w-md">
                  Tell us what you need, when you need it, and the budget you&apos;re
                  working with. We&apos;ll come back with a shortlist within 48 hours.
                </p>
                <ul className="mt-10 space-y-4 text-sm text-muted-foreground">
                  {[
                    'Response within 24 hours.',
                    'No deposit required to enquire.',
                    'Lagos, Abuja, and nationwide delivery.',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground" />
                      <p>{line}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <Reveal delay={0.1} className="lg:col-span-7 lg:col-start-6">
              <div className="bg-background p-8 md:p-12 border border-border/60">
                <ServiceEnquiryForm serviceSlug={service.slug} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Related services ─── */}
      {related.length > 0 && (
        <section className="container-editorial py-20 md:py-28">
          <div className="flex items-end justify-between gap-6 mb-10 md:mb-12">
            <Reveal>
              <p className="eyebrow text-foreground/50 mb-3">Explore more</p>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight">
                Related services.
              </h2>
            </Reveal>
            <Link
              href="/services"
              className="group hidden sm:inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground link-underline flex-shrink-0"
            >
              All services
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {related.map((rel, i) => (
              <Reveal key={rel.slug} delay={i * 0.06}>
                <Link href={`/services/${rel.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={rel.image}
                      alt={rel.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="font-display text-lg text-background mix-blend-difference">
                        {rel.number}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      {rel.category}
                    </p>
                    <h3 className="font-display text-xl tracking-tight leading-tight">
                      {rel.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2">
                      {rel.comingSoon ? 'Coming Soon' : rel.priceLabel}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

