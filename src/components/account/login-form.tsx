'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { checkLoginGate } from '@/actions/store'
import { GoogleButton, AuthDivider } from '@/components/account/google-button'

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/account'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      // Signup now ends with an email OTP step. If this account never
      // finished it, route them to the verify page with a clear message
      // instead of a generic "invalid email or password".
      const gate = await checkLoginGate(email)
      if (gate.needsVerification) {
        try {
          sessionStorage.setItem(
            'wb_verify',
            JSON.stringify({ email: email.toLowerCase(), password })
          )
        } catch {
          /* verify falls back to sign-in handoff without the stash */
        }
        router.push(`/account/verify?email=${encodeURIComponent(email.toLowerCase())}`)
        return
      }
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (!res || res.error) {
        toast.error('Invalid email or password. Please try again.')
        setLoading(false)
        return
      }
      toast.success('Welcome back')
      // Role-aware redirect:
      // Fetch the freshly-issued session and route staff → /admin, customers → /account (or the original callbackUrl).
      // Use a hard window.location redirect so the new session cookie is guaranteed
      // to be sent with the next request — a client-side router.push can race
      // the cookie being persisted, which on serverless platforms results in
      // /admin rendering without a session and bouncing back to /admin/login.
      let destination = callbackUrl
      try {
        const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' })
        if (sessionRes.ok) {
          const session = await sessionRes.json()
          const role = session?.user?.role
          if (role && role !== 'CUSTOMER') {
            // Staff signed in via the customer login page — send them to the admin console.
            destination = '/admin'
          }
        }
      } catch {
        // Non-fatal: fall back to the original callbackUrl below.
      }
      if (typeof window !== 'undefined') {
        window.location.href = destination
      } else {
        router.push(destination)
        router.refresh()
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
        <Label htmlFor="password" className="label-uppercase text-muted-foreground">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          className="h-11"
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
            Signing in…
          </>
        ) : (
          <>
            Sign In
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
      <AuthDivider />
      <GoogleButton enabled={googleEnabled} label="Continue with Google" callbackUrl={callbackUrl} />
      <p className="text-center text-sm text-muted-foreground">
        New to Wardrobecare?{' '}
        <Link
          href="/account/register"
          className="text-foreground link-underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  )
}
