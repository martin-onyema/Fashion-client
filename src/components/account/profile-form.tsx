'use client'

import { useState } from 'react'
import { Loader2, Check, User, Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/actions/store'
import { toast } from 'sonner'

type ProfileFormProps = {
  initialName: string | null
  initialEmail: string
  initialPhone: string | null
  initialWhatsapp: string | null
}

export function ProfileForm({
  initialName,
  initialEmail,
  initialPhone,
  initialWhatsapp,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName ?? '')
  const [phone, setPhone] = useState(initialPhone ?? '')
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp ?? '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters.')
      return
    }
    if (!phone || phone.trim().length < 7) {
      toast.error('Please enter a valid phone number.')
      return
    }
    setSaving(true)
    const fd = new FormData()
    fd.set('name', name.trim())
    fd.set('phone', phone.trim())
    fd.set('whatsappNumber', whatsapp.trim())
    const res = await updateProfile(fd)
    setSaving(false)
    if (!res.ok) {
      toast.error(res.error || 'Could not update profile.')
      return
    }
    toast.success('Profile updated')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Account section */}
      <section className="border border-border rounded-lg p-5 md:p-6 bg-card">
        <div className="flex items-center gap-2 mb-5">
          <User className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <h3 className="label-uppercase text-muted-foreground">Account</h3>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="label-uppercase text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={initialEmail}
            disabled
            className="bg-muted/40 text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed. Contact support if you need to update it.
          </p>
        </div>
      </section>

      {/* Personal details */}
      <section className="border border-border rounded-lg p-5 md:p-6 bg-card">
        <div className="flex items-center gap-2 mb-5">
          <User className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <h3 className="label-uppercase text-muted-foreground">Personal Details</h3>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="label-uppercase text-muted-foreground">
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={saving}
              placeholder="Your full name"
              className="h-11"
            />
          </div>
        </div>
      </section>

      {/* Contact details */}
      <section className="border border-border rounded-lg p-5 md:p-6 bg-card">
        <div className="flex items-center gap-2 mb-5">
          <Phone className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <h3 className="label-uppercase text-muted-foreground">Contact</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="label-uppercase text-muted-foreground">
              Phone *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={saving}
              placeholder="+234 800 000 0000"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="whatsapp"
              className="label-uppercase text-muted-foreground flex items-center gap-1.5"
            >
              <MessageCircle className="size-3" strokeWidth={1.5} />
              WhatsApp <span className="text-muted-foreground/60 normal-case tracking-normal">(optional)</span>
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              disabled={saving}
              placeholder="+234 800 000 0000"
              className="h-11"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Check className="size-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
