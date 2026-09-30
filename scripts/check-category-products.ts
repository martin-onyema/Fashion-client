/**
 * Diagnose categories with no image set: show parent/child relationships,
 * count of products directly in this category, and (for parents) total
 * products across children.
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const noImageCats = await db.category.findMany({
    where: { image: null },
    include: {
      parent: true,
      children: { include: { _count: { select: { products: true } } } },
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  })

  console.log(`Found ${noImageCats.length} categories with no image:\n`)

  for (const c of noImageCats) {
    const parent = c.parent?.name ?? '(top-level)'
    const directProducts = c._count.products
    const childCount = c.children.length
    const childProducts = c.children.reduce((s, ch) => s + ch._count.products, 0)
    console.log(
      `${c.name.padEnd(30)} slug=${c.slug.padEnd(40)} parent=${parent.padEnd(15)} direct=${directProducts} children=${childCount} childProducts=${childProducts} featured=${c.featured}`,
    )
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
