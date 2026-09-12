/**
 * POST /api/chat — "Wally", the AI shopping assistant (fully functional).
 *
 * Upgrade over the previous static-prompt bot:
 *  1. REAL catalog search  — the user's latest message is parsed for category,
 *     occasion, colour, budget and size signals, then scored against the live
 *     database (532 products). Top matches are injected into the prompt AND
 *     streamed to the widget as structured product cards (image, price, sizes).
 *  2. FAQ grounding        — store FAQs are keyword-matched and injected so
 *     answers about delivery/returns/payment quote real policy.
 *  3. Order lookup         — "WC-XXXXX" order numbers are detected and the live
 *     order status is fetched from the DB and rendered as an order card.
 *  4. Real navigation      — every URL in the prompt is a route that exists
 *     (shop filters, product pages, track-order, faq, returns, shipping…).
 *  5. Size expertise       — a grounded men's size chart + measuring guide.
 *  6. Context awareness    — the widget sends the current page and a remembered
 *     customer profile (e.g. known size) which the prompt takes into account.
 *
 * Response protocol (NDJSON — one JSON object per line):
 *   {"type":"meta","products":[…],"order":{…}|null}   ← sent first, before tokens
 *   {"type":"token","v":"…"}                          ← many
 *   {"type":"end"}
 */
import { NextRequest } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_MESSAGES = 20
const MAX_USER_CHARS = 2000
const TOP_PRODUCTS = 6

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

interface CatalogProduct {
  name: string
  slug: string
  price: number
  salePrice: number | null
  currency: string
  description: string
  tags: string
  categorySlug: string
  categoryName: string
  img: string | null
  sizes: string[]
  inStock: boolean
  featured: boolean
}
interface CatalogCategory { name: string; slug: string; featured: boolean }
interface CatalogFaq { question: string; answer: string; category: string }
interface CatalogSettings {
  whatsapp: string | null
  supportEmail: string | null
  supportPhone: string | null
  instagram: string | null
  deliveryFee: number
  freeOver: number
  bankName: string | null
  bankAccountName: string | null
  bankAccountNumber: string | null
  paystackEnabled: boolean
}
interface Catalog {
  products: CatalogProduct[]
  categories: CatalogCategory[]
  faqs: CatalogFaq[]
  settings: CatalogSettings | null
  ts: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalog cache (60s TTL) — one small query set per minute, works identically
// on SQLite (dev) and Postgres (prod): all text scoring happens in JS.
// ─────────────────────────────────────────────────────────────────────────────
let CATALOG: Catalog | null = null
const CATALOG_TTL = 60_000

async function getCatalog(): Promise<Catalog> {
  if (CATALOG && Date.now() - CATALOG.ts < CATALOG_TTL) return CATALOG
  const [rawProducts, categories, faqs, settings] = await Promise.all([
    db.product.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        name: true, slug: true, price: true, salePrice: true, currency: true,
        description: true, tags: true, featured: true,
        category: { select: { name: true, slug: true } },
        images: { orderBy: { position: 'asc' }, take: 1, select: { url: true } },
        variants: { select: { size: true, stock: true } },
      },
    }),
    db.category.findMany({
      where: { active: true },
      orderBy: { order: 'desc' },
      select: { name: true, slug: true, featured: true },
    }),
    db.fAQ.findMany({
      where: { published: true },
      select: { question: true, answer: true, category: true },
      orderBy: { order: 'asc' },
    }),
    db.adminSettings.findFirst({
      select: {
        whatsappNumber: true, supportEmail: true, supportPhone: true, instagramUrl: true,
        defaultDeliveryFee: true, freeDeliveryThreshold: true,
        bankName: true, bankAccountName: true, bankAccountNumber: true, paystackEnabled: true,
      },
    }),
  ])

  const products: CatalogProduct[] = rawProducts.map((p) => ({
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    currency: p.currency,
    description: p.description ?? '',
    tags: p.tags ?? '',
    categorySlug: p.category?.slug ?? '',
    categoryName: p.category?.name ?? '',
    img: p.images[0]?.url ?? null,
    sizes: [...new Set(p.variants.map((v) => v.size).filter((s): s is string => !!s))],
    inStock: p.variants.length === 0 || p.variants.some((v) => v.stock > 0),
    featured: p.featured,
  }))

  const s = settings
  CATALOG = {
    products,
    categories,
    faqs,
    settings: s
      ? {
          whatsapp: s.whatsappNumber, supportEmail: s.supportEmail, supportPhone: s.supportPhone,
          instagram: s.instagramUrl, deliveryFee: s.defaultDeliveryFee, freeOver: s.freeDeliveryThreshold,
          bankName: s.bankName, bankAccountName: s.bankAccountName, bankAccountNumber: s.bankAccountNumber,
          paystackEnabled: s.paystackEnabled,
        }
      : null,
    ts: Date.now(),
  }
  return CATALOG
}

