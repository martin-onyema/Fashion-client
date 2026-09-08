import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { getAllCategories } from '@/lib/queries'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ProductForm } from '@/components/admin/product-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'New Product',
  robots: { index: false, follow: false },
}

export default async function NewProductPage() {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  const categories = await getAllCategories()

  return (
    <AdminLayout
      title="New Product"
      description="Add a new product to the catalogue"
      permissions={perms}
    >
      <ProductForm categories={categories} />
    </AdminLayout>
  )
}
