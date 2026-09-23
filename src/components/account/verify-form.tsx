'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { ArrowRight, CheckCircle2, Loader2, MailWarning } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { verifySignupOtp, resendSignupOtp } from '@/actions/store'

const DIGITS = 6
const RESEND_SECONDS = 60

type StashedVerify = {
  email?: string
  password?: string
  devCode?: string | null
}

// ---- sessionStorage stash (register/login hand-off) -----------------
// Read through useSyncExternalStore so hydration renders the server
// snapshot (empty) first and the real values appear right after — no
// hydration mismatch, no setState-in-effect. getSnapshot must return a
// stable reference for a given raw string (the Task 34 profiles lesson).
const EMPTY_STASH: StashedVerify = {}
let cachedRaw: string | null | undefined
let cachedParsed: StashedVerify = EMPTY_STASH

function readStash(): StashedVerify {
  if (typeof window === 'undefined') return EMPTY_STASH
  try {
    const raw = sessionStorage.getItem('wb_verify')
    if (raw === cachedRaw) return cachedParsed
    cachedRaw = raw
    cachedParsed = raw ? (JSON.parse(raw) as StashedVerify) : EMPTY_STASH
    return cachedParsed
  } catch {
    return EMPTY_STASH
  }
}

function subscribeStash() {
  // sessionStorage has no change events; the one transition we care about
  // (server snapshot → client snapshot) is handled by useSyncExternalStore
  // itself.
  return () => {}
}

/**
 * Second step of email + password signup: enter the 6-digit code we
 * emailed (or, when the environment has no mail provider, the code shown
 * in the notice below), get verified, and land in your account.
 *
 * The register and login forms stash { email, password } in sessionStorage
 * before routing here, so verification can finish with an automatic
 * sign-in. If that stash is missing (fresh tab, bookmarked link) we still
 * verify the address and hand over to the login page with a clear message.
 */
