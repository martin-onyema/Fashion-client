import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const s = await db.adminSettings.findUnique({ where: { id: 'singleton' } })
  // Paystack is only “live” when both the toggle is on AND a real key exists —
  // otherwise checkout hides the card option and falls back to bank transfer / WhatsApp.
  const paystackPublicKey = s?.paystackPublicKey || process.env.PAYSTACK_PUBLIC_KEY || ''
  const paystackEnabled = Boolean(s?.paystackEnabled && paystackPublicKey)
  // Only return safe public fields (no secrets)
  return NextResponse.json({
    whatsappNumber: s?.whatsappNumber ?? '2348026133770',
    whatsappEnabled: s?.whatsappEnabled ?? true,
    instagramUrl: s?.instagramUrl ?? 'https://www.instagram.com/wardrobecareng/',
    storeName: s?.storeName ?? 'Wardrobecare Clothing',
    storeTagline: s?.storeTagline ?? "Your #1 Personal Shopper for premium men's fashion.",
    defaultDeliveryFee: s?.defaultDeliveryFee ?? 2500,
    freeDeliveryThreshold: s?.freeDeliveryThreshold ?? 50000,
    paystackPublicKey,
    paystackEnabled,
  })
}
