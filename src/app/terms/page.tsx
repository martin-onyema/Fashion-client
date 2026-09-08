import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Terms of Service',
  description:
    'Terms of service for shopping and booking styling services with Wardrobecare Clothing.',
}

const SECTIONS = [
  {
    title: 'About These Terms',
    body: [
      'These terms govern your use of this website and any order you place with Wardrobecare Clothing ("Wardrobecare", "we", "us"), operated by Wardrobecare Nigeria Enterprises in Lagos, Nigeria. By placing an order, booking a service or creating an account, you agree to these terms.',
      'Wardrobecare is a personal shopping and menswear company: we sell curated clothing, footwear and accessories, and we provide styling services including personal shopping, style and wardrobe consultations, home fittings, outfit gifting and traditional wear consultation.',
    ],
  },
  {
    title: 'Orders & Acceptance',
    body: [
      'Placing an order on the website or via WhatsApp is an offer to purchase. An order is accepted once we confirm availability and receive payment (or payment confirmation, for bank transfers). We may decline or cancel an order if an item is out of stock, if payment cannot be verified, or where an error in price or product information occurs — in which case you will be notified and any payment made will be refunded.',
      'Product images are for presentation. Colours may vary slightly between screens, and measurements are approximate. Where sizing matters, our team is available on WhatsApp to help you choose before you pay.',
    ],
  },
  {
    title: 'Pricing & Payment',
    body: [
      'All prices are shown in Nigerian Naira (₦) and include applicable taxes unless stated otherwise. Delivery fees are shown at checkout: a flat ₦2,500 within Nigeria, free on orders over ₦50,000.',
      'We accept payment by bank transfer to Wardrobecare Nigeria Enterprises, Sparkle Bank, account number 1000447933; by WhatsApp order confirmation; and by card where available, processed securely through Paystack. Bank transfer orders are held for 24 hours pending payment confirmation.',
      'We do not store your card details. Card transactions are handled entirely by our PCI-DSS compliant payment processor.',
    ],
  },
  {
    title: 'Styling Services',
    body: [
      'Service bookings (personal shopping, consultations, home fittings, gifting and sourcing briefs) are confirmed once the session fee, where applicable, is paid and a date is agreed. Styling fees cover our time, curation and expertise — they do not include the price of clothing or accessories, which you only pay for if you choose to keep them.',
      'Rescheduling is free with at least 24 hours notice. Missed appointments without notice may forfeit the session fee. If a stylist needs to reschedule, we will offer you the next available slot or a full refund of the session fee.',
    ],
  },
  {
    title: 'Delivery & Risk',
    body: [
      'Lagos deliveries typically arrive within 1–2 business days and other states within 2–5 business days after payment confirmation. You will receive delivery updates through your preferred contact channel.',
      'Ownership and risk pass to you on delivery to the address or the person you nominated. Please inspect your order on arrival — report any issue within 48 hours so we can resolve it quickly.',
    ],
  },
  {
    title: 'Returns & Exchanges',
    body: [
      'Unworn items in original condition with tags may be returned or exchanged within the window described on our Returns page. Custom-sourced, altered and clearance items may be final sale — this is stated on the product page before you pay.',
      'To start a return or exchange, contact us with your order number via WhatsApp or email and we will guide you through the process.',
    ],
  },
  {
    title: 'Acceptable Use',
    body: [
      'You agree not to misuse this website: no attempts to breach security, scrape content at scale, place fraudulent orders, or infringe the intellectual property of Wardrobecare or our partners. The site content — text, imagery, layout and branding — belongs to Wardrobecare Clothing and may not be copied for commercial use without permission.',
    ],
  },
  {
    title: 'Liability & Governing Law',
    body: [
      'To the extent permitted by Nigerian law, our liability for any claim relating to an order or service is limited to the amount you paid for that order or service. We are not liable for indirect losses such as missed events or opportunities arising from delivery delays outside our control.',
      'These terms are governed by the laws of the Federal Republic of Nigeria. Disputes will first be addressed through good-faith discussion — contact us and we will work to resolve any issue fairly.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'Questions about these terms? Reach us at wardrobecare@gmail.com or on WhatsApp at 0802 613 3770. Business address: Lagos, Nigeria.',
    ],
  },
]

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-16 md:py-24">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Terms
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1] tracking-[-0.02em] mb-6">
            Fair, simple terms.
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed mb-16">
            The ground rules for shopping with Wardrobecare Clothing and booking our
            styling services — written plainly, so there are no surprises.
          </p>

          <div className="space-y-12">
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h2 className="font-display text-2xl md:text-3xl mb-4">{s.title}</h2>
                <div className="space-y-4">
                  {s.body.map((p, i) => (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <section className="border-t border-border pt-8">
              <p className="text-xs text-muted-foreground">
                Last updated: September 2026 · Wardrobecare Clothing, Lagos, Nigeria
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
