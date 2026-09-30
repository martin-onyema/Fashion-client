import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { BrandForm } from '@/components/admin/forms/brand-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Brand',
  robots: { index: false, follow: false },
}

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { id } = await params

  const brand = await db.brand.findUnique({
    where: { id },
    select: {
      id: true, name: true, slug: true, description: true,
      logoUrl: true, country: true, active: true,
    },
  })
  if (!brand) notFound()

  return (
    <AdminLayout
      title={`Edit · ${brand.name}`}
      description="Modify brand details."
      permissions={perms}
    >
      <BrandForm brand={brand} />
    </AdminLayout>
  )
}
