import type { Metadata } from 'next'
import { CategoryHubPage, hubMetadata } from '@/components/shop/category-hub'

export const metadata: Metadata = hubMetadata('accessories')

export default function AccessoriesPage() {
  return <CategoryHubPage route="accessories" />
}
