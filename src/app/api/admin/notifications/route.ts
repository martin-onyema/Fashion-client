import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Lightweight polling endpoint for the admin notification bell. */
export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!userId || !role || role === 'CUSTOMER') {
    return NextResponse.json({ notifications: [] }, { status: 401 })
  }

  const notifications = await db.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      link: true,
      read: true,
      createdAt: true,
    },
  })

  return NextResponse.json(
    { notifications: notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })) },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  )
}
