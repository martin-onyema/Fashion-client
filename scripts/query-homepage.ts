import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const content = await prisma.homepageContent.findFirst()
  console.log('HERO IMAGE:', content?.heroImage)
  console.log('HERO TITLE:', content?.heroTitle)
  console.log('IG IMAGES:', content?.instagramImages?.slice(0, 400))
  // categories with images used on home "worlds"
  const cats = await prisma.category.findMany({
    where: { featured: true },
    select: { name: true, slug: true, image: true, children: { select: { name: true, image: true } } },
  })
  for (const c of cats) {
    console.log(`WORLD: ${c.name} (${c.slug}) -> img: ${c.image ?? 'none'} | child imgs: ${c.children.map(ch => ch.image).filter(Boolean).slice(0,2).join(', ') || 'none'}`)
  }
  // sample of product images (first image of 12 newest products)
  const prods = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: { name: true, images: { take: 1, select: { url: true } } },
  })
  for (const p of prods) console.log(`PRODUCT: ${p.name} -> ${p.images[0]?.url ?? 'none'}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
