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

export function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'
  const [email, setEmail] = useState('admin@wardrobecare.com')
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
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (!res || res.error) {
        toast.error('Invalid credentials. Please try again.')
        setLoading(false)
        return
      }
      toast.success('Welcome back')
      // Hard redirect instead of router.push:
      // signIn({ redirect: false }) sets the session cookie on the response,
      // but a client-side router navigation may race ahead of the cookie
      // being persisted by the browser — and on serverless platforms (Aliyun
      // FC) the next render can land on a different instance whose
      // session check sees no cookie and bounces the user back to /admin/login.
      // A full page reload guarantees the cookie is sent with the next request.
      if (typeof window !== 'undefined') {
        window.location.href = callbackUrl
      } else {
        router.push(callbackUrl)
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
      {/* Credentials are intentionally NOT displayed here — this page is
          reachable only via the secret admin path and hidden behind the
          middleware stealth gate. Never print credentials in the UI. */}
      <div className="text-center">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground link-underline"
        >
          ← Back to store
        </Link>
      </div>
    </form>
  )
}
