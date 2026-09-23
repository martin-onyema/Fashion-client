import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const total = await db.product.count()
const demoLike = await db.product.count({ where: { OR: [
  { name: { contains: 'sample' } },
  { name: { contains: 'demo' } },
  { name: { contains: 'Test ' } },
]}})
const users = await db.user.count()
const orders = await db.order.count()
const customers = await db.user.count({ where: { role: 'CUSTOMER' } })
const noDesc = await db.product.count({ where: { description: { lte: '' } } })
const unsplashImgs = await db.productImage.count({ where: { url: { contains: 'unsplash' } } })
const placeholderNames = await db.product.findMany({ where: { OR: [
  { name: { contains: 'sample' } }, { name: { contains: 'demo' } }, { name: { contains: 'placeholder' } },
]}, select: { name: true }, take: 10 })
const t = await db.product.findMany({ select: { name: true }, take: 3, orderBy: { createdAt: 'asc' } })
console.log(JSON.stringify({ total, demoLike, users, orders, customers, noDesc, unsplashImgs, placeholderNames, sample: t }, null, 2))
await db.$disconnect()
