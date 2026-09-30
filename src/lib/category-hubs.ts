/**
 * Category hub pages — the dedicated landing pages behind the four main
 * retail nav items (Clothing / Footwear / Accessories / Fragrance & Grooming).
 *
 * Clicking a top-level nav label lands here instead of the all-products shop
 * grid: each hub organises its subcategories into their own editorial
 * sections (mirroring the mega-menu groups 1:1), with a product rail per
 * subcategory. Deep links still point at /shop?category=<slug> for the full
 * filtered grid, so the hub is a wayfinding + SEO layer, never a duplicate
 * of the shop page.
 *
 * `groups` intentionally mirror nav-data.ts mega groups. Sub slugs must match
 * the Prisma Category tree; subs missing from the DB are skipped gracefully.
 */

export type HubSub = {
  slug: string
  label: string
  /** One-line editorial description shown above the subcategory's rail. */
  description: string
}

export type HubGroup = {
  /** Group heading — mirrors the mega-menu group label. */
  label: string
  subs: HubSub[]
}

export type HubConfig = {
  /** Route slug — the page lives at /<route>. */
  route: string
  /** Prisma root Category slug the products are fetched from. */
  rootSlug: string
  navLabel: string
  h1: string
  eyebrow: string
  heroLede: string
  metaTitle: string
  metaDescription: string
  groups: HubGroup[]
}

