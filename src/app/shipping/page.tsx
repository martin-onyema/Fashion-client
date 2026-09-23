import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Shipping & Delivery Information',
  description:
    'How Wardrobecare delivery works — payment on delivery, Lagos and nationwide timelines, what to expect, your responsibilities, additional fees, and how service bookings are scheduled and delivered.',
  alternates: { canonical: '/shipping' },
  openGraph: {
    title: 'Shipping & Delivery Information',
    description:
      'Payment on delivery, delivery timelines, what to expect, your responsibilities, and how service bookings are scheduled and delivered.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shipping & Delivery Information',
    description:
      'Payment on delivery, delivery timelines, and how service bookings are scheduled and delivered.',
  },
}

// ─── /shipping — Mockup 18 structure 1:1 ─────────────────────────────────────
// Wardrobecare operates two ways: shipped retail orders, and scheduled
// in-person or virtual services. Delivery and timing work differently for each.

const TOC = [
  ['#retail', 'Retail Orders'],
  ['#services', 'Service Bookings'],
  ['#cod', 'Payment on Delivery'],
  ['#timeline', 'Delivery Timeline'],
  ['#expect', 'What to Expect'],
  ['#responsibilities', 'Your Responsibilities'],
  ['#fees', 'Additional Fees'],
] as const

const SERVICE_BOOKINGS = [
  {
    tag: 'Virtual or In-Person',
    name: 'Wardrobe & Style Consultation',
    slug: 'style-wardrobe-consultation',
    body: 'No delivery involved. Your session is confirmed by phone or WhatsApp once booked, with a fixed date and time — in person or by video call.',
  },
  {
    tag: 'Sourced & Delivered',
    name: 'Personal Shopping',
    slug: 'personal-shopping',
    body: 'Once your brief is approved and sourced pieces are ready, delivery follows the same Retail Order process below — including COD and delivery windows.',
  },
  {
    tag: 'On-Site Visit',
    name: 'Home Fitting',
    slug: 'home-fitting',
    body: 'A stylist travels to your home or office at the scheduled time. If you need to reschedule, contact us at least 24 hours ahead where possible.',
  },
  {
    tag: 'Sourced & Delivered',
    name: 'Outfit Gifting',
    slug: 'outfit-gifting',
    body: 'The finished, gift-wrapped outfit is delivered the same way as a retail order, on the date you specify — directly to the recipient or to you.',
  },
  {
    tag: 'Drop-off & Return',
    name: 'Amendments & Alterations',
    slug: 'amendments-alterations',
    body: 'Drop your piece at our Lagos studio, or arrange a pickup with us. After alteration, it is returned the same way as a retail order.',
  },
  {
    tag: 'Coming Soon',
    name: 'Premium Sourcing',
    slug: 'premium-sourcing',
    body: 'Not yet bookable. Once live, sourced items will be delivered the same way as a retail order.',
  },
  {
    tag: 'Coming Soon',
    name: 'Traditional Wear Consultation',
    slug: 'traditional-wear-consultation',
    body: 'Not yet bookable. Delivery and scheduling details will be published here once the service opens.',
  },
]

