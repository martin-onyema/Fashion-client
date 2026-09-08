import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Privacy Policy',
  description:
    'How Wardrobecare Clothing collects, uses and protects your personal information.',
}

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: [
      'When you shop, book a styling service or subscribe to The Wardrobecare List, we collect the information needed to serve you: your name, email address, phone number, WhatsApp number and delivery addresses. For orders, we also keep a record of the items purchased, order values and delivery instructions.',
      'If you use our personal shopping, wardrobe consultation or home fitting services, your stylist may keep style notes such as your sizes, fits and preferences so future sessions and recommendations are accurate. You can ask us to update or delete these notes at any time.',
      'We do not collect or store your card details, bank login credentials or USSD PIN on our website. Payments are processed by our licensed payment partners or settled directly into our designated bank account.',
    ],
  },
  {
    title: 'How We Use Your Information',
    body: [
      'Your information is used to process and deliver orders, confirm payments, arrange deliveries, respond to enquiries sent through WhatsApp or email, and provide the styling services you book. It also allows us to notify you about order status, restocks and delivery updates.',
      'If you subscribe to our newsletter, we use your email address to send style edits, new arrivals and offers. Every marketing email includes an unsubscribe link, and you may also ask us to remove you from our list by contacting us directly.',
      'We may use aggregated, anonymised information to understand how visitors use the site so we can improve the shopping experience. This aggregate data never identifies you personally.',
    ],
  },
  {
    title: 'Payments & Bank Transfers',
    body: [
      'Where card payments are available, they are processed by Paystack, a PCI-DSS compliant payment processor licensed in Nigeria. Your card details go directly to Paystack over an encrypted connection — we never see or store them.',
      'For bank transfers, payments are made to our designated account: Wardrobecare Nigeria Enterprises, Sparkle Bank, account number 1000447933. We store only the payment reference and confirmation status needed to reconcile your order.',
      'Orders placed through WhatsApp are confirmed the same way: once your transfer or payment is verified, your order is processed and you receive updates on WhatsApp.',
    ],
  },
  {
    title: 'How We Share Information',
    body: [
      'We share the minimum information necessary with trusted partners to fulfil your order: courier companies receive your name, address and phone number for delivery, and our payment processors receive the transaction details needed to confirm payment.',
      'We do not sell, rent or trade your personal information to third parties for their own marketing. We will only disclose information where required by law, regulation or a valid legal process.',
    ],
  },
  {
    title: 'Cookies & Analytics',
    body: [
      'Our website uses essential cookies to keep you signed in and remember your shopping cart. We may also use privacy-respecting analytics to understand which pages and products are most useful to visitors.',
      'You can control or delete cookies through your browser settings. Blocking essential cookies may affect features such as sign-in and checkout.',
    ],
  },
  {
    title: 'Data Retention & Security',
    body: [
      'We keep your order and account information for as long as your account is active or as needed to comply with tax, accounting and legal obligations in Nigeria. You may request deletion of your account and personal data at any time, subject to those legal retention requirements.',
      'We apply reasonable technical and organisational safeguards — including encrypted connections (HTTPS) and restricted access to administrative systems — to protect your information against unauthorised access, loss or misuse.',
    ],
  },
  {
    title: 'Your Rights & Contact',
    body: [
      'You have the right to access the personal information we hold about you, request corrections, ask for deletion, and withdraw consent for marketing at any time. To exercise any of these rights, reach out and we will respond promptly.',
      'Wardrobecare Clothing · wardrobecare@gmail.com · WhatsApp 0802 613 3770 · Lagos, Nigeria.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-16 md:py-24">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Privacy
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1] tracking-[-0.02em] mb-6">
            Your data, respected.
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed mb-16">
            This policy explains what information Wardrobecare Clothing collects, why we
            collect it, and the choices you have. It applies to this website, our WhatsApp
            ordering line and our styling services.
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