// ─────────────────────────────────────────────────────────────────────────────
// Intent extraction
// ─────────────────────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'the','a','an','and','or','for','with','me','my','i','we','our','you','your','is','are','do','does',
  'did','can','could','would','should','have','has','need','want','looking','look','show','find','get',
  'give','please','hi','hello','hey','some','any','of','in','on','to','at','it','its','that','this',
  'what','which','how','where','when','who','there','here','be','been','am','was','were','will','just',
  'about','like','love','new','best','good','great','nice','something','anything','see','buy','order',
  'shop','store','site','website','page','price','prices','much','cost','naira','ngn','n','na','abeg',
  'make','let','us','also','too','very','so','if','but','not','no','yes','ok','okay','thanks','thank',
])

/** user words → category slugs (real slugs from the DB) */
const CATEGORY_ALIASES: Record<string, string[]> = {
  shirt: ['casual-shirts', 'formal-shirts', 'polo-shirts'],
  polo: ['polo-shirts'],
  tee: ['t-shirts'],
  tshirt: ['t-shirts'],
  suit: ['suits', 'blazers'],
  blazer: ['blazers', 'suits'],
  jacket: ['jackets', 'hoodies-sweatshirts'],
  hoodie: ['hoodies-sweatshirts'],
  sweatshirt: ['hoodies-sweatshirts'],
  trouser: ['trousers', 'chinos'],
  trousers: ['trousers', 'chinos'],
  pants: ['trousers', 'chinos'],
  chino: ['chinos', 'trousers'],
  jean: ['jeans'],
  denim: ['jeans'],
  short: ['shorts'],
  jogger: ['joggers'],
  shoe: ['footwear', 'loafers', 'dress-shoes', 'casual-shoes', 'sneakers'],
  shoes: ['footwear', 'loafers', 'dress-shoes', 'casual-shoes', 'sneakers'],
  sneaker: ['sneakers', 'casual-shoes'],
  loafer: ['loafers'],
  slipper: ['loafers', 'casual-shoes'],
  sandal: ['loafers', 'casual-shoes'],
  belt: ['belts'],
  tie: ['ties'],
  sock: ['socks'],
  watch: ['accessories'],
  wallet: ['wallets-purses'],
  purse: ['wallets-purses'],
  bag: ['wallets-purses', 'accessories'],
  sunglasses: ['sunglasses'],
  glasses: ['sunglasses'],
  shade: ['sunglasses'],
  cap: ['caps-hats'],
  hat: ['caps-hats'],
  cufflink: ['cufflinks', 'accessories'],
  bracelet: ['bracelets', 'accessories'],
  suspender: ['suspenders', 'accessories'],
  perfume: ['mens-fragrance', 'fragrance-grooming'],
  fragrance: ['mens-fragrance', 'fragrance-grooming'],
  scent: ['mens-fragrance', 'fragrance-grooming'],
  cologne: ['mens-fragrance', 'fragrance-grooming'],
  spray: ['mens-fragrance', 'fragrance-grooming'],
  deodorant: ['mens-grooming', 'mens-fragrance'],
  grooming: ['mens-grooming', 'fragrance-grooming'],
  pajama: ['pyjamas'],
  pyjama: ['pyjamas'],
  innerwear: ['innerwear'],
  underwear: ['innerwear'],
  boxers: ['innerwear'],
  vest: ['innerwear'],
  gift: ['accessories', 'mens-fragrance', 'wallets-purses', 'ties'],
  accessories: ['accessories'],
  accessory: ['accessories'],
}

