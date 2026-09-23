import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Wardrobecare',
  description:
    'The terms that apply when you access, register with, or make a purchase on the Wardrobecare website.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms & Conditions | Wardrobecare',
    description:
      'The terms that apply when you access, register with, or make a purchase on the Wardrobecare website.',
    type: 'website',
  },
}

const TOC = [
  ['#intro', 'Introduction'],
  ['#eligibility', 'Eligibility'],
  ['#account', 'Your Account'],
  ['#availability', 'Site Availability'],
] as const

const NUM = ['01', '02', '03', '04']

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* ─── Hero ─── */}
        <section className="pt-40 md:pt-48 pb-14 border-b border-border/60">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-8">
              Legal
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.02em] text-balance max-w-4xl">
              Terms &amp; Conditions
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mt-8">
              The terms that apply when you access, register with, or make a purchase on the
              Wardrobecare website.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-14 md:py-20">
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
            {/* 1 · Introduction */}
            <section id="intro" className="scroll-mt-32">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[0]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Introduction
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Welcome to the Wardrobecare website and application. By accessing the Site,
                    you agree to comply with these Terms &amp; Conditions. We may update these
                    terms at any time — continued use of the Site after changes are posted means
                    you accept them.
                  </p>
                </div>
              </div>
            </section>

            {/* 2 · Eligibility */}
            <section id="eligibility" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[1]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Eligibility
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You confirm that you are at least 18 years of age, or are accessing the Site
                    under the supervision of a parent or legal guardian. We reserve the right to
                    limit or withdraw access if we believe a user is under 18.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We grant you a non-transferable, revocable license to use the Site for the
                    purpose of shopping for personal items and booking services. Any breach of
                    these terms may result in immediate revocation of this license.
                  </p>
                </div>
              </div>
            </section>

            {/* 3 · Your Account */}
            <section id="account" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[2]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Your Account &amp; Registration
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    Registering an account lets you track orders, save addresses, and build a
                    wishlist. You&apos;re responsible for keeping your login details confidential
                    and for all activity under your account. Please notify us immediately of any
                    unauthorized use.
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      'Provide accurate, current, and complete information when registering',
                      'Keep your registration details up to date',
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

            {/* 4 · Site Availability */}
            <section id="availability" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[3]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Site Availability
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We aim to keep the Site accessible at all times, but reserve the right to make
                    changes, perform maintenance, or temporarily suspend access without notice.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ─── CTA ─── */}
          <section className="mt-20 bg-foreground text-background p-10 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <h2 className="font-display text-3xl md:text-4xl tracking-[-0.01em] text-balance">
              Questions about these terms?
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
