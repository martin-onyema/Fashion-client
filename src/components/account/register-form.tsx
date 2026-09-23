'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerUser } from '@/actions/store'
import { GoogleButton, AuthDivider } from '@/components/account/google-button'

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error('Please complete all required fields.')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      // 1. Register the user via server action — the account is created
      //    unverified and a 6-digit OTP is issued for the email address.
      const fd = new FormData()
      fd.set('name', name)
      fd.set('email', email)
      fd.set('password', password)
      fd.set('phone', phone)
      const res = await registerUser(fd)
      if (!res.ok) {
        toast.error(res.error || 'Could not create account.')
        setLoading(false)
        return
      }
      // 2. Hand off to the OTP verification step. The password rides along
      //    in sessionStorage (this tab only) so the verify form can sign the
      //    user in automatically once the code checks out.
      const devCode = 'devCode' in res && typeof res.devCode === 'string' ? res.devCode : null
      try {
        sessionStorage.setItem(
          'wb_verify',
          JSON.stringify({ email: email.toLowerCase(), password, devCode })
        )
      } catch {
        /* private browsing etc. — verify falls back to sign-in handoff */
      }
      toast.success('Account created — one quick check left')
      router.push(`/account/verify?email=${encodeURIComponent(email.toLowerCase())}`)
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className="label-uppercase text-muted-foreground">
          Full Name
        </Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          className="h-11"
          placeholder="Your full name"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="label-uppercase text-muted-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="h-11"
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone" className="label-uppercase text-muted-foreground">
          Phone <span className="text-muted-foreground/60 normal-case tracking-normal">(optional)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          className="h-11"
          placeholder="+234 800 000 0000"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="label-uppercase text-muted-foreground">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          className="h-11"
          placeholder="Min. 6 characters"
          minLength={6}
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="mt-2 h-11 w-full"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating account…
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
      <AuthDivider />
      <GoogleButton enabled={googleEnabled} label="Continue with Google" />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/account/login"
          className="text-foreground link-underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
