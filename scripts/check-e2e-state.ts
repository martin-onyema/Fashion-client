import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

const email = process.argv[2] || 'e2e-test@wc-verify.com'

const u = await db.user.findUnique({ where: { email } })
console.log('DB user:', u ? { email: u.email, name: u.name, role: u.role, active: u.active, hasHash: !!u.passwordHash } : 'NOT FOUND')

// Latest orders (for the E2E purchase check)
const orders = await db.order.findMany({
  orderBy: { createdAt: 'desc' },
  take: 3,
  include: { items: true },
})
for (const o of orders) {
  console.log(`order ${o.orderNumber} | ${o.customerName} | ${o.email} | ${o.paymentMethod} | ${o.status}/${o.paymentStatus} | ₦${o.total} | ${o.items.length} item(s)`)
}

await db.$disconnect()
