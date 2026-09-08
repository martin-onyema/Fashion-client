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
      bankName: 'Sparkle Bank',
      bankAccountName: 'Wardrobecare Nigeria Enterprises',
      bankAccountNumber: '1000447933',
      bankSortCode: '',
      bankTransferInstructions:
        'Please make payment within 24 hours to confirm your order. Send your payment receipt and order number to us via WhatsApp (08026133770) for fast confirmation.',
    },
    create: {
      id: 'singleton',
      bankName: 'Sparkle Bank',
      bankAccountName: 'Wardrobecare Nigeria Enterprises',
      bankAccountNumber: '1000447933',
      bankSortCode: '',
      bankTransferInstructions:
        'Please make payment within 24 hours to confirm your order. Send your payment receipt and order number to us via WhatsApp (08026133770) for fast confirmation.',
    },
  })

  console.log('✓ Bank details saved.')
  await db.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
