import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { getAdminSettings } from '@/lib/queries'
import { FAQ_CATEGORIES, WHATSAPP_COMMANDS, FAQ_PAGE_UPDATED } from '@/lib/faq-data'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions | Wardrobecare',
  description:
    'Answers to what people actually ask us — about our services, sizing, ordering, delivery, and how Wardrobecare works day to day.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ — Frequently Asked Questions | Wardrobecare',
    description:
      'Answers to what people actually ask us — about our services, sizing, ordering, delivery, and how Wardrobecare works day to day.',
    type: 'website',
  },
}

export default async function FAQPage() {
  const settings = await getAdminSettings()
  const whatsapp = settings?.whatsappNumber ?? '2348026133770'
  const waLink = `https://wa.me/${String(whatsapp).replace(/\D/g, '')}`

  // FAQPage structured data — every question/answer pair.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_CATEGORIES.flatMap((cat) =>
      cat.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      }))
    ),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* ─── Hero ─── */}
        <section className="pt-40 md:pt-48 pb-14 border-b border-border/60">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-8">
              Customer Care
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.02em] text-balance max-w-4xl">
              Frequently Asked Questions
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mt-8">
              Answers to what people actually ask us — about our services, sizing, ordering,
              delivery, and how Wardrobecare works day to day.
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mt-6">
              {FAQ_PAGE_UPDATED}
            </p>
          </div>
        </section>

        {/* ─── Table of contents ─── */}
        <nav
          aria-label="FAQ categories"
          className="sticky top-[57px] z-30 bg-background/95 backdrop-blur-sm border-b border-border/60"
        >
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-4">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {FAQ_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`#${cat.id}`}
                    className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="tabular-nums mr-1">{cat.num}</span>
                    {cat.title}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#commands"
                  className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="tabular-nums mr-1">19</span>
                  WhatsApp Commands
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* ─── Categories ─── */}
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-16 md:py-24">
          {FAQ_CATEGORIES.map((cat) => (
            <section key={cat.id} id={cat.id} className="mb-16 scroll-mt-32">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground">
                  {cat.num}
                </span>
                <h2 className="font-display text-2xl md:text-4xl tracking-[-0.01em]">
                  {cat.title}
                </h2>
                {cat.tag && (
                  <span className="ml-2 border border-border px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-muted-foreground whitespace-nowrap">
                    {cat.tag}
                  </span>
                )}
              </div>
              <div className="border-t border-foreground/80 mb-2" aria-hidden />
              <Accordion type="single" collapsible className="w-full">
                {cat.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`${cat.id}-${i}`}
                    className="border-b border-border/60"
                  >
                    <AccordionTrigger className="text-left text-base md:text-lg font-display tracking-tight py-5 hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-6 whitespace-pre-line">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}

          {/* ─── The Wardrobecare Promise ─── */}
          <section className="mb-16 bg-foreground text-background p-10 md:p-16 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-background/60 mb-5">
              The Wardrobecare Promise
            </p>
            <p className="font-display text-3xl md:text-5xl leading-[1.15] tracking-[-0.01em] text-balance">
              Don&apos;t just buy clothes. Build a wardrobe that works for you.
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-background/60 mt-8">
              Fashion · Personality · Style
            </p>
          </section>

          {/* ─── 19 · WhatsApp commands ─── */}
          <section id="commands" className="mb-16 scroll-mt-32">
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground">
                19
              </span>
              <h2 className="font-display text-2xl md:text-4xl tracking-[-0.01em]">
                Quick WhatsApp Commands
              </h2>
            </div>
            <div className="border-t border-foreground/80 mb-6" aria-hidden />
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed mb-8">
              Message us on WhatsApp and send any of these commands as the first word of your
              message — our assistant will route you straight to the right answer or service.
            </p>
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-3.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                      Command
                    </th>
                    <th className="px-5 py-3.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                      What it does
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {WHATSAPP_COMMANDS.map((c) => (
                    <tr key={c.cmd} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <code className="text-xs bg-secondary px-2 py-1">{c.cmd}</code>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{c.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── Contact CTA ─── */}
          <section className="border border-border p-8 md:p-14 text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-3">Still have a question?</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Call or WhatsApp +234 802 613 3770, or email hello@wardrobecare.com.ng — Mon–Sat,
              9am–6pm (Lagos time).
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
              >
                Chat on WhatsApp
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href="/track-order"
                className="inline-flex items-center justify-center border border-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors"
              >
                Track Order
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
