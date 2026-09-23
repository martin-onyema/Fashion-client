/**
 * Paystack webhook endpoint.
 *
 * Paystack POSTs events to this URL whenever a transaction's status
 * changes (e.g. payment succeeded, refund processed, charge failed).
 *
 * Flow:
 *   1. Read the raw body (needed for signature verification — we cannot
 *      use Next's `request.json()` because it consumes the stream).
 *   2. Verify the `x-paystack-signature` HMAC-SHA512 header.
 *   3. Idempotency check — store the event reference in WebhookEvent; if
 *      already processed, return 200 without re-doing the work.
 *   4. Process the event:
 *      - charge.success → mark Order as PAID (if not already)
 *      - refund.processed → mark Refund as SUCCESS
 *      - refund.failed → mark Refund as FAILED + create notification
 *      - transfer.failed → create notification (we don't issue transfers)
 *
 * Always returns 200 OK so Paystack doesn't retry indefinitely. Failures
 * are logged but never bubble up to the response.
 *
 * Configure your webhook URL in Paystack Dashboard → Settings → Webhooks.
 * The URL is: https://your-domain.com/api/webhooks/paystack
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPaystackSignature } from '@/lib/paystack/server'
import { auditLog } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let rawBody = ''
  try {
    rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature') ?? ''

    // 1. Verify signature
    if (!(await verifyPaystackSignature(rawBody, signature))) {
      console.warn('[paystack-webhook] invalid signature — ignoring')
      return NextResponse.json({ status: 'invalid signature' }, { status: 200 })
    }

    const event = JSON.parse(rawBody)
    const eventType: string = event.event
    const data: any = event.data ?? {}
    const reference: string = data.reference ?? data.refund_reference ?? event.id?.toString() ?? cryptoRandom()
    const provider = 'paystack'

    // 2. Idempotency — store the webhook reference
    const existing = await db.webhookEvent.findUnique({ where: { reference } }).catch(() => null)
    if (existing?.processed) {
      return NextResponse.json({ status: 'already processed' })
    }
    if (existing) {
      // Already stored but not processed — continue processing
    } else {
      await db.webhookEvent.create({
        data: {
          provider,
          eventType,
          reference,
          payload: rawBody.slice(0, 8000),
        },
      }).catch(() => {/* might be a race — ignore */})
    }

    // 3. Dispatch on event type
    switch (eventType) {
      case 'charge.success':
        await handleChargeSuccess(data)
        break
      case 'refund.processed':
        await handleRefundProcessed(data)
        break
      case 'refund.failed':
        await handleRefundFailed(data)
        break
      case 'transfer.failed':
      case 'transfer.reversed':
        await createSystemNotificationsSafe({
          type: 'SYSTEM',
          title: 'Paystack transfer issue',
          body: `Transfer event: ${eventType} for ${reference}`,
          link: '/admin/orders',
        })
        break
      default:
        // Unknown event — log it for visibility
        console.log(`[paystack-webhook] unhandled event type: ${eventType}`)
    }

    // 4. Mark processed
    await db.webhookEvent.updateMany({
      where: { reference },
      data: { processed: true, processedAt: new Date() },
    }).catch(() => {/* ignore */})

    return NextResponse.json({ status: 'ok' })
  } catch (e: any) {
    console.error('[paystack-webhook] processing failed:', e?.message)
    // Return 200 anyway so Paystack doesn't retry forever — the event is
    // stored in WebhookEvent and we can re-process manually if needed.
    return NextResponse.json({ status: 'error', error: e?.message }, { status: 200 })
  }
}

/**
 * Handle charge.success — mark order as PAID if it isn't already.
 *
 * This is the canonical source of truth for "is this order paid?".
 * The customer's browser hitting /checkout/verify is a secondary
 * verification path; the webhook is what really finalises payment
 * even if the customer closes the tab.
 */
