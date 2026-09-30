/**
 * Diagnose what the homepage "Shop by World" section will actually display.
 * Mirrors the filter+map logic in app/page.tsx so we can see exactly which
 * categories will render, with what image, and which are skipped.
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    include: { children: { orderBy: { name: 'asc' } } },
  })

  const featuredTopCats = categories.filter((c) => c.featured && c.children.length > 0)

  console.log(`=== ${featuredTopCats.length} featured top-level categories with children (WILL RENDER) ===`)
  for (const c of featuredTopCats) {
    const worldImage = c.children[0]?.image ?? ''
    console.log(
      `${c.name.padEnd(30)} slug=${c.slug.padEnd(35)} featured=${c.featured} children=${c.children.length} worldImg=${worldImage || '(NONE)'}`,
    )
  }

  console.log(`\n=== Featured top-level categories WITHOUT children (FILTERED OUT) ===`)
  for (const c of categories.filter((c) => c.featured && c.children.length === 0)) {
    console.log(
      `${c.name.padEnd(30)} slug=${c.slug.padEnd(35)} image=${c.image ?? '(none)'}`,
    )
  }

  console.log(`\n=== Non-featured top-level categories (FILTERED OUT) ===`)
  for (const c of categories.filter((c) => !c.featured)) {
    console.log(
      `${c.name.padEnd(30)} slug=${c.slug.padEnd(35)} featured=${c.featured} children=${c.children.length}`,
    )
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