/** occasion phrases → category slugs */
const OCCASION_MAP: { words: string[]; slugs: string[] }[] = [
  { words: ['work', 'office', 'formal', 'interview', 'meeting', 'business', 'corporate'], slugs: ['formal-shirts', 'polo-shirts', 'casual-shirts', 'trousers', 'chinos', 'blazers', 'suits', 'loafers', 'ties'] },
  { words: ['wedding', 'owambe', 'asoebi', 'aso-ebi', 'engagement', 'traditional'], slugs: ['suits', 'blazers', 'accessories', 'cufflinks', 'pocket-squares', 'loafers', 'formal-shirts'] },
  { words: ['casual', 'weekend', 'relaxed', 'everyday', 'hangout', 'chill'], slugs: ['t-shirts', 'polo-shirts', 'jeans', 'shorts', 'sneakers', 'casual-shirts'] },
  { words: ['gym', 'sport', 'training', 'workout', 'running', 'fitness'], slugs: ['joggers', 'hoodies-sweatshirts', 't-shirts', 'sneakers'] },
  { words: ['church', 'sunday'], slugs: ['formal-shirts', 'trousers', 'loafers', 'blazers'] },
  { words: ['date', 'dinner', 'night', 'party', 'club', 'birthday'], slugs: ['polo-shirts', 'casual-shirts', 'jeans', 'loafers', 'blazers', 'mens-fragrance'] },
  { words: ['beach', 'vacation', 'holiday', 'travel', 'resort'], slugs: ['shorts', 'polo-shirts', 't-shirts', 'sunglasses', 'caps-hats', 'loafers'] },
  { words: ['cold', 'harmattan', 'rain', 'wet'], slugs: ['jackets', 'hoodies-sweatshirts'] },
]

const COLORS = ['black', 'white', 'blue', 'navy', 'brown', 'tan', 'beige', 'pink', 'green', 'grey', 'gray', 'red', 'yellow', 'purple', 'cream', 'khaki', 'olive', 'orange']

const SIZE_LETTERS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL']

export interface ChatIntent {
  tokens: string[]
  categorySlugs: Set<string>
  occasionSlugs: Set<string>
  colors: Set<string>
  priceMin: number | null
  priceMax: number | null
  size: string | null
  orderNumber: string | null
  isGreeting: boolean
}

