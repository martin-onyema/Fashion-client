import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ServiceEnquiryForm } from '@/components/services/service-enquiry-form'
import { PersonalShoppingContent, type ShelfProduct } from './personal-shopping-content'
import { getServiceBySlug, getRelatedServices } from '@/lib/services-data'
import { getProducts } from '@/lib/queries'
import { db } from '@/lib/db'
import { whatsappLink } from '@/lib/format'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Minus,
  Plus,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type Params = Promise<{ slug: string }>

// Queries the DB (live admin settings) on every request — must never be
// prerendered at build time (build machines may not have DATABASE_URL).
export const dynamic = 'force-dynamic'

// ─── SEO ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) return { title: 'Service Not Found' }

  return {
    title: `${service.name} — Wardrobecare Services`,
    description: service.tagline,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.name} — Wardrobecare`,
      description: service.tagline,
      type: 'website',
      images: [{ url: service.image, alt: service.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${service.name} — Wardrobecare`,
      description: service.tagline,
      images: [service.image],
    },
  }
}

// (Service pages render per request — see `dynamic = "force-dynamic"` in the
// root layout. Keeping the build database-free means deploys never fail.)

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function ServiceDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) notFound()

  const related = getRelatedServices(service.slug, 3)
  const comingSoon = Boolean(service.comingSoon)

  // Store settings drive the waitlist WhatsApp deep link on coming-soon pages.
  // Defensive: a settings-store hiccup must never 500 the whole service route.
  const settings = await db.adminSettings
    .findUnique({ where: { id: 'singleton' } })
    .catch(() => null)
  const whatsappNumber = (settings?.whatsappNumber || '2348026133770').replace(/\D/g, '')
  const waitlistMsg = `Hello Wardrobecare, I'd like to join the waitlist for *${service.name}*. Please notify me when bookings open.`

  // JSON-LD structured data — no Offer for coming-soon services.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    category: service.category,
    provider: {
      '@type': 'Organization',
      name: 'Wardrobecare Clothing',
      url: 'https://wardrobecare.com.ng',
    },
    areaServed: ['Lagos', 'Abuja', 'Nigeria'],
    ...(comingSoon
      ? {}
      : {
          offers: {
            '@type': 'Offer',
            price: service.startingPrice,
            priceCurrency: 'NGN',
            description: service.priceNote || service.priceUnit,
          },
        }),
  }

  // Personal Shopping carries a bespoke, richer landing page (service 01);
  // every other service keeps the shared template below.
  if (service.slug === 'personal-shopping') {
    const products = await getProducts({ limit: 8, sort: 'featured' })
    const shelf: ShelfProduct[] = products.slice(0, 8).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      salePrice: p.salePrice ?? null,
      category: p.category?.name ?? null,
      image: p.images[0]?.url ?? null,
    }))
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <PersonalShoppingContent service={service} shelf={shelf} related={related} />
        <Footer />
      </>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* ─── Hero — split editorial ─── */}
        <section className="border-b border-foreground/10 bg-background">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10 pt-10 md:pt-14 pb-12 md:pb-16">
            <nav aria-label="Breadcrumb" className="mb-10 md:mb-14">
              <ol className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-foreground/45">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-foreground/80">{service.name}</li>
              </ol>
            </nav>

            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-end">
              {/* Text panel */}
              <div className="lg:col-span-7">
                <p className="eyebrow text-foreground/50 mb-5">
                  Service {service.number} — {service.category}
                </p>
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.98] tracking-[-0.02em] text-balance">
                  {service.name}
                </h1>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-7 max-w-2xl">
                  {service.description}
                </p>
                <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <a
                    href={comingSoon ? '#notify' : '#book'}
                    className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
                  >
                    {comingSoon ? 'Join the Waitlist' : 'Book This Service'}
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  {comingSoon ? (
                    <span className="inline-flex items-center gap-2 border border-foreground/25 px-4 py-2.5 text-[10px] uppercase tracking-[0.18em] text-foreground/70">
                      <span className="size-1.5 rounded-full bg-foreground/50" />
                      Coming Soon
                    </span>
                  ) : (
                    <a
                      href={service.pricingTable ? '#pricing' : '#how'}
                      className="group inline-flex items-center gap-3 border border-foreground/25 px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-foreground hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
                    >
                      {service.pricingTable ? 'See Pricing' : 'See How It Works'}
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>
              </div>

              {/* Image panel */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] overflow-hidden border border-border/60 bg-card">
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover img-editorial"
                  />
                  {!comingSoon && (
                    <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-[300px] bg-background/95 backdrop-blur px-4 py-3 border border-border/60">
                      <p className="font-display text-lg leading-none">{service.priceLabel}</p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mt-1.5">
                        {service.priceUnit}
                        {service.priceNote ? ` · ${service.priceNote}` : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Facts strip */}
            <dl className="mt-12 md:mt-16 pt-6 border-t border-foreground/10 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Response</dt>
                <dd className="text-sm mt-1.5">Within 24 hours</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Coverage</dt>
                <dd className="text-sm mt-1.5">Lagos · Abuja · Nationwide</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Commission</dt>
                <dd className="text-sm mt-1.5">None on sourced items</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Enquiries</dt>
                <dd className="text-sm mt-1.5">WhatsApp · Phone · Email</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ─── Who It's For ─── */}
        <section className="py-16 md:py-24 bg-secondary/40 border-y border-foreground/10">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="max-w-2xl mb-10 md:mb-12">
              <p className="eyebrow text-foreground/50 mb-4">Who it&apos;s for</p>
              <h2 className="font-display text-3xl md:text-5xl leading-[1.02] tracking-[-0.02em] text-balance">
                Built for the way you actually dress.
              </h2>
            </div>
            <ul className="grid md:grid-cols-2 gap-x-12">
              {service.whoFor.map((item, i) => (
                <li key={i} className="flex items-start gap-5 py-5 border-t border-foreground/10">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1 flex-shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-base text-foreground leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── What's Included / How it works — dark band ─── */}
        <section className="bg-foreground text-background" id="how">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-20 md:py-28">
            <div className="max-w-3xl mb-12 md:mb-16">
              <p className="eyebrow text-background/50 mb-4">
                {service.whatsIncluded[0]?.step ? 'How it works' : "What's included"}
              </p>
              <h2 className="font-display text-4xl md:text-5xl leading-[1] tracking-[-0.02em] text-balance">
                {service.whatsIncluded[0]?.step
                  ? 'A clear, structured process.'
                  : 'Everything you get.'}
              </h2>
            </div>
            <ul className="grid md:grid-cols-2 gap-x-14">
              {service.whatsIncluded.map((item, i) => (
                <li key={i} className="border-t border-background/15 py-8 md:py-10">
                  <div className="flex items-baseline gap-6">
                    {item.step ? (
                      <span className="font-display text-4xl md:text-5xl text-background/25 leading-none tabular-nums flex-shrink-0">
                        {item.step}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center size-9 border border-background/25 flex-shrink-0">
                        <Check className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                    )}
                    <div>
                      <h3 className="font-display text-xl md:text-2xl tracking-tight leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm text-background/70 mt-3 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section className="py-20 md:py-32 bg-background" id="pricing">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            {service.pricingTable && !comingSoon ? (
              <div className="grid lg:grid-cols-12 gap-10 md:gap-16">
                <div className="lg:col-span-5">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                    {service.pricingTable.title ?? 'Pricing'}
                  </p>
                  <h2 className="font-display text-4xl md:text-5xl leading-[1] tracking-[-0.02em]">
                    Clear, itemised pricing.
                  </h2>
                  {service.pricingTable.subtitle && (
                    <p className="text-base text-muted-foreground mt-6 leading-relaxed">
                      {service.pricingTable.subtitle}
                    </p>
                  )}
                  <p className="font-display text-6xl md:text-7xl tracking-[-0.02em] leading-[0.9] mt-10">
                    {service.priceLabel}
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    {service.priceUnit}
                    {service.priceNote ? ` · ${service.priceNote}` : ''}
                  </p>
                </div>
                <div className="lg:col-span-6 lg:col-start-7">
                  <div>
                    {service.pricingTable.rows.map((row, i) => (
                      <div
                        key={i}
                        className="flex items-baseline justify-between gap-6 py-4 border-b border-border/60"
                      >
                        <span className="text-sm md:text-base text-foreground">{row.label}</span>
                        <span className="text-sm md:text-base font-medium tabular-nums whitespace-nowrap">
                          {row.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                  {service.pricingTable.groupLabel && service.pricingTable.groupRows && (
                    <div className="mt-10">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                        {service.pricingTable.groupLabel}
                      </p>
                      {service.pricingTable.groupRows.map((row, i) => (
                        <div
                          key={i}
                          className="flex items-baseline justify-between gap-6 py-4 border-b border-border/60"
                        >
                          <span className="text-sm md:text-base text-foreground">{row.label}</span>
                          <span className="text-sm md:text-base font-medium tabular-nums whitespace-nowrap">
                            {row.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {service.pricingTable.feeBanner && (
                    <div className="mt-10 bg-foreground text-background p-6 md:p-7 flex items-center justify-between gap-6">
                      <div>
                        <p className="font-display text-lg leading-snug">
                          {service.pricingTable.feeBanner.title}
                        </p>
                        <p className="text-xs text-background/70 mt-2 leading-relaxed">
                          {service.pricingTable.feeBanner.body}
                        </p>
                      </div>
                      <p className="font-display text-2xl md:text-3xl whitespace-nowrap">
                        {service.pricingTable.feeBanner.amount}
                      </p>
                    </div>
                  )}
                  {service.pricingTable.notes && service.pricingTable.notes.length > 0 && (
                    <div className="mt-8 space-y-4">
                      {service.pricingTable.notes.map((note, i) => (
                        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                          <span className="text-foreground font-medium">{note.lead}</span>{' '}
                          {note.body}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
            <div className="grid lg:grid-cols-12 gap-10 md:gap-16 items-center">
              <div className="lg:col-span-6">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                  Pricing
                </p>
                {comingSoon ? (
                  <>
                    <p className="font-display text-6xl md:text-7xl lg:text-8xl tracking-[-0.02em] leading-[0.9] text-muted-foreground">
                      Coming soon
                    </p>
                    <p className="text-base text-muted-foreground mt-6">
                      This service isn&apos;t bookable yet. Join the waitlist below and
                      you&apos;ll be the first to know when it launches — with launch pricing
                      for early clients.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-display text-6xl md:text-7xl lg:text-8xl tracking-[-0.02em] leading-[0.9]">
                      {service.priceLabel}
                    </p>
                    <p className="text-base text-muted-foreground mt-6">
                      {service.priceUnit}
                      {service.priceNote ? ` · ${service.priceNote}` : ''}
                    </p>
                  </>
                )}
              </div>
              {comingSoon ? (
                <div className="lg:col-span-5 lg:col-start-8">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    We&apos;re putting the final touches on this service — refining the
                    network, the process, and the guarantees behind it. Nothing launches until
                    it meets the standard the rest of our services are known for.
                  </p>
                  <p className="text-base text-muted-foreground leading-relaxed mt-6">
                    In the meantime, our bookable services cover most briefs — and waitlist
                    clients get priority scheduling and launch pricing when this one opens.
                  </p>
                </div>
              ) : (
                <div className="lg:col-span-5 lg:col-start-8">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Pricing is transparent. You only pay for the service as described — no hidden
                    fees, no minimums, no commissions on items we source for you.
                  </p>
                  <p className="text-base text-muted-foreground leading-relaxed mt-6">
                    For exact quotes on specific briefs, use the enquiry form below. We&apos;ll
                    confirm pricing before any work begins.
                  </p>
                </div>
              )}
            </div>
            )}
          </div>
        </section>

        {/* ─── Testimonial ─── */}
        {service.testimonial && (
          <section className="py-16 md:py-24 bg-secondary/40 border-y border-foreground/10">
            <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
              <p className="eyebrow text-foreground/50 mb-8">From a Wardrobecare client</p>
              <blockquote className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-[-0.01em] text-balance">
                &ldquo;{service.testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-10 flex items-center gap-4">
                <div className="h-px w-12 bg-foreground/30" />
                <div>
                  <p className="text-sm">{service.testimonial.author}</p>
                  <p className="text-xs text-muted-foreground mt-1">{service.testimonial.role}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── FAQ ─── */}
        <section className="py-20 md:py-32 bg-background">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-12 gap-10 md:gap-16">
              <div className="lg:col-span-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                  Frequently Asked
                </p>
                <h2 className="font-display text-3xl md:text-4xl leading-[1] tracking-[-0.02em]">
                  Questions,
                  <br />
                  answered.
                </h2>
              </div>
              <div className="lg:col-span-7 lg:col-start-6">
                <Accordion type="single" collapsible className="w-full">
                  {service.faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/60">
                      <AccordionTrigger className="text-left text-base md:text-lg font-display tracking-tight py-6 hover:no-underline">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-6">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Booking CTA / Waitlist ─── */}
        <section id={comingSoon ? 'notify' : 'book'} className="py-20 md:py-32 bg-secondary/40">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-5">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                  {service.finalCta.title}
                </p>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1] tracking-[-0.02em]">
                  {service.finalCta.body}
                </h2>
                <div className="mt-10 space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground" />
                    <p>Response within 24 hours.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground" />
                    <p>No deposit required to enquire.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground" />
                    <p>Lagos, Abuja, and nationwide.</p>
                  </div>
                </div>
              </div>
              {comingSoon ? (
                <div className="lg:col-span-7 lg:col-start-6 bg-background p-8 md:p-12 border border-border/60">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center justify-center size-10 rounded-full bg-foreground text-background">
                      <Bell className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="font-display text-2xl tracking-tight leading-tight">
                        Join the waitlist
                      </h3>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1">
                        Be first when {service.name} opens
                      </p>
                    </div>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                    Leave your details and you&apos;ll be notified the moment this service
                    launches — waitlist clients get priority scheduling and launch pricing.
                  </p>
                  <a
                    href={whatsappLink(whatsappNumber, waitlistMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-8 inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
                  >
                    Join via WhatsApp
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <p className="text-xs text-muted-foreground mt-4">
                    Opens WhatsApp with a pre-filled waitlist message — no forms, no spam.
                  </p>
                </div>
              ) : (
                <div className="lg:col-span-7 lg:col-start-6 bg-background p-8 md:p-12 border border-border/60">
                  <ServiceEnquiryForm serviceSlug={service.slug} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── Related services ─── */}
        {related.length > 0 && (
          <section className="py-20 md:py-28 bg-background">
            <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
              <div className="flex items-end justify-between mb-10 md:mb-12">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                    Explore more
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl tracking-tight">
                    Related services.
                  </h2>
                </div>
                <Link
                  href="/services"
                  className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground link-underline"
                >
                  All services
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/services/${rel.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <Image
                        src={rel.image}
                        alt={rel.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="font-display text-lg text-background mix-blend-difference">
                          {rel.number}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        {rel.category}
                      </p>
                      <h3 className="font-display text-xl tracking-tight leading-tight">
                        {rel.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2">
                        {rel.comingSoon ? 'Coming Soon' : rel.priceLabel}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
