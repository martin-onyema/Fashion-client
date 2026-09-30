import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const settings = await prisma.adminSettings.findFirst()
  console.log('ADMIN SETTINGS ROW:', JSON.stringify(settings, null, 2))
  const counts = {
    products: await prisma.product.count(),
    variants: await prisma.productVariant.count(),
    images: await prisma.productImage.count(),
    users: await prisma.user.count(),
    orders: await prisma.order.count(),
  }
  console.log('COUNTS:', JSON.stringify(counts))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