export const HUBS: Record<string, HubConfig> = {
  clothing: {
    route: 'clothing',
    rootSlug: 'clothing',
    navLabel: 'Clothing',
    h1: 'Clothing',
    eyebrow: 'Wardrobecare · Lagos',
    heroLede:
      'Every piece we stock, sorted the way a wardrobe is actually built. Shirting, tailoring, knitwear and layers each hold their own edit below — with Bottoms, our companion category, in a section of its own.',
    metaTitle: 'Clothing — Shirts, Suits, Blazers & Bottoms',
    metaDescription:
      "Shop Wardrobecare's clothing edits — blazers, casual and formal shirts, polos, suits, t-shirts and hoodies, plus chinos, jeans and trousers. Lagos delivery, nationwide shipping.",
    groups: [
      {
        label: 'Clothing',
        subs: [
          {
            slug: 'blazers',
            label: 'Blazers',
            description:
              'Structured shoulders and clean lines — blazers that carry boardrooms and owambe alike.',
          },
          {
            slug: 'casual-shirts',
            label: 'Casual Shirts',
            description:
              'Everyday shirting in breathable cottons and soft prints, built for Lagos heat and easy dressing.',
          },
          {
            slug: 'formal-shirts',
            label: 'Formal / Office Shirts',
            description:
              'Crisp, pressed and meeting-ready — the backbone of a working wardrobe.',
          },
          {
            slug: 'hoodies-sweatshirts',
            label: 'Hoodies & Sweatshirts',
            description:
              'Off-duty layers with a premium hand-feel — for flights, Fridays and slow Sundays.',
          },
          {
            slug: 'jackets',
            label: 'Jackets',
            description:
              'Outer layers with presence, from lightweight overshirts to statement pieces.',
          },
          {
            slug: 'polo-shirts',
            label: 'Polo Shirts',
            description:
              'The smart-casual middle ground — cut clean, worn often.',
          },
          {
            slug: 'suits',
            label: 'Suits',
            description:
              'Two- and three-piece tailoring for the days that matter most.',
          },
          {
            slug: 't-shirts',
            label: 'T-Shirts',
            description:
              'Premium tees with weight and shape that survive the wash.',
          },
        ],
      },
      {
        label: 'Bottoms',
        subs: [
          {
            slug: 'chinos',
            label: 'Chinos',
            description:
              'Smart-casual trousers that move from the office to the evening without a change.',
          },
          {
            slug: 'jeans',
            label: 'Jeans',
            description:
              'Denim with integrity — straight, clean and dependable.',
          },
          {
            slug: 'joggers',
            label: 'Joggers',
            description:
              'Relaxed bottoms that still look intentional.',
          },
          {
            slug: 'shorts',
            label: 'Shorts',
            description:
              'Warm-weather staples cut at exactly the right length.',
          },
          {
            slug: 'trousers',
            label: 'Trousers',
            description:
              'Pressed pleats and tailored falls — the foundation of formal dress.',
          },
        ],
      },
    ],
  },

  footwear: {
    route: 'footwear',
    rootSlug: 'footwear',
    navLabel: 'Footwear',
    h1: 'Footwear',
    eyebrow: 'Wardrobecare · Lagos',
    heroLede:
      'Every pair we carry, arranged in its own edit below — from boardroom derbies to weekend loafers, each style vetted for leather quality before it reaches these shelves.',
    metaTitle: 'Footwear — Dress Shoes, Loafers & Casual Shoes',
    metaDescription:
      'Explore the Wardrobecare footwear edits — casual shoes, dress shoes, exotic shoes and loafers, curated for the distinguished Lagos man. Lagos delivery, nationwide shipping.',
    groups: [
      {
        label: 'Footwear',
        subs: [
          {
            slug: 'casual-shoes',
            label: 'Casual Shoes',
            description:
              'Sneakers and easy pairs that survive Lagos pavements without losing their manners.',
          },
          {
            slug: 'dress-shoes',
            label: 'Dress Shoes',
            description:
              'Oxfords and derbies with a clean welt — the full stop at the end of a tailored look.',
          },
          {
            slug: 'exotic-shoes',
            label: 'Exotic Shoes',
            description:
              'Statement leathers for the occasions that call for them.',
          },
          {
            slug: 'loafers',
            label: 'Loafers',
            description:
              'Slip on and go — the hardest-working pair in a Nigerian wardrobe.',
          },
        ],
      },
    ],
  },

  accessories: {
    route: 'accessories',
    rootSlug: 'accessories',
    navLabel: 'Accessories',
    h1: 'Accessories',
    eyebrow: 'Wardrobecare · Lagos',
    heroLede:
      'The details that finish an outfit. Belts, ties, pocket squares and everything in between — each category holds its own edit below.',
    metaTitle: 'Accessories — Ties, Belts, Wallets & More',
    metaDescription:
      'Browse Wardrobecare accessories by category — belts, caps & hats, pocket squares, socks, sunglasses, ties and wallets & purses. Finishing touches for a considered wardrobe.',
    groups: [
      {
        label: 'Accessories',
        subs: [
          {
            slug: 'belts',
            label: 'Belts',
            description:
              'Leather belts that match the formality of the shoe — always.',
          },
          {
            slug: 'caps-hats',
            label: 'Caps & Hats',
            description:
              'Crowns for the off days — structured caps and easy hats.',
          },
          {
            slug: 'pocket-squares',
            label: 'Pocket Squares',
            description:
              'A flash of colour and intent for the jacket’s breast pocket.',
          },
          {
            slug: 'socks',
            label: 'Socks',
            description:
              'The quiet detail — cotton-rich pairs that stay up all day.',
          },
          {
            slug: 'sunglasses',
            label: 'Sunglasses',
            description:
              'Frames with presence, for the Lagos sun and the drive through it.',
          },
          {
            slug: 'ties',
            label: 'Ties',
            description:
              'Silk and textured ties tied to the season’s tailoring.',
          },
          {
            slug: 'wallets-purses',
            label: 'Wallets & Purses',
            description:
              'Everyday carry, leathered and slim — made to age well.',
          },
        ],
      },
    ],
  },

  'fragrance-grooming': {
    route: 'fragrance-grooming',
    rootSlug: 'fragrance-grooming',
    navLabel: 'Fragrance & Grooming',
    h1: 'Fragrance & Grooming',
    eyebrow: 'Wardrobecare · Lagos',
    heroLede:
      'Scent and self-care, curated like the clothes. Men’s fragrance, grooming essentials and a women’s fragrance edit — each in its own section below.',
    metaTitle: "Fragrance & Grooming — Men's & Women's Scents",
    metaDescription:
      'Shop Wardrobecare’s fragrance & grooming edits — men’s fragrance, men’s grooming and women’s fragrance, each with its own curated selection. Lagos delivery, nationwide shipping.',
    groups: [
      {
        label: 'Fragrance & Grooming',
        subs: [
          {
            slug: 'mens-fragrance',
            label: "Men's Fragrance",
            description:
              'Signature scents with staying power — from fresh morning sprays to evening woods.',
          },
          {
            slug: 'mens-grooming',
            label: "Men's Grooming",
            description:
              'The ritual kit — skincare and grooming essentials that keep the look sharp.',
          },
          {
            slug: 'womens-fragrance',
            label: "Women's Fragrance",
            description:
              'For the women we shop for — a considered edit of feminine scents.',
          },
        ],
      },
    ],
  },
}

/** Hub configs in nav order (also used for sitemap). */
export const HUB_LIST: HubConfig[] = [
  HUBS.clothing,
  HUBS.footwear,
  HUBS.accessories,
  HUBS['fragrance-grooming'],
]

/** Returns the hub config for a root category slug, or undefined. */
export function getHub(rootSlug: string): HubConfig | undefined {
  return HUBS[rootSlug]
}
