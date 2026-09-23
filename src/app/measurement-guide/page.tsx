import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Ruler } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'How to Measure Yourself — Measurement Guide | Wardrobecare',
  description:
    'The 8 key measurements for shirts, trousers, footwear and fitted native wear — plus the general size chart (S–7XL) and traditional wear sizing guidance for agbada, kaftan and senator pieces.',
  alternates: { canonical: '/measurement-guide' },
  openGraph: {
    title: 'How to Measure Yourself | Wardrobecare',
    description:
      'A few minutes with a tape measure now saves a back-and-forth exchange later. The 8 key measurements, the general size chart, and traditional wear sizing.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Measure Yourself | Wardrobecare',
    description:
      'The 8 key measurements, the general size chart, and traditional wear sizing guidance.',
  },
}

// ─── /measurement-guide — Mockup 25 structure 1:1 ────────────────────────────
// Customer-care content page: the 8 key measurements, the general size chart,
// traditional wear sizing, and the "still not sure?" route into services.

const TOC = [
  ['#measurements', 'The 8 Key Measurements'],
  ['#size-chart', 'General Size Chart'],
  ['#traditional', 'Traditional Wear Sizing'],
  ['#not-sure', 'Still Not Sure?'],
] as const

const MEASUREMENTS = [
  {
    n: '01',
    name: 'Neck',
    body: 'Wrap the tape around the base of your neck, where a collar would sit. How much slack you leave depends on the occasion:',
    points: [
      'Formal, requires a tie: no slack at all around the collar.',
      'Smart casual, closed collar, no tie: one finger’s width of slack.',
      'Traditional — buba, senator, or any loose-fit top: one to two fingers’ width of slack.',
    ],
  },
  {
    n: '02',
    name: 'Chest',
    body: 'Measure around the fullest part of your chest, under the arms and across the shoulder blades, tape level all the way round. The same slack rule as Neck applies — none for formal, one finger for smart casual, one to two fingers for traditional or any loose fit.',
    points: [],
  },
  {
    n: '03',
    name: 'Waist',
    body: 'Measure around your natural waistline with no slack at all — the tape should feel exactly like a trouser sitting tight around your waist without a belt holding it up.',
    points: [],
  },
  {
    n: '04',
    name: 'Hips',
    body: 'Measure around the fullest part of your hips and seat, keeping the tape parallel to the floor.',
    points: [],
  },
  {
    n: '05',
    name: 'Shoulder Width',
    body: 'Measure across your back from the edge of one shoulder to the edge of the other, where a seam would naturally fall.',
    points: [],
  },
  {
    n: '06',
    name: 'Sleeve Length',
    body: 'With your arm slightly bent, measure from the shoulder edge, down the outside of the arm, to just past the wrist bone.',
    points: [],
  },
  {
    n: '07',
    name: 'Inseam',
    body: 'Measure from the top of your inner thigh straight down to where you want the trouser to end at your ankle.',
    points: [],
  },
  {
    n: '08',
    name: 'Shoe Size',
    body: 'Your regular, comfortable shoe is your true size. Measure that shoe’s length in inches or centimetres — a universal measurement — then convert it to whichever country’s sizing system you need for an accurate fit.',
    points: [],
  },
]

const SIZE_CHART: [string, string, string, string][] = [
  ['S', '90–96', '76–81', '36–38'],
  ['M', '97–102', '82–87', '39–40'],
  ['L', '103–109', '88–94', '41–42'],
  ['XL', '110–116', '95–101', '43–44'],
  ['XXL', '117–123', '102–108', '45–46'],
  ['3XL', '124–130', '109–115', '47–48'],
  ['4XL', '131–137', '116–122', '49–50'],
  ['5XL', '138–144', '123–129', '51–52'],
  ['6XL', '145–151', '130–136', '53–54'],
  ['7XL', '152–158', '137–143', '55–56'],
]

