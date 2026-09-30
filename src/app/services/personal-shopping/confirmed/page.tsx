import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

// Confirmation is a transactional utility page — keep it out of search indexes.
export const metadata: Metadata = {
  title: 'Brief Received — Wardrobecare',
  description: 'Your Personal Shopping brief has been received.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/services/personal-shopping/confirmed' },
}

type SearchParams = Promise<{ ref?: string; budget?: string; needed?: string }>

export default async function ConfirmedPage({ searchParams }: { searchParams: SearchParams }) {
  const { ref, budget, needed } = await searchParams

  const summary: [string, string][] = [
    ['Service', 'Personal Shopping'],
    ['Budget range', budget || '—'],
    ['Needed by', needed || '—'],
    ['Reference no.', ref || '—'],
  ]

  const nextSteps = [
    'A stylist reviews your brief (within 24 hours)',
    "You'll get a call or WhatsApp message to confirm details",
    'We source and send you a curated shortlist to approve',
    'You only pay for what you keep',
  ]

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-2xl px-6 lg:px-10 pt-32 md:pt-44 pb-20 md:pb-28 text-center">
          {/* Checkmark */}
          <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background">
            <Check className="h-6 w-6" strokeWidth={2} />
          </div>

          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            Booking — Personal Shopping
          </p>
          <h1 className="font-display text-4xl md:text-6xl leading-[1] tracking-[-0.02em] text-balance">
            Your brief has been sent
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-5 max-w-md mx-auto leading-relaxed">
            We&apos;ve received your Personal Shopping brief. A stylist will review it and reach
            out within 24 hours to confirm details and next steps.
          </p>

          {/* Summary card */}
          <dl className="mt-12 border border-border text-left">
            {summary.map(([label, value], i) => (
              <div
                key={label}
                className={`flex items-baseline justify-between gap-6 px-6 md:px-8 py-4 ${
                  i < summary.length - 1 ? 'border-b border-border/60' : ''
                }`}
              >
                <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </dt>
                <dd className="text-sm font-medium text-right">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Next steps */}
          <div className="mt-6 border border-border bg-secondary/40 text-left p-6 md:p-8">
            <h2 className="font-display text-lg mb-4">What happens next</h2>
            <ol className="space-y-3">
              {nextSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-[11px] tabular-nums text-muted-foreground/70 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/services"
              className="inline-flex items-center justify-center border border-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors"
            >
              Back to Services
            </Link>
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
            >
              Continue Shopping
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
