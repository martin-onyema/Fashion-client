import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const c = await db.homepageContent.findFirst()
console.log('igImages:', c?.instagramImages ?? '(null - fallback used)')
await db.$disconnect()
