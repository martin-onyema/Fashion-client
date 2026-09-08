import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FaqActions } from '@/components/admin/faq-actions'
import { truncate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'FAQs',
  robots: { index: false, follow: false },
}

export default async function AdminFaqsPage() {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()

  const faqs = await db.fAQ.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
    take: 200,
  })

  const publishedCount = faqs.filter((f) => f.published).length
  const categories = Array.from(new Set(faqs.map((f) => f.category)))

  return (
    <AdminLayout
      title="FAQs"
      description={`${faqs.length} question${faqs.length === 1 ? '' : 's'} · ${publishedCount} published · ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
      permissions={perms}
      actions={
        <Button asChild size="sm">
          <Link href="/admin/faqs/new">
            <Plus className="size-4" />
            New FAQ
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Order</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <p className="text-sm text-muted-foreground mb-4">No FAQs yet.</p>
                      <Button asChild size="sm">
                        <Link href="/admin/faqs/new">
                          <Plus className="size-4" />
                          New FAQ
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  faqs.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="pl-6">
                        <span className="font-medium">{truncate(f.question, 80)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary">
                          {f.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {f.order}
                      </TableCell>
                      <TableCell>
                        {f.published ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-200">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-secondary text-muted-foreground">
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <FaqActions faq={{ id: f.id, question: f.question }} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
