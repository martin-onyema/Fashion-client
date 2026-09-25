import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ServiceEnquiryForm } from '@/components/services/service-enquiry-form'
import { SERVICES, SERVICE_GROUPS } from '@/lib/services-data'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Services — Personal Shopping, Style Consultations & Premium Sourcing',
  description:
    'Seven ways to work with Wardrobecare — from one-off style consultations to fully sourced, in-home styling. Personal shopping, wardrobe audits, home fittings, premium sourcing, and traditional wear styling in Lagos and nationwide.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Wardrobecare Services — A more personal way to dress well.',
    description:
      'Personal shopping, style consultations, home fittings, premium sourcing, and traditional wear styling. Built around you.',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
        alt: 'A curated rail of premium menswear pieces',
      },
    ],
  },
}

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* ─── Hero ─── */}
        <section className="relative">
          {/* Background image */}
          <div className="absolute inset-0 -z-10">
            <Image
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000&auto=format&fit=crop"
              alt="Premium menswear editorial image"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/40 to-foreground/70" />
          </div>

          <div className="mx-auto max-w-[1600px] px-6 lg:px-10 pt-40 md:pt-48 pb-32 md:pb-40 text-background">
            <p className="text-[11px] uppercase tracking-[0.25em] text-background/80 mb-6">
              Wardrobecare Services
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.02em] max-w-5xl">
              A more personal way to dress well.
            </h1>
            <p className="text-base md:text-lg text-background/85 mt-8 max-w-2xl leading-relaxed">
              Whether you need someone to shop for you, refine your wardrobe, source something
              exceptional, or prepare for an important occasion, our services are designed around you.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href="#book"
                className="group inline-flex items-center gap-3 bg-background text-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-background/90 transition-colors"
              >
                Book a Consultation
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#services"
                className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-background link-underline"
              >
                Explore Services
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

        {/* ─── Intro ─── */}
        <section className="py-20 md:py-32 bg-background">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-12 gap-10 md:gap-16">
              <div className="lg:col-span-5">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                  Seven Ways to Work With Us
                </p>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1] tracking-[-0.02em]">
                  From one-off consultations to fully sourced, in-home styling.
                </h2>
              </div>
              <div className="lg:col-span-6 lg:col-start-7">
                <p className="text-base text-muted-foreground leading-relaxed">
                  Wardrobecare is more than a shop. It&apos;s a styling partner — for one
                  outfit, one occasion, or your entire wardrobe. Whether you need a single piece
                  sourced, a full seasonal refresh, or someone to come fit you at home, we have a
                  service built for it.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed mt-6">
                  Every engagement starts with a brief and ends with you looking — and feeling —
                  exactly the way you want to. No guesswork. No second trips. No buyer&apos;s
                  remorse.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── All 7 Services ─── */}
        <section id="services" className="py-20 md:py-32 bg-secondary/40">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            {/* Group 1: Sourcing */}
            {SERVICE_GROUPS.map((group, gIdx) => (
              <div key={group.label} className={gIdx > 0 ? 'mt-24 md:mt-32' : ''}>
                <div className="grid lg:grid-cols-12 gap-10 items-end mb-12 md:mb-16">
                  <div className="lg:col-span-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                      {group.label}
                    </p>
                    <h3 className="font-display text-3xl md:text-4xl tracking-tight">
                      {group.description}
                    </h3>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {group.services.map((service) => (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      className="group block bg-background border border-border/60 hover:border-foreground transition-colors"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <Image
                          src={service.image}
                          alt={service.imageAlt}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                        />
                        <div className="absolute top-5 left-5">
                          <span className="font-display text-xl text-background mix-blend-difference">
                            {service.number}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 md:p-7">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                          {service.category}
                        </p>
                        <h4 className="font-display text-xl md:text-2xl tracking-tight leading-tight">
                          {service.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-3">
                          {service.tagline}
                        </p>
                        <div className="mt-5 flex items-baseline justify-between border-t border-border/60 pt-4">
                          <div>
                            <span className="text-xs uppercase tracking-[0.18em] text-foreground">
                              {service.priceLabel}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              · {service.priceUnit}
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Booking CTA ─── */}
        <section id="book" className="py-20 md:py-32 bg-background">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
              {/* Left: copy */}
              <div className="lg:col-span-5">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                  Book a Consultation
                </p>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1] tracking-[-0.02em]">
                  Tell us what you need.
                  <br />
                  <span className="text-muted-foreground">We&apos;ll handle the rest.</span>
                </h2>
                <p className="text-base text-muted-foreground mt-8 max-w-md leading-relaxed">
                  Fill out the form and we&apos;ll be in touch within 24 hours to plan the next step —
                  whether that&apos;s a quick WhatsApp call, a home visit, or sourcing a specific piece.
                </p>
                <div className="mt-10 space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground" />
                    <p>No deposit required to enquire.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground" />
                    <p>We respond to every enquiry within 24 hours.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground" />
                    <p>Services available in Lagos, Abuja, and nationwide.</p>
                  </div>
                </div>
              </div>

              {/* Right: form */}
              <div className="lg:col-span-7 lg:col-start-6 bg-secondary/40 p-8 md:p-12">
                <ServiceEnquiryForm />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Cross-link to Shop ─── */}
        <section className="py-20 md:py-28 bg-foreground text-background">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-background/60 mb-3">
                Prefer to browse yourself?
              </p>
              <h3 className="font-display text-3xl md:text-4xl tracking-tight">
                Explore the Shop.
              </h3>
              <p className="text-sm text-background/70 mt-3 max-w-md">
                Five hundred curated pieces across clothing, footwear, accessories, and fragrance.
                Filter by category, size, and price.
              </p>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 bg-background text-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-background/90 transition-colors flex-shrink-0"
            >
              Shop the Collection
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
