/**
 * Patch broken Unsplash image URLs in the existing database.
 * Replaces 404-ing image URLs with working alternatives.
 *
 * Run: npx tsx scripts/patch-broken-images.ts
 */
import { db } from '../src/lib/db'

const REPLACEMENTS: Record<string, string> = {
  // Old (404) → New (working, verified 200 OK)
  'https://images.unsplash.com/photo-1589361243786-84be5ae3bcb9?q=80&w=1200&auto=format&fit=crop':
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582966772680-860e372bb2cb?q=80&w=1200&auto=format&fit=crop':
    'https://images.unsplash.com/photo-1564859228273-274232fdb516?q=80&w=1200&auto=format&fit=crop',
  // Previous (incorrect) replacement that also 404s — sweep it up too
  'https://images.unsplash.com/photo-1582550748068-7d8a6b5e8b34?q=80&w=1200&auto=format&fit=crop':
    'https://images.unsplash.com/photo-1564859228273-274232fdb516?q=80&w=1200&auto=format&fit=crop',
}

async function main() {
  console.log('→ Patching broken image URLs...\n')

  // 1. ProductImage.url
  let imgCount = 0
  for (const [oldUrl, newUrl] of Object.entries(REPLACEMENTS)) {
    const result = await db.productImage.updateMany({
      where: { url: oldUrl },
      data: { url: newUrl },
    })
    if (result.count > 0) {
      console.log(`  ✓ ProductImage: replaced ${result.count} row(s) for ${oldUrl.slice(-40)}`)
      imgCount += result.count
    }
  }

  // 2. ProductVariant.imageUrl (in case any variant references these)
  let varCount = 0
  for (const [oldUrl, newUrl] of Object.entries(REPLACEMENTS)) {
    const result = await db.productVariant.updateMany({
      where: { imageUrl: oldUrl },
      data: { imageUrl: newUrl },
    })
    if (result.count > 0) {
      console.log(`  ✓ ProductVariant: replaced ${result.count} row(s)`)
      varCount += result.count
    }
  }

  // 3. Category.image
  let catCount = 0
  for (const [oldUrl, newUrl] of Object.entries(REPLACEMENTS)) {
    const result = await db.category.updateMany({
      where: { image: oldUrl },
      data: { image: newUrl },
    })
    if (result.count > 0) {
      console.log(`  ✓ Category: replaced ${result.count} row(s)`)
      catCount += result.count
    }
  }

  // 4. HomepageContent (heroImage, featuredImage, instagramImages JSON)
  const home = await db.homepageContent.findUnique({ where: { id: 'singleton' } })
  if (home) {
    let updated = false
    const patch: any = {}
    if (home.heroImage && REPLACEMENTS[home.heroImage]) {
      patch.heroImage = REPLACEMENTS[home.heroImage]
      updated = true
    }
    if (home.featuredImage && REPLACEMENTS[home.featuredImage]) {
      patch.featuredImage = REPLACEMENTS[home.featuredImage]
      updated = true
    }
    if (home.instagramImages) {
      let inst = home.instagramImages as any
      let instChanged = false
      if (Array.isArray(inst)) {
        inst = inst.map((u: string) => {
          if (typeof u === 'string' && REPLACEMENTS[u]) {
            instChanged = true
            return REPLACEMENTS[u]
          }
          return u
        })
        if (instChanged) {
          patch.instagramImages = inst
          updated = true
        }
      } else if (typeof inst === 'string') {
        // JSON string
        try {
          const arr = JSON.parse(inst)
          if (Array.isArray(arr)) {
            let changed = false
            const newArr = arr.map((u: string) => {
              if (typeof u === 'string' && REPLACEMENTS[u]) {
                changed = true
                return REPLACEMENTS[u]
              }
              return u
            })
            if (changed) {
              patch.instagramImages = newArr as any
              updated = true
            }
          }
        } catch {}
      }
    }
    if (updated) {
      await db.homepageContent.update({ where: { id: 'singleton' }, data: patch })
      console.log(`  ✓ HomepageContent: updated`)
    }
  }

  console.log(`\n✓ Done. Replaced ${imgCount + varCount + catCount} row(s) total.`)
  await db.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
