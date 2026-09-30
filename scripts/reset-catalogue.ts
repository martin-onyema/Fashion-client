/**
 * Hard reset of catalogue + cart + orders so we can re-seed with real data.
 * Preserves: Users, CMS content, AdminSettings.
 * Wipes:   OrderItem, Order, Payment, OrderStatusHistory,
 *          CartItem, Cart, WishlistItem, Wishlist,
 *          Review, ProductImage, ProductVariant, Product, Category.
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('🗑️  Resetting catalogue, orders, cart, wishlist...')

  // 1. OrderItem → Order → Payment (no FK to product with cascade, so delete items first)
  await db.orderItem.deleteMany()
  await db.payment.deleteMany()
  await db.orderStatusHistory.deleteMany()
  await db.order.deleteMany()
  console.log('  ✓ orders wiped')

  // 2. Cart & Wishlist
  await db.cartItem.deleteMany()
  await db.cart.deleteMany()
  await db.wishlistItem.deleteMany()
  await db.wishlist.deleteMany()
  console.log('  ✓ cart + wishlist wiped')

  // 3. Reviews, Addresses (addresses may reference orders)
  await db.review.deleteMany()
  await db.address.deleteMany()
  console.log('  ✓ reviews + addresses wiped')

  // 4. Product images & variants → Products → Categories
  await db.productImage.deleteMany()
  await db.productVariant.deleteMany()
  await db.product.deleteMany()
  await db.category.deleteMany()
  console.log('  ✓ products + categories wiped')

  // 5. Coupons (optional — leave intact if present)
  // await db.coupon.deleteMany()

  const [u, p, c, o, img, v, cat] = await Promise.all([
    db.user.count(),
    db.product.count(),
    db.category.count(),
    db.order.count(),
    db.productImage.count(),
    db.productVariant.count(),
    db.cart.count(),
  ])
  console.log('\n=== AFTER RESET ===')
  console.log({ users: u, products: p, categories: cat, orders: o, images: img, variants: v, carts: c })
}

main()
  .catch((e) => {
    console.error('RESET FAILED:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
