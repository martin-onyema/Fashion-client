import bcrypt from 'bcryptjs'
import { randomInt } from 'crypto'
import { db } from '@/lib/db'

/**
 * Signup OTP — one-time 6-digit email verification codes.
 *
 * Issued when a customer creates an account with email + password and
 * stamped against `User.emailVerified` on success. Google sign-ups skip
 * this flow entirely (Google has already verified the address).
 *
 * Delivery: when RESEND_API_KEY is configured the code is emailed through
 * Resend's REST API (no SDK dependency). When it is not — e.g. a local or
 * staging environment — the code is returned to the caller so the signup
 * flow stays testable, and the UI says honestly that email isn't set up.
 */

const OTP_TTL_MS = 10 * 60 * 1000 // code lives for 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000 // 60s between codes for the same email
const MAX_ATTEMPTS = 5 // wrong entries before the code is voided
const BCRYPT_ROUNDS = 10

export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

export type IssueOtpResult =
  | { ok: true; devCode?: string; expiresAt: Date }
  | { ok: false; error: string; cooldownSeconds?: number }

/**
 * Generate, store (bcrypt-hashed) and deliver a fresh signup OTP.
 * Any previously-issued unconsumed codes for the email are voided so
 * only the newest code can ever match.
 */
export async function issueSignupOtp(rawEmail: string): Promise<IssueOtpResult> {
  const email = rawEmail.trim().toLowerCase()

  // Enforce the resend cooldown server-side so a hammered button can't
  // flood the inbox (or the database).
  const latest = await db.signupOtp.findFirst({
    where: { email, consumed: false },
    orderBy: { createdAt: 'desc' },
  })
  if (latest) {
    const elapsed = Date.now() - latest.createdAt.getTime()
    if (elapsed < RESEND_COOLDOWN_MS) {
      const cooldownSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
      return {
        ok: false,
        error: `Please wait ${cooldownSeconds}s before requesting a new code.`,
        cooldownSeconds,
      }
    }
  }

  // Void older codes — only the newest one may verify.
  await db.signupOtp.updateMany({
    where: { email, consumed: false },
    data: { consumed: true },
  })

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS)
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await db.signupOtp.create({
    data: { email, codeHash, expiresAt },
  })

  if (mailConfigured()) {
    const delivered = await sendOtpEmail(email, code).catch(() => false)
    if (!delivered) {
      return {
        ok: false,
        error: 'We could not send the verification email. Please try again in a moment.',
      }
    }
    return { ok: true, expiresAt }
  }

  // No mail provider on this environment — surface the code honestly so
  // the signup flow still works end to end. The UI explains this.
  console.log(`[otp] RESEND_API_KEY not set — signup code for ${email}: ${code}`)
  return { ok: true, devCode: code, expiresAt }
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; error: string; tooManyAttempts?: boolean; expired?: boolean }

/**
 * Check a 6-digit code for an email. On success the code is consumed and
 * `User.emailVerified` is stamped. Wrong entries count toward a cap of
 * MAX_ATTEMPTS; hitting the cap voids the code and forces a resend.
 */
export async function verifySignupOtpCode(rawEmail: string, rawCode: string): Promise<VerifyOtpResult> {
  const email = rawEmail.trim().toLowerCase()
  const code = rawCode.trim()

  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: 'Enter the 6-digit code from your email.' }
  }

  const otp = await db.signupOtp.findFirst({
    where: { email, consumed: false },
    orderBy: { createdAt: 'desc' },
  })
  if (!otp) {
    return { ok: false, error: 'No active code for this email. Request a new one.' }
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    await db.signupOtp.update({ where: { id: otp.id }, data: { consumed: true } })
    return {
      ok: false,
      tooManyAttempts: true,
      error: 'Too many wrong attempts. Request a new code to continue.',
    }
  }

  if (otp.expiresAt.getTime() < Date.now()) {
    await db.signupOtp.update({ where: { id: otp.id }, data: { consumed: true } })
    return { ok: false, expired: true, error: 'This code has expired. Request a new one.' }
  }

  const match = await bcrypt.compare(code, otp.codeHash)
  if (!match) {
    const attempts = otp.attempts + 1
    const consumed = attempts >= MAX_ATTEMPTS
    await db.signupOtp.update({ where: { id: otp.id }, data: { attempts, consumed } })
    return {
      ok: false,
      tooManyAttempts: consumed,
      error: consumed
        ? 'Too many wrong attempts. Request a new code to continue.'
        : `That code is not right. ${MAX_ATTEMPTS - attempts} ${MAX_ATTEMPTS - attempts === 1 ? 'try' : 'tries'} left.`,
    }
  }

  // Verified — burn the code and stamp the account in one go.
  await db.signupOtp.update({ where: { id: otp.id }, data: { consumed: true } })
  await db.user.updateMany({
    where: { email, role: 'CUSTOMER' },
    data: { emailVerified: new Date() },
  })
  return { ok: true }
}

/** Branded transactional email via Resend's REST API. Returns true on 2xx. */
async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false
  const from = process.env.EMAIL_FROM || 'Wardrobecare <onboarding@resend.dev>'

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `${code} is your Wardrobecare verification code`,
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1817;">
          <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #8a8580; margin: 0 0 16px;">Wardrobecare</p>
          <h1 style="font-size: 24px; font-weight: 400; margin: 0 0 12px;">Verify your email</h1>
          <p style="font-size: 14px; line-height: 1.6; color: #4a4540; margin: 0 0 24px;">
            Welcome to Wardrobecare. Enter this code to finish creating your account — it expires in 10 minutes.
          </p>
          <p style="font-size: 34px; letter-spacing: 0.45em; font-weight: 700; margin: 0 0 24px; padding: 16px 20px; background: #f5f3f0; text-align: center;">${code}</p>
          <p style="font-size: 12px; line-height: 1.6; color: #8a8580; margin: 0;">
            You received this email because someone started creating a Wardrobecare account with this address. If that wasn't you, you can ignore it.
          </p>
        </div>
      `,
    }),
  })
  return res.ok
}
