import type { Metadata } from 'next'
import { CategoryHubPage, hubMetadata } from '@/components/shop/category-hub'

export const metadata: Metadata = hubMetadata('footwear')

export default function FootwearPage() {
  return <CategoryHubPage route="footwear" />
}
