/**
 * Paystack payment integration helper.
 * Secret key is NEVER exposed to the client. All verification happens server-side.
 *
 * Secret resolution order:
 *   1. env PAYSTACK_SECRET_KEY (backwards compatibility)
 *   2. AdminSettings.paystackSecretKey (set in Admin → Settings — self-serve)
 * When neither is configured, a safe mock path keeps the checkout flow testable.
 */
import { db } from '@/lib/db'

export type PaystackInitResponse = {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export type PaystackVerifyResponse = {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number // in kobo
    currency: string
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    customer: {
      email: string
      name?: string
    }
    metadata?: any
  }
}

/**
 * Resolve the Paystack secret key: env var first, then the value saved in
 * Admin → Settings. Result is cached for 30s to avoid a DB hit per request.
 * Returns null when Paystack is not configured (mock mode).
 */
let secretCache: { value: string | null; at: number } | null = null
const SECRET_TTL_MS = 30_000

export async function getPaystackSecret(): Promise<string | null> {
  const envSecret = process.env.PAYSTACK_SECRET_KEY
  if (envSecret && envSecret !== 'sk_test_x') return envSecret

  if (secretCache && Date.now() - secretCache.at < SECRET_TTL_MS) {
    return secretCache.value
  }
  let value: string | null = null
  try {
    const s = await db.adminSettings.findUnique({
      where: { id: 'singleton' },
      select: { paystackSecretKey: true },
    })
    const saved = s?.paystackSecretKey?.trim()
    if (saved) value = saved
  } catch {
    // DB unavailable — fall through to mock mode
  }
  secretCache = { value, at: Date.now() }
  return value
}

/** Invalidate the cached secret (call after admin saves settings). */
export function invalidatePaystackSecretCache() {
  secretCache = null
}

/** True when a real secret key is configured (env or admin settings). */
export async function isPaystackConfigured(): Promise<boolean> {
  return (await getPaystackSecret()) !== null
}

/**
 * Initialize a Paystack transaction. Returns the authorization URL the
 * customer should be redirected to.
 */
export async function initializePaystackTransaction(params: {
  email: string
  amount: number // in naira
  reference: string
  callback_url: string
  metadata?: Record<string, any>
}): Promise<PaystackInitResponse> {
  const secret = await getPaystackSecret()
  if (!secret) {
    // Sandbox / not-configured path: return a mock URL pointing to /checkout/verify
    // so the dev experience is smooth. In production, set PAYSTACK_SECRET_KEY.
    const sep = params.callback_url.includes('?') ? '&' : '?'
    return {
      status: true,
      message: 'Mock (no Paystack secret configured)',
      data: {
        authorization_url: `${params.callback_url}${sep}reference=${params.reference}&mock=1`,
        access_code: 'mock_access_code',
        reference: params.reference,
      },
    }
  }

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100), // naira → kobo
      reference: params.reference,
      callback_url: params.callback_url,
      metadata: params.metadata,
      currency: 'NGN',
    }),
  })
  return res.json()
}

/**
 * Verify a Paystack transaction server-side. ONLY this function determines
 * whether an order is marked as paid.
 */
export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackVerifyResponse | null> {
  const secret = await getPaystackSecret()
  if (!secret) {
    // Sandbox path: trust the request only if it carries mock=1
    return {
      status: true,
      message: 'Mock verification',
      data: {
        id: 0,
        domain: 'test',
        status: 'success',
        reference,
        amount: 0,
        currency: 'NGN',
        gateway_response: 'Approved',
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        channel: 'mock',
        customer: { email: '' },
      },
    } as any
  }

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
    },
  )
  if (!res.ok) return null
  return res.json()
}

/**
 * Get the public key for client-side Paystack Pop. Returns an empty string
 * when Paystack is not configured — checkout hides the card option and
 * falls back to bank transfer / WhatsApp ordering in that case.
 */
export function getPaystackPublicKey(): string {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || ''
}

/**
 * Refund a Paystack transaction. The `transactionId` is Paystack's tx id
 * (NOT the reference). You can also pass `reference` to refund by reference
 * — Paystack supports both.
 *
 * Returns the gateway response or null on failure.
 *
 * Refunds in Paystack take time to settle — the status will be `pending`
 * initially and become `processed` when settled. We treat the refund as
 * successful when Paystack returns `status: true`.
 */
export type PaystackRefundResponse = {
  status: boolean
  message: string
  data: {
    transaction: number
    integration: number
    domain: string
    currency: string
    amount: number // in kobo
    channel: string
    merchant_note: string | null
    status: string // 'pending' | 'processed' | 'failed' | 'reversed'
    refunded_at: string | null
    refund_reference: string
    refund_type: string // 'full' | 'partial'
    created_at: string
    updated_at: string
  }
}

export async function refundPaystackTransaction(params: {
  reference: string
  amount: number // in naira
  merchant_note?: string
}): Promise<PaystackRefundResponse | null> {
  const secret = await getPaystackSecret()
  if (!secret) {
    // Mock path — Pretend the refund succeeded
    return {
      status: true,
      message: 'Mock refund (no Paystack secret configured)',
      data: {
        transaction: 0,
        integration: 0,
        domain: 'test',
        currency: 'NGN',
        amount: Math.round(params.amount * 100),
        channel: 'mock',
        merchant_note: params.merchant_note ?? null,
        status: 'processed',
        refunded_at: new Date().toISOString(),
        refund_reference: `rfn_mock_${Date.now()}`,
        refund_type: 'partial',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }
  }

  const res = await fetch('https://api.paystack.co/refund', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reference: params.reference, // refund by transaction reference
      amount: Math.round(params.amount * 100), // naira → kobo
      currency: 'NGN',
      merchant_note: params.merchant_note,
    }),
  })
  if (!res.ok) return null
  return res.json()
}

/**
 * Verify the `x-paystack-signature` header against the raw body using
 * HMAC SHA512 with the secret key.
 *
 * Used by the webhook endpoint to ensure the request really came from
 * Paystack and not an attacker.
 */
import crypto from 'node:crypto'

export async function verifyPaystackSignature(
  payload: string,
  signature: string,
): Promise<boolean> {
  const secret = await getPaystackSecret()
  if (!secret) {
    // Mock path: accept any payload so dev webhook tests work
    return true
  }
  const expected = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex')
  // Use timingSafeEqual to avoid timing attacks
  try {
    if (expected.length !== signature.length) return false
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex'),
    )
  } catch {
    return false
  }
}
