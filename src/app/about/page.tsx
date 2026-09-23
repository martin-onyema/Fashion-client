import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { SERVICES } from '@/lib/services-data'

export const metadata: Metadata = {
  title: 'About — Wardrobecare Clothing',
  description:
    "A distinguished men's fashion and personal-shopping business, built in Lagos since 2003. Personal styling, wardrobe consultancy, and a curated retail edit.",
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About — Wardrobecare Clothing',
    description:
      "A distinguished men's fashion and personal-shopping business, built in Lagos since 2003.",
    type: 'website',
  },
}

const STATS: { n: string; l: string }[] = [
  { n: '2003', l: 'Founded' },
  { n: String(SERVICES.length), l: 'Core Services' },
  { n: 'Lagos', l: 'Based & Serving Nigeria' },
]

const VALUES: { n: string; title: string; body: string }[] = [
  {
    n: '1',
    title: 'Service First',
    body: 'Styling and consultation come before the sale — not the other way around.',
  },
  {
    n: '2',
    title: 'Fit Over Everything',
    body: 'The right fit outperforms the highest price tag, every time.',
  },
  {
    n: '3',
    title: 'Dress With Intention',
    body: 'Every piece should earn its place in your wardrobe — nothing bought on impulse.',
  },
  {
    n: '4',
    title: 'Plain, Honest Guidance',
    body: 'No jargon, no inflated claims — just clear advice you can actually use.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* ─── Hero ─── */}
        <section className="pt-40 md:pt-48 pb-16 md:pb-24 border-b border-border/60">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-8">
              About Wardrobecare
            </p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.02em] max-w-5xl text-balance">
              A distinguished men&apos;s fashion and personal-shopping business, built in Lagos
              since 2003.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mt-10">
              Wardrobecare exists to take the guesswork out of dressing well — through personal
              styling, wardrobe consultancy, and a curated retail edit, built around how you
              actually live.
            </p>
          </div>
        </section>

        {/* ─── Stats row ─── */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
              {STATS.map((s) => (
                <div key={s.l} className="py-10 sm:px-10 first:sm:pl-0 last:sm:pr-0">
                  <p className="font-display text-5xl md:text-6xl tracking-[-0.02em] tabular-nums">
                    {s.n}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-3">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Our Story ─── */}
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="relative aspect-[4/5] bg-muted overflow-hidden order-2 lg:order-1">
                <Image
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
                  alt="A Wardrobecare styling session — curated menswear pieces laid out for a client"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="order-1 lg:order-2">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                  Our Story
                </p>
                <h2 className="font-display text-4xl md:text-5xl leading-[1] tracking-[-0.02em] mb-8">
                  Dressing well, without the guesswork.
                </h2>
                <div className="space-y-5 text-sm md:text-base text-muted-foreground leading-relaxed">
                  <p>
                    Wardrobecare began in 2003 with a simple belief: that dressing well
                    shouldn&apos;t require guesswork, and that every man deserves a wardrobe that
                    actually works for his life — not just what happens to be on a rack.
                  </p>
                  <p>
                    What started as personal styling has grown into a full consultancy — wardrobe
                    consultations, personal shopping, home fittings, gifting, and a curated retail
                    edit — all built around the same principle: service comes first, and the
                    clothes follow from there.
                  </p>
                  <p>
                    Today, Wardrobecare works with clients across Lagos and beyond, in person and
                    through phone and video consultations, helping men build wardrobes with
                    intention rather than impulse.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── What We Believe ─── */}
        <section className="py-20 md:py-32 bg-secondary/40 border-y border-border/60">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="max-w-3xl mb-12 md:mb-16">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                What We Believe
              </p>
              <h2 className="font-display text-4xl md:text-5xl leading-[1] tracking-[-0.02em]">
                Four principles behind every brief.
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {VALUES.map((v) => (
                <div key={v.n} className="bg-background border border-border/60 p-8 flex flex-col">
                  <span className="font-display text-4xl text-muted-foreground/40 mb-6 tabular-nums">
                    {v.n}
                  </span>
                  <h3 className="font-display text-xl tracking-tight leading-tight">{v.title}</h3>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Founder ─── */}
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/5] bg-muted overflow-hidden max-w-md">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop"
                    alt="Olawunmi, founder and stylist at Wardrobecare"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="lg:col-span-6 lg:col-start-7">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                  Founder &amp; Stylist
                </p>
                <h2 className="font-display text-4xl md:text-5xl tracking-[-0.02em] mb-8">
                  Olawunmi
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Olawunmi founded Wardrobecare in 2003 and remains the vision and driving force
                  behind the business, now based in Lagos. He works directly with clients through
                  in-person sessions, phone calls, and video consultations. His approach blends
                  hands-on styling experience with a practical, plain-English philosophy: dressing
                  well should be accessible, not intimidating.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="bg-foreground text-background py-20 md:py-28">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <h2 className="font-display text-4xl md:text-6xl leading-[1] tracking-[-0.02em] max-w-2xl text-balance">
                Ready to build a wardrobe that works for you?
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/services"
                  className="group inline-flex items-center justify-center gap-3 bg-background text-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-background/90 transition-colors"
                >
                  Book a Consultation
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center border border-background/50 text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:border-background hover:bg-background/10 transition-colors"
                >
                  Explore the Shop
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