function extractIntent(text: string): ChatIntent {
  const lower = text.toLowerCase()
  const tokens = lower
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))

  const categorySlugs = new Set<string>()
  for (const [key, slugs] of Object.entries(CATEGORY_ALIASES)) {
    if (tokens.some((t) => t === key || t === `${key}s` || t.startsWith(key))) {
      slugs.forEach((s) => categorySlugs.add(s))
    }
  }
  const occasionSlugs = new Set<string>()
  for (const occ of OCCASION_MAP) {
    if (occ.words.some((w) => lower.includes(w))) occ.slugs.forEach((s) => occasionSlugs.add(s))
  }

  const colors = new Set<string>(COLORS.filter((c) => lower.includes(c)))

  // budget: "under 30k", "below ₦30,000", "less than 25k", "between 20k and 50k", "20000-40000"
  let priceMin: number | null = null
  let priceMax: number | null = null
  const num = (raw: string, k?: string) => {
    const n = parseFloat(raw.replace(/,/g, ''))
    if (Number.isNaN(n)) return null
    return k ? n * 1000 : n
  }
  const range = lower.match(/between\s*₦?\s*([\d,]+)\s*(k)?\s*(?:and|to|-)\s*₦?\s*([\d,]+)\s*(k)?/)
  if (range) {
    priceMin = num(range[1], range[2])
    priceMax = num(range[3], range[4])
  } else {
    const under = lower.match(/(?:under|below|less than|max(?:imum)?|budget(?: of)?|cheaper than|not more than|within|around|about)\s*₦?\s*([\d,]+(?:\.\d+)?)\s*(k\b)?/)
    if (under) priceMax = num(under[1], under[2])
  }

  // size: "size L", "I wear XL", "i'm a size 40", "size 42"
  let size: string | null = null
  const letter = lower.match(/(?:size|wear|take|am|fit)\s*(?:a\s*|an\s*)?(xs|s|m|l|xl|xxl|xxxl|3xl)\b/)
  if (letter) {
    const v = letter[1].toUpperCase()
    size = v === 'XXXL' ? '3XL' : v
  }
  if (!size) {
    const numeric = lower.match(/size\s*(\d{2})\b/)
    if (numeric) size = numeric[1]
  }

  const orderNumber = text.match(/\b(WC-[A-Za-z0-9]{3,})\b/i)?.[1]?.toUpperCase() ?? null

  const isGreeting = /^(hi|hello|hey|good (morning|afternoon|evening)|how far|salut|yo)[\s!.,]*$/i.test(text.trim())

  return { tokens, categorySlugs, occasionSlugs, colors, priceMin, priceMax, size, orderNumber, isGreeting }
}

// ─────────────────────────────────────────────────────────────────────────────
// Product scoring (pure JS — dialect-neutral, fast on 500-item catalog)
// ─────────────────────────────────────────────────────────────────────────────
function effectivePrice(p: CatalogProduct): number {
  return p.salePrice && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price
}

function searchProducts(catalog: Catalog, intent: ChatIntent) {
  const scored: { p: CatalogProduct; score: number }[] = []

  for (const p of catalog.products) {
    const hay = `${p.name} ${p.description} ${p.tags}`.toLowerCase()
    let score = 0
    let matched = false

    for (const slug of intent.occasionSlugs) {
      if (p.categorySlug === slug) {
        score += 4
        matched = true
      }
    }
    for (const slug of intent.categorySlugs) {
      if (p.categorySlug === slug) {
        score += 2.5
        matched = true
      }
    }
    for (const t of intent.tokens) {
      // "shirt" should not score T-shirts — T-shirt is its own intent
      if (t === 'shirt' && p.name.toLowerCase().includes('t-shirt')) continue
      if (p.name.toLowerCase().includes(t)) {
        score += 2
        matched = true
      } else if (hay.includes(t)) {
        score += 1
        matched = true
      }
    }
    for (const c of intent.colors) {
      if (p.name.toLowerCase().includes(c)) {
        score += 1.5
        matched = true
      }
    }

    const price = effectivePrice(p)
    if (intent.priceMax !== null && price > intent.priceMax * 1.05) score -= 6
    if (intent.priceMin !== null && price < intent.priceMin * 0.95) score -= 6
    if ((intent.priceMax !== null || intent.priceMin !== null) && price >= (intent.priceMin ?? 0) * 0.95 && price <= (intent.priceMax ?? Infinity) * 1.05) {
      score += 2
      matched = true
    }

    if (!p.inStock) score -= 2
    if (p.featured) score += 0.3
    if (intent.size && p.sizes.includes(intent.size)) score += 1

    if (matched && score > 0) scored.push({ p, score })
  }

  scored.sort((a, b) => b.score - a.score)
  let results = scored.slice(0, TOP_PRODUCTS).map((s) => s.p)

  // Budget-only query with no keyword hits → cheapest within budget
  if (results.length === 0 && (intent.priceMax !== null || intent.priceMin !== null)) {
    results = catalog.products
      .filter((p) => {
        const pr = effectivePrice(p)
        return pr >= (intent.priceMin ?? 0) * 0.95 && pr <= (intent.priceMax ?? Infinity) * 1.05
      })
      .sort((a, b) => effectivePrice(a) - effectivePrice(b))
      .slice(0, TOP_PRODUCTS)
  }
  return results
}

