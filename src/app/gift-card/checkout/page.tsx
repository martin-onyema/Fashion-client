import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { db } from '@/lib/db'
import { GiftCardWizard } from './gift-card-wizard'

// Reads live admin settings from the DB on every request — must never be
// prerendered at build time (build machines may not have DATABASE_URL).
export const dynamic = 'force-dynamic'

// Checkout is a transactional utility page — keep it out of search indexes.
export const metadata: Metadata = {
  title: 'Gift Card Checkout — Wardrobecare',
  description: 'Choose an amount, tell us who he is, and send a Wardrobecare gift card.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/gift-card/checkout' },
}

export default async function GiftCardCheckoutPage() {
  const settings = await db.adminSettings.findUnique({ where: { id: 'singleton' } })

  const bank = {
    name: settings?.bankName || 'Sparkle Bank',
    accountName: settings?.bankAccountName || 'Wardrobecare Nigeria Enterprises',
    accountNumber: settings?.bankAccountNumber || '1000447933',
    instructions: settings?.bankTransferInstructions || '',
  }
  const whatsappNumber = settings?.whatsappNumber || '2348026133770'

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-[900px] px-6 lg:px-10 pt-32 md:pt-40 pb-20 md:pb-28">
          {/* Header */}
          <div className="mb-10">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Outfit Gifting — Gift Card
            </p>
            <h1 className="font-display text-4xl md:text-6xl leading-[1] tracking-[-0.02em] text-balance">
              Send a gift card
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mt-5 max-w-xl">
              Pick a location in step 2 and watch the delivery fee and total update live in step
              3 — total = gift card amount + delivery fee for his location.
            </p>
          </div>

          <GiftCardWizard bank={bank} whatsappNumber={whatsappNumber} />
        </div>
      </main>
      <Footer />
    </>
  )
}
