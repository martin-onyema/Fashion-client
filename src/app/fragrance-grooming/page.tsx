import type { Metadata } from 'next'
import { CategoryHubPage, hubMetadata } from '@/components/shop/category-hub'

export const metadata: Metadata = hubMetadata('fragrance-grooming')

export default function FragranceGroomingPage() {
  return <CategoryHubPage route="fragrance-grooming" />
}
