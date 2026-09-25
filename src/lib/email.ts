/**
 * Transactional email for Wardrobecare — powered by Resend.
 *
 * Design goals:
 *  - ZERO new dependencies: uses the Resend REST API via fetch.
 *  - GRACEFUL DEGRADATION: if RESEND_API_KEY is missing (or Resend is down)
 *    every function logs and returns safely — checkout and admin actions
 *    NEVER fail because of email.
 *  - BRANDED: templates follow the store's monochrome identity
 *    (#121110 black / #f7f6f3 warm white / #e9e7e1 warm grey).
 *
 * Environment variables (set in Vercel):
 *  - RESEND_API_KEY  re_...        (from resend.com/api-keys)
 *  - EMAIL_FROM      Wardrobecare <codes@wardrobecare.com.ng>
 *                                    (domain already verified in Resend)
 * Optional:
 *  - ADMIN_NOTIFY_EMAIL  fallback recipient for new-order alerts when the
 *                        store's supportEmail setting is empty.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const SEND_TIMEOUT_MS = 5000

export type EmailOrderItem = {
  productName: string
  size?: string | null
  color?: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

export type EmailOrder = {
  orderNumber: string
  customerName: string
  email: string
  phone?: string | null
  state: string
  city: string
  address: string
  subtotal: number
  deliveryFee: number
  discount?: number
  total: number
  paymentMethod?: string | null
  status?: string
}

export type EmailSendResult = {
  ok: boolean
  skipped?: boolean
  id?: string
  error?: string
}

// ────────────────────────────────────────────────────────────
// Core client
// ────────────────────────────────────────────────────────────

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

function fromAddress(): string {
  return process.env.EMAIL_FROM || 'Wardrobecare Clothing <onboarding@resend.dev>'
}

function baseUrl(): string {
  return (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/+$/, '')
}

/**
 * Low-level send. Never throws — every failure is captured and logged.
 */
