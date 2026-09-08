/**
 * Seed products + categories from the scraped wardrobecare.com.ng WooCommerce data.
 * Reads:
 *   - download/scrape/products-consolidated.json (535 products)
 *   - download/scrape/categories-consolidated.json (48 categories)
 * Writes:
 *   - Category rows (with parent/child links preserved)
 *   - Product rows (slug = unique)
 *   - ProductImage rows (URLs point to /product-images/<slug>__<file>)
 *   - ProductVariant rows (one per size option, default stock)
 *
 * Idempotent: re-running upserts by slug/sku and skips existing images.
 * Run with:  bun run scripts/seed-real-products.ts
 */
import { PrismaClient, type Product, type Category } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const db = new PrismaClient()

const SCRAPE = '/home/z/my-project/download/scrape'
const IMG_PUBLIC_PREFIX = '/product-images'

type NormCategory = {
  sourceId: number
  name: string
  slug: string
  parent: number
  count: number
  image: string | null
}

type NormProduct = {
  sourceId: number
  slug: string
  name: string
  permalink: string
  sku: string | null
  type: 'simple' | 'variable' | string
  shortDescription: string
  description: string
  priceNGN: number
  regularPriceNGN: number
  salePriceNGN: number
  onSale: boolean
  currency: string
  averageRating: number
  reviewCount: number
  inStock: boolean
  categories: { sourceId: number; name: string; slug: string }[]
  tags: { sourceId: number; name: string; slug: string }[]
  attributes: { name: string; options: string[] }[]
  variations: number[]
  images: { sourceId: number; src: string; alt: string; name: string }[]
}

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(SCRAPE, file), 'utf8'))
}

function sanitizeFileSlug(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9\-]/g, '_')
    .slice(0, 60)
}

function basenameFromUrl(u: string): string {
  try {
    const url = new URL(u)
    const parts = url.pathname.split('/')
    return decodeURIComponent(parts[parts.length - 1] || '')
  } catch {
    return ''
  }
}

