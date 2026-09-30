import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { GiftCardBanner } from '@/components/gift-card/gc-banner'
import { ServiceEnquiryForm } from '@/components/services/service-enquiry-form'
import { getServiceBySlug, getRelatedServices } from '@/lib/services-data'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ArrowRight, Check } from 'lucide-react'

// ─── Bespoke page: Outfit Gifting ────────────────────────────────────────────
// Implements the artifact structure 1:1 (hero → who this is for → how it
// works → pricing & packaging → final CTA) in the site's editorial design,
// with added detail: recipient-brief guidance, box-size guide, gifting
// guarantees, preview approval, and the site-standard FAQ + enquiry form.

const service = getServiceBySlug('outfit-gifting')!

export const metadata: Metadata = {
  title: 'Outfit Gifting — Wardrobecare Services',
  description:
    'A fully styled outfit, curated for someone else, gift-wrapped and delivered. Professional styling, gift wrapping, and delivery included — starting at ₦40,000.',
  alternates: { canonical: '/services/outfit-gifting' },
  openGraph: {
    title: 'Outfit Gifting — Wardrobecare',
    description:
      'Give a complete styled outfit, curated for him — gift-wrapped and delivered for any occasion. From ₦40,000.',
    type: 'website',
    images: [{ url: service.image, alt: service.imageAlt }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Outfit Gifting — Wardrobecare',
    description:
      'Give a complete styled outfit, curated for him — gift-wrapped and delivered. From ₦40,000.',
    images: [service.image],
  },
}

// ─── Content ─────────────────────────────────────────────────────────────────

const WHO_FOR = [
  {
    title: 'More than a gift card.',
    body: 'When clothing is the gift, the thought is visible. A styled outfit says you paid attention — to his taste, his calendar, and the moment he is walking into.',
  },
  {
    title: 'You know the occasion, not the size.',
    body: 'Weddings, birthdays, promotions, anniversaries. If you are not certain of his exact size or style, the brief covers only what you know — and every gift includes one free size exchange.',
  },
  {
    title: 'It should arrive ready to wear.',
    body: 'No assembling pieces from three different stores the night before. The outfit arrives complete, gift-wrapped and boxed — he opens it and gets dressed.',
  },
  {
    title: 'A personal note, included.',
    body: 'Every gift carries a handwritten note from you. Tell us what you would like it to say, and we will write it properly and tuck it into the box.',
  },
  {
    title: 'A complete outfit, not a single piece.',
    body: 'We style shirt, trousers, and accessories as one considered look, so nothing about the finished outfit is left to guesswork.',
  },
  {
    title: 'For the men in your life.',
    body: 'Husbands, brothers, fathers, sons, colleagues — the ones who already dress well, and the ones you would like to see dress better.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Tell Us About Him',
    body: 'His sizes if you know them, his style, the occasion, and your budget. A two-minute brief is enough — we ask the right follow-up questions only when we need to.',
  },
  {
    n: '02',
    title: 'We Style It',
    body: 'A complete outfit is curated around the brief, then gift-wrapped with your handwritten note. Want to approve it first? We send a preview before the box is sealed.',
  },
  {
    n: '03',
    title: 'Delivered',
    body: 'Sent directly to him, or to you first if you would rather present it yourself. Specify a delivery date in the brief and we confirm scheduling before you pay.',
  },
]

const STEP_NOTES = [
  'Preview approval available before sealing',
  'Date-specific delivery, confirmed in advance',
  'Delivered to him — or to you first',
]

const BOX_SIZES = [
  {
    size: 'Small',
    price: '₦10,000',
    body: 'One folded piece or accessory — a shirt, knit, cap, or fragrance.',
  },
  {
    size: 'Medium',
    price: '₦20,000',
    body: 'A shirt or polo with an accessory — or a pair of footwear.',
  },
  {
    size: 'Large',
    price: '₦30,000',
    body: 'A complete outfit — top, bottom, and accessories in one box.',
  },
]

const PRICING_NOTES = [
  'Outfit cost is separate from the styling fee — you approve the pieces and the total before we assemble anything.',
  'Standard delivery is priced by location. See shipping & delivery for current charges.',
  'Bulk orders — multiple boxes — and far locations needing a vehicle are assessed case by case and confirmed before checkout.',
  'Every gifting outfit includes one free size exchange within 7 days of delivery.',
]

const FAQS = [
  {
    q: 'What if it does not fit?',
    a: 'All gifting outfits include one free size exchange within 7 days of delivery. We keep the recipient’s details on file, so the swap is quick and painless.',
  },
  {
    q: 'Can you deliver on a specific date?',
    a: 'Yes — specify the date in the brief and we will confirm delivery scheduling before you pay. For weddings and birthdays, we recommend briefing us at least 5 working days ahead.',
  },
  {
    q: 'Can I see the outfit before it is delivered?',
    a: 'Yes. We can send a preview of the curated outfit for your approval before the box is sealed — or deliver it as a complete surprise, whichever you prefer.',
  },
  {
    q: 'Can I gift more than one outfit?',
    a: 'Yes. For multiple outfits or categories we add presentation boxes — ₦10,000 small, ₦20,000 medium, ₦30,000 large. We plan the categories with you during the brief.',
  },
]

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Outfit Gifting',
  description: service.description,
  category: 'Gifting',
  provider: {
    '@type': 'Organization',
    name: 'Wardrobecare Clothing',
    url: 'https://wardrobecare.com.ng',
  },
  areaServed: ['Lagos', 'Abuja', 'Nigeria'],
  offers: {
    '@type': 'Offer',
    price: 40000,
    priceCurrency: 'NGN',
    description:
      'Styling & gift wrap — includes first presentation box (small or medium). Outfit cost separate.',
  },
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OutfitGiftingPage() {
  const related = getRelatedServices('outfit-gifting', 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* ─── Hero — split editorial ─── */}
        <section className="border-b border-foreground/10 bg-background">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10 pt-10 md:pt-14 pb-12 md:pb-16">
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
                <li className="text-foreground/80">Outfit Gifting</li>
              </ol>
            </nav>

            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-end">
              <div className="lg:col-span-7">
                <p className="eyebrow text-foreground/50 mb-5">
                  Service {service.number} — {service.category}
                </p>
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.98] tracking-[-0.02em] text-balance">
                  Outfit Gifting
                </h1>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-7 max-w-2xl">
                  A fully styled outfit, curated for someone else, gift-wrapped and delivered —
                  for the men in your life who dress well, or who you want to dress well.
                </p>
                <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <a
                    href="#book"
                    className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
                  >
                    Plan a Gift
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="#how-it-works"
                    className="group inline-flex items-center gap-3 border border-foreground/25 px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-foreground hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    See How It Works
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] overflow-hidden border border-border/60 bg-card">
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover img-editorial"
                  />
                  <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur px-4 py-3 border border-border/60">
                    <p className="font-display text-lg leading-none">From ₦40,000</p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mt-1.5">
                      Styling &amp; gift wrap · outfit cost separate
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <dl className="mt-12 md:mt-16 pt-6 border-t border-foreground/10 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Styling fee</dt>
                <dd className="text-sm mt-1.5">From ₦40,000</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Includes</dt>
                <dd className="text-sm mt-1.5">First presentation box</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Outfit cost</dt>
                <dd className="text-sm mt-1.5">Separate, at retail</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Coverage</dt>
                <dd className="text-sm mt-1.5">Lagos · Abuja · Nationwide</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ─── Gift card banner (artifact gc-banner — full-width variant) ─── */}
        <GiftCardBanner />

        {/* ─── Who this is for ─── */}
        <section className="py-16 md:py-24 bg-secondary/40 border-y border-foreground/10">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="max-w-2xl mb-10 md:mb-12">
              <p className="eyebrow text-foreground/50 mb-4">Who this is for</p>
              <h2 className="font-display text-3xl md:text-5xl leading-[1.02] tracking-[-0.02em] text-balance">
                Gifting, minus the guesswork.
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mt-5">
                Most people do not need another generic gift idea — they need someone to
                translate goodwill into an outfit he will actually wear. That is the entire
                service.
              </p>
            </div>
            <ul className="grid md:grid-cols-2 gap-x-12">
              {WHO_FOR.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-5 py-5 border-t border-foreground/10"
                >
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1 flex-shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-base font-display tracking-tight">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── How it works — dark band ─── */}
        <section id="how-it-works" className="scroll-mt-24 bg-foreground text-background">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-20 md:py-28">
            <div className="max-w-3xl mb-12 md:mb-16">
              <p className="eyebrow text-background/50 mb-4">How it works</p>
              <h2 className="font-display text-4xl md:text-5xl leading-[1] tracking-[-0.02em] text-balance">
                Three steps. One considered gift.
              </h2>
            </div>
            <ul className="grid md:grid-cols-2 gap-x-14">
              {STEPS.map((step, i) => (
                <li key={i} className="border-t border-background/15 py-8 md:py-10">
                  <div className="flex items-baseline gap-6">
                    <span className="font-display text-4xl md:text-5xl text-background/25 leading-none tabular-nums flex-shrink-0">
                      {step.n}
                    </span>
                    <div>
                      <h3 className="font-display text-xl md:text-2xl tracking-tight leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-sm text-background/70 mt-3 leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-10 border-t border-background/15 pt-7 flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
              {STEP_NOTES.map((note, i) => (
                <div key={i} className="flex items-center gap-3 flex-1">
                  <Check className="h-4 w-4 text-background/70 flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-xs uppercase tracking-[0.14em] text-background/60">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Pricing & Packaging ─── */}
        <section className="py-20 md:py-32 bg-background">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-12 gap-10 md:gap-16">
              {/* Left intro */}
              <div className="lg:col-span-5">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                  Pricing &amp; Packaging
                </p>
                <h2 className="font-display text-4xl md:text-5xl leading-[1] tracking-[-0.02em] text-balance">
                  One flat styling fee. No surprises.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mt-6 max-w-md">
                  Gifting is priced as a service, separate from the outfit itself. You pay a flat
                  styling and gift-wrap fee, then the cost of the outfit you choose — nothing
                  hidden, no commissions on the pieces we curate.
                </p>
              </div>

              {/* Right fee table */}
              <div className="lg:col-span-6 lg:col-start-7">
                <div className="border border-border/60 bg-secondary/40">
                  <div className="flex items-baseline justify-between gap-6 px-8 py-7 border-b border-border/60">
                    <div>
                      <p className="font-display text-2xl tracking-tight">Styling &amp; gift wrap</p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Includes your first presentation box — small or medium
                      </p>
                    </div>
                    <p className="font-display text-3xl md:text-4xl tracking-tight tabular-nums text-foreground flex-shrink-0">
                      ₦40,000
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-6 px-8 py-5 border-b border-border/60">
                    <p className="text-sm text-foreground">First box upgraded to large</p>
                    <p className="text-sm tabular-nums text-muted-foreground flex-shrink-0">+₦10,000</p>
                  </div>
                  <div className="px-8 pt-6 pb-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Additional boxes — multiple outfits or categories
                    </p>
                  </div>
                  {[
                    ['Additional box — small', '₦10,000'],
                    ['Additional box — medium', '₦20,000'],
                    ['Additional box — large', '₦30,000'],
                  ].map(([label, amt]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-6 px-8 py-4 border-t border-border/60"
                    >
                      <p className="text-sm text-foreground">{label}</p>
                      <p className="text-sm tabular-nums text-muted-foreground flex-shrink-0">{amt}</p>
                    </div>
                  ))}
                </div>

                {/* Box size guide */}
                <div className="grid sm:grid-cols-3 gap-4 mt-6">
                  {BOX_SIZES.map((box) => (
                    <div key={box.size} className="border border-border/60 bg-background p-6">
                      <div className="flex items-baseline justify-between gap-2 mb-3">
                        <p className="font-display text-lg tracking-tight">{box.size}</p>
                        <p className="text-xs tabular-nums text-muted-foreground">{box.price}</p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{box.body}</p>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                <ul className="mt-8 border-t border-border/60">
                  {PRICING_NOTES.map((note, i) => (
                    <li key={i} className="flex items-start gap-3 py-4 border-b border-border/60">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1 flex-shrink-0 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {i === 1 ? (
                          <>
                            Standard delivery is priced by location. See{' '}
                            <Link
                              href="/shipping"
                              className="text-foreground underline underline-offset-4 hover:no-underline"
                            >
                              shipping &amp; delivery
                            </Link>{' '}
                            for current charges.
                          </>
                        ) : (
                          note
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Testimonial ─── */}
        {service.testimonial && (
          <section className="py-16 md:py-24 bg-secondary/40 border-y border-foreground/10">
            <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
              <p className="eyebrow text-foreground/50 mb-8">From a Wardrobecare client</p>
              <blockquote className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-[-0.01em] text-balance">
                &ldquo;{service.testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-10 flex items-center gap-4">
                <div className="h-px w-12 bg-foreground/30" />
                <div>
                  <p className="text-sm">{service.testimonial.author}</p>
                  <p className="text-xs text-muted-foreground mt-1">{service.testimonial.role}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── FAQ ─── */}
        <section className="py-20 md:py-32 bg-background">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-12 gap-10 md:gap-16">
              <div className="lg:col-span-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                  Frequently Asked
                </p>
                <h2 className="font-display text-3xl md:text-4xl leading-[1] tracking-[-0.02em]">
                  Questions,
                  <br />
                  answered.
                </h2>
              </div>
              <div className="lg:col-span-7 lg:col-start-6">
                <Accordion type="single" collapsible className="w-full">
                  {FAQS.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/60">
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
          </div>
        </section>

        {/* ─── Final CTA / Booking ─── */}
        <section id="book" className="scroll-mt-24 py-20 md:py-32 bg-secondary/40">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-5">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                  Plan a Gift
                </p>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1] tracking-[-0.02em] text-balance">
                  Give a gift he&rsquo;ll actually wear.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mt-6 max-w-md">
                  Tell us who it is for and the occasion — we handle the styling, wrapping, and
                  delivery. Most gifts are curated and confirmed within 48 hours of the brief.
                </p>
                <div className="mt-10 space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground" />
                    <p>Response within 24 hours.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground" />
                    <p>No deposit required to enquire.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground" />
                    <p>Lagos, Abuja, and nationwide.</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 lg:col-start-6 bg-background p-8 md:p-12 border border-border/60">
                <ServiceEnquiryForm serviceSlug="outfit-gifting" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Related services ─── */}
        {related.length > 0 && (
          <section className="py-20 md:py-28 bg-background">
            <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
              <div className="flex items-end justify-between mb-10 md:mb-12">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                    Explore more
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl tracking-tight">
                    Related services.
                  </h2>
                </div>
                <Link
                  href="/services"
                  className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground link-underline"
                >
                  All services
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {related.map((rel) => (
                  <Link key={rel.slug} href={`/services/${rel.slug}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <Image
                        src={rel.image}
                        alt={rel.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="font-display text-lg text-background mix-blend-difference tabular-nums">
                          {rel.number}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        {rel.category}
                      </p>
                      <h3 className="font-display text-xl tracking-tight leading-tight">{rel.name}</h3>
                      <p className="text-xs text-muted-foreground mt-2">{rel.priceLabel}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
