import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAdmin } from '@/lib/session'
import { getMyPermissionCodes } from '@/lib/permissions'
import { db } from '@/lib/db'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShippingZoneCard } from '@/components/admin/shipping-zone-card'
import { NIGERIAN_STATES } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Shipping',
  robots: { index: false, follow: false },
}

export default async function AdminShippingPage() {
  const admin = await requireAdmin()
  const perms = await getMyPermissionCodes()

  const zones = await db.shippingZone.findMany({
    include: {
      methods: { orderBy: { baseCost: 'asc' } },
      _count: { select: { orders: true } },
    },
    orderBy: { name: 'asc' },
  })

  // Serialise dates as ISO for client component
  const serializable = zones.map((z) => ({
    id: z.id,
    name: z.name,
    states: z.states,
    countries: z.countries,
    active: z.active,
    ordersCount: z._count.orders,
    methods: z.methods.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      carrier: m.carrier,
      baseCost: m.baseCost,
      perKgCost: m.perKgCost,
      perItemCost: m.perItemCost,
      freeThreshold: m.freeThreshold,
      estimatedDaysMin: m.estimatedDaysMin,
      estimatedDaysMax: m.estimatedDaysMax,
      active: m.active,
    })),
  }))

  return (
    <AdminLayout
      title="Shipping"
      description={`${zones.length} zone${zones.length === 1 ? '' : 's'} · ${serializable.reduce((s, z) => s + z.methods.length, 0)} method${zones.length === 1 ? '' : 's'}`}
      permissions={perms}
      actions={
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/shipping/new">
            <Plus className="size-4" />
            New Zone
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            Ship-to zones are matched to a customer's delivery state. Methods inside each zone
            appear as options at checkout. Use <span className="font-mono">{"[\"*\"]"}</span> as
            the states list to cover the whole country.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Available Nigerian states: {NIGERIAN_STATES.length}.
          </p>
        </Card>

        {serializable.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-sm text-muted-foreground mb-4">No shipping zones yet.</p>
              <Button asChild size="sm">
                <Link href="/admin/shipping/new">
                  <Plus className="size-4" />
                  New Zone
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {serializable.map((z) => (
              <ShippingZoneCard key={z.id} zone={z} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
