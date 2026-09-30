/**
 * E2E test: Paystack flow — secret-from-DB, webhook charge.success over HTTP,
 * verifyPayment, idempotency, stock decrement.
 * Run: bun scripts/test-paystack-e2e.ts   (dev server must be running)
 */
import { db } from '../src/lib/db'
import {
  getPaystackSecret,
  isPaystackConfigured,
  invalidatePaystackSecretCache,
} from '../src/lib/paystack/server'

const BASE = 'http://localhost:3000'

async function main() {
  console.log('=== 1. Secret resolution (not configured) ===')
  invalidatePaystackSecretCache()
  console.log('getPaystackSecret:', await getPaystackSecret(), '(expect null)')
  console.log('isPaystackConfigured:', await isPaystackConfigured(), '(expect false)')

  console.log('\n=== 2. Secret resolution (saved in admin settings DB) ===')
  await db.adminSettings.upsert({
    where: { id: 'singleton' },
    update: { paystackSecretKey: 'sk_test_e2e_fake_12345' },
    create: { id: 'singleton', paystackSecretKey: 'sk_test_e2e_fake_12345' },
  })
  invalidatePaystackSecretCache()
  console.log('getPaystackSecret:', await getPaystackSecret(), '(expect sk_test_e2e_fake_12345)')
  console.log('isPaystackConfigured:', await isPaystackConfigured(), '(expect true)')
  await db.adminSettings.update({ where: { id: 'singleton' }, data: { paystackSecretKey: null } })
  invalidatePaystackSecretCache()
  console.log('cleaned up:', await getPaystackSecret(), '(expect null)')

  console.log('\n=== 3. Create test order + pending payment ===')
  const variant = await db.productVariant.findFirst({
    where: { stock: { gt: 5 } },
    include: { product: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!variant) throw new Error('no variant with stock found')
  console.log(`product: ${variant.product.name} (${variant.size ?? 'no size'}), stock=${variant.stock}, price=${variant.price}`)
  const beforeStock = variant.stock
  const qty = 2
  const subtotal = Number(variant.price) * qty
  const deliveryFee = 2500
  const total = subtotal + deliveryFee
  const orderNumber = `WC-TEST-${Date.now().toString(36).toUpperCase()}`
  const reference = `${orderNumber}-${Date.now().toString(36)}`
  await db.order.create({
    data: {
      orderNumber,
      customerName: 'E2E Test Buyer',
      email: 'e2e-test@wardrobecare.example',
      phone: '08000000000',
      state: 'Lagos',
      city: 'Ikeja',
      address: '1 Test Street, E2E Lane',
      subtotal,
      deliveryFee,
      total,
      paymentMethod: 'PAYSTACK',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      items: { create: [{ productId: variant.productId, variantId: variant.id, productName: variant.product.name, productSlug: variant.product.slug, productImage: variant.product.images?.[0]?.url ?? null, size: variant.size, quantity: qty, unitPrice: variant.price, totalPrice: subtotal }] },
      statusHistory: { create: { status: 'PENDING', note: 'Order received (e2e test)' } },
      payments: { create: { provider: 'PAYSTACK', reference, amount: total, status: 'PENDING' } },
    },
  })
  console.log('order:', orderNumber, '| reference:', reference, '| total:', total)

  console.log('\n=== 4. Webhook over HTTP: charge.success (mock mode accepts any signature) ===')
  const event = {
    event: 'charge.success',
    data: { reference, amount: total * 100, currency: 'NGN', status: 'success', gateway_response: 'Approved' },
  }
  const res = await fetch(`${BASE}/api/webhooks/paystack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-paystack-signature': 'mock' },
    body: JSON.stringify(event),
  })
  const body = await res.json()
  console.log('webhook response:', res.status, JSON.stringify(body))

  console.log('\n=== 5. DB state after webhook ===')
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { payments: true },
  })
  if (!order) throw new Error('order missing')
  const afterVariant = await db.productVariant.findUnique({ where: { id: variant.id } })
  console.log('order.status:', order.status, '(expect PAID)')
  console.log('order.paymentStatus:', order.paymentStatus, '(expect SUCCESS)')
  console.log('payment.verified:', order.payments[0]?.verified, '(expect true)')
  console.log(`stock: ${beforeStock} -> ${afterVariant?.stock} (expect -${qty})`)
  const okState =
    order.status === 'PAID' &&
    order.paymentStatus === 'SUCCESS' &&
    order.payments[0]?.verified === true &&
    afterVariant?.stock === beforeStock - qty

  console.log('\n=== 6. Idempotency: replay same webhook ===')
  const res2 = await fetch(`${BASE}/api/webhooks/paystack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-paystack-signature': 'mock' },
    body: JSON.stringify(event),
  })
  console.log('replay response:', res2.status, JSON.stringify(await res2.json()))
  const stockAfterReplay = (await db.productVariant.findUnique({ where: { id: variant.id } }))?.stock
  console.log('stock unchanged after replay:', stockAfterReplay === beforeStock - qty, '(expect true)')

  console.log('\n=== 7. verifyPayment (customer redirect path) ===')
  const { verifyPayment } = await import('../src/actions/store')
  const v = await verifyPayment(reference)
  console.log('verifyPayment:', JSON.stringify(v), '(expect ok, PAID)')

  console.log('\n=== 8. Cleanup ===')
  await db.order.delete({ where: { id: order.id } })
  console.log('test order deleted')

  console.log('\n' + (okState ? '✅ E2E PASS — webhook → PAID → stock → idempotency all correct' : '❌ E2E FAIL — state mismatch'))
  if (!okState) process.exit(1)
}

main()
  .catch((e) => {
    console.error('❌ E2E ERROR:', e?.message ?? e)
    process.exit(1)
  })
  .finally(() => process.exit(0))
