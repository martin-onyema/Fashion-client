import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { DELIVERY_ZONE_GROUPS } from '@/lib/delivery-zones'
import { getAdminSettings } from '@/lib/queries'
import { formatNGN } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Delivery Charges by Location',
  description:
    'Wardrobecare delivery fees across Lagos, listed by named area — five Lagos Island tiers and six Lagos Mainland tiers, collected on delivery. Complimentary delivery on retail orders over ₦50,000.',
  alternates: { canonical: '/delivery-charges' },
  openGraph: {
    title: 'Delivery Charges by Location',
    description:
      'Wardrobecare delivery fees across Lagos, listed by named area — five Lagos Island tiers and six Lagos Mainland tiers, collected on delivery.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delivery Charges by Location',
    description:
      'Wardrobecare delivery fees across Lagos, listed by named area — collected on delivery.',
  },
}

// ─── /delivery-charges — Mockup 24 structure 1:1 ─────────────────────────────
// "Delivery Charges by Location — Lagos Island (5 tiers) & Mainland (6 tiers),
// by named area." One canonical fee table for the whole site; the data lives in
// src/lib/delivery-zones.ts (the same source the gift card checkout reads).

const NOTES = [
  {
    label: 'When you pay',
    body: 'Delivery fees are collected with your payment on delivery — cash, bank transfer, or card. Nothing is charged for delivery before your order arrives.',
  },
  {
    label: 'Complimentary delivery',
    body: 'Retail orders above the complimentary threshold ship free. The threshold is shown at checkout and confirmed when you order.',
  },
  {
    label: 'Service bookings & gifts',
    body: 'Sourced-and-delivered services — Personal Shopping, Outfit Gifting, and gift card deliveries — use these same location fees, confirmed with you before anything is scheduled.',
  },
  {
    label: 'If nobody is home',
    body: 'If no one is available to receive the order at the agreed time, a re-delivery fee may apply. Someone aged 18 or older must be present to sign.',
  },
  {
    label: 'Outside Lagos',
    body: 'We deliver nationwide. Fees outside Lagos depend on your location and carrier — contact us on WhatsApp with your delivery address for an exact quote before you order.',
  },
]

export default async function DeliveryChargesPage() {
  const settings = await getAdminSettings().catch(() => null)
  const freeThreshold = settings?.freeDeliveryThreshold ?? 50000
  const totalZones = DELIVERY_ZONE_GROUPS.reduce((n, g) => n + g.zones.length, 0)

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
              Delivery Charges by Location
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mt-8">
              Every Lagos delivery fee we charge, listed by named area — {totalZones} tiers across
              the Island and the Mainland. Paid on delivery, never before. Orders above{' '}
              {formatNGN(freeThreshold)} ship free.
            </p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-8">
              Last updated — September 2026
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-14 md:py-20">
          {/* ─── Table of contents ─── */}
          <nav aria-label="Delivery charges sections" className="mb-16">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {DELIVERY_ZONE_GROUPS.map((g) => (
                <li key={g.area}>
                  <a
                    href={`#${g.area}`}
                    className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {g.label} — {g.zones.length} tiers
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#good-to-know"
                  className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Good to Know
                </a>
              </li>
            </ul>
          </nav>

          <div className="space-y-16">
            {/* ─── Zone groups ─── */}
            {DELIVERY_ZONE_GROUPS.map((group) => (
              <section
                key={group.area}
                id={group.area}
                className="scroll-mt-32"
                aria-label={`${group.label} delivery charges`}
              >
                <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      {group.zones.length} tiers
                    </p>
                    <h2 className="font-display text-3xl md:text-4xl tracking-[-0.01em]">
                      {group.label}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">{group.note}</p>
                  </div>
                </div>

                <div className="border-t border-border">
                  {group.zones.map((zone) => (
                    <div
                      key={zone.name}
                      className="grid md:grid-cols-12 gap-2 md:gap-10 py-5 md:py-6 border-b border-border/60 items-baseline"
                    >
                      <p className="md:col-span-8 text-sm md:text-[15px] leading-relaxed text-foreground">
                        {zone.name}
                      </p>
                      <p className="md:col-span-4 md:text-right font-display text-xl md:text-2xl tabular-nums">
                        {formatNGN(zone.fee)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* ─── Good to know ─── */}
            <section id="good-to-know" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <h2 className="font-display text-3xl md:text-4xl tracking-[-0.01em]">
                  Good to Know
                </h2>
              </div>
              <div className="border-t border-border">
                {NOTES.map((note) => (
                  <div
                    key={note.label}
                    className="grid md:grid-cols-12 gap-2 md:gap-10 py-6 md:py-7 border-b border-border/60"
                  >
                    <p className="md:col-span-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:pt-1">
                      {note.label}
                    </p>
                    <p className="md:col-span-9 text-sm text-muted-foreground leading-relaxed">
                      {note.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── Cross-links ─── */}
            <section className="border-t border-border/60 pt-12">
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href="/shipping"
                  className="group border border-border bg-card p-6 md:p-8 hover:border-foreground/30 transition-colors"
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    Full policy
                  </p>
                  <h3 className="font-display text-xl md:text-2xl mb-2">
                    Shipping &amp; Delivery Information
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    Timelines, payment on delivery, what to expect, and how service bookings are
                    scheduled and delivered.
                  </p>
                  <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground">
                    <span className="link-underline">Read the shipping policy</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  href="/gift-card"
                  className="group border border-border bg-card p-6 md:p-8 hover:border-foreground/30 transition-colors"
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    Sending a gift?
                  </p>
                  <h3 className="font-display text-xl md:text-2xl mb-2">
                    Gift Cards, Delivered Too
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    Gift card deliveries to any of these locations use the same fee — calculated
                    for you at checkout before you pay.
                  </p>
                  <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground">
                    <span className="link-underline">Explore gift cards</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* ─── Dark CTA ─── */}
        <section className="bg-[#121110] text-[#f7f6f3]">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-20 md:py-28">
            <div className="grid lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-7">
                <p className="eyebrow text-[#f7f6f3]/50 mb-6">Still have a question?</p>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.015em] text-balance">
                  We&apos;ll confirm your exact fee before anything moves.
                </h2>
                <p className="text-sm md:text-[15px] text-[#f7f6f3]/65 leading-relaxed max-w-xl mt-6">
                  Message us on WhatsApp with your delivery address and what you&apos;re ordering —
                  we&apos;ll reply with the exact fee and the earliest delivery day. No surprises
                  on arrival.
                </p>
              </div>
              <div className="lg:col-span-5 lg:col-start-9 flex flex-col sm:flex-row lg:justify-end gap-3">
                <Link
                  href="/faq"
                  className="group inline-flex items-center justify-center gap-2.5 bg-[#f7f6f3] text-[#121110] px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-white transition-colors"
                >
                  Read the FAQ
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/track-order"
                  className="inline-flex items-center justify-center border border-white/40 text-[#f7f6f3] px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-[#f7f6f3] hover:text-[#121110] hover:border-[#f7f6f3] transition-colors"
                >
                  Track an Order
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
