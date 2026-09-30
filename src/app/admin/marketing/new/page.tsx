import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { CampaignForm } from '@/components/admin/forms/campaign-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'New Campaign',
  robots: { index: false, follow: false },
}

export default async function NewCampaignPage() {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  const products = await db.product.findMany({
    where: { published: true, status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
    take: 500,
  })

  return (
    <AdminLayout
      title="New Campaign"
      description="Create a promotion, flash sale, or featured collection."
      permissions={perms}
    >
      <CampaignForm campaign={null} products={products} />
    </AdminLayout>
  )
}
