/**
 * Import the Wardrobecare Nigeria catalogue (scraped by scripts/scrape-wc.py)
 * into the local SQLite database via Prisma.
 *
 * Inputs : scripts/wc-data/products-archive.json, scripts/wc-data/products-details.json
 * Output : products in DB + scripts/wc-data/image-manifest.json for the image downloader
 *
 * Run: bun scripts/import-wc.ts
 */
import { PrismaClient } from '@prisma/client'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

const db = new PrismaClient()
const DATA = path.join(process.cwd(), 'scripts', 'wc-data')

// ---------------------------------------------------------------- types

type ArchiveItem = {
  wpId: string
  slug: string
  name: string
  image: string
  cats: string[]
  tags: string[]
  stock: string
  type: string
}

type Variation = {
  id: number | string
  attrs: Record<string, string>
  price: number | null
  regular_price: number | null
  in_stock: boolean
  sku: string | null
}

type DetailItem = {
  priceHtml?: string
  prices?: string[]
  regularPrices?: string[]
  variations?: Variation[]
  variationsError?: string
  attributes?: { label: string; value: string }[]
  description?: string
  shortDescription?: string
  gallery?: string[]
  sku?: string
  cats?: string[]
  tags?: string[]
  type?: string
}

// ---------------------------------------------------------------- category mapping

// Ordered most-specific first. First match on the product's WP category slugs wins.
const CAT_MAP: [RegExp, string][] = [
  [/^t-shirts?(-|$)|^tees?$|^tshirt/, 't-shirts'],
  [/^polo/, 'polo-shirts'],
  [/^formal-shirts?$|^office-shirts?$|^dress-shirts?$/, 'formal-shirts'],
  [/^casual-shirts?$|^shirts?$|^checked-shirts?$|^plain-shirts?$|^long-sleeve-shirts?$|^short-sleeve-shirts?$|^native-shirts?$/, 'casual-shirts'],
  [/^blazers?$|^suit-jackets?$|^sport-coats?$/, 'blazers'],
  [/^suits?$|^two-piece($|-)|^three-piece($|-)/, 'suits'],
  [/^jackets?$|^bomber-jackets?$|^denim-jackets?$|^puffer/, 'jackets'],
  [/^hoodies?$|^sweatshirts?$|^hoodies-sweatshirts$/, 'hoodies-sweatshirts'],
  [/^boxers?$|^underwear$|^vests?$|^innerwear$|^singlets?$|^tank-tops?$|^pyjamas?$|^sleepwear$|^nightwear$/, 'innerwear'],
  [/^shorts?$|^bermuda-shorts?$|^cargo-shorts?$|^chino-shorts?$|^sweat-shorts?$|^short-sleeves$|^short$/, 'shorts'],
  [/^joggers?$|^sweatpants?$|^track-pants?$|^sweat-pants?$/, 'joggers'],
  [/^jeans?$|^denim($|-)|^denim-pants?$|^denim-trousers?$/, 'jeans'],
  [/^chinos?($|-)|^chino-trousers?$|^chino-pants?$|^mens-chinos($|-)/, 'chinos'],
  [/^trousers?$|^pants?$|^cargo($|-)|^cargo-pants?$|^cargo-trousers?$|^pleated-trousers?$|^drawstring-trousers?$|^corduroy/, 'trousers'],
  [/^sneakers?$|^trainers?$|^athletic-shoes?$|^sport-shoes?$/, 'sneakers'],
  [/^loafers?$|^moccasins?$|^drivers?$|^suede-shoes?$/, 'loafers'],
  [/^dress-shoes?$|^oxfords?$|^derbies?$|^monk($|-)|^monk-straps?$/, 'dress-shoes'],
  [/^exotic-shoes?$|^leather-shoes?$/, 'exotic-shoes'],
  [/^casual-shoes?$|^canvas-shoes?$|^espadrilles?$|^boat-shoes?$/, 'casual-shoes'],
  [/^sandals?$|^slides?$|^slippers?$|^mules?$/, 'sandals'],
  [/^boots?$|^chelsea-boots?$|^ankle-boots?$|^combat-boots?$/, 'boots'],
  [/^belts?$/, 'belts'],
  [/^caps?$|^hats?$|^caps-hats$|^bucket-hats?$|^fedoras?$|^beanies?$/, 'caps-hats'],
  [/^ties?$|^neckties?$|^neck-ties?$|^skinny-ties?$|^bow-ties?$/, 'ties'],
  [/^bow-ties?$/, 'ties'],
  [/^pocket-squares?$|^pocket-square$/, 'pocket-squares'],
  [/^cufflinks?$|^cuff-link/, 'cufflinks'],
  [/^suspenders?$|^braces($|-)/, 'suspenders'],
  [/^bracelets?$|^beads?$|^lapel-pins?$|^chains?$|^necklaces?$/, 'bracelets'],
  [/^sunglasses?$|^eyewear$|^shades$/, 'sunglasses'],
  [/^socks?$|^ankle-socks?$|^no-show-socks?$/, 'socks'],
  [/^wallets?$|^wallets-purses$|^cardholders?$|^card-holders?$|^money-clips?$|^purses?$|^clutches?$/, 'wallets-purses'],
  [/^watches?$/, 'watches'],
  [/^mens-fragrance$|^fragrance$|^eau-de-parfum$|^perfumes?$|^colognes?$|^aftershaves?$|^body-sprays?$/, 'mens-fragrance'],
  [/^womens-fragrance$|^ladies-fragrance$/, 'womens-fragrance'],
  [/^grooming$|^mens-grooming$|^beard($|-)|^beard-oils?$|^skincare$|^body-care$|^hair-care$/, 'mens-grooming'],
  [/^pyjamas?$|^lounge-wear$|^loungewear$/, 'pyjamas'],
  [/^new-arrivals$/, 'new-arrivals'],
]

