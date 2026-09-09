import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ServiceEnquiryForm } from '@/components/services/service-enquiry-form'
import { getServiceBySlug, getRelatedServices } from '@/lib/services-data'
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
  const settings = await db.adminSettings.findUnique({ where: { id: 'singleton' } })
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* ─── Hero ─── */}
        <section className="relative bg-foreground">
          <div className="absolute inset-0">
            {service.imageMobile ? (
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet={`${service.imageMobile} 800w`}
                  sizes="100vw"
                />
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              </picture>
            ) : (
              <Image
                src={service.image}
                alt={service.imageAlt}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/40 to-foreground/75" />
          </div>

          <div className="mx-auto max-w-[1600px] px-6 lg:px-10 pt-40 md:pt-48 pb-24 md:pb-32 text-background">
            <div className="max-w-5xl">
              <p className="text-[11px] uppercase tracking-[0.25em] text-background/80 mb-6">
                Service {service.number} — {service.category}
              </p>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.02em]">
                {service.name}
              </h1>
              <p className="text-base md:text-lg text-background/85 mt-8 max-w-2xl leading-relaxed">
                {service.description}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <a
                  href={comingSoon ? '#notify' : '#book'}
                  className="group inline-flex items-center gap-3 bg-background text-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-background/90 transition-colors"
                >
                  {comingSoon ? 'Join the Waitlist' : 'Book This Service'}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
                {comingSoon ? (
                  <span className="inline-flex items-center gap-2 border border-background/40 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-background">
                    <span className="size-1.5 rounded-full bg-background/70" />
                    Coming Soon
                  </span>
                ) : (
                  <div className="text-background">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-background/70">
                      {service.priceLabel}
                    </p>
                    <p className="text-xs text-background/60 mt-1">
                      {service.priceUnit}
                      {service.priceNote ? ` · ${service.priceNote}` : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Breadcrumb ─── */}
        <section className="py-6 border-b border-border/60 bg-background">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
              <span>/</span>
              <span className="text-foreground">{service.name}</span>
            </nav>
          </div>
        </section>

        {/* ─── Who It's For ─── */}
        <section className="py-20 md:py-32 bg-background">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-12 gap-10 md:gap-16">
              <div className="lg:col-span-5">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                  Who it&apos;s for
                </p>
                <h2 className="font-display text-4xl md:text-5xl leading-[1] tracking-[-0.02em]">
                  Built for the way you actually dress.
                </h2>
              </div>
              <div className="lg:col-span-6 lg:col-start-7">
                <ul className="space-y-5">
                  {service.whoFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 pb-5 border-b border-border/60 last:border-0">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1 flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-base text-foreground leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── What's Included / How it works ─── */}
        <section className="py-20 md:py-32 bg-secondary/40">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="max-w-3xl mb-12 md:mb-16">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                {service.whatsIncluded[0]?.step ? 'How it works' : 'What&apos;s included'}
              </p>
              <h2 className="font-display text-4xl md:text-5xl leading-[1] tracking-[-0.02em]">
                {service.whatsIncluded[0]?.step
                  ? 'A clear, structured process.'
                  : 'Everything you get.'}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {service.whatsIncluded.map((item, i) => (
                <div
                  key={i}
                  className="bg-background p-8 md:p-10 border border-border/60 flex flex-col"
                >
                  {item.step && (
                    <span className="font-display text-4xl md:text-5xl text-muted-foreground/40 mb-6">
                      {item.step}
                    </span>
                  )}
                  {!item.step && (
                    <div className="mb-6">
                      <Check className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                    </div>
                  )}
                  <h3 className="font-display text-xl md:text-2xl tracking-tight leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section className="py-20 md:py-32 bg-background">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
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
          </div>
        </section>

        {/* ─── Testimonial ─── */}
        {service.testimonial && (
          <section className="py-20 md:py-32 bg-foreground text-background">
            <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
              <p className="text-[11px] uppercase tracking-[0.25em] text-background/60 mb-8">
                From a Wardrobecare client
              </p>
              <blockquote className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-[-0.01em]">
                &ldquo;{service.testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-10 flex items-center gap-4">
                <div className="h-px w-12 bg-background/40" />
                <div>
                  <p className="text-sm text-background">{service.testimonial.author}</p>
                  <p className="text-xs text-background/60 mt-1">{service.testimonial.role}</p>
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
