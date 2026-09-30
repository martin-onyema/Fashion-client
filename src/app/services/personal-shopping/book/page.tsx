import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BookingWizard } from './booking-wizard'

// Booking is a utility flow — keep it out of search indexes (SEO).
export const metadata: Metadata = {
  title: 'Book Personal Shopping — Wardrobecare',
  description:
    'Tell us what you need — occasion, budget, and sizing — and a Wardrobecare stylist will curate a shortlist for you.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/services/personal-shopping/book' },
}

export default function BookPersonalShoppingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 pt-32 md:pt-40 pb-20 md:pb-28">
          {/* Flow head */}
          <div className="mb-10">
            <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-8">
              <Link href="/services" className="hover:text-foreground transition-colors">
                Services
              </Link>
              <span aria-hidden>/</span>
              <Link
                href="/services/personal-shopping"
                className="hover:text-foreground transition-colors"
              >
                Personal Shopping
              </Link>
              <span aria-hidden>/</span>
              <span className="text-foreground">Book</span>
            </nav>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Booking — Personal Shopping
            </p>
            <h1 className="font-display text-4xl md:text-6xl leading-[1] tracking-[-0.02em]">
              Tell us what you need
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-4">
              4 short steps. Takes about 2 minutes.
            </p>
          </div>

          <BookingWizard />
        </div>
      </main>
      <Footer />
    </>
  )
}
