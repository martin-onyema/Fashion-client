'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

function GoogleIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}

/**
 * "Continue with Google" button shared by the register and login forms.
 *
 * When the server has no GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET the
 * provider is genuinely absent, so instead of bouncing the user through
 * a NextAuth error page the click explains the situation honestly.
 */
export function GoogleButton({
  enabled,
  label,
  callbackUrl = '/account',
}: {
  enabled: boolean
  label: string
  callbackUrl?: string
}) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!enabled) {
      toast.info('Google sign-in is not set up on this site yet.', {
        description:
          'Use your email and password for now. To switch it on, the team adds Google OAuth credentials to the server environment.',
      })
      return
    }
    setLoading(true)
    try {
      // Full-page redirect to Google — the callback returns the user to
      // callbackUrl with a session cookie already set.
      await signIn('google', { callbackUrl })
    } catch {
      toast.error('Could not start Google sign-in. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={handleClick}
      disabled={loading}
      className="h-11 w-full gap-2.5"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
      {loading ? 'Redirecting…' : label}
    </Button>
  )
}

/** Thin editorial divider used between the Google button and the email form. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label="or">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