/** keyword-match FAQs (word overlap between user text and Q+A) */
function matchFaqs(catalog: Catalog, intent: ChatIntent) {
  const scored = catalog.faqs
    .map((f) => {
      const hay = `${f.question} ${f.answer}`.toLowerCase()
      let score = 0
      for (const t of intent.tokens) if (hay.includes(t)) score += 1
      for (const t of intent.tokens) if (f.question.toLowerCase().includes(t)) score += 1
      return { f, score }
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  return scored.map((x) => x.f)
}

async function lookupOrder(orderNumber: string) {
  try {
    const order = await db.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true, status: true, paymentStatus: true, total: true, currency: true,
        trackingNumber: true, carrier: true, createdAt: true, shippedAt: true, deliveredAt: true,
        items: { select: { name: true, quantity: true } },
      },
    })
    return order
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// System prompt
// ─────────────────────────────────────────────────────────────────────────────
const SIZE_CHART = `MEN'S SIZE GUIDE (letter sizes = chest/waist in inches):
- S: chest 34-36, waist 28-30
- M: chest 38-40, waist 32-34
- L: chest 40-42, waist 34-36
- XL: chest 42-44, waist 36-38
- XXL: chest 44-46, waist 38-40
- 3XL: chest 46-48, waist 40-42
Trousers & jeans use the NUMERIC waist size in inches (32, 34, 36, 38…). Some trousers list a length, e.g. "38 (length 41)" = waist 38in, inseam 41in.
Footwear uses standard numeric sizes; suggest the customer's usual shoe size.
MEASURING TIPS: chest = around the fullest part under the arms; waist = around the natural waistline (near the navel). If between sizes, go one size UP for shirts/tees (our formal shirts run slim; polos and tees run true to size).`

function pageContext(page?: string): string {
  if (!page) return 'Home page'
  const p = page.split('?')[0]
  if (p === '/' || p === '') return 'Home page'
  if (p === '/shop') return 'The shop listing page (filters: category, size, price, sort)'
  if (p.startsWith('/product/')) return `A product detail page (${p}) — likely interested in this item or completing an outfit`
  if (p === '/cart') return 'The cart page — likely considering checkout'
  if (p === '/checkout') return 'The checkout page — may need payment/delivery help'
  if (p.startsWith('/track-order')) return 'The order-tracking page — expects to look up an order'
  if (p.startsWith('/account')) return 'Their account area'
  if (p === '/faq') return 'The FAQs page'
  if (p === '/returns') return 'The returns & refunds policy page'
  if (p === '/shipping') return 'The delivery/shipping info page'
  if (p === '/about') return 'The About page'
  if (p.startsWith('/services')) return 'The personal shopping / services page'
  return p
}

async function buildSystemPrompt(opts: {
  intent: ChatIntent
  products: CatalogProduct[]
  faqs: CatalogFaq[]
  order: Awaited<ReturnType<typeof lookupOrder>>
  page?: string
  profile?: { size?: string; fit?: string }
}): Promise<string> {
  const catalog = await getCatalog()
  const s = catalog.settings
  const { intent, products, faqs, order } = opts

  const whatsapp = s?.whatsapp ? `0${s.whatsapp.replace(/^234/, '')}` : '08026133770'
  const waLink = s?.whatsapp ? `https://wa.me/${s.whatsapp}` : 'https://wa.me/2348026133770'

  const featuredCats = catalog.categories.filter((c) => c.featured)
  const catList = (featuredCats.length > 0 ? featuredCats : catalog.categories)
    .map((c) => `${c.name} (/shop?category=${c.slug})`)
    .join(', ')

  const productBlock = products.length
    ? `MATCHED PRODUCTS (real, live items — reference them by their numbers; the widget displays them as cards with photos):
${products.map((p, i) => {
  const price = effectivePrice(p)
  const sale = p.salePrice && p.salePrice > 0 && p.salePrice < p.price ? p.price : null
  return `[${i + 1}] ${p.name} — ${sale ? `NOW ${p.currency} ${price.toLocaleString()} (was ${p.currency} ${sale.toLocaleString()})` : `${p.currency} ${price.toLocaleString()}`} — sizes: ${p.sizes.length > 0 ? p.sizes.join('/') : 'one size'} — ${p.inStock ? 'in stock' : 'currently out of stock'} — link: /product/${p.slug}`
}).join('\n')}`
    : 'MATCHED PRODUCTS: none matched this request — say so honestly, suggest the closest categories from the list above, or offer the WhatsApp personal-shopper service.'

  const faqBlock = faqs.length
    ? `STORE POLICY GROUNDING (use these facts, quote them closely):
${faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n')}`
    : ''

  const orderBlock = order
    ? `LIVE ORDER LOOKUP (customer just asked about this order — give a warm, clear status summary):
- Order ${order.orderNumber}: status ${order.status}, payment ${order.paymentStatus}, total ${order.currency} ${Number(order.total).toLocaleString()}, placed ${new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} (${order.items.length} item(s))
${order.trackingNumber ? `- Tracking: ${order.trackingNumber}${order.carrier ? ` via ${order.carrier}` : ''}` : '- No tracking number yet'}
${order.deliveredAt ? `- Delivered on ${new Date(order.deliveredAt).toLocaleDateString('en-GB')}` : ''}`
    : intent.orderNumber
      ? `ORDER LOOKUP: order ${intent.orderNumber} was NOT found in the system. Ask them to double-check the number (format WC-XXXXXX, from their confirmation email/WhatsApp) or contact support.`
      : ''

  const profileBlock = opts.profile?.size
    ? `KNOWN CUSTOMER PROFILE: they previously told me their size is ${opts.profile.size} — use it when recommending sizes. ${opts.profile.fit ? `Fit preference: ${opts.profile.fit}.` : ''}`
    : ''

  return `You are "Wally", the AI personal shopper for Wardrobecare Clothing — a premium men's fashion store in Surulere, Lagos, Nigeria. Tagline: "${s ? 'Your #1 Personal Shopper for premium men\'s fashion.' : ''}"

STORE FACTS (real — never contradict):
- Currency: Nigerian Naira (NGN). Catalogue: ${catalog.products.length} live products, ${catalog.categories.length} categories.
- Delivery: flat ${s ? s.deliveryFee.toLocaleString() : '2,500'} NGN nationwide, FREE on orders over ${s ? s.freeOver.toLocaleString() : '50,000'} NGN.
- Payment: Paystack (card/bank/ussd)${s?.paystackEnabled === false ? ' (temporarily offline)' : ''}, or bank transfer to ${s?.bankName ?? 'Sparkle Bank'} — ${s?.bankAccountName ?? 'Wardrobecare Nigeria Enterprises'}, ${s?.bankAccountNumber ?? '1000447933'} — or order via WhatsApp (${whatsapp}).
- Personal shopping / style advice is a free service — WhatsApp ${whatsapp} or visit /services.
- Instagram: ${s?.instagram ?? 'https://www.instagram.com/wardrobecareng/'}

REAL SITE ROUTES (only these exist — never invent URLs):
- Shop all: /shop · New arrivals: /shop?sort=newest · Filtered category: /shop?category=<slug> (e.g. /shop?category=formal-shirts)
- Price filter example: /shop?maxPrice=30000 · Size filter example: /shop?size=L
- Product pages: /product/<slug> (use the exact slugs given in MATCHED PRODUCTS)
- Cart: /cart · Checkout: /checkout · Wishlist: /account/wishlist · My orders: /account/orders · Account: /account
- Track an order: /track-order (order numbers look like WC-XXXXXX)
- FAQs: /faq · Returns & refunds: /returns · Delivery info: /shipping · About us: /about · Services: /services

AVAILABLE CATEGORIES: ${catList}

${productBlock}

${SIZE_CHART}

${faqBlock}

${orderBlock}

${profileBlock}

USER'S CURRENT PAGE: ${pageContext(opts.page)} — tailor suggestions to where they are.

YOUR JOB:
1. Tour guide: when someone is new or lost, introduce the store briefly and point them to 2-3 relevant links (real routes only).
2. Personal shopper: when they describe an occasion, style, colour or budget, recommend from MATCHED PRODUCTS by number ("[1] and [4] would be perfect…"), with one-line reasons. If nothing matched, say so honestly and offer the closest category link or the WhatsApp personal-shopper service.
3. Sizing expert: answer size questions using the SIZE CHART; ask for their usual size, height or measurements when needed; if they tell you their size, confirm it so the widget remembers it.
4. Orders: if they give a WC- order number, summarise the LIVE ORDER LOOKUP; otherwise send them to /track-order.
5. Policies: answer delivery/returns/payment questions from STORE FACTS and the grounding above; anything beyond it → WhatsApp ${whatsapp} (link ${waLink}) or /faq.

STYLE RULES:
- Warm, confident, premium — like a personal shopper at a high-end Lagos boutique.
- Concise: 1–3 short sentences per idea, max ~90 words per reply. No walls of text, no headings, no bullet lists unless comparing products.
- Always end with a natural next step or question when it helps ("Want me to show you what's in your size?").
- NEVER invent products, prices, sizes, stock levels or URLs. Only reference MATCHED PRODUCTS and real routes.
- Prices: always NGN with thousands separators (₦30,000). Never promise discounts that aren't shown.
- If asked something unrelated to the store, answer briefly and steer back to fashion.
- Emojis: at most one per reply, and only if the user uses them first.`
}

// ─────────────────────────────────────────────────────────────────────────────
// SSE → token parsing (SDK emits SSE lines; we re-emit as NDJSON events)
// ─────────────────────────────────────────────────────────────────────────────
/** Parse ONE complete SSE line → delta token (or null). */
function parseSseLine(line: string): string | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('data:')) return null
  const payload = trimmed.slice(5).trim()
  if (payload === '[DONE]' || payload.length === 0) return null
  try {
    const json = JSON.parse(payload)
    const token = json?.choices?.[0]?.delta?.content
    return typeof token === 'string' && token.length > 0 ? token : null
  } catch {
    return null // malformed → skipped
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: {
    messages?: ChatMessage[]
    sessionId?: string
    page?: string
    profile?: { size?: string; fit?: string }
  }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const incoming = body.messages
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return new Response(JSON.stringify({ error: 'messages[] is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const history = incoming
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role === 'system' ? ('assistant' as const) : m.role,
      content: String(m.content ?? '').slice(0, MAX_USER_CHARS),
    }))
    .filter((m) => m.content.length > 0)
  if (history.length === 0) {
    return new Response(JSON.stringify({ error: 'messages[] is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const latestUser = [...history].reverse().find((m) => m.role === 'user')?.content ?? ''
  const intent = extractIntent(latestUser)

  // Catalog + search + grounding (never fail the request on DB hiccups)
  let products: CatalogProduct[] = []
  let faqs: CatalogFaq[] = []
  let order: Awaited<ReturnType<typeof lookupOrder>> = null
  const discovery = intent.isGreeting || /show me (around|what)|what do you (sell|have|stock)|new (here|arrivals|in)|newest|browse|tour|first time/.test(latestUser.toLowerCase())
  try {
    const catalog = await getCatalog()
    products = discovery
      ? [...catalog.products].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, TOP_PRODUCTS)
      : searchProducts(catalog, intent)
    faqs = matchFaqs(catalog, intent)
    if (intent.orderNumber) order = await lookupOrder(intent.orderNumber)
  } catch (e) {
    console.error('[chat] catalog/search failed:', e)
  }

  let systemPrompt: string
  try {
    systemPrompt = await buildSystemPrompt({
      intent, products, faqs, order, page: body.page, profile: body.profile,
    })
  } catch (e) {
    console.error('[chat] prompt build failed:', e)
    systemPrompt =
      "You are Wally, the friendly AI shopping assistant for Wardrobecare Clothing, a premium men's fashion store in Lagos, Nigeria. Help users navigate the site (/shop, /track-order, /faq, /returns) and find products. Be brief and warm."
  }

  const encoder = new TextEncoder()
  const ndjson = (obj: unknown) => encoder.encode(`${JSON.stringify(obj)}\n`)

  // Product-card payload for the widget (strip heavy fields)
  const cardProducts = products.map((p) => ({
    name: p.name,
    slug: p.slug,
    price: effectivePrice(p),
    wasPrice: p.salePrice && p.salePrice > 0 && p.salePrice < p.price ? p.price : null,
    currency: p.currency,
    img: p.img,
    sizes: p.sizes.slice(0, 8),
    inStock: p.inStock,
  }))
  const orderCard = order
    ? {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        currency: order.currency,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        itemCount: order.items.length,
        placedAt: order.createdAt,
      }
    : null

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // 1) meta event first — widget renders cards under the incoming message
      controller.enqueue(ndjson({ type: 'meta', products: cardProducts, order: orderCard }))

      let zai: Awaited<ReturnType<typeof ZAI.create>>
      try {
        zai = await ZAI.create()
      } catch (e) {
        console.error('[chat] ZAI.create failed:', e)
        controller.enqueue(
          ndjson({ type: 'token', v: "I'm having trouble connecting right now — please try again in a moment, or reach us on WhatsApp at 08026133770." }),
        )
        controller.enqueue(ndjson({ type: 'end' }))
        controller.close()
        return
      }

      const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }, ...history]

      let emittedAny = false
      try {
        const result: any = await zai.chat.completions.create({
          messages,
          thinking: { type: 'disabled' },
          stream: true,
        })
        // SSE events can split across chunk boundaries — carry the partial
        // line over so no tokens are ever dropped mid-event.
        let carry = ''
        for await (const chunk of result as AsyncIterable<Uint8Array>) {
          const text = carry + Buffer.from(chunk).toString('utf8')
          const lines = text.split('\n')
          carry = lines.pop() ?? ''
          for (const line of lines) {
            const token = parseSseLine(line)
            if (token) {
              emittedAny = true
              controller.enqueue(ndjson({ type: 'token', v: token }))
            }
          }
        }
        if (carry.trim()) {
          const token = parseSseLine(carry)
          if (token) {
            emittedAny = true
            controller.enqueue(ndjson({ type: 'token', v: token }))
          }
        }
        if (!emittedAny && result?.choices?.[0]?.message?.content) {
          controller.enqueue(ndjson({ type: 'token', v: String(result.choices[0].message.content) }))
          emittedAny = true
        }
        if (!emittedAny) {
          controller.enqueue(
            ndjson({ type: 'token', v: 'Sorry, I drew a blank there — could you rephrase? You can also reach our team on WhatsApp at 08026133770.' }),
          )
        }
      } catch (e) {
        console.error('[chat] streaming failed:', e)
        if (!emittedAny) {
          controller.enqueue(
            ndjson({ type: 'token', v: 'Something went wrong on my side — please try again in a moment.' }),
          )
        }
      } finally {
        controller.enqueue(ndjson({ type: 'end' }))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
