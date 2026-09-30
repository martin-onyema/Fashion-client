/**
 * Seed demo notifications + audit log entries so the new admin dashboard
 * sections have content to display during testing.
 *
 * Also seeds one demo MANAGER staff account if it doesn't exist.
 *
 * Run:  bun run scripts/seed-demo-staff.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('Seeding demo staff + notifications + audit log...')

  // 1. Demo MANAGER staff account (only if doesn't exist)
  const managerEmail = 'manager@wardrobecare.com'
  const existing = await db.user.findUnique({ where: { email: managerEmail } })
  if (!existing) {
    const passwordHash = await bcrypt.hash('wardrobecare2026', 10)
    const manager = await db.user.create({
      data: {
        email: managerEmail,
        name: 'Demo Manager',
        role: 'MANAGER',
        passwordHash,
        phone: '+234 800 MANAGER',
        jobTitle: 'Store Manager',
        department: 'Operations',
        active: true,
      },
    })
    console.log(`✓ Created MANAGER: ${managerEmail} (id: ${manager.id})`)
  } else {
    console.log(`✓ MANAGER already exists: ${managerEmail}`)
  }

  // 2. Demo CUSTOMER_SUPPORT staff account
  const supportEmail = 'support@wardrobecare.com'
  const existingSupport = await db.user.findUnique({ where: { email: supportEmail } })
  if (!existingSupport) {
    const passwordHash = await bcrypt.hash('wardrobecare2026', 10)
    const support = await db.user.create({
      data: {
        email: supportEmail,
        name: 'Demo Support',
        role: 'CUSTOMER_SUPPORT',
        passwordHash,
        phone: '+234 800 SUPPORT',
        jobTitle: 'Customer Support Agent',
        department: 'Customer Service',
        active: true,
      },
    })
    console.log(`✓ Created CUSTOMER_SUPPORT: ${supportEmail} (id: ${support.id})`)
  } else {
    console.log(`✓ CUSTOMER_SUPPORT already exists: ${supportEmail}`)
  }

  // 3. Find all staff users to notify
  const staff = await db.user.findMany({
    where: { role: { not: 'CUSTOMER' } },
    select: { id: true, name: true, role: true },
  })
  console.log(`Found ${staff.length} staff users`)

  // 4. Create demo notifications
  // Avoid duplicates — check by title first
  const notifs = [
    {
      type: 'NEW_ORDER',
      title: 'New order WC-DEMO001 received',
      body: 'Customer Tunde A. placed an order for ₦45,500',
      link: '/admin/orders',
    },
    {
      type: 'LOW_INVENTORY',
      title: 'Olive Green Joggers running low',
      body: 'Only 4 units left in stock (threshold 5)',
      link: '/admin/inventory?status=low',
    },
    {
      type: 'OUT_OF_STOCK',
      title: 'Black Polo Shirt is out of stock',
      body: 'Variant L dropped to 0 after recent orders',
      link: '/admin/inventory?status=out',
    },
    {
      type: 'NEW_REVIEW',
      title: 'New 5-star review on Navy Blazer',
      body: 'James K. wrote: "Excellent quality, perfect fit!"',
      link: '/admin/reviews',
    },
    {
      type: 'REFUND_ISSUED',
      title: 'Refund issued on WC-DEMO002',
      body: '₦12,000 refunded (partial) — reason: customer changed mind',
      link: '/admin/orders',
    },
    {
      type: 'PAYMENT_FAILED',
      title: 'Payment failed for WC-DEMO003',
      body: 'Paystack returned: insufficient funds',
      link: '/admin/orders',
    },
    {
      type: 'NEW_CUSTOMER',
      title: 'New customer registered',
      body: 'Femi O. joined wardrobecare.com.ng',
      link: '/admin/customers',
    },
    {
      type: 'CAMPAIGN_STARTED',
      title: 'Flash Sale campaign is now live',
      body: '"Summer Sale" — 20% off select items, ends in 48 hours',
      link: '/admin/marketing',
    },
  ]

  let notifCount = 0
  for (const n of notifs) {
    // Check if already exists (by title)
    const existing = await db.notification.findFirst({ where: { title: n.title } })
    if (existing) continue
    await db.notification.createMany({
      data: staff.map((s) => ({
        recipientId: s.id,
        type: n.type as any,
        title: n.title,
        body: n.body,
        link: n.link,
        // Mark first 3 as unread for demo
        read: notifCount >= 3,
      })),
    })
    notifCount++
  }
  console.log(`✓ Created ${notifCount} notification(s) × ${staff.length} recipients = ${notifCount * staff.length} rows`)

  // 5. Create demo audit log entries — need an ADMIN actor
  const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) {
    console.log('⚠ No ADMIN user found — skipping audit log seed')
    return
  }

  const auditEntries = [
    {
      action: 'product.create',
      entityType: 'Product',
      entityId: 'demo-product-1',
      description: 'Created product "Classic Navy Blazer" (SKU WC-BLAZER-NAVY, ₦45,000)',
    },
    {
      action: 'product.update',
      entityType: 'Product',
      entityId: 'demo-product-2',
      description: 'Updated product "Olive Joggers" — price: ₦18,500 → ₦17,000',
    },
    {
      action: 'order.update_status',
      entityType: 'Order',
      entityId: 'demo-order-1',
      description: 'Updated order WC-DEMO001 status: PENDING → PAID',
    },
    {
      action: 'order.refund',
      entityType: 'Refund',
      entityId: 'demo-refund-1',
      description: 'Refunded ₦12,000 on order WC-DEMO002 (partial · customer changed mind)',
    },
    {
      action: 'inventory.adjust',
      entityType: 'ProductVariant',
      entityId: 'demo-variant-1',
      description: 'Adjusted stock on "Black Polo Shirt" (L): 0 → 25 (+25, reason: restock)',
    },
    {
      action: 'coupon.create',
      entityType: 'Coupon',
      entityId: 'demo-coupon-1',
      description: 'Created coupon "SUMMER20" (PERCENTAGE 20)',
    },
    {
      action: 'settings.update',
      entityType: 'AdminSettings',
      entityId: 'singleton',
      description: 'Updated store settings — defaultDeliveryFee: ₦2,500 → ₦3,000',
    },
    {
      action: 'staff.create',
      entityType: 'User',
      entityId: 'demo-staff-1',
      description: 'Created staff account "Demo Manager" (manager@wardrobecare.com) with role MANAGER',
    },
  ]

  let auditCount = 0
  for (const a of auditEntries) {
    const existing = await db.auditLog.findFirst({ where: { description: a.description } })
    if (existing) continue
    await db.auditLog.create({
      data: {
        actorId: admin.id,
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        description: a.description,
      },
    })
    auditCount++
  }
  console.log(`✓ Created ${auditCount} audit log entries`)

  // 6. Create demo shipping zones + methods if none exist
  const zonesCount = await db.shippingZone.count()
  if (zonesCount === 0) {
    const lagosZone = await db.shippingZone.create({
      data: {
        name: 'Lagos (Same-Day / Next-Day)',
        states: JSON.stringify(['Lagos']),
        active: true,
        methods: {
          create: [
            {
              name: 'Same-Day Delivery',
              description: 'Order before 12pm, delivered same day within Lagos',
              carrier: 'GIG Logistics',
              baseCost: 3000,
              estimatedDaysMin: 0,
              estimatedDaysMax: 1,
              active: true,
            },
            {
              name: 'Next-Day Delivery',
              description: 'Standard delivery within Lagos',
              carrier: 'GIG Logistics',
              baseCost: 2000,
              estimatedDaysMin: 1,
              estimatedDaysMax: 2,
              active: true,
            },
          ],
        },
      },
    })
    console.log(`✓ Created Lagos shipping zone with 2 methods`)

    const nationwideZone = await db.shippingZone.create({
      data: {
        name: 'Nationwide (Nigeria)',
        states: JSON.stringify(['*']),
        active: true,
        methods: {
          create: [
            {
              name: 'Standard Delivery',
              description: '2-5 business days nationwide',
              carrier: 'GIG Logistics',
              baseCost: 2500,
              freeThreshold: 50000,
              estimatedDaysMin: 2,
              estimatedDaysMax: 5,
              active: true,
            },
            {
              name: 'Express Delivery',
              description: '1-3 business days',
              carrier: 'DHL',
              baseCost: 5000,
              estimatedDaysMin: 1,
              estimatedDaysMax: 3,
              active: true,
            },
          ],
        },
      },
    })
    console.log(`✓ Created Nationwide shipping zone with 2 methods`)
  } else {
    console.log(`✓ Shipping zones already exist (${zonesCount})`)
  }

  // 7. Create a demo coupon if none exist
  const couponsCount = await db.coupon.count()
  if (couponsCount === 0) {
    await db.coupon.create({
      data: {
        code: 'WELCOME10',
        description: '10% off for new customers',
        type: 'PERCENTAGE',
        value: 10,
        minOrder: 10000,
        usageLimit: 1000,
        active: true,
      },
    })
    await db.coupon.create({
      data: {
        code: 'FREESHIP',
        description: 'Free shipping on orders over ₦30,000',
        type: 'FREE_SHIPPING',
        value: 0,
        minOrder: 30000,
        active: true,
        freeShipping: true,
      },
    })
    await db.coupon.create({
      data: {
        code: 'FLASH50',
        description: '₦5,000 off (Flash sale)',
        type: 'FIXED',
        value: 5000,
        minOrder: 20000,
        maxDiscount: 5000,
        usageLimit: 100,
        active: true,
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
    console.log(`✓ Created 3 demo coupons (WELCOME10, FREESHIP, FLASH50)`)
  } else {
    console.log(`✓ Coupons already exist (${couponsCount})`)
  }

  // 8. Create demo campaigns if none exist
  const campaignsCount = await db.campaign.count()
  if (campaignsCount === 0) {
    const now = new Date()
    const startsAt = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const endsAt = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000)

    await db.campaign.create({
      data: {
        name: 'Summer Collection Launch',
        description: '20% off all summer essentials — tees, shorts, polos',
        type: 'PROMOTION',
        active: true,
        startsAt,
        endsAt,
        discountType: 'PERCENTAGE',
        discountValue: 20,
      },
    })
    await db.campaign.create({
      data: {
        name: 'Flash Weekend Sale',
        description: '48-hour flash sale — save ₦5,000 on select items',
        type: 'FLASH_SALE',
        active: true,
        startsAt: now,
        endsAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        discountType: 'FIXED',
        discountValue: 5000,
      },
    })
    console.log(`✓ Created 2 demo campaigns`)
  } else {
    console.log(`✓ Campaigns already exist (${campaignsCount})`)
  }

  // 9. Create demo brands if none exist
  const brandsCount = await db.brand.count()
  if (brandsCount === 0) {
    const brands = [
      { name: 'Hugo Boss', slug: 'hugo-boss', country: 'Germany' },
      { name: 'Jack & Jones', slug: 'jack-jones', country: 'Denmark' },
      { name: 'Levis', slug: 'levis', country: 'USA' },
      { name: 'Polo Club', slug: 'polo-club', country: 'USA' },
      { name: 'Nike', slug: 'nike', country: 'USA' },
      { name: 'Tom Tailor', slug: 'tom-tailor', country: 'Germany' },
    ]
    for (const b of brands) {
      await db.brand.create({ data: b })
    }
    console.log(`✓ Created ${brands.length} demo brands`)
  } else {
    console.log(`✓ Brands already exist (${brandsCount})`)
  }

  // 10. Create demo banners if none exist
  const bannersCount = await db.promotionalBanner.count()
  if (bannersCount === 0) {
    await db.promotionalBanner.create({
      data: {
        title: 'Summer Sale — Up to 30% Off',
        subtitle: 'Premium menswear at unbeatable prices. Limited time only.',
        ctaText: 'SHOP NOW',
        ctaHref: '/shop?sort=newest',
        active: true,
        order: 1,
      },
    })
    await db.promotionalBanner.create({
      data: {
        title: 'Free Delivery on Orders ₦50,000+',
        subtitle: 'Nationwide delivery on us.',
        ctaText: 'BROWSE COLLECTION',
        ctaHref: '/shop',
        active: true,
        order: 2,
      },
    })
    console.log(`✓ Created 2 demo banners`)
  } else {
    console.log(`✓ Banners already exist (${bannersCount})`)
  }

  // 11. Create demo FAQs if none exist
  const faqsCount = await db.fAQ.count()
  if (faqsCount === 0) {
    const faqs = [
      { question: 'How long does delivery take?', answer: 'Lagos: 1-2 business days. Nationwide: 2-5 business days. Express options available at checkout.', category: 'Shipping' },
      { question: 'What is your return policy?', answer: 'Items can be returned within 14 days of delivery, provided they are unworn, with original tags. Refunds are processed to the original payment method within 5 business days.', category: 'Returns' },
      { question: 'Do you offer exchanges?', answer: 'Yes — if the size doesn\'t fit, we offer one free exchange per order. Contact us on WhatsApp within 7 days of delivery.', category: 'Returns' },
      { question: 'Which payment methods do you accept?', answer: 'We accept Paystack (cards, bank transfer, USSD), bank transfer (manual), and WhatsApp ordering.', category: 'Payments' },
      { question: 'How do I track my order?', answer: 'Once your order is shipped, you\'ll receive a tracking number via WhatsApp and email. You can also track via the "Track Order" page using your order number.', category: 'Orders' },
      { question: 'Are your products authentic?', answer: 'Yes. We only stock 100% authentic menswear sourced directly from authorised distributors and brand-verified suppliers.', category: 'Products' },
    ]
    for (const f of faqs) {
      await db.fAQ.create({ data: { ...f, order: 0, published: true } })
    }
    console.log(`✓ Created ${faqs.length} demo FAQs`)
  } else {
    console.log(`✓ FAQs already exist (${faqsCount})`)
  }

  // 12. Summary
  console.log('\n=== DATABASE SUMMARY ===')
  console.log(`Users:        ${await db.user.count()}`)
  console.log(`Products:     ${await db.product.count()}`)
  console.log(`Categories:   ${await db.category.count()}`)
  console.log(`Brands:       ${await db.brand.count()}`)
  console.log(`Orders:       ${await db.order.count()}`)
  console.log(`Coupons:      ${await db.coupon.count()}`)
  console.log(`Campaigns:    ${await db.campaign.count()}`)
  console.log(`Reviews:      ${await db.review.count()}`)
  console.log(`Banners:      ${await db.promotionalBanner.count()}`)
  console.log(`FAQs:         ${await db.fAQ.count()}`)
  console.log(`ShippingZones: ${await db.shippingZone.count()}`)
  console.log(`ShippingMethods: ${await db.shippingMethod.count()}`)
  console.log(`Notifications: ${await db.notification.count()}`)
  console.log(`AuditLogs:    ${await db.auditLog.count()}`)
  console.log(`Permissions:  ${await db.permission.count()}`)
  console.log(`RolePerms:    ${await db.rolePermission.count()}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