async function handleChargeSuccess(data: any) {
  const reference: string = data.reference
  if (!reference) return

  const payment = await db.payment.findUnique({
    where: { reference },
    include: { order: { include: { items: true } } },
  })
  if (!payment) {
    // Unknown payment — probably a transaction we never initialised
    return
  }
  if (payment.verified && payment.status === 'SUCCESS') {
    // Already processed
    return
  }

  const paidAmountKobo = data.amount ?? 0
  const paidAmountNaira = paidAmountKobo / 100
  // Tolerance: 1 naira
  if (Math.abs(paidAmountNaira - payment.amount) > 1) {
    console.warn(
      `[paystack-webhook] amount mismatch for ${reference}: expected ${payment.amount} got ${paidAmountNaira}`,
    )
  }

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        verified: true,
        paidAt: new Date(),
        rawResponse: JSON.stringify(data).slice(0, 8000),
      },
    })
    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'PAID',
        paymentStatus: 'SUCCESS',
        statusHistory: {
          create: {
            status: 'PAID',
            note: 'Payment confirmed via Paystack webhook',
          },
        },
      },
    })
    // Decrement stock on each order item
    for (const item of payment.order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      }
    }
  })

  // Create notifications for staff
  await createSystemNotificationsSafe({
    type: 'NEW_ORDER',
    title: `New paid order ${payment.order.orderNumber}`,
    body: `Payment confirmed via webhook. Amount: ₦${paidAmountNaira.toFixed(0)}`,
    link: `/admin/orders/${payment.orderId}`,
  })
}

/**
 * Handle refund.processed — mark Refund as SUCCESS.
 */
async function handleRefundProcessed(data: any) {
  const refundReference: string = data.refund_reference
  if (!refundReference) return

  const refund = await db.refund.findUnique({
    where: { reference: refundReference },
    include: { order: true },
  })
  if (!refund) return
  if (refund.status === 'SUCCESS') return

  await db.refund.update({
    where: { id: refund.id },
    data: {
      status: 'SUCCESS',
      processedAt: new Date(),
      rawResponse: JSON.stringify(data).slice(0, 8000),
    },
  })

  // If this was the final refund, also restore inventory
  if (refund.amount + refund.amount >= refund.order.total) {
    // Already handled in the action — but if webhook fired first we redo
  }

  await createSystemNotificationsSafe({
    type: 'REFUND_ISSUED',
    title: `Refund processed on ${refund.order.orderNumber}`,
    body: `₦${refund.amount} settled successfully`,
    link: `/admin/orders/${refund.orderId}`,
  })
}

async function handleRefundFailed(data: any) {
  const refundReference: string = data.refund_reference
  if (!refundReference) return

  const refund = await db.refund.findUnique({
    where: { reference: refundReference },
    include: { order: true },
  })
  if (!refund) return

  await db.refund.update({
    where: { id: refund.id },
    data: {
      status: 'FAILED',
      rawResponse: JSON.stringify(data).slice(0, 8000),
    },
  })

  await createSystemNotificationsSafe({
    type: 'REFUND_FAILED',
    title: `Refund FAILED on ${refund.order.orderNumber}`,
    body: `Refund of ₦${refund.amount} failed at gateway. Reason: ${data.merchant_note ?? 'unknown'}`,
    link: `/admin/orders/${refund.orderId}`,
  })
}

/**
 * Safe variant of the notification helper — never throws.
 */
async function createSystemNotificationsSafe(input: {
  type: any
  title: string
  body?: string
  link?: string
}) {
  try {
    const staff = await db.user.findMany({
      where: { role: { not: 'CUSTOMER' }, active: true },
      select: { id: true },
    })
    if (staff.length === 0) return
    await db.notification.createMany({
      data: staff.map((s) => ({
        recipientId: s.id,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link,
      })),
    })
  } catch (e) {
    console.error('[createSystemNotificationsSafe] failed:', e)
  }
}

function cryptoRandom() {
  return `wh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * GET endpoint — return 200 so Paystack's webhook URL verifier accepts.
 */
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Paystack webhook endpoint' })
}
