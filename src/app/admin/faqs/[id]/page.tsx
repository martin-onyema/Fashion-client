import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { FaqForm } from '@/components/admin/forms/faq-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit FAQ',
  robots: { index: false, follow: false },
}

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const perms = await getMyPermissionCodes()
  const { id } = await params

  const faq = await db.fAQ.findUnique({
    where: { id },
    select: {
      id: true, question: true, answer: true,
      category: true, order: true, published: true,
    },
  })
  if (!faq) notFound()

  return (
    <AdminLayout
      title={`Edit · ${faq.question.slice(0, 40)}${faq.question.length > 40 ? '…' : ''}`}
      description="Modify this FAQ."
      permissions={perms}
    >
      <FaqForm faq={faq} />
    </AdminLayout>
  )
}
