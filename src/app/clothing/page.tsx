import type { Metadata } from 'next'
import Link from 'next/link'
import { CategoryHubPage, hubMetadata } from '@/components/shop/category-hub'

export const metadata: Metadata = hubMetadata('clothing')

const QUICK_LINKS = [
  ['Shop All Clothing', '/shop?category=clothing'],
  ['Shop Bottoms', '/shop?category=bottoms'],
  ['Blazers', '/shop?category=blazers'],
  ['Shirts', '/shop?category=casual-shirts'],
  ['T-Shirts', '/shop?category=t-shirts'],
  ['Suits', '/shop?category=suits'],
] as const

export default function ClothingPage() {
  return (
    <>
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-5 flex flex-wrap items-center gap-2">
          {QUICK_LINKS.map(([label, href], index) => (
            <Link key={href} href={href} className={index === 0 ? 'inline-flex items-center bg-foreground text-background px-4 py-2 text-[10px] uppercase tracking-[0.16em]' : 'inline-flex items-center border border-foreground/15 px-4 py-2 text-[10px] uppercase tracking-[0.16em] hover:bg-foreground hover:text-background transition-colors'}>
              {label}
            </Link>
          ))}
        </div>
      </section>
      <CategoryHubPage route="clothing" />
    </>
  )
}
