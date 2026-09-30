import {
  ShoppingBag, Package, Users, Boxes, CreditCard, Undo2, Ticket, ScrollText,
} from 'lucide-react'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'
import { GenerateReportButton } from '@/components/admin/generate-report-button'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Reports',
  robots: { index: false, follow: false },
}

type ReportType = {
  title: string
  description: string
  icon: any
  color: string
}

const REPORTS: ReportType[] = [
  {
    title: 'Sales Report',
    description: 'Revenue, order volume, and average order value over time. Group by day, week, or month.',
    icon: ShoppingBag,
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    title: 'Product Report',
    description: 'Best and worst sellers, stock value, and inventory turnover by category.',
    icon: Package,
    color: 'bg-stone-100 text-stone-700',
  },
  {
    title: 'Customer Report',
    description: 'New vs returning customers, lifetime value, and acquisition channels.',
    icon: Users,
    color: 'bg-teal-50 text-teal-700',
  },
  {
    title: 'Inventory Report',
    description: 'Current stock levels, low-stock alerts, and adjustment history with reasons.',
    icon: Boxes,
    color: 'bg-amber-50 text-amber-700',
  },
  {
    title: 'Payment Report',
    description: 'Payment provider breakdown, success rates, and pending settlements.',
    icon: CreditCard,
    color: 'bg-violet-50 text-violet-700',
  },
  {
    title: 'Refund Report',
    description: 'Refund volume, reasons, and turnaround times by gateway.',
    icon: Undo2,
    color: 'bg-red-50 text-red-700',
  },
  {
    title: 'Coupon Report',
    description: 'Discount usage, revenue impact, and per-coupon ROI.',
    icon: Ticket,
    color: 'bg-rose-50 text-rose-700',
  },
  {
    title: 'Audit Report',
    description: 'Staff activity log — who did what, when, and to which entity.',
    icon: ScrollText,
    color: 'bg-sky-50 text-sky-700',
  },
]

export default async function AdminReportsPage() {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()

  return (
    <AdminLayout
      title="Reports"
      description="Export financial and operational data — CSV / Excel / PDF generation."
      permissions={perms}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORTS.map((r) => {
          const Icon = r.icon
          return (
            <Card key={r.title} className="overflow-hidden">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className={'size-10 rounded-md flex items-center justify-center ' + r.color}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg">{r.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    Export: CSV · Excel · PDF
                  </span>
                  <GenerateReportButton />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </AdminLayout>
  )
}
