import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const s = await db.adminSettings.findFirst()
console.log(JSON.stringify({
  storeName: s?.storeName, storeTagline: s?.storeTagline,
  supportEmail: s?.supportEmail, supportPhone: s?.supportPhone,
  whatsappNumber: s?.whatsappNumber,
  bankName: s?.bankName, bankAccountName: s?.bankAccountName,
  bankAccountNumber: s?.bankAccountNumber, bankTransferInstructions: s?.bankTransferInstructions,
  instagramUrl: s?.instagramUrl, facebookUrl: s?.facebookUrl, twitterUrl: s?.twitterUrl, tiktokUrl: s?.tiktokUrl,
}, null, 2))
await db.$disconnect()
