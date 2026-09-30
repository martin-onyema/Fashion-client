import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { CategoryForm } from '@/components/admin/forms/category-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Category',
  robots: { index: false, follow: false },
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { id } = await params

  const [category, parents] = await Promise.all([
    db.category.findUnique({
      where: { id },
      select: {
        id: true, name: true, slug: true, description: true, parentId: true,
        image: true, order: true, featured: true, active: true,
        seoTitle: true, seoDescription: true, seoKeywords: true,
      },
    }),
    db.category.findMany({
      where: { parentId: null, NOT: { id } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ])
  if (!category) notFound()

  return (
    <AdminLayout
      title={`Edit · ${category.name}`}
      description="Modify category details, hierarchy, and SEO."
      permissions={perms}
    >
      <CategoryForm category={category} parents={parents} />
    </AdminLayout>
  )
}
