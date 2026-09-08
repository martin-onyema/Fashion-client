// Consolidate WooCommerce products + categories from scraped JSON
// into a single normalized file ready for seeding the Prisma database.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SCRAPE_DIR = resolve('/home/z/my-project/download/scrape')

type WCImage = { id: number; src: string; alt: string; name?: string }
type WCProduct = {
  id: number
  name: string
  slug: string
  permalink: string
  sku?: string
  type: string // 'simple' | 'variable' | ...
  short_description: string
  description: string
  on_sale: boolean
  prices: {
    price: string
    regular_price: string
    sale_price: string
    currency_code: string
    currency_minor_unit: number
  }
  average_rating?: string
  review_count?: number
  images: WCImage[]
  categories: { id: number; name: string; slug: string }[]
  tags?: { id: number; name: string; slug: string }[]
  is_in_stock: boolean
  stock_status?: string
  attributes?: any[]
  variations?: number[]
}

type NormalizedProduct = {
  sourceId: number
  slug: string
  name: string
  permalink: string
  sku: string | null
  type: 'simple' | 'variable' | string
  shortDescription: string
  description: string
  priceNGN: number // naira (already divided)
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

function stripHtml(s: string): string {
  return (s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;|&apos;/g, "'")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function minorToMajor(price: string, minor: number): number {
  if (!price) return 0
  const n = Number(price)
  if (!Number.isFinite(n)) return 0
  return minor > 0 ? Math.round(n / 10 ** minor) : n
}

function loadJson(file: string) {
  return JSON.parse(readFileSync(resolve(SCRAPE_DIR, file), 'utf8'))
}

async function main() {
  const cats: any[] = loadJson('wc-cats.json')
  const productPages: any[][] = [
    loadJson('wc-products-p1.json'),
    loadJson('wc-products-p2.json'),
    loadJson('wc-products-p3.json'),
    loadJson('wc-products-p4.json'),
    loadJson('wc-products-p5.json'),
    loadJson('wc-products-p6.json'),
  ]
  const allProducts: WCProduct[] = productPages.flat()
  console.log(`Total products: ${allProducts.length}`)
  console.log(`Total categories: ${cats.length}`)

  // De-dupe by id
  const uniqById = new Map<number, WCProduct>()
  for (const p of allProducts) uniqById.set(p.id, p)
  const uniqueProducts = [...uniqById.values()]
  console.log(`Unique products: ${uniqueProducts.length}`)

  const normalized: NormalizedProduct[] = uniqueProducts.map((p) => {
    const minor = p.prices?.currency_minor_unit ?? 2
    return {
      sourceId: p.id,
      slug: p.slug,
      name: stripHtml(p.name),
      permalink: p.permalink,
      sku: p.sku || null,
      type: p.type,
      shortDescription: stripHtml(p.short_description),
      description: stripHtml(p.description),
      priceNGN: minorToMajor(p.prices?.price ?? '0', minor),
      regularPriceNGN: minorToMajor(p.prices?.regular_price ?? '0', minor),
      salePriceNGN: minorToMajor(p.prices?.sale_price ?? '0', minor),
      onSale: !!p.on_sale,
      currency: p.prices?.currency_code ?? 'NGN',
      averageRating: Number(p.average_rating ?? 0),
      reviewCount: Number(p.review_count ?? 0),
      inStock: !!p.is_in_stock,
      categories: (p.categories || []).map((c) => ({
        sourceId: c.id,
        name: stripHtml(c.name),
        slug: c.slug,
      })),
      tags: (p.tags || []).map((t) => ({
        sourceId: t.id,
        name: stripHtml(t.name),
        slug: t.slug,
      })),
      attributes: (p.attributes || []).map((a) => ({
        name: stripHtml(a.name || ''),
        options: (a.options || []).map((o: any) =>
          typeof o === 'string' ? stripHtml(o) : stripHtml(o?.name ?? ''),
        ),
      })),
      variations: p.variations || [],
      images: (p.images || []).map((img) => ({
        sourceId: img.id,
        src: img.src,
        alt: stripHtml(img.alt || ''),
        name: stripHtml(img.name || ''),
      })),
    }
  })

  // Quick stats
  const totalImages = normalized.reduce(
    (acc, p) => acc + p.images.length,
    0,
  )
  const variableCount = normalized.filter((p) => p.type === 'variable').length
  const simpleCount = normalized.filter((p) => p.type === 'simple').length
  const outOfStock = normalized.filter((p) => !p.inStock).length

  console.log('\n--- STATS ---')
  console.log(`Total images: ${totalImages}`)
  console.log(`Variable products: ${variableCount}`)
  console.log(`Simple products: ${simpleCount}`)
  console.log(`Out of stock: ${outOfStock}`)
  console.log(`Price range: ₦${Math.min(...normalized.map((p) => p.priceNGN))} – ₦${Math.max(...normalized.map((p) => p.priceNGN))}`)

  // Save consolidated output
  writeFileSync(
    resolve(SCRAPE_DIR, 'products-consolidated.json'),
    JSON.stringify(normalized, null, 2),
  )

  // Save categories
  const normCats = cats.map((c) => ({
    sourceId: c.id,
    name: stripHtml(c.name),
    slug: c.slug,
    parent: c.parent || 0,
    count: c.count || 0,
    image: c.image?.src || null,
  }))
  writeFileSync(
    resolve(SCRAPE_DIR, 'categories-consolidated.json'),
    JSON.stringify(normCats, null, 2),
  )

  // Save image manifest for parallel download
  type ImgTask = { productSourceId: number; productSlug: string; sourceId: number; src: string; alt: string }
  const imgTasks: ImgTask[] = []
  for (const p of normalized) {
    for (const img of p.images) {
      imgTasks.push({
        productSourceId: p.sourceId,
        productSlug: p.slug,
        sourceId: img.sourceId,
        src: img.src,
        alt: img.alt,
      })
    }
  }
  writeFileSync(
    resolve(SCRAPE_DIR, 'image-tasks.json'),
    JSON.stringify(imgTasks, null, 2),
  )
  console.log(`\nImage tasks: ${imgTasks.length}`)
  console.log(`Wrote: products-consolidated.json`)
  console.log(`Wrote: categories-consolidated.json`)
  console.log(`Wrote: image-tasks.json`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
