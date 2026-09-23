'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { purchaseGiftCard } from '@/actions/store'
import { DELIVERY_ZONES } from '@/lib/delivery-zones'
import { formatNGN, whatsappLink } from '@/lib/format'

// ─── Gift Card checkout wizard ───────────────────────────────────────────────
// Artifact sequence 1:1: 1. Amount → 2. Recipient & Delivery Location →
// 3. Review & Pay → 4. Sent. The delivery fee is a live lookup from the shared
// DELIVERY_ZONES table (same pricing as retail delivery — never a second copy).

type Bank = { name: string; accountName: string; accountNumber: string; instructions: string }

const STEPS = [
  { n: '01', label: 'Amount' },
  { n: '02', label: 'Recipient' },
  { n: '03', label: 'Review & Pay' },
  { n: '04', label: 'Sent' },
]

const CHANNELS = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'SMS' },
] as const

type Channel = (typeof CHANNELS)[number]['value']

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
        {label}
        {required && <span className="text-foreground ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-700 mt-1.5">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full h-12 px-4 text-sm bg-transparent border border-border focus:border-foreground outline-none transition-colors placeholder:text-muted-foreground/60'

export function GiftCardWizard({ bank, whatsappNumber }: { bank: Bank; whatsappNumber: string }) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Step 1
  const [amountRaw, setAmountRaw] = useState('')
  const amount = useMemo(() => {
    const n = parseInt(amountRaw.replace(/[^0-9]/g, ''), 10)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [amountRaw])
  const amountValid = amount != null && amount >= 100000

  // Step 2
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [locationName, setLocationName] = useState('')
  const [channel, setChannel] = useState<Channel>('WHATSAPP')

  // Buyer details (the payer) — collected alongside the recipient in step 2
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')

  const zone = DELIVERY_ZONES.find((z) => z.name === locationName) ?? null

  // Step 3 / 4
  const total = (amount ?? 0) + (zone?.fee ?? 0)
  const [result, setResult] = useState<{
    reference: string
    amount: number
    deliveryFee: number
    total: number
  } | null>(null)

  const go = (n: number) => {
    setErrors({})
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = () => {
    if (step === 0 && !amountValid) {
      setErrors({ amount: 'Minimum gift card value is ₦100,000' })
      return
    }
    if (step === 1) {
      const e: Record<string, string> = {}
      if (recipientName.trim().length < 2) e.recipientName = 'Enter the recipient’s full name'
      if (!zone) e.location = 'Select a delivery location'
      if (channel === 'EMAIL' && !/^\S+@\S+\.\S+$/.test(recipientEmail.trim()))
        e.recipientEmail = 'The card will be sent here — enter a valid email'
      if (channel !== 'EMAIL' && recipientPhone.trim().length < 7)
        e.recipientPhone = 'The card will be sent here — enter a valid phone number'
      setErrors(e)
      if (Object.keys(e).length) return
    }
    go(Math.min(step + 1, 3))
  }

  const submit = async () => {
    setSubmitting(true)
    try {
      const res = await purchaseGiftCard({
        amount,
        location: zone?.name,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        recipientEmail: recipientEmail.trim(),
        channel,
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim(),
        buyerEmail: buyerEmail.trim(),
      })
      if (!res.ok) {
        toast.error(res.error)
        setSubmitting(false)
        return
      }
      setResult({ reference: res.reference, amount: res.amount, deliveryFee: res.deliveryFee, total: res.total })
      go(3)
    } catch {
      toast.error('Could not place the gift card order. Please try again.')
    }
    setSubmitting(false)
  }

  const channelLabel = CHANNELS.find((c) => c.value === channel)?.label ?? 'WhatsApp'

  const whatsappMsg = result
    ? `Hello Wardrobecare, I've placed a gift card order (${result.reference}).\n\nGift card value: ${formatNGN(result.amount)}\nDelivery: ${zone?.name ?? ''} — ${formatNGN(result.deliveryFee)}\nTotal: ${formatNGN(result.total)}\nRecipient: ${recipientName.trim()}\n\nPlease confirm payment receipt. Thank you!`
    : `Hello Wardrobecare, I'd like to confirm payment for my gift card order.`

  return (
    <div className="border border-border">
      {/* Progress bars */}
      <div className="flex gap-1 px-6 md:px-10 pt-8" aria-hidden>
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className={`h-[3px] flex-1 transition-colors duration-500 ${
              i <= step ? 'bg-foreground' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Stepper nav */}
      <ol className="flex flex-wrap gap-x-6 gap-y-2 px-6 md:px-10 pt-6 pb-5 border-b border-border text-[11px] uppercase tracking-[0.14em]">
        {STEPS.map((s, i) => (
          <li
            key={s.n}
            className={`tabular-nums ${
              i === step ? 'text-foreground' : i < step ? 'text-muted-foreground' : 'text-muted-foreground/60'
            }`}
          >
            <span className="mr-1.5">{s.n}</span>
            {s.label}
          </li>
        ))}
      </ol>

      {/* Panels */}
      <div className="px-6 md:px-10 py-10">
        {/* ── Step 1 — Choose the Amount ── */}
        {step === 0 && (
          <section>
            <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em] mb-2">
              Choose the amount
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Any custom amount — ₦100,000 minimum, no fixed ceiling.
            </p>
            <Field label="Gift card value" required error={errors.amount}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₦
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter any amount"
                  value={amount ? amount.toLocaleString('en-NG') : ''}
                  onChange={(e) => setAmountRaw(e.target.value)}
                  className={`${inputCls} pl-9`}
                />
              </div>
            </Field>
            <p
              className={`text-xs mt-3 ${
                amount && !amountValid ? 'text-red-700' : 'text-muted-foreground'
              }`}
            >
              {amount && !amountValid ? 'Minimum gift card value is ₦100,000' : 'Minimum ₦100,000'}
            </p>
          </section>
        )}

        {/* ── Step 2 — Recipient & Delivery Location ── */}
        {step === 1 && (
          <section>
            <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em] mb-2">
              Recipient &amp; delivery location
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              This is what determines the delivery fee in the next step.
            </p>
            <div className="space-y-6">
              <Field label="Recipient's name" required error={errors.recipientName}>
                <input
                  className={inputCls}
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Full name"
                  autoComplete="off"
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-6">
                <Field
                  label={channel === 'EMAIL' ? 'Recipient’s email' : 'Recipient’s phone'}
                  required
                  error={channel === 'EMAIL' ? errors.recipientEmail : errors.recipientPhone}
                >
                  <input
                    className={inputCls}
                    value={channel === 'EMAIL' ? recipientEmail : recipientPhone}
                    onChange={(e) =>
                      channel === 'EMAIL'
                        ? setRecipientEmail(e.target.value)
                        : setRecipientPhone(e.target.value)
                    }
                    placeholder={channel === 'EMAIL' ? 'him@example.com' : '0803 000 0000'}
                    inputMode={channel === 'EMAIL' ? 'email' : 'tel'}
                    autoComplete="off"
                  />
                </Field>
                <Field label={`Recipient's other contact (optional)${channel !== 'EMAIL' ? ' — email' : ' — phone'}`}>
                  <input
                    className={inputCls}
                    value={channel === 'EMAIL' ? recipientPhone : recipientEmail}
                    onChange={(e) =>
                      channel === 'EMAIL'
                        ? setRecipientPhone(e.target.value)
                        : setRecipientEmail(e.target.value)
                    }
                    placeholder={channel === 'EMAIL' ? '0803 000 0000' : 'him@example.com'}
                    inputMode={channel === 'EMAIL' ? 'tel' : 'email'}
                    autoComplete="off"
                  />
                </Field>
              </div>

              <Field label="Delivery location" required error={errors.location}>
                <select
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className={`${inputCls} appearance-none`}
                >
                  <option value="">Select a location…</option>
                  {DELIVERY_ZONES.map((z) => (
                    <option key={z.name} value={z.name}>
                      {z.name} — {formatNGN(z.fee)}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Notification channel toggle */}
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                  Notify him by <span className="text-foreground">*</span>
                </p>
                <div className="inline-flex border border-border" role="group" aria-label="Notification channel">
                  {CHANNELS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setChannel(c.value)}
                      className={`px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] transition-colors ${
                        channel === c.value
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  The other two channels are used as backups automatically.
                </p>
              </div>

              {/* Live fee */}
              <div className="border border-border px-5 py-4 flex items-center justify-between gap-6">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Delivery fee for this location
                </p>
                <p
                  className={`font-display text-xl tabular-nums ${
                    zone ? 'text-foreground' : 'text-muted-foreground/50'
                  }`}
                >
                  {zone ? formatNGN(zone.fee) : '— select a location —'}
                </p>
              </div>
            </div>

            {/* Buyer details */}
            <div className="mt-10 pt-8 border-t border-border/60">
              <h3 className="font-display text-xl tracking-[-0.01em] mb-1.5">Your details</h3>
              <p className="text-xs text-muted-foreground mb-6">
                You&apos;re the one paying — we confirm everything with you before the card goes out.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label="Your full name" required>
                  <input
                    className={inputCls}
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Adaeze Johnson"
                    autoComplete="name"
                  />
                </Field>
                <Field label="Your phone / WhatsApp" required>
                  <input
                    className={inputCls}
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="0803 000 0000"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </Field>
              </div>
            </div>
          </section>
        )}

        {/* ── Step 3 — Review & Pay ── */}
        {step === 2 && (
          <section>
            <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em] mb-2">
              Review &amp; pay
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              The delivery fee is a live lookup from the location you chose — not a flat add-on.
            </p>
            <dl className="border-t border-border">
              <div className="flex items-baseline justify-between gap-6 py-4 border-b border-border/60">
                <dt className="text-sm text-muted-foreground">Gift card value</dt>
                <dd className="text-sm tabular-nums">{formatNGN(amount ?? 0)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 py-4 border-b border-border/60">
                <dt className="text-sm text-muted-foreground">Delivery to {zone?.name}</dt>
                <dd className="text-sm tabular-nums">{formatNGN(zone?.fee ?? 0)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 py-5 border-b border-border">
                <dt className="font-display text-lg">Total charged to you</dt>
                <dd className="font-display text-2xl tabular-nums">{formatNGN(total)}</dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground mt-6 flex items-start gap-2">
              <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" strokeWidth={2} />
              Payment is by bank transfer. Once it&apos;s confirmed, {recipientName.trim() ||
              'he'}{' '}
              gets the card via {channelLabel} — with the other two channels as backups.
            </p>
          </section>
        )}

        {/* ── Step 4 — Sent ── */}
        {step === 3 && result && (
          <section>
            <div className="flex items-center gap-4 mb-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background flex-shrink-0">
                <Check className="h-5 w-5" strokeWidth={2} />
              </span>
              <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">
                Gift card order placed
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              <span className="text-foreground font-medium">{recipientName.trim()}</span> will be
              notified via {channelLabel} (and the other two channels too, automatically) with a
              link to shop up to {formatNGN(result.amount)} — as soon as your payment is
              confirmed.
            </p>

            {/* Recipient notification preview */}
            <div className="mt-8 border border-border bg-secondary/40 p-6 max-w-xl">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                {channelLabel} — Recipient notification
              </p>
              <p className="text-sm leading-relaxed">
                &ldquo;A Wardrobecare gift card worth {formatNGN(result.amount)} has been paid for
                on your behalf. Shop for yourself at wardrobecare.com.ng — here&apos;s your
                link.&rdquo;
              </p>
            </div>

            {/* Payment details */}
            <div className="mt-8 bg-secondary/40 p-6 max-w-xl">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-4 pb-3 border-b border-border">
                Payment details — {result.reference}
              </p>
              <div className="space-y-3">
                {[
                  ['Bank', bank.name],
                  ['Account Name', bank.accountName],
                ].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between gap-6">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {l}
                    </span>
                    <span className="text-sm text-right">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-6">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Account Number
                  </span>
                  <span className="text-sm font-mono">{bank.accountNumber}</span>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between gap-6">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Amount due
                  </span>
                  <span className="text-sm tabular-nums font-medium">{formatNGN(result.total)}</span>
                </div>
              </div>
              {bank.instructions && (
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                  {bank.instructions}
                </p>
              )}
              <a
                href={whatsappLink(whatsappNumber, whatsappMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-foreground text-background py-3.5 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
              >
                Send Payment Proof via WhatsApp
              </a>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Gift card reference: <span className="font-mono">{result.reference}</span> — keep it
              for your records.
            </p>
          </section>
        )}
      </div>

      {/* Actions */}
      {step < 3 && (
        <div className="flex items-center justify-between px-6 md:px-10 py-6 border-t border-border bg-secondary/40">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => go(step - 1)}
              disabled={submitting}
              className="inline-flex items-center gap-2 border border-border px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] hover:border-foreground transition-colors disabled:opacity-50"
            >
              &larr; Back
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={next}
              disabled={step === 0 && !amountValid}
              className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing order…
                </>
              ) : (
                `Place Order — ${formatNGN(total)}`
              )}
            </button>
          )}
        </div>
      )}
      {step === 3 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 md:px-10 py-6 border-t border-border bg-secondary/40">
          <Link
            href="/gift-card"
            className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to gift cards
          </Link>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.2em]"
          >
            <span className="link-underline">Back to the shop</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  )
}
