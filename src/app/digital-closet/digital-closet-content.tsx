'use client'

import { Fragment } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  Camera,
  Check,
  Lock,
  Palette,
  Scissors,
  Shuffle,
} from 'lucide-react'
import { NotifyForm } from './notify-form'

/**
 * Digital Closet & Capsule Wardrobe — page content.
 *
 * Content structure ported 1:1 from the approved artifact; the visual design
 * is the site's own monochrome editorial system (Playfair display headings,
 * Inter body, warm-white/black palette, bordered cards, uppercase micro
 * labels, dark #121110 bands) so the page reads as native Wardrobecare.
 */

const EASE = [0.16, 1, 0.3, 1] as const

// ---------------------------------------------------------------------------
// Content data — ported verbatim from the approved design artifact
// ---------------------------------------------------------------------------

const HOW_STEPS = [
  {
    n: '01',
    title: 'Start Free',
    body: "7 days, no cost, whether you've had a Consultation or just found this page.",
  },
  {
    n: '02',
    title: 'Look Around',
    body: "See a sample closet below so you know what it looks like before adding anything.",
  },
  {
    n: '03',
    title: 'Go Annual to Add Your Own',
    body: 'Subscribing unlocks adding your real pieces and building your own combinations.',
  },
  {
    n: '04',
    title: 'Send Photos, We Clean Them Up',
    body: 'Snap what you own — we turn it into a proper catalog photo. Details below.',
  },
]

const WALKTHROUGH_STEPS = [
  {
    n: '01',
    title: 'Sort by Category',
    body: 'List what you own — shirts/tops, trousers, footwear, and so on.',
  },
  {
    n: '02',
    title: 'Tag Colour & Occasion',
    body: "A quick tag for each piece — what it is, and when you'd wear it.",
  },
  {
    n: '03',
    title: 'We Find Combinations',
    body: "Your capsule wardrobe builds itself from what you've added.",
  },
]

const PHOTO_STAGES = [
  {
    icon: Camera,
    title: 'You Snap It',
    body: 'Guided frame overlay in-app: plain background, natural light, item laid flat or worn.',
  },
  {
    icon: Scissors,
    title: 'Background Removed',
    body: 'Automated background removal isolates the item, same as our product photography.',
  },
  {
    icon: Palette,
    title: 'Colour & Light Corrected',
    body: 'Automatic correction so colour reads true, matching site-standard product shots.',
  },
  {
    icon: Check,
    title: 'Staff Spot-Check',
    body: "A quick human review before it's saved — catches anything the automation missed.",
  },
]

const OUTFITS = [
  { num: 'Outfit 1', occasion: 'Office', pieces: 'Navy blazer, white shirt, grey trouser' },
  { num: 'Outfit 2', occasion: 'Church', pieces: 'Cream kaftan, brown loafers' },
  { num: 'Outfit 3', occasion: 'Friday Casual', pieces: 'Olive overshirt, dark denim' },
  { num: 'Outfit 4', occasion: 'Date Night', pieces: 'Black polo, tailored chino' },
  { num: 'Outfit 5', occasion: 'Wedding Guest', pieces: 'Senator, brown accessories' },
]

const WARDROBE_CATS = [
  { name: 'Shirts/Tops', swatches: ['#ffffff', '#1B1917', '#A8823D'], count: '3 pieces' },
  { name: 'Trousers', swatches: ['#6B7A6E', '#1B1917'], count: '2 pieces' },
  { name: 'Footwear', swatches: ['#8C3B2E', '#1B1917'], count: '2 pairs' },
  { name: 'Traditional Wear', swatches: ['#F7F3EA'], count: '1 piece' },
]

const GAPS = [
  { item: 'A tan or brown blazer', why: 'Nothing bridges Outfit 3 (casual) and Outfit 1 (office)' },
  { item: 'A plain white t-shirt, fitted', why: "Layers under Outfit 3's overshirt" },
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
  tag,
  aside,
}: {
  eyebrow: string
  title: string
  tag?: string
  aside?: string
}) {
  return (
    <Reveal>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-foreground/50 mb-4">{eyebrow}</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.08] tracking-[-0.015em] text-balance flex items-center gap-3 flex-wrap">
            {title}
            {tag && <Tag>{tag}</Tag>}
          </h2>
        </div>
        {aside && (
          <span className="hidden sm:block text-[10px] uppercase tracking-[0.14em] text-foreground/45 whitespace-nowrap pb-1.5">
            {aside}
          </span>
        )}
      </div>
    </Reveal>
  )
}

// ---------------------------------------------------------------------------

