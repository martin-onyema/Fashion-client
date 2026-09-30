import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { cache } from 'react'

/**
 * Get the current authenticated session (server-side).
 */
export async function getSession() {
  return getServerSession(authOptions)
}

/**
 * Require an authenticated customer. Returns the user or redirects to /account/login.
 */
export async function requireUser() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/account/login?callbackUrl=' + encodeURIComponent('/account'))
  }
  return session.user as { id: string; email: string; name?: string | null; role: 'CUSTOMER' | 'ADMIN' | 'MANAGER' | 'SALES' | 'INVENTORY_MANAGER' | 'CUSTOMER_SUPPORT' | 'CONTENT_MANAGER' }
}

/**
 * Require any staff member (any role other than CUSTOMER).
 * Re-fetches user from DB to ensure role is current and account is active.
 * Redirects to /admin/login if unauthenticated or not staff.
 *
 * Existing admin pages call this — it remains the simplest staff gate.
 * For granular permission checks, prefer `requireStaffWithPermission()`
 * from `@/lib/permissions` instead.
 */
export const getCurrentStaffUser = cache(async () => {
  const session = await getSession()
  if (!session?.user) return null
  const u = session.user as { id?: string }
  if (!u.id) return null
  const dbUser = await db.user.findUnique({ where: { id: u.id } })
  if (!dbUser || dbUser.role === 'CUSTOMER' || !dbUser.active) return null
  return dbUser
})

export async function requireAdmin() {
  const dbUser = await getCurrentStaffUser()
  if (!dbUser) redirect('/admin/login')
  return dbUser
}
