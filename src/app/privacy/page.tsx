import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Privacy & Confidentiality | Wardrobecare',
  description:
    'How Wardrobecare collects, uses, and protects your personal information when you use our site and services.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy & Confidentiality | Wardrobecare',
    description:
      'How Wardrobecare collects, uses, and protects your personal information when you use our site and services.',
    type: 'website',
  },
}

const TOC = [
  ['#data', 'Data We Collect'],
  ['#use', 'How We Use It'],
  ['#disclosure', 'Disclosure'],
  ['#thirdparty', 'Third Parties'],
  ['#security', 'Security & Cookies'],
  ['#rights', 'Your Rights'],
] as const

const NUM = ['01', '02', '03', '04', '05', '06', '07']

export default function PrivacyPage() {
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
              Privacy &amp; Confidentiality
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mt-8">
              How Wardrobecare collects, uses, and protects your personal information when you use
              our site and services.
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
            {/* 1 · Data We Collect */}
            <section id="data" className="scroll-mt-32">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[0]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Data We Collect
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    When you place an order or use the Site, we may collect personal information
                    including your name, gender, date of birth, email address, postal and delivery
                    addresses, phone number, and payment details.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You can browse the Site anonymously without providing personal details — we
                    cannot identify you unless you&apos;ve created an account and logged in.
                  </p>
                </div>
              </div>
            </section>

            {/* 2 · How We Use Your Information */}
            <section id="use" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[1]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    How We Use Your Information
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use your information to process orders and service bookings, manage your
                    account, verify payments, coordinate delivery or in-person appointments, and
                    improve how we style and shop for you. With your consent, we may also send you
                    updates about services, new arrivals, or styling offers you might find useful.
                    You can opt out of these communications at any time.
                  </p>
                </div>
              </div>
            </section>

            {/* 3 · Disclosure */}
            <section id="disclosure" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[2]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Disclosure of Your Information
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We may share personal information to fulfill legal requirements, protect
                    rights and safety, or facilitate delivery (for example, sharing your name and
                    address with a courier). We do not sell your personal data to third parties
                    without consent, except where required by law or necessary to provide our
                    services.
                  </p>
                </div>
              </div>
            </section>

            {/* 4 · Third Parties */}
            <section id="thirdparty" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[3]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Third Parties
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We share only what&apos;s needed with the people who help us serve you —
                    couriers for delivery, payment processors for transactions, and (where a
                    service calls for it) external tailors for alterations work. We don&apos;t
                    sell your personal data, and we don&apos;t have a network of affiliated
                    companies to share it with — Wardrobecare is a single business. The Site may
                    contain links to other sites; we aren&apos;t responsible for their privacy
                    practices.
                  </p>
                </div>
              </div>
            </section>

            {/* 5 · Security & Cookies */}
            <section id="security" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[4]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Security &amp; Cookies
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use encryption, firewalls, and secure servers to protect your information,
                    though no method of transmission is 100% secure. Cookies are used for
                    convenience (e.g. remembering your cart) — not for targeted advertising. This
                    site may use Google Analytics to understand site usage.
                  </p>
                </div>
              </div>
            </section>

            {/* 6 · Your Rights */}
            <section id="rights" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[5]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Your Rights
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You have the right to request access to the personal data we hold about you,
                    correct any inaccuracies free of charge, and ask us to stop using your data
                    for direct marketing at any time.
                  </p>
                </div>
              </div>
            </section>

            {/* 7 · Changes */}
            <section className="border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {NUM[6]}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Changes to This Policy
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We may amend this Privacy Policy at any time by posting updated terms on this
                    page.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ─── CTA ─── */}
          <section className="mt-20 bg-foreground text-background p-10 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <h2 className="font-display text-3xl md:text-4xl tracking-[-0.01em] text-balance">
              Questions about your data?
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
