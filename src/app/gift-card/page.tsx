import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { DELIVERY_ZONES } from '@/lib/delivery-zones'
import { formatNGN } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Wardrobecare Gift Cards — Give the gift of choice',
  description:
    'Send a Wardrobecare gift card — from ₦100,000, no fixed ceiling. He shops for himself and is notified instantly by email, SMS & WhatsApp.',
  alternates: { canonical: '/gift-card' },
  openGraph: {
    title: 'Wardrobecare Gift Cards',
    description:
      'Can’t decide his size or style? Send a gift card — from ₦100,000, with no fixed ceiling. He’s notified by email, SMS & WhatsApp.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wardrobecare Gift Cards',
    description: 'From ₦100,000 — he chooses, we notify him.',
  },
}

// ─── /gift-card — gift card landing ──────────────────────────────────────────
// Copy from the gift-card banner artifact ("Give the gift of choice." /
// "Send a Gift Card" / "He's notified instantly by email, SMS & WhatsApp");
// steps mirror the gift card checkout sequence; delivery fees are the shared
// Delivery Charges by Location table.

const STEPS = [
  {
    n: '01',
    title: 'Choose the amount',
    body: 'Any custom amount — ₦100,000 minimum, no fixed ceiling. You set the value; he sets the wardrobe.',
  },
  {
    n: '02',
    title: 'Recipient & delivery location',
    body: 'Tell us who he is and where the card is going. The location is what determines the delivery fee — a live lookup from the same charges table we use for retail delivery.',
  },
  {
    n: '03',
    title: 'Review, pay & notify',
    body: 'The total is the gift card value plus the delivery fee for his location. Once your payment is confirmed, he is notified by your chosen channel with a link to shop up to the card value.',
  },
]

const GOOD_TO_KNOW = [
  'Notified by email, SMS & WhatsApp',
  '₦100,000 minimum — no ceiling',
  'Delivery fee priced by location',
  'Redeemable across the entire shop',
]

export default function GiftCardPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* ─── Hero ─── */}
        <section className="pt-40 md:pt-48 pb-14 md:pb-20 border-b border-border/60">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-8">
              Outfit Gifting — Gift Cards
            </p>
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
              <div className="lg:col-span-8">
                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.02em] text-balance">
                  Give the gift of choice.
                </h1>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mt-8">
                  Can&apos;t decide his size or style? Send a Wardrobecare gift card instead — he
                  shops for himself, from ₦100,000, with no fixed ceiling.
                </p>
              </div>
              <div className="lg:col-span-4 lg:col-start-9">
                <Link
                  href="/gift-card/checkout"
                  className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
                >
                  Send a Gift Card
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                  He&apos;s notified instantly by email, SMS &amp; WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-14">
              <div className="lg:col-span-5">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                  How it works
                </p>
                <h2 className="font-display text-4xl md:text-5xl leading-[1] tracking-[-0.02em] text-balance">
                  Three steps, then it&apos;s his.
                </h2>
              </div>
              <div className="lg:col-span-6 lg:col-start-7 flex items-end">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The whole thing takes a couple of minutes. The only decision that changes the
                  total is his delivery location — everything else is exactly what you choose.
                </p>
              </div>
            </div>

            <dl className="border-t border-border">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="grid md:grid-cols-12 gap-3 md:gap-10 py-8 md:py-10 border-b border-border/60"
                >
                  <dt className="md:col-span-2">
                    <span className="font-display text-3xl md:text-4xl text-muted-foreground/50 tabular-nums">
                      {s.n}
                    </span>
                  </dt>
                  <dd className="md:col-span-4">
                    <h3 className="font-display text-2xl tracking-[-0.01em]">{s.title}</h3>
                  </dd>
                  <dd className="md:col-span-6 text-sm text-muted-foreground leading-relaxed">
                    {s.body}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Good to know chips */}
            <ul className="flex flex-wrap gap-x-8 gap-y-3 mt-10">
              {GOOD_TO_KNOW.map((item) => (
                <li
                  key={item}
                  className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border border-border px-4 py-2.5"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── Delivery charges by location ─── */}
        <section className="pb-20 md:pb-28">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="border border-border/60 bg-secondary/40">
              <div className="px-8 md:px-10 py-7 border-b border-border/60">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                  Delivery charges by location
                </p>
                <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em] text-balance">
                  The fee for his area, shown before you pay.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3 max-w-2xl">
                  Gift cards are delivered to him directly, so the delivery fee depends on his
                  location. These are the same charges we use for retail delivery — the checkout
                  looks the fee up live from this table.
                </p>
              </div>
              <div className="grid md:grid-cols-2">
                {DELIVERY_ZONES.map((z, i) => (
                  <div
                    key={z.name}
                    className={`flex items-baseline justify-between gap-6 px-8 md:px-10 py-4 ${
                      i < DELIVERY_ZONES.length - 2 ? 'border-b border-border/40' : ''
                    } ${i % 2 === 0 ? 'md:border-r md:border-border/40' : ''} ${
                      i === DELIVERY_ZONES.length - 1 ? 'border-b-0' : ''
                    } ${i === DELIVERY_ZONES.length - 2 ? 'max-md:border-b-0 md:border-b' : ''}`}
                  >
                    <p className="text-sm text-muted-foreground leading-snug">{z.name}</p>
                    <p className="text-sm tabular-nums text-foreground flex-shrink-0">
                      {formatNGN(z.fee)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="bg-foreground text-background">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-16 md:py-20 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <h2 className="font-display text-3xl md:text-4xl tracking-[-0.01em] text-balance">
              Ready to send one?
            </h2>
            <Link
              href="/gift-card/checkout"
              className="group inline-flex items-center justify-center gap-3 bg-background text-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-background/90 transition-colors whitespace-nowrap"
            >
              Send a Gift Card
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
