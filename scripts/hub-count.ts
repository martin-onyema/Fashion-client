import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ datasources: { db: { url: 'file:/home/z/my-project/db/custom.db' } } })
async function main() {
  const total = await prisma.product.count()
  const published = await prisma.product.count({ where: { published: true } })
  console.log(`total=${total} published=${published}`)
  // distribution of published products by parent category (incl. children)
  const cats = await prisma.category.findMany({ include: { parent: true, _count: { select: { products: { where: { published: true } } } } } })
  const byParent = new Map<string, number>()
  for (const c of cats) {
    const key = c.parent?.slug ?? c.slug
    byParent.set(key, (byParent.get(key) ?? 0) + c._count.products)
  }
  console.log([...byParent.entries()].map(([k, v]) => `${k}:${v}`).join('  '))
}
main().finally(() => prisma.$disconnect())