export async function sendEmail(input: {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}): Promise<EmailSendResult> {
  if (!emailConfigured()) {
    console.log(`[email] skipped (RESEND_API_KEY not set): "${input.subject}" → ${input.to}`)
    return { ok: false, skipped: true, error: 'email-not-configured' }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS)

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [input.to],
        subject: input.subject,
        html: input.html,
        ...(input.text ? { text: input.text } : {}),
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[email] resend ${res.status} for "${input.subject}" → ${input.to}: ${body.slice(0, 300)}`)
      return { ok: false, error: `resend-${res.status}` }
    }

    const data: any = await res.json().catch(() => ({}))
    console.log(`[email] sent "${input.subject}" → ${input.to} (id: ${data?.id ?? '?'})`)
    return { ok: true, id: data?.id }
  } catch (e: any) {
    const reason = e?.name === 'AbortError' ? 'timeout' : e?.message
    console.error(`[email] failed "${input.subject}" → ${input.to}: ${reason}`)
    return { ok: false, error: String(reason) }
  } finally {
    clearTimeout(timer)
  }
}

// ────────────────────────────────────────────────────────────
// Branding helpers
// ────────────────────────────────────────────────────────────

function naira(amount: number): string {
  return `₦${Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
}

function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const C = {
  ink: '#121110',
  paper: '#f7f6f3',
  card: '#ffffff',
  muted: '#6f6c66',
  line: '#e9e7e1',
  good: '#1f7a4d',
} as const

function layout(opts: { title: string; preheader?: string; body: string }): string {
  const year = new Date().getFullYear()
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;padding:0;background:${C.paper};font-family:Georgia,'Times New Roman',serif;">
<span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(opts.preheader ?? opts.title)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:32px 12px;">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- Brand bar -->
    <tr><td style="background:${C.ink};padding:28px 40px;text-align:center;">
      <div style="color:#f7f6f3;font-family:Helvetica,Arial,sans-serif;font-size:20px;letter-spacing:6px;font-weight:bold;">WARDROBECARE</div>
      <div style="color:#a8a49c;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:3px;margin-top:6px;">CLOTHING &middot; LAGOS</div>
    </td></tr>

    <!-- Body card -->
    <tr><td style="background:${C.card};border:1px solid ${C.line};border-top:none;padding:40px;">
      <h1 style="margin:0 0 8px;color:${C.ink};font-family:Helvetica,Arial,sans-serif;font-size:22px;font-weight:bold;">${escapeHtml(opts.title)}</h1>
      ${opts.body}
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:24px 8px;text-align:center;">
      <div style="color:${C.muted};font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:18px;">
        &copy; ${year} Wardrobecare Clothing &middot; Your #1 Personal Shopper for premium men's fashion<br>
        Questions? Reply to this email or reach us on WhatsApp &middot; <a href="${baseUrl()}/track-order" style="color:${C.ink};">Track your order</a>
      </div>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 4px;"><tr>
<td style="background:${C.ink};border-radius:3px;">
  <a href="${href}" style="display:inline-block;padding:13px 34px;color:#f7f6f3;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:2px;text-decoration:none;">${escapeHtml(label)}</a>
</td></tr></table>`
}

function itemsTable(items: EmailOrderItem[]): string {
  const rows = items.map((it) => {
    const variant = [it.size, it.color].filter(Boolean).join(' / ')
    return `<tr>
  <td style="padding:10px 0;border-bottom:1px solid ${C.line};color:${C.ink};font-family:Helvetica,Arial,sans-serif;font-size:13px;">
    ${escapeHtml(it.productName)}${variant ? `<span style="color:${C.muted};"> &nbsp;(${escapeHtml(variant)})</span>` : ''}
    <span style="color:${C.muted};"> &nbsp;&times;${it.quantity}</span>
  </td>
  <td align="right" style="padding:10px 0;border-bottom:1px solid ${C.line};color:${C.ink};font-family:Helvetica,Arial,sans-serif;font-size:13px;white-space:nowrap;">${naira(it.totalPrice)}</td>
</tr>`
  })
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join('')}</table>`
}

function totalsBlock(order: EmailOrder): string {
  const discount = order.discount && order.discount > 0
    ? `<tr><td style="padding:4px 0;color:${C.muted};font-family:Helvetica,Arial,sans-serif;font-size:13px;">Discount</td>
       <td align="right" style="padding:4px 0;color:${C.good};font-family:Helvetica,Arial,sans-serif;font-size:13px;">&minus;${naira(order.discount)}</td></tr>`
    : ''
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
  <tr><td style="padding:4px 0;color:${C.muted};font-family:Helvetica,Arial,sans-serif;font-size:13px;">Subtotal</td>
      <td align="right" style="padding:4px 0;color:${C.ink};font-family:Helvetica,Arial,sans-serif;font-size:13px;">${naira(order.subtotal)}</td></tr>
  ${discount}
  <tr><td style="padding:4px 0;color:${C.muted};font-family:Helvetica,Arial,sans-serif;font-size:13px;">Delivery</td>
      <td align="right" style="padding:4px 0;color:${C.ink};font-family:Helvetica,Arial,sans-serif;font-size:13px;">${order.deliveryFee > 0 ? naira(order.deliveryFee) : 'Free'}</td></tr>
  <tr><td style="padding:12px 0 0;border-top:2px solid ${C.ink};color:${C.ink};font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold;">Total</td>
      <td align="right" style="padding:12px 0 0;border-top:2px solid ${C.ink};color:${C.ink};font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold;">${naira(order.total)}</td></tr>
</table>`
}

function addressBlock(order: EmailOrder): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:${C.paper};border:1px solid ${C.line};">
  <tr><td style="padding:16px 20px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:20px;color:${C.muted};">
    <strong style="color:${C.ink};letter-spacing:1px;">DELIVERING TO</strong><br>
    ${escapeHtml(order.customerName)}<br>
    ${escapeHtml(order.address)}, ${escapeHtml(order.city)}, ${escapeHtml(order.state)}<br>
    ${escapeHtml(order.phone ?? '')}
  </td></tr>
</table>`
}

function paragraph(text: string): string {
  return `<p style="margin:8px 0 20px;color:${C.muted};font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;">${text}</p>`
}

function orderBadge(orderNumber: string): string {
  return `<div style="margin:0 0 20px;color:${C.ink};font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:1px;">
    <span style="background:${C.paper};border:1px solid ${C.line};padding:6px 14px;">ORDER ${escapeHtml(orderNumber)}</span>
  </div>`
}

// ────────────────────────────────────────────────────────────
// 1. Order confirmation (fires on order creation)
// ────────────────────────────────────────────────────────────

export async function sendOrderConfirmation(
  order: EmailOrder,
  items: EmailOrderItem[],
  replyTo?: string,
): Promise<EmailSendResult> {
  const payNote =
    order.paymentMethod === 'WHATSAPP'
      ? 'One of our stylists will contact you on WhatsApp to arrange payment and delivery.'
      : 'Complete your payment via the secure Paystack checkout — you will receive a receipt the moment it succeeds.'
  const html = layout({
    title: `Thank you, ${order.customerName.split(' ')[0]} — your order is confirmed`,
    preheader: `Order ${order.orderNumber} received — ${naira(order.total)}`,
    body: `
      ${orderBadge(order.orderNumber)}
      ${paragraph(`We have received your order and our team is already preparing it. ${payNote}`)}
      ${itemsTable(items)}
      ${totalsBlock(order)}
      ${addressBlock(order)}
      ${button(`${baseUrl()}/track-order`, 'TRACK YOUR ORDER')}
    `,
  })
  return sendEmail({
    to: order.email,
    subject: `Order ${order.orderNumber} confirmed — Wardrobecare Clothing`,
    html,
    replyTo,
  })
}

// ────────────────────────────────────────────────────────────
// 2. Payment receipt (fires when payment is confirmed)
// ────────────────────────────────────────────────────────────

export async function sendPaymentReceipt(
  order: EmailOrder,
  items: EmailOrderItem[],
  payment?: { reference?: string | null; paidAt?: Date | null },
  replyTo?: string,
): Promise<EmailSendResult> {
  const html = layout({
    title: 'Payment confirmed — thank you',
    preheader: `We received ${naira(order.total)} for order ${order.orderNumber}`,
    body: `
      ${orderBadge(order.orderNumber)}
      ${paragraph(`Your payment of <strong style="color:${C.ink};">${naira(order.total)}</strong> was received successfully${
        payment?.paidAt ? ` on ${payment.paidAt.toUTCString()}` : ''
      }. Your order is now being prepared for dispatch.`)}
      ${itemsTable(items)}
      ${totalsBlock(order)}
      ${
        payment?.reference
          ? `<p style="margin:20px 0 0;color:${C.muted};font-family:Helvetica,Arial,sans-serif;font-size:12px;">Payment reference: <span style="color:${C.ink};">${escapeHtml(payment.reference)}</span></p>`
          : ''
      }
      ${addressBlock(order)}
      ${button(`${baseUrl()}/track-order`, 'TRACK YOUR ORDER')}
    `,
  })
  return sendEmail({
    to: order.email,
    subject: `Receipt for order ${order.orderNumber} — payment confirmed`,
    html,
    replyTo,
  })
}

// ────────────────────────────────────────────────────────────
// 3. Shipping / tracking update (fires when admin adds tracking)
// ────────────────────────────────────────────────────────────

export async function sendTrackingUpdate(
  order: EmailOrder,
  tracking: { trackingNumber?: string; trackingUrl?: string; carrier?: string },
  replyTo?: string,
): Promise<EmailSendResult> {
  const carrierLine = tracking.carrier ? ` with ${escapeHtml(tracking.carrier)}` : ''
  const trackingBlock = tracking.trackingNumber
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:${C.paper};border:1px solid ${C.line};">
        <tr><td style="padding:16px 20px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:${C.muted};">
          <strong style="color:${C.ink};letter-spacing:1px;">TRACKING</strong><br>
          ${tracking.carrier ? `${escapeHtml(tracking.carrier)} &nbsp;&middot;&nbsp; ` : ''}
          <span style="color:${C.ink};font-size:15px;">${escapeHtml(tracking.trackingNumber)}</span>
        </td></tr>
      </table>`
    : ''
  const html = layout({
    title: 'Your order is on the way',
    preheader: `Order ${order.orderNumber} has been dispatched`,
    body: `
      ${orderBadge(order.orderNumber)}
      ${paragraph(`Great news — your order has been dispatched${carrierLine} and is on its way to you.`)}
      ${trackingBlock}
      ${paragraph(`Expected delivery: <strong style="color:${C.ink};">2&ndash;5 business days</strong> depending on your location. Our support line will follow up on WhatsApp on the day of delivery.`)}
      ${tracking.trackingUrl ? button(tracking.trackingUrl, 'TRACK PARCEL') : button(`${baseUrl()}/track-order`, 'TRACK YOUR ORDER')}
    `,
  })
  return sendEmail({
    to: order.email,
    subject: `Your Wardrobecare order ${order.orderNumber} is on the way`,
    html,
    replyTo,
  })
}

// ────────────────────────────────────────────────────────────
// 4. Refund confirmation (fires after a successful refund)
// ────────────────────────────────────────────────────────────

export async function sendRefundConfirmation(
  order: EmailOrder,
  refund: { amount: number; reason?: string; full: boolean },
  replyTo?: string,
): Promise<EmailSendResult> {
  const html = layout({
    title: 'Your refund has been processed',
    preheader: `Refund of ${naira(refund.amount)} for order ${order.orderNumber}`,
    body: `
      ${orderBadge(order.orderNumber)}
      ${paragraph(`We have processed a refund of <strong style="color:${C.ink};">${naira(refund.amount)}</strong> for your order${
        refund.reason ? ` — reason: ${escapeHtml(refund.reason)}` : ''
      }. ${refund.full ? 'This is a full refund for the order.' : 'This is a partial refund for the returned items.'}`)}
      ${paragraph(`Refunds to cards typically appear within <strong style="color:${C.ink};">5&ndash;10 business days</strong>, depending on your bank. If you do not see it by then, reply to this email and we will trace it with Paystack immediately.`)}
      ${paragraph(`We are sorry this purchase did not work out, and we appreciate your patience.`)}
    `,
  })
  return sendEmail({
    to: order.email,
    subject: `Refund processed for order ${order.orderNumber} — Wardrobecare Clothing`,
    html,
    replyTo,
  })
}

// ────────────────────────────────────────────────────────────
// 5. Internal new-order alert (to the store owner)
// ────────────────────────────────────────────────────────────

export async function notifyAdminNewOrder(
  order: EmailOrder,
  items: EmailOrderItem[],
  adminEmail: string | null | undefined,
): Promise<EmailSendResult> {
  const target = adminEmail || process.env.ADMIN_NOTIFY_EMAIL
  if (!target) {
    console.log('[email] admin alert skipped (no supportEmail / ADMIN_NOTIFY_EMAIL)')
    return { ok: false, skipped: true, error: 'no-admin-email' }
  }
  const html = layout({
    title: `New order ${order.orderNumber} — ${naira(order.total)}`,
    preheader: `${order.customerName} placed a ${naira(order.total)} order`,
    body: `
      ${orderBadge(order.orderNumber)}
      ${paragraph(`<strong style="color:${C.ink};">${escapeHtml(order.customerName)}</strong> just placed an order via
        ${order.paymentMethod === 'WHATSAPP' ? 'WhatsApp' : 'Paystack checkout'}.`) }
      ${itemsTable(items)}
      ${totalsBlock(order)}
      ${addressBlock(order)}
      ${button(`${baseUrl()}/admin/orders`, 'OPEN ADMIN CONSOLE')}
    `,
  })
  return sendEmail({
    to: target,
    subject: `🔔 New order ${order.orderNumber} — ${naira(order.total)}`,
    html,
  })
}