// Catch-all SEO categories — never used as a product's primary category.
const CATCH_ALL = /^(mens-clothing($|-)|mens-fashion($|-)|mens-wears?$|mens-wear|online-shopping|mens-style|mens-grooming-product|wardrobecare|shop($|-)|lagos|nigeria|surulere|dubai|turkey|london|usa|free-shipping|sales?$|deals?|clearance|best-seller|top-rated|gift($|-)|gifts?$)/

function mapCategories(cats: string[]): string | null {
  const candidates: { target: string; rank: number }[] = []
  for (const raw of cats) {
    const c = raw.toLowerCase().trim()
    if (!c || CATCH_ALL.test(c)) continue
    for (let i = 0; i < CAT_MAP.length; i++) {
      if (CAT_MAP[i][0].test(c)) {
        candidates.push({ target: CAT_MAP[i][1], rank: i })
        break
      }
    }
  }
  if (!candidates.length) return null
  candidates.sort((a, b) => a.rank - b.rank)
  return candidates[0].target
}

// Keyword fallbacks from name/tags when categories are all catch-alls.
const NAME_KEYWORDS: [RegExp, string][] = [
  [/polo shirt|polo top|golf shirt/i, 'polo-shirts'],
  [/t-?shirt|tee shirt|crew neck|crewneck|v-?neck|graphic (print )?(crew|tee)/i, 't-shirts'],
  [/blazer|sport coat/i, 'blazers'],
  [/\bsuit\b|two-?piece|three-?piece|tuxedo/i, 'suits'],
  [/hoodie|sweatshirt/i, 'hoodies-sweatshirts'],
  [/jogger|sweatpant|track pant/i, 'joggers'],
  [/jeans|denim trouser|denim pant/i, 'jeans'],
  [/\bshorts?\b|bermuda/i, 'shorts'],
  [/chino/i, 'chinos'],
  [/trouser|cargo pant|dress pant|pleated|drawstring pant/i, 'trousers'],
  [/sneaker|trainer|canvas shoe/i, 'sneakers'],
  [/loafer|moccasin|driver/i, 'loafers'],
  [/oxford|derby|monk strap|dress shoe|brogue/i, 'dress-shoes'],
  [/\bbelt\b/i, 'belts'],
  [/\bcap\b|\bhat\b|bucket|fedora|beanie/i, 'caps-hats'],
  [/\btie\b|necktie|bow tie/i, 'ties'],
  [/pocket square/i, 'pocket-squares'],
  [/cufflink/i, 'cufflinks'],
  [/ suspender|\bbraces\b/i, 'suspenders'],
  [/bracelet|\bbeads?\b|lapel pin/i, 'bracelets'],
  [/sunglass|shades|eyewear/i, 'sunglasses'],
  [/\bsocks?\b/i, 'socks'],
  [/wallet|cardholder|card holder|money clip/i, 'wallets-purses'],
  [/perfume|cologne|eau de|edp|edt|body spray/i, 'mens-fragrance'],
  [/boxer|vest|singlet|underwear|pyjama|pajama|sleepwear/i, 'innerwear'],
  [/\bshirt\b/i, 'casual-shirts'],
  [/\bjacket\b|bomber|puffer/i, 'jackets'],
  [/\bsandal|\bslide\b|\bflip-?flop/i, 'sandals'],
]

