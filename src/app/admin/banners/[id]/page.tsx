import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { BannerForm } from '@/components/admin/forms/banner-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Banner',
  robots: { index: false, follow: false },
}

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { id } = await params

  const banner = await db.promotionalBanner.findUnique({
    where: { id },
    select: {
      id: true, title: true, subtitle: true, image: true,
      ctaText: true, ctaHref: true, active: true, order: true,
      startsAt: true, endsAt: true,
    },
  })
  if (!banner) notFound()

  return (
    <AdminLayout
      title={`Edit · ${banner.title}`}
      description="Modify banner details."
      permissions={perms}
    >
      <BannerForm banner={banner} />
    </AdminLayout>
  )
}