export function VerifyForm({ email }: { email: string }) {
  const [code, setCode] = useState<string[]>(Array(DIGITS).fill(''))
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [devCodeOverride, setDevCodeOverride] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(RESEND_SECONDS)
  const [resending, setResending] = useState(false)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  // Hand-off stash written by the register / login forms (same tab).
  const stash = useSyncExternalStore(subscribeStash, readStash, () => EMPTY_STASH)
  const devCode = devCodeOverride ?? (typeof stash.devCode === 'string' ? stash.devCode : null)
  const hasStashedPassword = typeof stash.password === 'string' && stash.password.length > 0

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const clearCode = useCallback(() => {
    setCode(Array(DIGITS).fill(''))
    inputsRef.current[0]?.focus()
  }, [])

  const finishVerification = useCallback(async () => {
    // Verified — drop the stash so the code/password don't linger.
    try {
      sessionStorage.removeItem('wb_verify')
    } catch {
      /* private browsing etc. — non-fatal */
    }
    const password = typeof stash.password === 'string' ? stash.password : undefined
    if (password) {
      // Auto sign-in now that emailVerified is stamped (the credentials
      // provider unblocks verified customers).
      const sign = await signIn('credentials', { email, password, redirect: false })
      if (sign && !sign.error) {
        toast.success('Email verified. Welcome to Wardrobecare.')
        // Hard redirect so the fresh session cookie is guaranteed to be
        // sent with the next request (same reasoning as register/login).
        if (typeof window !== 'undefined') window.location.href = '/account'
        return
      }
      // Password didn't match (e.g. arrived from the login gate with a typo).
      toast.error('Email verified — but that password did not match. Please sign in.')
      setVerified(true)
      return
    }
    // No stash (direct visit): verification stands, hand over to sign-in.
    toast.success('Email verified. Please sign in.')
    setVerified(true)
  }, [email, stash.password])

  const submitCode = useCallback(
    async (digits: string[]) => {
      const full = digits.join('')
      if (full.length !== DIGITS || digits.some((d) => !/^\d$/.test(d))) {
        toast.error('Enter the full 6-digit code.')
        return
      }
      setLoading(true)
      try {
        const res = await verifySignupOtp(email, full)
        if (!res.ok) {
          const info = res as { error?: string; tooManyAttempts?: boolean }
          toast.error(info.error || 'That code did not match.')
          clearCode()
          setLoading(false)
          return
        }
        await finishVerification()
      } catch {
        toast.error('Something went wrong. Please try again.')
        setLoading(false)
      }
    },
    [email, clearCode, finishVerification]
  )

  const handleChange = (index: number, value: string) => {
    // Keep only the last digit typed (covers mobile autocorrect quirks).
    const digit = value.replace(/\D/g, '').slice(-1)
    if (!digit) return
    const next = [...code]
    next[index] = digit
    setCode(next)
    if (index < DIGITS - 1) {
      inputsRef.current[index + 1]?.focus()
    } else if (next.every((d) => /^\d$/.test(d))) {
      // Sixth digit filled — submit without asking.
      submitCode(next)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = [...code]
      if (next[index]) {
        next[index] = ''
        setCode(next)
      } else if (index > 0) {
        next[index - 1] = ''
        setCode(next)
        inputsRef.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < DIGITS - 1) {
      e.preventDefault()
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, DIGITS)
    if (!pasted) return
    const next = Array(DIGITS)
      .fill('')
      .map((_, i) => pasted[i] ?? '')
    setCode(next)
    if (pasted.length === DIGITS && next.every((d) => /^\d$/.test(d))) {
      submitCode(next)
    } else {
      inputsRef.current[Math.min(pasted.length, DIGITS - 1)]?.focus()
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const res = await resendSignupOtp(email)
      if (!res.ok) {
        const info = res as { error?: string; cooldownSeconds?: number }
        if (typeof info.cooldownSeconds === 'number') {
          setCooldown(info.cooldownSeconds)
        }
        toast.error(info.error || 'Could not send a new code. Try again shortly.')
        setResending(false)
        return
      }
      if (typeof res.devCode === 'string') setDevCodeOverride(res.devCode)
      setCooldown(RESEND_SECONDS)
      clearCode()
      toast.success('A fresh code is on its way.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
    setResending(false)
  }

  if (verified) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-2">
        <CheckCircle2 className="size-10 text-green-700" strokeWidth={1.5} />
        <div>
          <p className="font-display text-2xl">Email verified</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
            {hasStashedPassword
              ? 'Your account is ready. Taking you in now — if nothing happens, use the button below.'
              : 'Your account is ready. Sign in to pick up where you left off.'}
          </p>
        </div>
        <Button asChild size="lg" className="h-11 mt-1">
          <Link href="/account/login">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Honest dev-mode notice: no mail provider on this environment */}
      {devCode && (
        <div className="rounded-md border border-dashed border-amber-600/40 bg-amber-50 px-4 py-3 text-center">
          <p className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-amber-800">
            <MailWarning className="size-3.5" />
            Demo environment — no email delivery
          </p>
          <p className="text-xs text-amber-900/80 mt-1.5 leading-relaxed">
            This site has no email provider configured yet, so instead of an
            inbox your code appears here. In production this is emailed.
          </p>
          <p className="font-display text-3xl tracking-[0.5em] text-amber-900 mt-2 pl-2">
            {devCode}
          </p>
        </div>
      )}

      {/* 6-digit code entry */}
      <div
        className="flex justify-between gap-1.5 sm:gap-2.5"
        aria-label="Verification code"
      >
        {code.map((digit, i) => (
          <Input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            disabled={loading}
            aria-label={`Digit ${i + 1}`}
            className="h-13 w-full min-w-0 px-0 text-center font-display text-xl"
          />
        ))}
      </div>

      <Button
        type="button"
        size="lg"
        onClick={() => submitCode(code)}
        disabled={loading}
        className="h-11 w-full"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Verifying…
          </>
        ) : (
          <>
            Verify Email
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      {/* Resend with an honest cooldown */}
      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t get the code?{' '}
        {cooldown > 0 ? (
          <span className="text-muted-foreground/70">
            Resend available in {cooldown}s
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-foreground link-underline disabled:opacity-50"
          >
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        )}
      </p>
    </div>
  )
}
