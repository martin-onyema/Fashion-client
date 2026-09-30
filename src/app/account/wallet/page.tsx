import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AccountShell } from '@/components/account/account-shell'
import { requireUser } from '@/lib/session'
import { formatNGN } from '@/lib/format'
import { ArrowRight, Wallet, Plus, Gift, Repeat, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Wallet',
  robots: { index: false, follow: false },
}

// ─── /account/wallet — Mockup 31 structure 1:1 ───────────────────────────────
// "Real account page, honest empty states, Top-Up/Referral marked Coming
// Soon." The wallet holds Wardrobecare store credit from approved
// change-of-mind exchanges (see /returns). Nothing is simulated: an empty
// wallet shows an empty wallet.

const COMING_SOON = (
  <span className="inline-flex items-center border border-border text-[10px] uppercase tracking-[0.14em] text-muted-foreground px-3 py-1.5 whitespace-nowrap">
    Coming Soon
  </span>
)

export default async function WalletPage() {
  const user = await requireUser()

  return (
    <>
      <Navbar />
      <AccountShell
        title="My Wallet"
        description="Store credit from approved exchanges — ready for your next order."
      >
        <div className="space-y-10">
          {/* ─── Balance card ─── */}
          <section aria-label="Wallet balance">
            <div className="bg-[#121110] text-[#f7f6f3] p-8 md:p-12">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#f7f6f3]/50 mb-6 flex items-center gap-2">
                    <Wallet className="size-4" strokeWidth={1.5} />
                    Wallet balance
                  </p>
                  <p className="font-display text-5xl md:text-7xl tabular-nums leading-none">
                    {formatNGN(0)}
                  </p>
                  <p className="text-sm text-[#f7f6f3]/60 leading-relaxed max-w-md mt-6">
                    Hello {user.name?.split(' ')[0] || 'there'} — your wallet is empty right now.
                    When a change-of-mind exchange is approved, its credited value will appear
                    here automatically.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Transactions: honest empty state ─── */}
          <section aria-label="Wallet activity">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="label-uppercase text-muted-foreground mb-1">History</p>
                <h2 className="font-display text-2xl md:text-3xl">Wallet Activity</h2>
              </div>
            </div>
            <div className="border border-border rounded-lg p-8 md:p-12 text-center bg-card">
              <Repeat className="size-8 mx-auto text-muted-foreground mb-3" strokeWidth={1.5} />
              <h3 className="font-display text-xl mb-2">No wallet activity yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                Credits and purchases will be listed here. Right now there is nothing to show —
                and that&apos;s the truth of it.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground"
              >
                <span className="link-underline">Browse the edit</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>

          {/* ─── Top-Up & Referral — Coming Soon ─── */}
          <section aria-label="Coming soon features">
            <p className="label-uppercase text-muted-foreground mb-1">On the way</p>
            <h2 className="font-display text-2xl md:text-3xl mb-6">Coming Soon</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-6 md:p-8 bg-card">
                <div className="flex items-start justify-between gap-4">
                  <Plus className="size-5 text-muted-foreground" strokeWidth={1.5} />
                  {COMING_SOON}
                </div>
                <h3 className="font-display text-xl mt-5">Top-Up</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  Loading your wallet in advance so checkout is one step faster. Not available
                  yet — we won&apos;t take money we can&apos;t hold for you properly.
                </p>
              </div>
              <div className="border border-border rounded-lg p-6 md:p-8 bg-card">
                <div className="flex items-start justify-between gap-4">
                  <Gift className="size-5 text-muted-foreground" strokeWidth={1.5} />
                  {COMING_SOON}
                </div>
                <h3 className="font-display text-xl mt-5">Referral Credit</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  Earn store credit when a friend orders through your link. Not available yet —
                  the honest version is worth the wait.
                </p>
              </div>
            </div>
          </section>

          {/* ─── How wallet credit works ─── */}
          <section aria-label="How the wallet works">
            <p className="label-uppercase text-muted-foreground mb-1">Good to know</p>
            <h2 className="font-display text-2xl md:text-3xl mb-6">How Wallet Credit Works</h2>
            <div className="border-t border-border">
              {[
                {
                  label: 'Where it comes from',
                  body: 'A change-of-mind exchange can be issued as store credit instead of a swap — the agreed value is deposited to your wallet. See the full policy under Returns & Exchange.',
                },
                {
                  label: 'How it is used',
                  body: 'Credit is applied to a future order — retail or a booked service — when you check out or confirm a booking. It never expires.',
                },
                {
                  label: 'What it does not cover',
                  body: 'Wallet credit holds product value only. Delivery fees are paid separately, on delivery, as usual.',
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="grid md:grid-cols-12 gap-2 md:gap-10 py-6 border-b border-border/60"
                >
                  <p className="md:col-span-4 text-sm text-foreground font-medium md:pt-0.5">
                    {row.label}
                  </p>
                  <p className="md:col-span-8 text-sm text-muted-foreground leading-relaxed">
                    {row.body}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6 flex items-center gap-2">
              <ShieldCheck className="size-4" strokeWidth={1.5} />
              Credit is applied by the Wardrobecare team after an approved exchange — you will be
              notified by WhatsApp or email when it lands.
            </p>
          </section>
        </div>
      </AccountShell>
      <Footer />
    </>
  )
}