export default function MeasurementGuidePage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* ─── Hero ─── */}
        <section className="pt-40 md:pt-48 pb-14 border-b border-border/60">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-8">
              Customer Care
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.02em] text-balance max-w-5xl">
              How to Measure Yourself
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mt-8">
              Accurate measurements are the difference between a piece that fits and one that just
              about does. A few minutes with a tape measure now saves a back-and-forth exchange
              later.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-14 md:py-20">
          {/* ─── What you'll need ─── */}
          <div className="bg-secondary/40 border-l-2 border-foreground p-5 md:p-6 mb-12">
            <p className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
              <Ruler className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} aria-hidden />
              <span>
                <span className="text-foreground font-medium">What you&apos;ll need:</span> a
                flexible tape measure, a mirror, and — if you can — a second person to help. Measure
                over light clothing, or just your underwear — not bulky layers.
              </span>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              <span className="text-foreground font-medium">Note:</span> how tight or snug the tape
              sits is the real difference between a fitted and a free/loose fit — pay attention to
              this everywhere it matters, not just at the neck and chest.
            </p>
          </div>

          {/* ─── Table of contents ─── */}
          <nav aria-label="Guide sections" className="mb-16">
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
            {/* ─── The 8 Key Measurements ─── */}
            <section id="measurements" className="scroll-mt-32">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 mb-10">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    01
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    The 8 Key Measurements
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    These cover almost everything we sell — shirts, trousers, footwear, and fitted
                    native wear.
                  </p>
                </div>
              </div>

              <dl className="border-t border-border">
                {MEASUREMENTS.map((m) => (
                  <div
                    key={m.n}
                    className="grid md:grid-cols-12 gap-3 md:gap-10 py-7 md:py-8 border-b border-border/60"
                  >
                    <dt className="md:col-span-4">
                      <span className="font-display text-2xl md:text-3xl text-muted-foreground/50 tabular-nums block mb-1">
                        {m.n}
                      </span>
                      <span className="font-display text-xl md:text-2xl tracking-[-0.01em]">
                        {m.name}
                      </span>
                    </dt>
                    <dd className="md:col-span-7 md:col-start-6">
                      <p className="text-sm text-muted-foreground leading-relaxed">{m.body}</p>
                      {m.points.length > 0 && (
                        <ul className="space-y-2 mt-4">
                          {m.points.map((p) => (
                            <li
                              key={p}
                              className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed"
                            >
                              <span
                                className="mt-2 h-px w-4 bg-muted-foreground flex-shrink-0"
                                aria-hidden
                              />
                              {p}
                            </li>
                          ))}
                        </ul>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* ─── General Size Chart ─── */}
            <section id="size-chart" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4 min-w-0">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    02
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    General Size Chart
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6 min-w-0">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    A starting reference, not a guarantee — sizing still varies by brand and cut.
                    When in doubt, go with your actual measurements above rather than a size label.
                  </p>
                  <div className="overflow-x-auto border border-border/60">
                    <table className="w-full text-sm min-w-[420px]">
                      <caption className="sr-only">
                        General size chart — chest, waist and neck in centimetres by letter size
                      </caption>
                      <thead>
                        <tr className="bg-secondary/60 border-b border-border/60 text-left">
                          <th className="px-5 py-3.5 text-[10px] uppercase tracking-[0.18em] font-medium text-muted-foreground">
                            Size
                          </th>
                          <th className="px-5 py-3.5 text-[10px] uppercase tracking-[0.18em] font-medium text-muted-foreground">
                            Chest (cm)
                          </th>
                          <th className="px-5 py-3.5 text-[10px] uppercase tracking-[0.18em] font-medium text-muted-foreground">
                            Waist (cm)
                          </th>
                          <th className="px-5 py-3.5 text-[10px] uppercase tracking-[0.18em] font-medium text-muted-foreground">
                            Neck (cm)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {SIZE_CHART.map(([size, chest, waist, neck]) => (
                          <tr key={size} className="border-b border-border/40 last:border-b-0">
                            <td className="px-5 py-3 font-medium">{size}</td>
                            <td className="px-5 py-3 tabular-nums text-muted-foreground">{chest}</td>
                            <td className="px-5 py-3 tabular-nums text-muted-foreground">{waist}</td>
                            <td className="px-5 py-3 tabular-nums text-muted-foreground">{neck}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                    Figures are approximate and rounded for general guidance — always give us your
                    actual measurements when booking a service or ordering a fitted piece.
                  </p>
                </div>
              </div>
            </section>

            {/* ─── Traditional Wear Sizing ─── */}
            <section id="traditional" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    03
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Traditional Wear Sizing
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    Agbada, kaftan, and senator pieces don&apos;t always follow the same sizing
                    logic as Western wear — fit is often about drape and proportion as much as exact
                    measurement.
                  </p>
                  <div className="bg-secondary/40 border-l-2 border-foreground p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="text-foreground font-medium">Our recommendation:</span> for
                      agbada, kaftan, senator, or any fusion piece, give us your height alongside
                      the 8 measurements above. A{' '}
                      <Link
                        href="/services/style-wardrobe-consultation"
                        className="link-underline text-foreground"
                      >
                        Wardrobe &amp; Style Consultation
                      </Link>{' '}
                      or a{' '}
                      <Link
                        href="/services/traditional-wear-consultation"
                        className="link-underline text-foreground"
                      >
                        Traditional Wear Consultation
                      </Link>{' '}
                      (Coming Soon) is the more reliable route for these pieces than
                      self-measuring alone.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── Still Not Sure? ─── */}
            <section id="not-sure" className="scroll-mt-32 border-t border-border/60 pt-12">
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
                <div className="lg:col-span-4">
                  <p className="text-[11px] tabular-nums uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    04
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                    Still Not Sure?
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-10">
                    If any of this feels like guesswork, that&apos;s completely normal — most people
                    haven&apos;t measured themselves properly before.{' '}
                    <Link href="/services/home-fitting" className="link-underline text-foreground">
                      Home Fitting
                    </Link>{' '}
                    (via Personal Shopping&apos;s In-Person Fitting) or a{' '}
                    <Link
                      href="/services/style-wardrobe-consultation"
                      className="link-underline text-foreground"
                    >
                      Wardrobe &amp; Style Consultation
                    </Link>{' '}
                    will get you accurate numbers with a real person doing the measuring.
                  </p>
                  <div className="bg-foreground text-background p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h3 className="font-display text-2xl md:text-3xl tracking-[-0.01em] text-balance">
                      Ready to shop, or want us to measure you properly?
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                      <Link
                        href="/shop"
                        className="group inline-flex items-center justify-center gap-3 bg-background text-foreground px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] hover:bg-background/90 transition-colors whitespace-nowrap"
                      >
                        Shop Now
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        href="/services/style-wardrobe-consultation"
                        className="inline-flex items-center justify-center gap-2 border border-background/40 px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] hover:border-background transition-colors whitespace-nowrap"
                      >
                        Book a Consultation
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
