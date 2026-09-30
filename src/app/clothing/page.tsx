import type { Metadata } from 'next'
import { CategoryHubPage, hubMetadata } from '@/components/shop/category-hub'

export const metadata: Metadata = hubMetadata('clothing')

export default function ClothingPage() {
  return <CategoryHubPage route="clothing" />
}
