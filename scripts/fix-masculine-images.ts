import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Masculine image replacements sourced from the store's own product photos
const REPLACEMENTS: Record<string, string> = {
  'mens-fragrance': '/products/khadlaj-oud-noir-eau-de-parfum-for-men-0.jpg',
  ties: '/products/mens-diagonal-stripe-silk-tie-navy-blue-charcoal-gray-0.jpg',
  joggers: '/products/lahti-pro-mens-double-panel-draw-string-joggers-grey-black-0.jpg',
  trousers: '/products/hm-mens-classic-smart-formal-pant-trousers-deep-navy-blue-0.jpg',
  shorts: '/products/levis-mens-classic-fit-utility-cargo-shorts-off-white-0.jpg',
  'pocket-squares': '/products/mens-polka-dot-neck-tie-with-matching-pocket-square-navy-blue-0.jpg',
}

async function main() {
  // 1. Update category images
  for (const [slug, img] of Object.entries(REPLACEMENTS)) {
    const cat = await prisma.category.findUnique({ where: { slug } })
    if (!cat) { console.log(`SKIP (not found): ${slug}`); continue }
    await prisma.category.update({ where: { slug }, data: { image: img } })
    console.log(`UPDATED ${slug} -> ${img}`)
  }

  // 2. Delete Women's Fragrance category (0 products)
  const wf = await prisma.category.findUnique({ where: { slug: 'womens-fragrance' }, include: { _count: { select: { products: true, children: true } } } })
  if (wf) {
    console.log(`WOMENS FRAGRANCE prods=${wf._count.products} children=${wf._count.children}`)
    if (wf._count.products === 0 && wf._count.children === 0) {
      await prisma.category.delete({ where: { slug: 'womens-fragrance' } })
      console.log('DELETED womens-fragrance category')
    } else {
      console.log('!! NOT DELETED — has products/children')
    }
  } else {
    console.log('womens-fragrance already gone')
  }

  // 3. Collect all distinct external image URLs in DB for 404 sweep
  const cats = await prisma.category.findMany({ select: { slug: true, image: true } })
  const urls = new Set<string>()
  for (const c of cats) if (c.image?.startsWith('http')) urls.add(c.image)
  const banners = await prisma.banner.findMany().catch(() => [])
  for (const b of banners as { image?: string }[]) if (b.image?.startsWith('http')) urls.add(b.image)
  console.log(`\n${urls.size} distinct external URLs to health-check:`)
  for (const u of urls) console.log('  ' + u)

  // 4. Any banners at all?
  console.log(`\nBanners in DB: ${(banners as unknown[]).length}`)
  const home = await prisma.homepageContent.findFirst()
  const hero = home?.heroImage
  console.log('Homepage heroImage:', hero)
}

main().catch(console.error).finally(() => prisma.$disconnect())
