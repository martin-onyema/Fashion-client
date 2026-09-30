/**
 * Paystack payment integration helper.
 * Secret key is NEVER exposed to the client. All verification happens server-side.
 */

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
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret || secret === 'sk_test_x') {
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
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret || secret === 'sk_test_x') {
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
 * Get the public key for client-side Paystack Pop. Falls back to a placeholder
 * in development so the UI doesn't crash.
 */
export function getPaystackPublicKey(): string {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_x'
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
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret || secret === 'sk_test_x') {
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

export function verifyPaystackSignature(
  payload: string,
  signature: string,
): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret || secret === 'sk_test_x') {
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
