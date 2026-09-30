/**
 * Set a representative product image on every Category row.
 *
 * Why this exists:
 *   - All 48 categories were seeded from WooCommerce where image=null.
 *   - The homepage "Shop by World" section uses `c.children[0]?.image` for
 *     each world card. With null images every card renders blank.
 *   - This script picks one real product image per category (from the
 *     products that belong to that category) and persists it on the
 *     Category.image field so the homepage, shop filters, navigation,
 *     and admin all show a real thumbnail.
 *
 * Rules:
 *   - For LEAF categories (no children): pick the first image of the
 *     first published product in that category.
 *   - For PARENT categories (has children): pick the first image of
 *     the first published product across ALL child categories. This
 *     gives a representative thumbnail for the parent world.
 *   - If no products are published, fall back to ANY product
 *     (published=false) so we still get an image.
 *   - Skip categories where image is already set, unless --force is
 *     passed (re-pick a fresh representative).
 *
 * Run:  bun run scripts/set-category-images.ts [--force]
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const FORCE = process.argv.includes('--force')

async function pickImageForLeafCategory(catId: string): Promise<string | null> {
  // First published product in this category
  const product = await db.product.findFirst({
    where: { categoryId: catId, published: true },
    orderBy: { createdAt: 'desc' },
    include: { images: { orderBy: { position: 'asc' }, take: 1 } },
  })
  if (product?.images[0]?.url) return product.images[0].url

  // Fallback: any product in this category
  const anyProduct = await db.product.findFirst({
    where: { categoryId: catId },
    include: { images: { orderBy: { position: 'asc' }, take: 1 } },
  })
  return anyProduct?.images[0]?.url ?? null
}

async function pickImageForParentCategory(
  parentCatId: string,
  childIds: string[],
): Promise<string | null> {
  // Try published products across all child categories
  const product = await db.product.findFirst({
    where: { categoryId: { in: childIds }, published: true },
    orderBy: { createdAt: 'desc' },
    include: { images: { orderBy: { position: 'asc' }, take: 1 } },
  })
  if (product?.images[0]?.url) return product.images[0].url

  // Fallback: any product across child categories
  const anyProduct = await db.product.findFirst({
    where: { categoryId: { in: childIds } },
    include: { images: { orderBy: { position: 'asc' }, take: 1 } },
  })
  if (anyProduct?.images[0]?.url) return anyProduct.images[0].url

  // Final fallback: pick a product directly in the parent category
  // (rare — parents usually have no direct products)
  return pickImageForLeafCategory(parentCatId)
}

async function main() {
  console.log(`Setting category images (FORCE=${FORCE})...`)

  const allCats = await db.category.findMany({
    include: { children: { select: { id: true } } },
  })
  console.log(`Found ${allCats.length} categories`)

  let set = 0
  let skipped = 0
  let noImage = 0
  const noImageCats: string[] = []

  for (const cat of allCats) {
    if (cat.image && !FORCE) {
      skipped++
      continue
    }

    const childIds = cat.children.map((c) => c.id)
    const image =
      childIds.length > 0
        ? await pickImageForParentCategory(cat.id, childIds)
        : await pickImageForLeafCategory(cat.id)

    if (!image) {
      noImage++
      noImageCats.push(`${cat.name} (${cat.slug})`)
      continue
    }

    await db.category.update({
      where: { id: cat.id },
      data: { image },
    })
    set++
    console.log(`  ✓ ${cat.name.padEnd(30)} ← ${image}`)
  }

  console.log('\n=== SUMMARY ===')
  console.log(`Set:     ${set}`)
  console.log(`Skipped: ${skipped} (already had image)`)
  console.log(`No image: ${noImage}`)
  if (noImageCats.length) {
    console.log('Categories with no image:')
    for (const c of noImageCats) console.log(`  - ${c}`)
  }
}

main()
  .catch((e) => {
    console.error('FAILED:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
