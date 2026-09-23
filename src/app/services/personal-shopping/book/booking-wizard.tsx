'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { submitServiceEnquiry } from '@/actions/store'

// ─── Types ───────────────────────────────────────────────────────────────────

type FormData = {
  // Step 1 — Your Details
  name: string
  phone: string
  email: string
  whatsapp: string
  // Step 2 — The Brief
  brief: string
  budget: string
  sizes: string
  // Step 3 — Delivery & Timing
  state: string
  city: string
  address: string
  neededBy: string
  notes: string
}

const EMPTY: FormData = {
  name: '',
  phone: '',
  email: '',
  whatsapp: '',
  brief: '',
  budget: '',
  sizes: '',
  state: 'Lagos',
  city: '',
  address: '',
  neededBy: '',
  notes: '',
}

const STEPS = [
  { num: '01', label: 'Your Details' },
  { num: '02', label: 'The Brief' },
  { num: '03', label: 'Delivery & Timing' },
  { num: '04', label: 'Confirm & Book' },
]

// ─── Field primitives ────────────────────────────────────────────────────────

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

// ─── Wizard ──────────────────────────────────────────────────────────────────

export function BookingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const set = (patch: Partial<FormData>) => setData((d) => ({ ...d, ...patch }))

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (data.name.trim().length < 2) e.name = 'Please enter your full name'
      if (data.phone.trim().length < 7) e.phone = 'Please enter a valid phone number'
      if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) e.email = 'Please enter a valid email'
    }
    if (s === 1) {
      if (data.brief.trim().length < 5)
        e.brief = 'Tell us a bit more — occasion, category, or the specific item'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, 3))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const back = () => {
    setErrors({})
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const composedMessage = () => {
    const lines = [
      `BRIEF: ${data.brief.trim()}`,
      data.budget.trim() ? `BUDGET RANGE: ${data.budget.trim()}` : '',
      data.sizes.trim() ? `SIZES (top/bottom/shoe): ${data.sizes.trim()}` : '',
      data.neededBy ? `NEEDED BY: ${data.neededBy}` : '',
      data.address.trim() || data.city.trim()
        ? `DELIVERY: ${[data.address.trim(), data.city.trim(), data.state].filter(Boolean).join(', ')}`
        : '',
      data.notes.trim() ? `NOTES: ${data.notes.trim()}` : '',
    ].filter(Boolean)
    return lines.join('\n')
  }

  const submit = async () => {
    if (!validateStep(0) || !validateStep(1)) {
      setStep(0)
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.set('name', data.name.trim())
      fd.set('email', data.email.trim())
      fd.set('phone', data.phone.trim())
      if (data.whatsapp.trim()) fd.set('whatsappNumber', data.whatsapp.trim())
      fd.set('serviceSlug', 'personal-shopping')
      fd.set('serviceName', 'Personal Shopping')
      fd.set('occasion', data.brief.trim().slice(0, 240))
      if (data.neededBy) fd.set('preferredDate', data.neededBy)
      const location = [data.address.trim(), data.city.trim()].filter(Boolean).join(', ')
      if (location) fd.set('location', location + (data.state ? `, ${data.state}` : ''))
      if (data.budget.trim()) fd.set('budget', data.budget.trim())
      if (data.sizes.trim()) fd.set('clothingSize', data.sizes.trim())
      fd.set('message', composedMessage())

      const result = await submitServiceEnquiry(fd)
      if (!result.ok) {
        toast.error(result.error)
        setSubmitting(false)
        return
      }
      const params = new URLSearchParams({
        ref: result.enquiryNumber ?? '',
        budget: data.budget.trim(),
        needed: data.neededBy,
      })
      router.push(`/services/personal-shopping/confirmed?${params.toString()}`)
    } catch {
      toast.error('Could not submit your brief. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="border border-border">
      {/* Progress bars */}
      <div className="flex gap-1 px-6 md:px-10 pt-8" aria-hidden>
        {STEPS.map((s, i) => (
          <div
            key={s.num}
            className={`h-[3px] flex-1 transition-colors duration-500 ${
              i < step ? 'bg-foreground' : i === step ? 'bg-foreground' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Stepper nav */}
      <ol className="flex flex-wrap gap-x-6 gap-y-2 px-6 md:px-10 pt-6 pb-5 border-b border-border text-[11px] uppercase tracking-[0.14em]">
        {STEPS.map((s, i) => (
          <li
            key={s.num}
            className={`tabular-nums ${
              i === step ? 'text-foreground' : i < step ? 'text-muted-foreground' : 'text-muted-foreground/60'
            }`}
          >
            <span className="mr-1.5">{s.num}</span>
            {s.label}
          </li>
        ))}
      </ol>

      {/* Panels */}
      <div className="px-6 md:px-10 py-10">
        {step === 0 && (
          <section>
            <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em] mb-8">
              Your details
            </h2>
            <div className="space-y-6">
              <Field label="Full name" required error={errors.name}>
                <input
                  className={inputCls}
                  value={data.name}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder="e.g. Adewale Johnson"
                  autoComplete="name"
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label="Phone number" required error={errors.phone}>
                  <input
                    className={inputCls}
                    value={data.phone}
                    onChange={(e) => set({ phone: e.target.value })}
                    placeholder="0803 000 0000"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </Field>
                <Field label="Email" required error={errors.email}>
                  <input
                    className={inputCls}
                    value={data.email}
                    onChange={(e) => set({ email: e.target.value })}
                    placeholder="you@example.com"
                    inputMode="email"
                    autoComplete="email"
                  />
                </Field>
              </div>
              <Field label="WhatsApp number (optional)">
                <input
                  className={inputCls}
                  value={data.whatsapp}
                  onChange={(e) => set({ whatsapp: e.target.value })}
                  placeholder="Same as phone, if different"
                  inputMode="tel"
                />
              </Field>
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em] mb-8">
              The brief
            </h2>
            <div className="space-y-6">
              <Field label="What are you shopping for? (occasion, category, or specific item)" required error={errors.brief}>
                <textarea
                  className={`${inputCls} min-h-[110px] resize-y py-3`}
                  value={data.brief}
                  onChange={(e) => set({ brief: e.target.value })}
                  placeholder="e.g. Need a full outfit for a wedding in 3 weeks — navy suit, shoes, accessories"
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label="Budget range">
                  <input
                    className={inputCls}
                    value={data.budget}
                    onChange={(e) => set({ budget: e.target.value })}
                    placeholder="e.g. ₦150,000 – ₦250,000"
                  />
                </Field>
                <Field label="Sizes (top / bottom / shoe)">
                  <input
                    className={inputCls}
                    value={data.sizes}
                    onChange={(e) => set({ sizes: e.target.value })}
                    placeholder="e.g. L / 34 / 43"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Not sure?{' '}
                    <a
                      href="/measurement-guide"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                      See how to measure yourself
                    </a>{' '}
                    — or leave blank and we&apos;ll measure you.
                  </p>
                </Field>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em] mb-8">
              Delivery &amp; timing
            </h2>
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label="State">
                  <input
                    className={inputCls}
                    value={data.state}
                    onChange={(e) => set({ state: e.target.value })}
                    placeholder="Lagos"
                  />
                </Field>
                <Field label="City / area">
                  <input
                    className={inputCls}
                    value={data.city}
                    onChange={(e) => set({ city: e.target.value })}
                    placeholder="e.g. Ikeja"
                  />
                </Field>
              </div>
              <Field label="Delivery address (optional)">
                <input
                  className={inputCls}
                  value={data.address}
                  onChange={(e) => set({ address: e.target.value })}
                  placeholder="House number, street name"
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label="Needed by (optional)">
                  <input
                    type="date"
                    className={inputCls}
                    value={data.neededBy}
                    onChange={(e) => set({ neededBy: e.target.value })}
                  />
                </Field>
                <Field label="Anything else? (optional)">
                  <input
                    className={inputCls}
                    value={data.notes}
                    onChange={(e) => set({ notes: e.target.value })}
                    placeholder="Colour likes, deadlines, links…"
                  />
                </Field>
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="font-display text-2xl md:text-3xl tracking-[-0.01em] mb-2">
              Confirm &amp; book
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Review your brief below. A stylist replies within 24 hours — you only pay for what
              you keep.
            </p>
            <dl className="border-t border-border">
              {[
                ['Name', data.name],
                ['Phone', data.phone],
                ['Email', data.email],
                ['The brief', data.brief],
                ['Budget range', data.budget || '—'],
                ['Sizes', data.sizes || '—'],
                ['Delivery', [data.address, data.city, data.state].filter(Boolean).join(', ') || '—'],
                ['Needed by', data.neededBy || '—'],
                ['Notes', data.notes || '—'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid sm:grid-cols-[160px_1fr] gap-1 sm:gap-6 py-4 border-b border-border/60"
                >
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground pt-0.5">
                    {label}
                  </dt>
                  <dd className="text-sm whitespace-pre-line">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground mt-6 flex items-start gap-2">
              <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" strokeWidth={2} />
              No deposit required to book. Sending this brief doesn&apos;t commit you to any
              purchase.
            </p>
          </section>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-6 md:px-10 py-6 border-t border-border bg-secondary/40">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            disabled={submitting}
            className="inline-flex items-center gap-2 border border-border px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] hover:border-foreground transition-colors disabled:opacity-50"
          >
            &larr; Back
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={next}
            className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
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
                Sending…
              </>
            ) : (
              <>
                Confirm &amp; Book
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