export default function ShippingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* ─── Hero ─── */}
        <section className="pt-40 md:pt-48 pb-14 border-b border-border/60">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-8">
              Customer Care
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.02em] text-balance max-w-5xl">
              Shipping &amp; Delivery Information
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mt-8">
              Wardrobecare operates two ways: shipped retail orders, and scheduled in-person or
              virtual services. Delivery and timing work differently for each — here&apos;s what to
              expect from both.
            </p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-8">
              Last updated — September 2026
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-14 md:py-20">
          {/* ─── Table of contents ─── */}
          <nav aria-label="Shipping sections" className="mb-16">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {TOC.map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-16">
            {/* ─── Retail Orders ─── */}
            <section id="retail" className="scroll-mt-32">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    01
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Retail Orders
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Applies to physical items purchased through the Wardrobecare shop — clothing,
                    footwear, accessories, and gifted outfits.
                  </p>
                </div>
              </div>
            </section>

            {/* ─── Payment on Delivery ─── */}
            <section id="cod" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    02
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Payment on Delivery
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    We accept Cash on Delivery (COD), which can be completed by:
                  </p>
                  <ul className="space-y-2.5 mb-6">
                    {['Cash at hand', 'Bank transfer', 'Mobile transfer', 'Online transfer'].map(
                      (item) => (
                        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                          <span className="mt-2 h-px w-4 bg-foreground flex-shrink-0" aria-hidden />
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                  <div className="bg-secondary/40 border-l-2 border-foreground p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      For any transfer method, please have evidence of a completed transaction
                      ready once your order has been confirmed by you or your representative.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── Delivery Timeline ─── */}
            <section id="timeline" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    03
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Delivery Timeline
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <ul className="space-y-4 mb-6">
                    <li className="flex items-start gap-5">
                      <span className="font-display text-2xl text-muted-foreground/50 tabular-nums flex-shrink-0">
                        01
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                        <span className="text-foreground font-medium">Estimated delivery:</span> 1
                        hour to 3 working days for most Lagos locations, and up to 7 working days
                        for further locations. This is an estimate, not a guaranteed delivery date
                        — estimates factor in order processing, transit to the delivery provider,
                        and transit to your address.
                      </p>
                    </li>
                    <li className="flex items-start gap-5">
                      <span className="font-display text-2xl text-muted-foreground/50 tabular-nums flex-shrink-0">
                        02
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                        <span className="text-foreground font-medium">Order processing:</span>{' '}
                        typically 1–2 days, though some orders ship within an hour and others may
                        take up to 5 days.
                      </p>
                    </li>
                    <li className="flex items-start gap-5">
                      <span className="font-display text-2xl text-muted-foreground/50 tabular-nums flex-shrink-0">
                        03
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                        <span className="text-foreground font-medium">Transit time:</span> time for
                        your order to leave our distribution point and reach the local delivery
                        carrier.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ─── What to Expect ─── */}
            <section id="expect" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    04
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    What to Expect
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Once your order is ready, our delivery partner will contact you on the phone
                    number provided to confirm timing. Deliveries are made between 8am and 6pm on
                    your selected day, with a call ahead to confirm an approximate arrival window.
                  </p>
                </div>
              </div>
            </section>

            {/* ─── Your Responsibilities ─── */}
            <section id="responsibilities" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    05
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Your Responsibilities
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-5">
                      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mt-1.5 whitespace-nowrap">
                        Presence
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        <span className="text-foreground font-medium">Who needs to be present?</span>{' '}
                        You or a representative aged 18 or older must be available to receive the
                        order at the agreed time. If no one is available, a re-delivery fee may
                        apply.
                      </p>
                    </li>
                    <li className="flex items-start gap-5">
                      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mt-1.5 whitespace-nowrap">
                        On arrival
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        <span className="text-foreground font-medium">On delivery:</span> Sign the
                        delivery note in front of the courier to confirm receipt. Examine your order
                        immediately for damage or errors. If anything is missing, damaged, or
                        incorrect, keep the item(s), note the issue on the delivery note, and
                        contact us within 48 hours.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ─── Additional Fees ─── */}
            <section id="fees" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    06
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Additional Fees
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Extra charges may apply if standard delivery conditions aren&apos;t met — for
                    example, an inaccessible address, being unavailable at the scheduled time, or a
                    change of delivery address after your order has begun processing.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                    Standard fees for every Lagos area are listed on their own page —{' '}
                    <Link
                      href="/delivery-charges"
                      className="text-foreground font-medium link-underline"
                    >
                      Delivery Charges by Location
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </section>

            {/* ─── Service Bookings ─── */}
            <section id="services" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    07
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Service Bookings
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Applies to Wardrobecare&apos;s styling and consultation services. These are
                    scheduled, not shipped — timing depends on the service itself.
                  </p>
                </div>
              </div>

              {/* Per-service rows */}
              <div className="mt-10 border-t border-border">
                {SERVICE_BOOKINGS.map((s, i) => (
                  <div
                    key={s.slug}
                    className="grid md:grid-cols-12 gap-2 md:gap-10 py-6 md:py-7 border-b border-border/60"
                  >
                    <div className="md:col-span-4">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-2">
                        {String(i + 1).padStart(2, '0')} — {s.tag}
                      </p>
                      <h3 className="font-display text-xl tracking-[-0.01em]">
                        <Link
                          href={`/services/${s.slug}`}
                          className="link-underline hover:text-foreground"
                        >
                          {s.name}
                        </Link>
                        {s.tag === 'Coming Soon' && (
                          <span className="sr-only"> (coming soon)</span>
                        )}
                      </h3>
                    </div>
                    <p className="md:col-span-7 md:col-start-6 text-sm text-muted-foreground leading-relaxed self-center">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ─── Contact CTA ─── */}
          <section className="mt-20 bg-foreground text-background p-10 md:p-14">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h2 className="font-display text-3xl md:text-4xl tracking-[-0.01em] text-balance">
                  Questions about an order or booking?
                </h2>
                <p className="text-sm text-background/60 leading-relaxed mt-3 max-w-md">
                  Phone / WhatsApp 0802 613 3770 · Email wardrobecare@gmail.com · Hours Mon–Sat,
                  9am–6pm (Lagos time)
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <a
                  href="https://wa.me/2348026133770"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-3 bg-background text-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-background/90 transition-colors whitespace-nowrap"
                >
                  Contact Us
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link
                  href="/track-order"
                  className="inline-flex items-center justify-center gap-2 border border-background/40 px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:border-background transition-colors whitespace-nowrap"
                >
                  Track an Order
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