export function DigitalClosetContent() {
  return (
    <div className="bg-background text-foreground">
      {/* ── Hero ── */}
      <section className="container-editorial pt-14 pb-14 md:pt-24 md:pb-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-end">
          <Reveal className="lg:col-span-7">
            <Tag>Coming Soon</Tag>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-[-0.015em] text-balance mt-6">
              Digital Closet &amp; Capsule Wardrobe
            </h1>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-5">
            <p className="text-sm md:text-[15px] text-foreground/60 leading-relaxed max-w-md lg:ml-auto">
              The closet comes first — a place to hold and organize what you own. The capsule
              wardrobe is what forms once it&apos;s built up. One subscription, tied to your
              Wardrobe &amp; Style Consultation or started fresh on your own.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-border">
        <div className="container-editorial py-14 md:py-20">
          <SectionHead eyebrow="How It Works" title="New Here? Here's How It Works" />
          <div className="mt-10 md:mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-10 gap-y-10">
            {HOW_STEPS.map((s, i) => (
              <Reveal key={s.n} delay={Math.min(i * 0.08, 0.3)}>
                <div className="border-t border-foreground/20 pt-5">
                  <div className="text-[11px] tabular-nums text-foreground/40">{s.n}</div>
                  <h3 className="font-display text-lg md:text-xl leading-snug mt-3">{s.title}</h3>
                  <p className="text-[13px] text-foreground/55 leading-relaxed mt-2">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Path note ── */}
      <div className="bg-secondary">
        <div className="container-editorial py-6">
          <Reveal>
            <p className="text-[13px] text-foreground/65 leading-relaxed max-w-3xl">
              <strong className="text-foreground font-medium">
                Didn&apos;t come through a Consultation?
              </strong>{' '}
              You don&apos;t need one to start — whether you found this while shopping the site or
              came across it directly, the path in is the same either way.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ── Trial banner (dark band) ── */}
      <section className="bg-[#121110] text-[#f7f6f3]">
        <div className="container-editorial py-12 md:py-16 flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12">
          <Reveal>
            <h2 className="font-display text-2xl md:text-4xl leading-tight tracking-[-0.01em]">
              Start free for 7 days.
            </h2>
            <p className="text-[13px] md:text-sm text-white/60 leading-relaxed mt-3 max-w-xl">
              Explore the closet at no cost. Adding your own pieces and reshuffling combinations
              both require the Annual plan — see why below.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href="#waitlist"
              className="group inline-flex items-center justify-center gap-2.5 bg-[#f7f6f3] text-[#121110] px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-white transition-colors whitespace-nowrap w-full md:w-auto"
            >
              Join the Waitlist
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── Locked — trial state ── */}
      <section className="border-t border-border">
        <div className="container-editorial py-14 md:py-20">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              <div>
                <p className="eyebrow text-foreground/50 mb-4">Trial Experience</p>
                <h2 className="font-display text-3xl md:text-4xl leading-tight tracking-[-0.01em]">
                  Add Your Existing Pieces
                </h2>
              </div>
              <Tag>
                <Lock className="h-3 w-3" strokeWidth={1.5} />
                Locked — Trial
              </Tag>
            </div>
            <p className="text-sm text-foreground/55 leading-relaxed mt-4 max-w-2xl">
              During your free trial, you can look around — building your own capsule wardrobe
              from your existing clothes unlocks once you subscribe annually.
            </p>
          </Reveal>
          <div className="mt-10 md:mt-14 grid md:grid-cols-3 gap-x-8 md:gap-x-10 gap-y-10 opacity-45">
            {WALKTHROUGH_STEPS.map((s) => (
              <div key={s.n} className="border-t border-foreground/20 pt-5">
                <div className="text-[11px] tabular-nums text-foreground/40">{s.n}</div>
                <h3 className="font-display text-lg md:text-xl leading-snug mt-3">{s.title}</h3>
                <p className="text-[13px] text-foreground/55 leading-relaxed mt-2">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Unlocked — annual subscriber state ── */}
      <section className="bg-secondary/50 border-t border-border">
        <div className="container-editorial py-14 md:py-20">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              <div>
                <p className="eyebrow text-foreground/50 mb-4">Annual Experience</p>
                <h2 className="font-display text-3xl md:text-4xl leading-tight tracking-[-0.01em]">
                  Add Your Existing Pieces
                </h2>
              </div>
              <Tag tone="solid">
                <Check className="h-3 w-3" strokeWidth={2} />
                Unlocked — Annual Subscriber
              </Tag>
            </div>
            <p className="text-sm text-foreground/55 leading-relaxed mt-4 max-w-2xl">
              Once you&apos;re on the Annual plan, the walkthrough above becomes fully usable —
              add as many pieces as you own, any time.
            </p>
          </Reveal>
          <div className="mt-10 md:mt-14 grid md:grid-cols-3 gap-x-8 md:gap-x-10 gap-y-10">
            {WALKTHROUGH_STEPS.map((s) => (
              <div key={s.n} className="border-t border-foreground/20 pt-5">
                <div className="text-[11px] tabular-nums text-foreground/40">{s.n}</div>
                <h3 className="font-display text-lg md:text-xl leading-snug mt-3">{s.title}</h3>
                <p className="text-[13px] text-foreground/55 leading-relaxed mt-2">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Photo pipeline ── */}
      <section className="border-t border-border">
        <div className="container-editorial py-14 md:py-20">
          <SectionHead eyebrow="The Pipeline" title="From Your Photo to a Product Photo" />
          <Reveal delay={0.1}>
            <p className="text-sm text-foreground/55 leading-relaxed mt-4 max-w-2xl">
              You send a normal phone photo of something you own. Here&apos;s what happens to it
              before it appears in your closet.
            </p>
          </Reveal>
          <div className="mt-10 md:mt-14 flex flex-col lg:flex-row lg:items-stretch gap-2 lg:gap-0">
            {PHOTO_STAGES.map((stage, i) => {
              const Icon = stage.icon
              return (
                <Fragment key={stage.title}>
                  {i > 0 && (
                    <div
                      className="flex justify-center lg:items-center py-1 lg:py-0 lg:px-5"
                      aria-hidden
                    >
                      <ArrowRight
                        className="hidden lg:block h-4 w-4 text-foreground/35"
                        strokeWidth={1.5}
                      />
                      <ArrowDown
                        className="lg:hidden h-4 w-4 text-foreground/35"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                  <Reveal delay={Math.min(i * 0.08, 0.3)} className="flex-1">
                    <div className="border border-border bg-card p-6 h-full">
                      <div className="flex items-center justify-between">
                        <Icon className="h-5 w-5 text-foreground/70" strokeWidth={1.5} />
                        <span className="text-[11px] tabular-nums text-foreground/35">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="font-display text-lg leading-snug mt-5">{stage.title}</h3>
                      <p className="text-[13px] text-foreground/55 leading-relaxed mt-2">
                        {stage.body}
                      </p>
                    </div>
                  </Reveal>
                </Fragment>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Sample outfits ── */}
      <section className="border-t border-border">
        <div className="container-editorial py-14 md:py-20">
          <SectionHead
            eyebrow="Sample Closet"
            title="Your Outfits"
            tag="Example"
            aside="7 combinations"
          />
          <Reveal delay={0.1}>
            <p className="text-sm text-foreground/55 leading-relaxed mt-4 max-w-2xl">
              This is a sample closet, so you can see what yours will look like — numbered exactly
              as they&apos;d be during your consultation, the same numbers you&apos;d find on your
              wardrobe rail.
            </p>
          </Reveal>
          <div className="mt-10 md:mt-12 flex gap-4 md:gap-5 overflow-x-auto hide-scroll pb-2 -mx-5 px-5 sm:mx-0 sm:px-0">
            {OUTFITS.map((o, i) => (
              <Reveal
                key={o.num}
                delay={Math.min(i * 0.06, 0.3)}
                className="flex-none w-[220px] sm:w-[240px]"
              >
                <div className="border border-border bg-card h-full">
                  <div className="relative h-[150px] bg-secondary flex items-center justify-center">
                    <span className="absolute top-3 left-3 bg-background border border-border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground/70">
                      {o.num}
                    </span>
                    <span className="font-display text-4xl text-foreground/20 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-foreground/50">
                      {o.occasion}
                    </div>
                    <div className="text-[13px] text-foreground/70 leading-relaxed mt-1.5">
                      {o.pieces}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Discover — annual only ── */}
      <section className="border-t border-border">
        <div className="container-editorial py-14 md:py-20">
          <SectionHead
            eyebrow="Annual Feature"
            title="Discover New Combinations"
            tag="Example"
            aside="outfit matching guide"
          />
          <Reveal delay={0.1}>
            <p className="text-sm text-foreground/55 leading-relaxed mt-4 max-w-2xl">
              New pairings from pieces you already own, with the styling logic explained.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 relative border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
              <span className="absolute top-4 right-4 md:top-6 md:right-6">
                <Tag tone="solid">
                  <Lock className="h-3 w-3" strokeWidth={1.5} />
                  Annual Only
                </Tag>
              </span>
              <div className="w-full md:w-[130px] h-[100px] flex-none bg-secondary" />
              <div className="flex-1 opacity-40 md:pr-32">
                <div className="text-[10px] uppercase tracking-[0.14em] text-foreground/60">
                  Neutral Anchor + One Accent
                </div>
                <div className="font-display text-lg md:text-xl mt-1.5">
                  White shirt, black trouser, black shoe
                </div>
                <div className="text-[13px] text-foreground/55 leading-relaxed mt-1.5">
                  A safe, reliable pairing — neutrals always work together, no colour-matching
                  risk.
                </div>
              </div>
              <button
                disabled
                className="inline-flex items-center justify-center gap-2 border border-foreground/25 px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] text-foreground/45 cursor-not-allowed md:flex-none"
              >
                <Shuffle className="h-3.5 w-3.5" strokeWidth={1.5} />
                Shuffle
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Wardrobe by category ── */}
      <section className="border-t border-border">
        <div className="container-editorial py-14 md:py-20">
          <SectionHead
            eyebrow="Sample Closet"
            title="Your Wardrobe"
            tag="Example"
            aside="by category"
          />
          <div className="mt-10 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {WARDROBE_CATS.map((c, i) => (
              <Reveal key={c.name} delay={Math.min(i * 0.06, 0.24)}>
                <div className="border border-border bg-card p-5 md:p-6 h-full">
                  <h3 className="font-display text-base md:text-lg">{c.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {c.swatches.map((hex) => (
                      <div
                        key={hex}
                        className="h-7 w-7 border border-border"
                        style={{ background: hex }}
                      />
                    ))}
                  </div>
                  <div className="text-[11px] text-foreground/45 mt-4">{c.count}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-6 bg-secondary border-l-2 border-foreground px-6 py-5">
              <p className="text-[13px] text-foreground/70 leading-relaxed">
                <strong className="text-foreground font-medium">Where fusion pieces go:</strong> a
                standalone fusion top or bottom (an agbada-cut jacket, a print-fabric trouser)
                files under Shirts/Tops or Trousers, same as any Western piece. A complete fusion
                outfit or classic native wear — agbada, kaftan, senator — files under Traditional
                Wear.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Wardrobe gaps ── */}
      <section className="border-t border-border">
        <div className="container-editorial py-14 md:py-20">
          <SectionHead
            eyebrow="What's Missing"
            title="Wardrobe Gaps"
            tag="Example"
            aside="from your latest consultation"
          />
          <div className="mt-10 md:mt-12 border-t border-border">
            {GAPS.map((g, i) => (
              <Reveal key={g.item} delay={Math.min(i * 0.08, 0.2)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-10 py-5 border-b border-border">
                  <div className="text-sm md:text-[15px] font-medium">{g.item}</div>
                  <div className="text-[13px] text-foreground/50 sm:text-right leading-relaxed">
                    {g.why}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subscription ── */}
      <section className="border-t border-border">
        <div className="container-editorial py-14 md:py-20">
          <SectionHead eyebrow="Digital Closet Plan" title="Subscription" />
          <div className="mt-10 md:mt-12 grid lg:grid-cols-12 gap-4 md:gap-6 items-stretch">
            <Reveal className="lg:col-span-5">
              <div className="bg-foreground text-background p-8 md:p-10 h-full flex flex-col">
                <Tag tone="dark">Base Plan</Tag>
                <h3 className="font-display text-2xl md:text-3xl mt-7">Annual</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-4xl md:text-5xl tracking-[-0.01em]">
                    ₦50,000
                  </span>
                  <span className="text-[13px] text-white/50">/ year</span>
                </div>
                <p className="text-[13px] text-white/60 leading-relaxed mt-5">
                  Included as the standard next step after a Wardrobe &amp; Style Consultation, or
                  subscribed to directly.
                </p>
              </div>
            </Reveal>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4 md:gap-6">
              {[
                {
                  key: 'purchase',
                  body: (
                    <>
                      <strong className="text-foreground font-medium">
                        Any additional purchase
                      </strong>{' '}
                      after your Consultation adds a free month to your subscription.
                    </>
                  ),
                },
                {
                  key: 'spend',
                  body: (
                    <>
                      <strong className="text-foreground font-medium">Spend ₦500,000+</strong> in a
                      single order and get 3 months free.
                    </>
                  ),
                },
              ].map((tip) => (
                <Reveal key={tip.key} className="h-full">
                  <div className="border border-border bg-card p-6 md:p-8 h-full flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-foreground/55">
                      Earn Free Time
                    </span>
                    <p className="text-[13px] md:text-sm text-foreground/75 leading-relaxed mt-4">
                      {tip.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Waitlist (dark close) ── */}
      <section id="waitlist" className="bg-[#121110] text-[#f7f6f3] scroll-mt-24">
        <div className="container-editorial py-16 md:py-24 text-center">
          <Reveal>
            <p className="eyebrow text-white/45">Be Notified</p>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.08] tracking-[-0.015em] text-balance mt-5">
              Be the first to know when this opens
            </h2>
            <p className="text-sm text-white/55 leading-relaxed mt-4 max-w-md mx-auto">
              Leave your details and we&apos;ll notify you as soon as the free trial is available.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-10">
              <NotifyForm />
            </div>
            <p className="text-[12px] italic text-white/40 mt-12">
              No pricing shown above is final — this page previews what the product will look like
              once it launches.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
