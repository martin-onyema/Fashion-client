/**
 * Type definitions for admin search results.
 *
 * The actual `adminSearch` server action lives in `src/actions/admin.ts`.
 * Keep this file type-only so it can be safely imported by both server
 * and client code without bundling Prisma into the browser.
 */
export type SearchResult = {
  type: 'product' | 'order' | 'customer' | 'category' | 'coupon' | 'review' | 'brand'
  id: string
  title: string
  subtitle?: string
  href: string
}