function sanitizeBasename(b: string): string {
  return b.replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

function localImageUrl(productSlug: string, src: string): string {
  const b = sanitizeBasename(basenameFromUrl(src))
  if (!b) return src
  return `${IMG_PUBLIC_PREFIX}/${sanitizeFileSlug(productSlug)}__${b}`
}

// Pick a primary category (first leaf category — usually the most specific).
function pickPrimaryCategorySlug(p: NormProduct): string | null {
  if (!p.categories.length) return null
  // Prefer the last (deepest) one — WooCommerce lists parent first then child
  const last = p.categories[p.categories.length - 1]
  return last.slug
}

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

async function main() {
  const cats: NormCategory[] = loadJson('categories-consolidated.json')
  const products: NormProduct[] = loadJson('products-consolidated.json')

  console.log(`Loaded ${cats.length} categories, ${products.length} products`)

  // ------------------------------------------------------------------
  // 1) CATEGORIES — upsert by slug, link by parent sourceId
  // ------------------------------------------------------------------
  console.log('\n--- Seeding categories ---')
  // First pass: create all top-level (parent=0) categories
  // Second pass: link children to parents
  const sourceIdToNewId = new Map<number, string>()

  // Sort: parents first
  const sortedCats = [...cats].sort((a, b) => {
    if (a.parent === 0 && b.parent !== 0) return -1
    if (a.parent !== 0 && b.parent === 0) return 1
    return 0
  })

  for (const c of sortedCats) {
    const parent = c.parent
      ? sourceIdToNewId.get(c.parent) || null
      : null

    const slug = c.slug || `cat-${c.sourceId}`
    const created = await db.category.upsert({
      where: { slug },
      update: {
        name: c.name,
        parentId: parent,
        image: c.image,
      },
      create: {
        name: c.name,
        slug,
        parentId: parent,
        image: c.image,
        featured: c.count >= 20, // mark big categories as featured
        order: c.count, // big categories show first
      },
    })
    sourceIdToNewId.set(c.sourceId, created.id)
  }
  console.log(`✓ ${sortedCats.length} categories upserted`)

  // ------------------------------------------------------------------
  // 2) PRODUCTS — upsert by slug
  // ------------------------------------------------------------------
  console.log('\n--- Seeding products ---')
  let createdCount = 0
  let updatedCount = 0
  let imageCount = 0
  let variantCount = 0

  // Build a slug → categoryId map for fast lookup
  const catSlugToId = new Map<string, string>()
  for (const [srcId, newId] of sourceIdToNewId) {
    const src = cats.find((c) => c.sourceId === srcId)
    if (src) catSlugToId.set(src.slug, newId)
  }

  for (const p of products) {
    const catSlug = pickPrimaryCategorySlug(p)
    let categoryId = catSlug ? catSlugToId.get(catSlug) : undefined
    if (!categoryId) {
      // Fallback: pick first category
      const first = p.categories[0]
      categoryId = first ? catSlugToId.get(first.slug) : undefined
    }
    if (!categoryId) {
      // Skip products with no category — we cannot create them since categoryId is non-null in schema
      console.warn(`  ⚠ skipping #${p.sourceId} ${p.name} — no category`)
      continue
    }

    // Ensure price > 0
    const finalPrice = p.priceNGN > 0 ? p.priceNGN : p.regularPriceNGN || 0
    if (finalPrice === 0) {
      console.warn(`  ⚠ zero price: #${p.sourceId} ${p.name}`)
    }

    const sku = (p.sku || `wc-${p.sourceId}`).toString()

    // Tags string
    const tagsStr = p.tags.map((t) => t.name).join(', ') || null
    const description = p.description || p.shortDescription || p.name

    // Build variant list — for variable products use the size attribute if present,
    // otherwise create default sizes
    const sizeAttr = p.attributes.find(
      (a) => a.name.toLowerCase() === 'size',
    )
    const sizes =
      sizeAttr && sizeAttr.options.length > 0
        ? sizeAttr.options
        : p.type === 'variable'
          ? DEFAULT_SIZES
          : []

    const existing = await db.product.findUnique({ where: { slug: p.slug } })

    const data = {
      name: p.name,
      slug: p.slug,
      description,
      features: p.shortDescription || null,
      sku,
      price: finalPrice,
      salePrice: p.onSale && p.salePriceNGN > 0 ? p.salePriceNGN : null,
      currency: p.currency || 'NGN',
      categoryId,
      tags: tagsStr,
      featured: p.averageRating >= 4.5 || p.reviewCount > 0,
      published: p.inStock, // hide out-of-stock from storefront by default
      rating: p.averageRating || 0,
      reviewCount: p.reviewCount || 0,
    }

    if (existing) {
      await db.product.update({ where: { id: existing.id }, data })
      updatedCount++
    } else {
      await db.product.create({ data })
      createdCount++
    }

    const productRow = await db.product.findUnique({
      where: { slug: p.slug },
      select: { id: true },
    })
    if (!productRow) continue

    // ----------------------------------------------------------------
    // IMAGES — wipe & recreate (simpler than per-row diff)
    // ----------------------------------------------------------------
    await db.productImage.deleteMany({
      where: { productId: productRow.id },
    })
    for (let i = 0; i < p.images.length; i++) {
      const img = p.images[i]
      const url = localImageUrl(p.slug, img.src)
      await db.productImage.create({
        data: {
          productId: productRow.id,
          url,
          altText: img.alt || p.name,
          position: i,
        },
      })
      imageCount++
    }

    // ----------------------------------------------------------------
    // VARIANTS — wipe & recreate
    // ----------------------------------------------------------------
    await db.productVariant.deleteMany({
      where: { productId: productRow.id },
    })
    for (const size of sizes) {
      await db.productVariant.create({
        data: {
          productId: productRow.id,
          size,
          sku: `${sku}-${size}`,
          stock: p.inStock ? 25 : 0,
          lowStockThreshold: 5,
        },
      })
      variantCount++
    }
  }

  console.log(`\n✓ ${createdCount} new products, ${updatedCount} updated`)
  console.log(`✓ ${imageCount} images, ${variantCount} variants`)

  // ------------------------------------------------------------------
  // 3) SUMMARY
  // ------------------------------------------------------------------
  const totalProducts = await db.product.count()
  const totalCats = await db.category.count()
  const totalImgs = await db.productImage.count()
  const totalVars = await db.productVariant.count()
  console.log('\n=== DATABASE TOTALS ===')
  console.log(`Categories: ${totalCats}`)
  console.log(`Products: ${totalProducts}`)
  console.log(`Product images: ${totalImgs}`)
  console.log(`Product variants: ${totalVars}`)
}

main()
  .catch((e) => {
    console.error('SEED FAILED:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
