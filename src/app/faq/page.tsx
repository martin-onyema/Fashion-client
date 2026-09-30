import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { getFAQs } from '@/lib/queries'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Link from 'next/link'

export const metadata = {
  title: 'FAQs',
  description: 'Common questions about shopping with Wardrobecare Clothing.',
}

export default async function FAQPage() {
  const faqs = await getFAQs()

  // Group by category
  const byCategory = faqs.reduce((acc, f) => {
    const cat = f.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(f)
    return acc
  }, {} as Record<string, typeof faqs>)

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-16 md:py-24">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Help Centre
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1] tracking-[-0.02em] mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed mb-16">
            Everything you need to know about shopping with Wardrobecare — from placing an order to delivery, returns, and personal shopping via WhatsApp.
          </p>

          {Object.entries(byCategory).map(([category, items]) => (
            <section key={category} className="mb-12">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-5 pb-2 border-b border-border">
                {category}
              </h2>
              <Accordion type="single" collapsible className="space-y-1">
                {items.map((f) => (
                  <AccordionItem key={f.id} value={f.id} className="border-b border-border/60">
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline py-5">
                      {f.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                      {f.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}

          {/* Contact CTA */}
          <section className="mt-16 border border-border p-8 md:p-12 text-center">
            <h3 className="font-display text-2xl md:text-3xl mb-3">Still have questions?</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Our team is available via WhatsApp for any question, large or small.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/track-order"
                className="inline-flex items-center justify-center bg-foreground text-background px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
              >
                Track Order
              </Link>
              <a
                href="https://wa.me/2348000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-foreground px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
