import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { CampaignForm } from '@/components/admin/forms/campaign-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Campaign',
  robots: { index: false, follow: false },
}

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { id } = await params

  const [campaign, products] = await Promise.all([
    db.campaign.findUnique({
      where: { id },
      select: {
        id: true, name: true, description: true, type: true, active: true,
        startsAt: true, endsAt: true, discountType: true, discountValue: true,
        audienceTags: true, usageLimit: true,
        products: { select: { productId: true } },
      },
    }),
    db.product.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
      take: 500,
    }),
  ])
  if (!campaign) notFound()

  return (
    <AdminLayout
      title={`Edit · ${campaign.name}`}
      description="Modify campaign details."
      permissions={perms}
    >
      <CampaignForm
        campaign={{
          ...campaign,
          productIds: campaign.products.map((p) => p.productId),
        }}
        products={products}
      />
    </AdminLayout>
  )
}
