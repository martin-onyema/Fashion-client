import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Returns & Exchanges',
  description:
    'The Wardrobecare exchange policy — eligible windows, item conditions, the exchange process, and delivery costs. Exchanges only, no cash refunds.',
  alternates: { canonical: '/returns' },
  openGraph: {
    title: 'Returns & Exchanges',
    description:
      'The Wardrobecare exchange policy — eligible windows, item conditions, the exchange process, and delivery costs.',
    type: 'website',
  },
}

const TOC = [
  ['#period', 'Exchange Period'],
  ['#condition', 'Condition of Items'],
  ['#reasons', 'Eligible Reasons'],
  ['#nonreturnable', 'Non-Returnable Items'],
  ['#process', 'Exchange Process'],
  ['#costs', 'Delivery Costs'],
  ['#refunds', 'Refund Policy'],
] as const

const NUM = ['01', '02', '03', '04', '05', '06', '07', '08', '09']

export default function ReturnsPage() {
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
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.02em] text-balance max-w-4xl">
              Return &amp; Exchange Policy
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mt-8">
              At Wardrobecare, we want every customer fully satisfied with their purchase. If
              something isn&apos;t right, we&apos;re happy to help with an exchange under the
              conditions below.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-14 md:py-20">
          {/* ─── Exchanges-only banner ─── */}
          <div className="bg-foreground text-background p-6 md:p-7 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-14">
            <p className="text-[11px] uppercase tracking-[0.2em] text-background/60 whitespace-nowrap">
              Please note
            </p>
            <p className="text-sm leading-relaxed">
              Wardrobecare offers <span className="font-medium">exchanges only — not cash
              refunds</span>. A change-of-mind exchange can be issued as wallet credit instead of a
              straight exchange.
            </p>
          </div>

          {/* ─── Table of contents ─── */}
          <nav aria-label="Policy sections" className="mb-16">
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
            {/* 1 · Exchange Period */}
            <section id="period" className="scroll-mt-32">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[0]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Exchange Period
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Two different windows apply, depending on the reason:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm leading-relaxed">
                      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mt-1 whitespace-nowrap">
                        48 hours
                      </span>
                      <span>
                        <span className="text-foreground font-medium">
                          Wrong size, wrong item, or defective/damaged item:
                        </span>{' '}
                        request an exchange within <strong>48 hours</strong> of receiving it.
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm leading-relaxed">
                      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mt-1 whitespace-nowrap">
                        24 hours
                      </span>
                      <span>
                        <span className="text-foreground font-medium">Change of mind:</span>{' '}
                        request within a shorter <strong>24-hour</strong> window from delivery.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2 · Condition of Items */}
            <section id="condition" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[1]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Condition of Items
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    To qualify for an exchange, items must be:
                  </p>
                  <ul className="space-y-2.5 mb-6">
                    {[
                      'Unworn, unused, and unwashed',
                      'In the original condition received',
                      'Complete with all tags and packaging intact',
                      'Free of damage, stains, or alterations',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                        <span className="mt-2 h-px w-4 bg-foreground flex-shrink-0" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Wardrobecare reserves the right to decline exchanges if these conditions
                    aren&apos;t met.
                  </p>
                  <div className="bg-secondary/40 border-l-2 border-foreground p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      If the replacement size or item is out of stock, Wardrobecare cannot
                      guarantee a specific turnaround time for the exchange. Where a size exchange
                      results from measurements or sizing information the customer provided,
                      Wardrobecare is not responsible for delays in resolving it.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3 · Eligible Reasons */}
            <section id="reasons" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[2]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Eligible Reasons for Exchange
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <ul className="space-y-2.5">
                    {[
                      'Wrong size',
                      'Wrong item delivered',
                      'Defective or damaged item (must be reported immediately upon delivery)',
                      'Change of mind — within 24 hours, subject to the condition requirements above',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                        <span className="mt-2 h-px w-4 bg-foreground flex-shrink-0" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 4 · Non-Returnable Items */}
            <section id="nonreturnable" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[3]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Non-Returnable Items
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    The following cannot be returned or exchanged:
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      'Innerwear and underwear items',
                      'Items purchased on clearance or final sale',
                      'Customized or altered items',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                        <span className="mt-2 h-px w-4 bg-muted-foreground flex-shrink-0" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 5 · Exchange Process */}
            <section id="process" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[4]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Exchange Process
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <ol className="space-y-4">
                    {[
                      'Contact us within the applicable window — 48 hours for wrong size, wrong item, or damage; 24 hours for a change of mind.',
                      'Send your order number, reason for exchange, and photos of the item if applicable.',
                      'Our team reviews the request and provides instructions for returning the item.',
                      'All returned items are inspected before an exchange is approved.',
                    ].map((step, i) => (
                      <li key={i} className="flex gap-5">
                        <span className="font-display text-2xl text-muted-foreground/50 tabular-nums flex-shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>

            {/* 6 · Delivery Costs */}
            <section id="costs" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[5]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Delivery Costs
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    If the exchange is due to a Wardrobecare error, we cover the delivery cost. If
                    it&apos;s due to size preference or a change of mind, the customer covers the
                    delivery cost.
                  </p>
                  <div className="bg-secondary/40 border-l-2 border-foreground p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      For a change-of-mind exchange specifically, you can choose between a straight
                      exchange for another item, or store credit deposited to your Wardrobecare
                      wallet for a future purchase.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                      Credited value appears in{' '}
                      <Link
                        href="/account/wallet"
                        className="text-foreground font-medium link-underline"
                      >
                        My Wallet
                      </Link>{' '}
                      in your account.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 7 & 8 · Inspection & Refund Policy */}
            <section id="refunds" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[6]} &amp; {NUM[7]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Inspection &amp; Refund Policy
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All returned items are inspected before an exchange is approved. Wardrobecare
                    does not currently offer refunds — only exchanges for eligible items.
                  </p>
                </div>
              </div>
            </section>

            {/* 9 · Availability of Replacement */}
            <section className="border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[8]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Availability of Replacement
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Exchanges are subject to product availability. If the requested item is
                    unavailable, a store credit may be issued instead.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ─── CTA ─── */}
          <section className="mt-20 bg-foreground text-background p-10 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <h2 className="font-display text-3xl md:text-4xl tracking-[-0.01em] text-balance">
              Need to start an exchange?
            </h2>
            <a
              href="https://wa.me/2348026133770"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 bg-background text-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-background/90 transition-colors whitespace-nowrap"
            >
              Contact Us
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
