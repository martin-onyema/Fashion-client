import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getHub } from '@/lib/category-hubs'
import { getHubData } from '@/lib/queries'
import { CategoryHubContent } from './category-hub-content'

export function hubMetadata(route: string): Metadata {
  const hub = getHub(route)
  if (!hub) return {}

  return {
    title: hub.metaTitle,
    description: hub.metaDescription,
  }
}

export async function CategoryHubPage({ route }: { route: string }) {
  const hub = getHub(route)
  if (!hub) notFound()

  const data = await getHubData(hub.rootSlug, hub.groups)
  return <CategoryHubContent hub={hub} data={data} />
}

export function CategoryHub() {
  return null
}

export default CategoryHub
