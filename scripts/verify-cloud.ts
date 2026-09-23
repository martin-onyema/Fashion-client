import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const [products, variants, images, cats, users] = await Promise.all([
  db.product.count(), db.productVariant.count(), db.productImage.count(),
  db.category.count(), db.user.count(),
])
console.log(`CLOUD: products=${products} variants=${variants} images=${images} categories=${cats} users=${users}`)
await db.$disconnect()
