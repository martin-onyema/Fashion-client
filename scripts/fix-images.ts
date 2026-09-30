/**
 * Update product image URLs to fix broken Unsplash links.
 * Maps old broken URLs to new working URLs.
 */
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

const replacements: Record<string, string> = {
  'photo-1618333258400-f3f2c92ff95f': 'photo-1626497764746-6dc3652e2c1e', // poloNavy
  'photo-1582551887189-09a8d6a0a7f6': 'photo-1542272604-787c3835535d', // jeansBlack
  'photo-1449505278894-297fdb3a8405': 'photo-1542291026-7eec264c27ff', // shoesCasual
}

async function main() {
  console.log('🔧 Updating image URLs...')
  const images = await db.productImage.findMany()
  let updated = 0
  for (const img of images) {
    let newUrl = img.url
    for (const [oldId, newId] of Object.entries(replacements)) {
      if (img.url.includes(oldId)) {
        newUrl = img.url.replace(oldId, newId)
        break
      }
    }
    // Also update variant imageUrls and category images
    if (newUrl !== img.url) {
      await db.productImage.update({ where: { id: img.id }, data: { url: newUrl } })
      updated++
    }
  }

  // Update category images
  const categories = await db.category.findMany()
  for (const cat of categories) {
    if (!cat.image) continue
    let newUrl = cat.image
    for (const [oldId, newId] of Object.entries(replacements)) {
      if (cat.image.includes(oldId)) {
        newUrl = cat.image.replace(oldId, newId)
        break
      }
    }
    if (newUrl !== cat.image) {
      await db.category.update({ where: { id: cat.id }, data: { image: newUrl } })
    }
  }

  // Update variant imageUrls
  const variants = await db.productVariant.findMany()
  for (const v of variants) {
    if (!v.imageUrl) continue
    let newUrl = v.imageUrl
    for (const [oldId, newId] of Object.entries(replacements)) {
      if (v.imageUrl.includes(oldId)) {
        newUrl = v.imageUrl.replace(oldId, newId)
        break
      }
    }
    if (newUrl !== v.imageUrl) {
      await db.productVariant.update({ where: { id: v.id }, data: { imageUrl: newUrl } })
    }
  }

  console.log(`✅ Updated ${updated} product images.`)
}

main().catch(console.error).finally(() => db.$disconnect())
