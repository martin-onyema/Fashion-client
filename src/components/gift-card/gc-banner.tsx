import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// ─── Gift Card banner (full-width variant) ───────────────────────────────────
// Artifact "gc-banner": the full-width version for the homepage or the top of
// the Outfit Gifting page. Dark editorial band matching home-services DNA.

export function GiftCardBanner() {
  return (
    <section aria-labelledby="gc-banner-title" className="bg-[#121110] text-[#f7f6f3]">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-16 md:py-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/50 mb-6">
              Outfit Gifting — Gift Cards
            </p>
            <h2
              id="gc-banner-title"
              className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1] tracking-[-0.015em] text-balance"
            >
              Give the gift of choice.
            </h2>
            <p className="text-sm md:text-base text-white/65 leading-relaxed mt-6 max-w-xl">
              Can&apos;t decide his size or style? Send a Wardrobecare gift card instead — he
              shops for himself, from ₦100,000, with no fixed ceiling.
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-9">
            <Link
              href="/gift-card/checkout"
              className="group inline-flex items-center gap-3 bg-[#f7f6f3] text-[#121110] px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-white/90 transition-colors"
            >
              Send a Gift Card
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-xs text-white/50 mt-4 leading-relaxed">
              He&apos;s notified instantly by email, SMS &amp; WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
