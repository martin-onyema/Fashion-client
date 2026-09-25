/**
 * Seed bank transfer details into AdminSettings.
 * Run: npx tsx scripts/seed-bank-details.ts
 */
import { db } from '../src/lib/db'

async function main() {
  console.log('→ Seeding bank transfer details...')

  await db.adminSettings.upsert({
    where: { id: 'singleton' },
    update: {
      bankName: 'Guaranty Trust Bank (GTBank)',
      bankAccountName: 'Wardrobecare Clothing',
      bankAccountNumber: '0123456789',
      bankSortCode: '058152052',
      bankTransferInstructions:
        'Please make payment within 24 hours to confirm your order. Send your payment receipt and order number to us via WhatsApp for fast confirmation.',
    },
    create: {
      id: 'singleton',
      bankName: 'Guaranty Trust Bank (GTBank)',
      bankAccountName: 'Wardrobecare Clothing',
      bankAccountNumber: '0123456789',
      bankSortCode: '058152052',
      bankTransferInstructions:
        'Please make payment within 24 hours to confirm your order. Send your payment receipt and order number to us via WhatsApp for fast confirmation.',
    },
  })

  console.log('✓ Bank details saved.')
  await db.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
