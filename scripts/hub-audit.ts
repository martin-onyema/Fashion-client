/** Audit: category tree + published product counts per subcategory (for hub pages). */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: { db: { url: 'file:/home/z/my-project/db/custom.db' } },
})

async function main() {
  const roots = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    include: {
      children: {
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        include: { _count: { select: { products: { where: { published: true } } } } },
      },
    },
  })

  for (const root of roots) {
    const rootSelf = await prisma.product.count({
      where: { categoryId: root.id, published: true },
    })
    const total =
      rootSelf +
      root.children.reduce((n, c) => n + c._count.products, 0)
    console.log(`\n■ ${root.name} (${root.slug}) — order ${root.order} — ${total} products (self ${rootSelf})`)
    for (const child of root.children) {
      console.log(`   ${child.slug.padEnd(22)} ${String(child._count.products).padStart(3)}  ${child.name}`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
