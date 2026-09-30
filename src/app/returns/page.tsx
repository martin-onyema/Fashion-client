import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { RotateCcw, Check, X, Clock } from 'lucide-react'

export const metadata = {
  title: 'Returns',
  description: 'Return policy for Wardrobecare Clothing orders.',
}

export default function ReturnsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-16 md:py-24">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Returns & Exchanges
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1] tracking-[-0.02em] mb-6">
            Return Policy
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed mb-16">
            We want you to love every piece in your Wardrobecare wardrobe. If something isn&apos;t right, here&apos;s how returns and exchanges work.
          </p>

          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            <div className="border-t border-foreground pt-4">
              <Clock className="h-5 w-5 mb-3" strokeWidth={1.5} />
              <p className="font-display text-3xl mb-1">7 Days</p>
              <p className="text-xs text-muted-foreground">to initiate a return</p>
            </div>
            <div className="border-t border-foreground pt-4">
              <RotateCcw className="h-5 w-5 mb-3" strokeWidth={1.5} />
              <p className="font-display text-3xl mb-1">Original</p>
              <p className="text-xs text-muted-foreground">condition required</p>
            </div>
            <div className="border-t border-foreground pt-4">
              <Check className="h-5 w-5 mb-3" strokeWidth={1.5} />
              <p className="font-display text-3xl mb-1">Refund</p>
              <p className="text-xs text-muted-foreground">within 5–7 business days</p>
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="font-display text-2xl md:text-3xl mb-4">Eligible Returns</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Items can be returned within 7 days of delivery, provided they meet all of the following conditions:
              </p>
              <ul className="space-y-2">
                {[
                  'Item is unworn, unwashed, and without stains or damage',
                  'All original tags and packaging are intact',
                  'Item is in its original condition with no alterations',
                  'Return is initiated within 7 days of delivery',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 mt-0.5 text-green-700 flex-shrink-0" strokeWidth={1.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl mb-4">Non-Returnable Items</h2>
              <ul className="space-y-2">
                {[
                  'Sale or clearance items (final sale)',
                  'Fragrance and grooming products (for hygiene reasons)',
                  'Innerwear and socks (for hygiene reasons)',
                  'Items damaged after delivery',
                  'Items returned without original packaging',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <X className="h-4 w-4 mt-0.5 text-red-700 flex-shrink-0" strokeWidth={1.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl mb-4">How to Initiate a Return</h2>
              <ol className="space-y-4">
                {[
                  { step: '1', text: 'Contact us via WhatsApp with your order number and the item(s) you wish to return.' },
                  { step: '2', text: 'Our team will review your request and confirm eligibility within 24 hours.' },
                  { step: '3', text: 'Once approved, package the item(s) securely with all original tags and packaging.' },
                  { step: '4', text: 'Ship the package to the address provided by our team. We recommend using a tracked courier service.' },
                  { step: '5', text: 'Once we receive and inspect the returned item(s), a refund will be processed within 5–7 business days to the original payment method.' },
                ].map((item) => (
                  <li key={item.step} className="flex gap-4">
                    <span className="font-display text-2xl text-muted-foreground tabular-nums flex-shrink-0">{item.step}</span>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">{item.text}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl mb-4">Exchanges</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We offer exchanges for size only, subject to stock availability. To request an exchange, follow the same process as a return and indicate the size you&apos;d like to exchange for. If the requested size is unavailable, we&apos;ll process a refund instead.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl mb-4">Refund Processing</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Refunds are processed to the original payment method within 5–7 business days of receiving and inspecting the returned item. For Paystack payments, the refund will appear on your card or bank statement within 5–10 business days, depending on your bank. For WhatsApp or bank transfer orders, refunds are issued via bank transfer to your Nigerian bank account.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl mb-4">Defective or Incorrect Items</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you receive a defective or incorrect item, please contact us via WhatsApp within 48 hours of delivery with photos of the item. We&apos;ll arrange a replacement or full refund at no cost to you, including return shipping.
              </p>
            </section>

            <section className="border-t border-border pt-8">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Wardrobecare Clothing reserves the right to refuse returns that do not meet the eligibility criteria above. All return decisions are made at our discretion and communicated clearly to the customer.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
