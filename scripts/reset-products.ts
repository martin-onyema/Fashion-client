/**
 * Properly reset products — delete in correct FK order.
 */
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  console.log('🗑️  Clearing products in FK-safe order...')
  await db.cartItem.deleteMany()
  await db.wishlistItem.deleteMany()
  await db.orderItem.deleteMany()
  await db.review.deleteMany()
  await db.productImage.deleteMany()
  await db.productVariant.deleteMany()
  await db.product.deleteMany()
  console.log('✅ Products cleared.')
}

main().catch(console.error).finally(() => db.$disconnect())
