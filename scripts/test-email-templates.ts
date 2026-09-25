/**
 * Email module test — run with: node_modules/.bin/jiti scripts/test-email-templates.ts
 *
 * 1. Verifies graceful degradation (no RESEND_API_KEY in sandbox → all sends
 *    must return { ok:false, skipped:true } WITHOUT throwing).
 * 2. Renders all 4 customer templates + admin alert to real HTML files so
 *    they can be previewed in a browser.
 */
import {
  emailConfigured,
  sendEmail,
  sendOrderConfirmation,
  sendPaymentReceipt,
  sendTrackingUpdate,
  sendRefundConfirmation,
  notifyAdminNewOrder,
} from '../src/lib/email'
import fs from 'node:fs'

const order = {
  orderNumber: 'WC-TEST-1001',
  customerName: 'Adewale Johnson',
  email: 'customer@example.com',
  phone: '+234 803 555 0101',
  state: 'Lagos',
  city: 'Ikeja',
  address: '12 Adeola Odeku Street, Apt 4B',
  subtotal: 87500,
  deliveryFee: 0,
  discount: 5000,
  total: 82500,
  paymentMethod: 'PAYSTACK',
  status: 'PAID',
}

const items = [
  { productName: 'Milano Double-Breasted Suit', size: '52R', color: 'Charcoal', quantity: 1, unitPrice: 65000, totalPrice: 65000 },
  { productName: 'Egyptian Cotton Dress Shirt', size: 'L', color: 'White', quantity: 1, unitPrice: 22500, totalPrice: 22500 },
  { productName: 'Hand-Stitched Leather Loafers', size: '43', color: 'Tan', quantity: 1, unitPrice: 0, totalPrice: 0 },
]

let pass = 0
let fail = 0
function check(name: string, cond: boolean, extra = '') {
  if (cond) {
    pass++
    console.log(`  ✔ ${name}`)
  } else {
    fail++
    console.log(`  ✘ ${name} ${extra}`)
  }
}

async function main() {
  console.log('== 1. Graceful degradation (no API key configured) ==')
  console.log(`  emailConfigured(): ${emailConfigured()}`)
  check('emailConfigured() = false in sandbox', emailConfigured() === false)

  const r1 = await sendEmail({ to: 'x@y.com', subject: 'raw test', html: '<p>hi</p>' })
  check('raw sendEmail skips without throwing', r1.ok === false && r1.skipped === true)

  const r2 = await sendOrderConfirmation(order, items)
  check('sendOrderConfirmation skips safely', r2.skipped === true)

  const r3 = await sendPaymentReceipt(order, items, { reference: 'WC-TEST-1001-abc', paidAt: new Date() })
  check('sendPaymentReceipt skips safely', r3.skipped === true)

  const r4 = await sendTrackingUpdate(order, { trackingNumber: 'GIG-12345678', carrier: 'GIG Logistics' })
  check('sendTrackingUpdate skips safely', r4.skipped === true)

  const r5 = await sendRefundConfirmation(order, { amount: 82500, reason: 'Customer request', full: true })
  check('sendRefundConfirmation skips safely', r5.skipped === true)

  const r6 = await notifyAdminNewOrder(order, items, 'owner@wardrobecare.com.ng')
  check('notifyAdminNewOrder skips safely', r6.skipped === true)

  console.log('\n== 2. Template rendering (HTML previews) ==')
  // The template builders are invoked by the send functions; to capture the
  // HTML we re-derive it by temporarily intercepting fetch.
  const captured: Record<string, string> = {}
  const realFetch = globalThis.fetch
  // @ts-ignore
  globalThis.fetch = async (url: any, init: any) => {
    const body = JSON.parse(init.body)
    captured[body.subject] = body.html
    return new Response(JSON.stringify({ id: 'preview' }), { status: 200 })
  }
  // Pretend we have a key so templates actually render + "send"
  process.env.RESEND_API_KEY = 're_test_preview'
  process.env.EMAIL_FROM = 'Wardrobecare <codes@wardrobecare.com.ng>'

  await sendOrderConfirmation(order, items, 'support@wardrobecare.com.ng')
  await sendPaymentReceipt(order, items, { reference: 'WC-TEST-1001-abc', paidAt: new Date() }, 'support@wardrobecare.com.ng')
  await sendTrackingUpdate(order, { trackingNumber: 'GIG-12345678', carrier: 'GIG Logistics' })
  await sendRefundConfirmation(order, { amount: 82500, reason: 'Customer request', full: true })
  await notifyAdminNewOrder(order, items, 'owner@wardrobecare.com.ng')

  globalThis.fetch = realFetch
  process.env.RESEND_API_KEY = undefined as any

  const outDir = '/home/z/my-project/download/email-previews'
  fs.mkdirSync(outDir, { recursive: true })
  const names = Object.keys(captured)
  for (const subject of names) {
    const slug = subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)
    fs.writeFileSync(`${outDir}/${slug}.html`, captured[subject])
    console.log(`  📄 ${slug}.html  (${(captured[subject].length / 1024).toFixed(1)} KB)`)
  }
  check('all 5 templates rendered non-empty HTML', names.length === 5 && Object.values(captured).every((h) => h.length > 2000))

  console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`)
  if (fail > 0) process.exit(1)
}

main().catch((e) => {
  console.error('TEST CRASHED:', e)
  process.exit(1)
})
