import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { CategoryForm } from '@/components/admin/forms/category-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'New Category',
  robots: { index: false, follow: false },
}

export default async function NewCategoryPage() {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  const parents = await db.category.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })
  return (
    <AdminLayout
      title="New Category"
      description="Add a new category to the catalogue."
      permissions={perms}
    >
      <CategoryForm category={null} parents={parents} />
    </AdminLayout>
  )
}