function inferFromKeywords(text: string): string | null {
  for (const [re, target] of NAME_KEYWORDS) {
    if (re.test(text)) return target
  }
  return null
}

// ---------------------------------------------------------------- helpers

function parseNGN(s: string | null | undefined): number | null {
  if (!s) return null
  const cleaned = s.replace(/[^\d.]/g, '')
  if (!cleaned) return null
  const n = parseFloat(cleaned)
  return Number.isFinite(n) && n > 0 ? n : null
}

function normalizeSize(raw: string | null | undefined): string | null {
  if (!raw) return null
  let s = raw.trim()
  if (!s) return null
  const up = s.toUpperCase()
  if (/^XXX?L$|^3XL$/.test(up)) s = '3XL'
  else if (/^XXL$|^2XL$/.test(up)) s = '2XL'
  else if (/^X{0,2}[SML]$/.test(up)) s = up
  else if (/^XL$/.test(up)) s = 'XL'
  else s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  return s
}

function uniqueSlugify(base: string, taken: Set<string>): string {
  let slug = base
  let i = 2
  while (taken.has(slug)) slug = `${base}-${i++}`
  taken.add(slug)
  return slug
}

// ---------------------------------------------------------------- main

async function main() {
  const archive: ArchiveItem[] = JSON.parse(
    readFileSync(path.join(DATA, 'products-archive.json'), 'utf-8'),
  )
  let details: Record<string, DetailItem> = {}
  try {
    details = JSON.parse(readFileSync(path.join(DATA, 'products-details.json'), 'utf-8'))
  } catch {
    console.log('no details file — importing archive-only data')
  }

  console.log(`archive: ${archive.length}, details: ${Object.keys(details).length}`)

  // ---- wipe existing catalogue (order-dependent: OrderItem has no cascade)
  console.log('clearing existing catalogue…')
  await db.orderItem.deleteMany({})
  await db.cartItem.deleteMany({})
  await db.wishlistItem.deleteMany({})
  await db.review.deleteMany({})
  await db.campaignProduct.deleteMany({})
  await db.bundleItem.deleteMany({})
  await db.productBundle.deleteMany({})
  await db.campaign.deleteMany({})
  await db.inventoryAdjustment.deleteMany({})
  await db.productAttributeValue.deleteMany({})
  await db.productAttribute.deleteMany({})
  await db.productVariant.deleteMany({})
  await db.productImage.deleteMany({})
  await db.product.deleteMany({})

  // ---- ensure target categories exist
  const neededTargets = new Set<string>()
  const takenSlugs = new Set<string>()
  for (const a of archive) {
    const d = details[a.slug]
    const cats = [...(d?.cats?.length ? d.cats : a.cats), ...a.cats]
    let target = mapCategories(cats)
    if (!target) target = inferFromKeywords(`${a.name} ${(d?.tags || a.tags).join(' ')}`)
    if (!target && a.cats.includes('new-arrivals')) target = 'new-arrivals'
    if (!target) target = 'clothing'
    a.wpId = a.wpId || ''
    ;(a as ArchiveItem & { _target?: string })._target = target
    neededTargets.add(target)
  }

  const catBySlug = new Map<string, { id: string; parentId: string | null }>()
  const allCats = await db.category.findMany()
  for (const c of allCats) catBySlug.set(c.slug, { id: c.id, parentId: c.parentId })

  // create missing child categories under the right parent
  const PARENT_FOR: Record<string, string> = {
    't-shirts': 'clothing', 'polo-shirts': 'clothing', 'casual-shirts': 'clothing',
    'formal-shirts': 'clothing', blazers: 'clothing', suits: 'clothing',
    jackets: 'clothing', 'hoodies-sweatshirts': 'clothing', innerwear: 'clothing',
    chinos: 'bottoms', trousers: 'bottoms', jeans: 'bottoms', shorts: 'bottoms', joggers: 'bottoms',
    sneakers: 'footwear', loafers: 'footwear', 'dress-shoes': 'footwear', 'casual-shoes': 'footwear',
    'exotic-shoes': 'footwear', sandals: 'footwear', boots: 'footwear',
    sunglasses: 'accessories', belts: 'accessories', 'caps-hats': 'accessories',
    'pocket-squares': 'accessories', ties: 'accessories', socks: 'accessories',
    'wallets-purses': 'accessories', cufflinks: 'accessories', suspenders: 'accessories',
    bracelets: 'accessories', watches: 'accessories',
    'mens-fragrance': 'fragrance-grooming', 'womens-fragrance': 'fragrance-grooming',
    'mens-grooming': 'fragrance-grooming',
    pyjamas: 'essentials', 'new-arrivals': '',
    clothing: '', bottoms: '', footwear: '', accessories: '', 'fragrance-grooming': '',
    essentials: '',
  }
  const NAME_FOR: Record<string, string> = {
    sneakers: 'Sneakers', cufflinks: 'Cufflinks', suspenders: 'Suspenders',
    bracelets: 'Bracelets', innerwear: 'Boxers & Underwear', sandals: 'Sandals',
    boots: 'Boots', watches: 'Watches',
  }
  for (const target of neededTargets) {
    if (catBySlug.has(target)) continue
    const parentSlug = PARENT_FOR[target] ?? ''
    const parent = parentSlug ? catBySlug.get(parentSlug) : undefined
    const created = await db.category.create({
      data: {
        name: NAME_FOR[target] ?? target.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
        slug: target,
        parentId: parent?.id ?? null,
        order: 50,
      },
    })
    catBySlug.set(target, { id: created.id, parentId: created.parentId })
    console.log(`  created category: ${target}`)
  }

  // ---- import products
  const manifest: { local: string; remote: string }[] = []
  const seen = new Set<string>()
  let imported = 0
  let noPrice = 0

  // collect images for featured selection
  const importedIds: { id: string; target: string }[] = []

  for (const a of archive) {
    if (seen.has(a.slug)) continue
    seen.add(a.slug)
    const d = details[a.slug]
    const target = (a as ArchiveItem & { _target?: string })._target ?? 'clothing'
    const cat = catBySlug.get(target)
    if (!cat) continue

    // price: display price from detail page, else null
    let price = d?.prices?.length ? parseNGN(d.prices[0]) : null
    if (price === null && d?.prices) price = parseNGN(d.prices.find((p) => parseNGN(p)) ?? null)
    // variant price fallback
    if (price === null && d?.variations?.length) {
      const vp = d.variations.map((v) => v.price).filter((p): p is number => typeof p === 'number' && p > 0)
      if (vp.length) price = Math.min(...vp)
    }
    if (price === null) {
      noPrice++
      continue
    }
    let regular = d?.regularPrices?.length ? parseNGN(d.regularPrices[0]) : null
    if (regular !== null && regular <= price) regular = null

    // variations
    const variantRows: {
      size: string | null
      color: string | null
      price: number
      stock: number
      sku: string | null
    }[] = []
    const seenSizes = new Set<string>()
    for (const v of d?.variations ?? []) {
      const attrs = v.attrs ?? {}
      const rawSize =
        attrs['attribute_pa_size'] ?? attrs['attribute_size'] ?? attrs['pa_size'] ?? null
      const size = normalizeSize(
        typeof rawSize === 'string' ? rawSize.replace(/^pa_/, '') : null,
      )
      const rawColor = attrs['attribute_pa_colour'] ?? attrs['attribute_pa_color'] ?? null
      const vPrice = typeof v.price === 'number' && v.price > 0 ? v.price : price
      // dedupe identical size rows (keep first)
      const key = size ?? `var-${v.id}`
      if (size && seenSizes.has(size)) continue
      if (size) seenSizes.add(size)
      variantRows.push({
        size,
        color: rawColor ? rawColor.replace(/^pa_/, '') : null,
        price: vPrice,
        stock: v.in_stock ? 12 : 0,
        sku: v.sku ?? null,
      })
    }
    // for variable products with attributes but no size attr (e.g. colour-only),
    // keep one variant per colour so stock tracking still works
    if (!variantRows.length && d?.type !== 'simple' && a.type !== 'simple' && d?.variations?.length) {
      for (const v of d.variations) {
        variantRows.push({
          size: null,
          color: null,
          price: typeof v.price === 'number' && v.price > 0 ? v.price : price,
          stock: v.in_stock ? 12 : 0,
          sku: v.sku ?? null,
        })
      }
    }

    // images — gallery order (main first), archive image as fallback
    const imageUrls: string[] = []
    const seenImg = new Set<string>()
    for (const g of d?.gallery ?? []) {
      const clean = g.split('?')[0]
      if (clean && !seenImg.has(clean)) {
        seenImg.add(clean)
        imageUrls.push(clean)
      }
    }
    if (a.image && !seenImg.has(a.image.split('?')[0])) {
      seenImg.add(a.image.split('?')[0])
      imageUrls.unshift(a.image.split('?')[0]) // archive main image first
    }
    const capped = imageUrls.slice(0, 4)

    const sku = d?.sku || (a.wpId ? `WC-${a.wpId}` : `WC-${a.slug.slice(0, 12).toUpperCase()}`)

    const created = await db.product.create({
      data: {
        name: a.name,
        slug: uniqueSlugify(a.slug, takenSlugs),
        description: d?.description || d?.shortDescription || a.name,
        sku,
        price,
        salePrice: regular ?? null,
        currency: 'NGN',
        categoryId: cat.id,
        tags: (d?.tags?.length ? d.tags : a.tags).slice(0, 12).join(', ') || null,
        published: a.stock !== 'outofstock',
        trackStock: true,
        images: {
          create: capped.map((url, i) => ({
            url: `/products/${a.slug}-${i}.jpg`,
            altText: `${a.name} — image ${i + 1}`,
            position: i,
          })),
        },
        variants: {
          create: variantRows.slice(0, 60).map((v) => ({
            size: v.size,
            color: v.color,
            price: v.price,
            stock: v.stock,
            sku: v.sku,
          })),
        },
      },
    })

    // attributes (Size / Weight rows from the WP attributes table)
    const usedAttrIds = new Set<string>()
    let attrIdx = 0
    for (const attr of d?.attributes ?? []) {
      const label = attr.label.replace(/[:\s]+$/, '')
      if (!/size|weight|length|colour|color|material|fit/i.test(label)) continue
      if (attr.value.length > 200) continue
      const attrSlug =
        label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `attr-${attrIdx}`
      let pa = await db.productAttribute.findUnique({ where: { slug: attrSlug } })
      if (!pa)
        pa = await db.productAttribute.create({
          data: {
            name: label,
            slug: attrSlug,
            values: JSON.stringify([]),
          },
        })
      if (!usedAttrIds.has(pa.id)) {
        usedAttrIds.add(pa.id)
        await db.productAttributeValue.create({
          data: { productId: created.id, attributeId: pa.id, value: attr.value },
        })
      }
      attrIdx++
      if (attrIdx >= 4) break
    }

    for (let i = 0; i < capped.length; i++) {
      manifest.push({ local: `public/products/${a.slug}-${i}.jpg`, remote: capped[i] })
    }
    imported++
    importedIds.push({ id: created.id, target })
  }

  // ---- featured: up to 8 across key categories
  const featuredTargets = ['chinos', 'polo-shirts', 'sneakers', 't-shirts', 'jeans', 'ties', 'loafers', 'casual-shirts']
  const featuredIds = new Set<string>()
  for (const t of featuredTargets) {
    const pick = importedIds.find((p) => p.target === t && !featuredIds.has(p.id))
    if (pick) featuredIds.add(pick.id)
    if (featuredIds.size >= 8) break
  }
  if (featuredIds.size) {
    await db.product.updateMany({
      where: { id: { in: Array.from(featuredIds) } },
      data: { featured: true },
    })
  }

  writeFileSync(
    path.join(DATA, 'image-manifest.json'),
    JSON.stringify(manifest, null, 1),
  )

  const productCount = await db.product.count()
  const variantCount = await db.productVariant.count()
  console.log(`IMPORT DONE: ${imported} products (${noPrice} skipped, no price), ${variantCount} variants, ${manifest.length} images, ${featuredIds.size} featured`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
