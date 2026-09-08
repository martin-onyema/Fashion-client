import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { getAllCategories } from '@/lib/queries'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ProductForm } from '@/components/admin/product-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Product',
  robots: { index: false, follow: false },
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { id } = await params
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: { orderBy: { size: 'asc' } },
        category: { include: { parent: true } },
      },
    }),
    getAllCategories(),
  ])
  if (!product) notFound()

  return (
    <AdminLayout
      title="Edit Product"
      description={product.name}
      permissions={perms}
    >
      <ProductForm categories={categories} product={product} />
    </AdminLayout>
  )
}
