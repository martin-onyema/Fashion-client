import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Truck, Clock, MapPin, Package } from 'lucide-react'

export const metadata = {
  title: 'Shipping',
  description: 'Shipping information for Wardrobecare Clothing orders across Nigeria.',
}

export default function ShippingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-16 md:py-24">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Shipping
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1] tracking-[-0.02em] mb-6">
            Delivery, simplified.
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed mb-16">
            We ship across Nigeria with care. Here&apos;s what to expect when you place an order with Wardrobecare.
          </p>

          {/* Quick stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="border-t border-foreground pt-4">
              <Clock className="h-5 w-5 mb-3" strokeWidth={1.5} />
              <p className="font-display text-3xl mb-1">1–2</p>
              <p className="text-xs text-muted-foreground">days to Lagos</p>
            </div>
            <div className="border-t border-foreground pt-4">
              <Clock className="h-5 w-5 mb-3" strokeWidth={1.5} />
              <p className="font-display text-3xl mb-1">2–5</p>
              <p className="text-xs text-muted-foreground">days to other states</p>
            </div>
            <div className="border-t border-foreground pt-4">
              <Truck className="h-5 w-5 mb-3" strokeWidth={1.5} />
              <p className="font-display text-3xl mb-1">₦2,500</p>
              <p className="text-xs text-muted-foreground">flat delivery fee</p>
            </div>
            <div className="border-t border-foreground pt-4">
              <Package className="h-5 w-5 mb-3" strokeWidth={1.5} />
              <p className="font-display text-3xl mb-1">Free</p>
              <p className="text-xs text-muted-foreground">over ₦50,000</p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            <section>
              <h2 className="font-display text-2xl md:text-3xl mb-4">Where We Ship</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We currently ship to all 36 states of Nigeria, including the Federal Capital Territory (Abuja). Orders are dispatched from Lagos and delivered via trusted local courier partners. For international delivery requests, please contact us via WhatsApp — we&apos;ll do our best to accommodate.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl mb-4">Processing Time</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Orders are processed within 24 hours of payment confirmation (excluding weekends and public holidays). Once your order is processed, you&apos;ll receive a notification with tracking information.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For WhatsApp orders, processing begins once our team confirms availability and payment with you directly.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl mb-4">Delivery Fees</h2>
              <div className="border border-border p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Standard delivery (nationwide)</span>
                  <span className="tabular-nums">₦2,500</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Complimentary delivery</span>
                  <span className="tabular-nums">Orders over ₦50,000</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-border">
                  <span className="text-muted-foreground">Express delivery (Lagos only)</span>
                  <span className="tabular-nums">Available on request</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Delivery fees are calculated at checkout and are non-refundable for returned orders, except in cases of defective or incorrect items.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl mb-4">Tracking Your Order</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once your order ships, you&apos;ll receive a tracking number via email and SMS. You can also track your order anytime using our <a href="/track-order" className="underline underline-offset-4 hover:text-foreground">Order Tracking</a> page — just enter your order number.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl mb-4">Delivery Partner</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We work with established Nigerian courier services to ensure your order arrives safely and on time. Our delivery partners will contact you before delivery to confirm your availability.
              </p>
            </section>

            <section className="border-t border-border pt-8">
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 mt-1 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-medium mb-1">Need help with delivery?</h3>
                  <p className="text-sm text-muted-foreground">
                    If you have any delivery-related questions or special requirements, please reach out via WhatsApp before placing your order.
                  </p>
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
