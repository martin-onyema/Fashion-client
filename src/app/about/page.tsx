import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { getAdminSettings, getCategories } from '@/lib/queries'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'About',
  description: 'Wardrobecare Clothing is your #1 personal shopper for premium men\'s fashion in Nigeria.',
}

export default async function AboutPage() {
  const [settings, categories] = await Promise.all([
    getAdminSettings(),
    getCategories(),
  ])

  const topLevelCats = categories.filter((c) => !c.parentId).slice(0, 6)

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* Hero */}
        <section className="relative h-[60vh] min-h-[400px] bg-foreground overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=2000&auto=format&fit=crop"
            alt="Wardrobecare editorial"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto max-w-[1600px] px-6 lg:px-10 pb-12 md:pb-16 w-full">
              <p className="text-[10px] uppercase tracking-[0.3em] text-background/70 mb-4">
                About Wardrobecare
              </p>
              <h1 className="font-display text-background text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.02em]">
                Wardrobecare
              </h1>
            </div>
          </div>
        </section>

        {/* Brand statement */}
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6 text-center">
              Our Positioning
            </p>
            <p className="font-display text-2xl md:text-4xl leading-[1.3] tracking-[-0.01em] text-center">
              {settings?.storeTagline ?? "Your #1 Personal Shopper for premium men's fashion."}
            </p>
            <div className="mt-12 space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
              <p>
                Wardrobecare Clothing is a Nigerian premium men&apos;s fashion and personal-shopping business built around a single idea: that the modern man deserves a wardrobe curated with intention — not a pile of random pieces, but a thoughtful edit of clothing, footwear, accessories and grooming that works together.
              </p>
              <p>
                We operate at the intersection of editorial taste and everyday practicality. Every piece in our catalogue is selected to serve a purpose in the wardrobe of a man who values how he shows up — at work, on weekends, at the occasion, and everywhere between.
              </p>
              <p>
                Beyond the catalogue itself, we offer a personal-shopping experience. Whether you prefer the convenience of online checkout secured by Paystack or the human touch of ordering via WhatsApp, we exist to make premium menswear accessible, trustworthy, and quietly excellent.
              </p>
            </div>
          </div>
        </section>

        {/* What we offer */}
        <section className="bg-secondary/40 py-20 md:py-32">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
              What We Offer
            </p>
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1] tracking-[-0.02em] mb-12 md:mb-16 max-w-2xl">
              The rooms of the wardrobe.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {topLevelCats.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${c.slug}`}
                  className="group border-t border-foreground pt-6"
                >
                  <p className="text-[10px] tabular-nums text-muted-foreground mb-2">0{i + 1}</p>
                  <h3 className="font-display text-2xl md:text-3xl mb-2 group-hover:translate-x-1 transition-transform duration-500">
                    {c.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {c.children.length} subcategories
                  </p>
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
                    Shop {c.name}
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Personal shopping */}
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                  Personal Shopping
                </p>
                <h2 className="font-display text-4xl md:text-6xl leading-[1] tracking-[-0.02em] mb-6">
                  Style, on your terms.
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  For many of our customers, shopping isn&apos;t a transaction — it&apos;s a conversation. That&apos;s why every product page on Wardrobecare carries an &ldquo;Order via WhatsApp&rdquo; button. Tap it, and you&apos;ll be connected directly with our team.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed mb-8">
                  We&apos;ll confirm availability, advise on fit, arrange delivery, and answer any question — large or small. It&apos;s the kind of service a personal shopper should provide, delivered with the convenience of modern commerce.
                </p>
                <a
                  href={`https://wa.me/${settings?.whatsappNumber ?? '2348000000000'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
                >
                  Chat on WhatsApp
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
                  alt="Wardrobecare personal shopping"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="bg-foreground text-background py-20 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-background/60 mb-6">
              Brand Philosophy
            </p>
            <p className="font-display text-2xl md:text-4xl lg:text-5xl leading-[1.3] tracking-[-0.01em]">
              &ldquo;We don&apos;t sell clothes. We curate confidence — one considered piece at a time.&rdquo;
            </p>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-background/50 mb-1">Premium</p>
                <p className="text-sm">Materials and construction that earn their place.</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-background/50 mb-1">Confidence</p>
                <p className="text-sm">Clothing that helps you show up as your best self.</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-background/50 mb-1">Convenience</p>
                <p className="text-sm">Online checkout or WhatsApp — your choice.</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-background/50 mb-1">Modern</p>
                <p className="text-sm">A wardrobe that fits today&apos;s man, not yesterday&apos;s.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
