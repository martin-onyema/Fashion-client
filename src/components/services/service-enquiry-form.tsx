'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitServiceEnquiry } from '@/actions/store'
import { SERVICES } from '@/lib/services-data'

type Props = {
  /** Pre-selected service slug. */
  serviceSlug?: string
  /** Compact layout (used in sidebars). */
  compact?: boolean
}

export function ServiceEnquiryForm({ serviceSlug, compact = false }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [enquiryNumber, setEnquiryNumber] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [service, setService] = useState(serviceSlug || '')
  const [occasion, setOccasion] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [size, setSize] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !phone || !service || !message) {
      toast.error('Please complete all required fields.')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.set('name', name)
      fd.set('email', email)
      fd.set('phone', phone)
      fd.set('whatsappNumber', whatsapp)
      fd.set('serviceSlug', service)
      const svc = SERVICES.find((s) => s.slug === service)
      fd.set('serviceName', svc?.name || service)
      fd.set('occasion', occasion)
      fd.set('preferredDate', preferredDate)
      fd.set('preferredTime', preferredTime)
      fd.set('location', location)
      fd.set('budget', budget)
      fd.set('clothingSize', size)
      fd.set('message', message)

      const res = await submitServiceEnquiry(fd)
      if (!res.ok) {
        toast.error(res.error || 'Could not submit enquiry.')
        setLoading(false)
        return
      }
      setEnquiryNumber(res.enquiryNumber || '')
      setSubmitted(true)
      toast.success('Enquiry submitted. We will be in touch within 24 hours.')
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={`flex flex-col items-center text-center ${compact ? 'py-8' : 'py-16'} px-6`}>
        <CheckCircle2 className="h-12 w-12 text-foreground mb-6" strokeWidth={1.5} />
        <h3 className="font-display text-3xl md:text-4xl tracking-tight">Thank you.</h3>
        <p className="text-sm text-muted-foreground mt-4 max-w-sm leading-relaxed">
          We&apos;ve received your enquiry and will be in touch within 24 hours to plan the next step.
        </p>
        {enquiryNumber && (
          <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Reference: {enquiryNumber}
          </p>
        )}
        <Button
          variant="outline"
          className="mt-8"
          onClick={() => router.push('/services')}
        >
          Back to all services
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-5 ${compact ? '' : 'py-8'}`}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full Name" required>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            className="h-11"
            placeholder="Your full name"
          />
        </Field>
        <Field label="Email" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="h-11"
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Phone" required>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={loading}
            className="h-11"
            placeholder="+234 800 000 0000"
          />
        </Field>
        <Field label="WhatsApp Number">
          <Input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            disabled={loading}
            className="h-11"
            placeholder="+234 800 000 0000"
          />
        </Field>
      </div>

      <Field label="Service" required>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          required
          disabled={loading || !!serviceSlug}
          className="flex h-11 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select a service…</option>
          {SERVICES.filter((s) => !s.comingSoon || s.slug === serviceSlug).map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.number} — {s.name}
              {s.comingSoon ? ' (Coming soon)' : ''}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Occasion">
          <Input
            type="text"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            disabled={loading}
            className="h-11"
            placeholder="e.g. Wedding, Work trip, Birthday"
          />
        </Field>
        <Field label="Preferred Date">
          <Input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            disabled={loading}
            className="h-11"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Preferred Time">
          <select
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            disabled={loading}
            className="flex h-11 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Any time</option>
            <option value="morning">Morning (9am–12pm)</option>
            <option value="afternoon">Afternoon (12pm–4pm)</option>
            <option value="evening">Evening (4pm–7pm)</option>
            <option value="weekend">Weekend</option>
          </select>
        </Field>
        <Field label="Location">
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={loading}
            className="h-11"
            placeholder="e.g. Lekki, Lagos"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Budget Range">
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            disabled={loading}
            className="flex h-11 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Select range…</option>
            <option value="0-50k">Under ₦50,000</option>
            <option value="50k-100k">₦50,000 – ₦100,000</option>
            <option value="100k-250k">₦100,000 – ₦250,000</option>
            <option value="250k-500k">₦250,000 – ₦500,000</option>
            <option value="500k+">Above ₦500,000</option>
            <option value="discuss">Prefer to discuss</option>
          </select>
        </Field>
        <Field label="Clothing Size">
          <Input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            disabled={loading}
            className="h-11"
            placeholder="e.g. M, 40R, 32×32, XL"
          />
        </Field>
      </div>

      <Field label="What do you need?" required>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          disabled={loading}
          rows={4}
          placeholder="Tell us a bit more about what you're looking for — what you need, when you need it, anything we should know."
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="mt-2 h-12 w-full"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending enquiry…
          </>
        ) : (
          <>
            Submit Enquiry
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        We&apos;ll respond within 24 hours via WhatsApp or email.
      </p>
    </form>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="label-uppercase text-muted-foreground">
        {label}
        {required && <span className="text-foreground ml-1">*</span>}
      </Label>
      {children}
    </div>
  )
}
