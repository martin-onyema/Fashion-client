import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const c = await db.homepageContent.findFirst()
if (!c) { console.log('no record'); process.exit(0) }
const WOMAN = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop'
if (c.instagramImages?.includes(WOMAN)) {
  const next = c.instagramImages.replace(WOMAN, '/images/ig-menswear.jpg')
  await db.homepageContent.update({ where: { id: c.id }, data: { instagramImages: next } })
  console.log('updated OK')
} else {
  console.log('woman URL not found (already updated?)')
}
await db.$disconnect()
