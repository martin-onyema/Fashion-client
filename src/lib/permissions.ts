/**
 * Permissions library
 *
 * Defines the granular permission codes used by the admin dashboard and
 * provides a `requireStaff(permission)` gate that:
 *   1. Requires an authenticated session
 *   2. Re-fetches the user from DB to ensure role is current
 *   3. Checks the user's role grants the requested permission
 *   4. Returns the user object (or redirects to /admin/login or 403)
 *
 * All admin server actions should call `requireStaff()` (or `requireAdmin()`
 * for super-admin-only operations) as their FIRST line.
 */
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Role } from '@prisma/client'

// ============================================================
// PERMISSION CODES
// ============================================================

export const PERMISSIONS = [
  // Catalogue
  { code: 'product.create', name: 'Create products', roles: ['ADMIN', 'MANAGER', 'INVENTORY_MANAGER', 'CONTENT_MANAGER'] },
  { code: 'product.update', name: 'Edit products', roles: ['ADMIN', 'MANAGER', 'INVENTORY_MANAGER', 'CONTENT_MANAGER'] },
  { code: 'product.delete', name: 'Delete products', roles: ['ADMIN', 'MANAGER'] },
  { code: 'product.publish', name: 'Publish/unpublish products', roles: ['ADMIN', 'MANAGER', 'CONTENT_MANAGER'] },
  { code: 'category.manage', name: 'Manage categories', roles: ['ADMIN', 'MANAGER', 'CONTENT_MANAGER'] },
  { code: 'brand.manage', name: 'Manage brands', roles: ['ADMIN', 'MANAGER', 'CONTENT_MANAGER'] },
  { code: 'attribute.manage', name: 'Manage attributes', roles: ['ADMIN', 'MANAGER', 'CONTENT_MANAGER'] },

  // Inventory
  { code: 'inventory.view', name: 'View inventory', roles: ['ADMIN', 'MANAGER', 'INVENTORY_MANAGER', 'SALES'] },
  { code: 'inventory.adjust', name: 'Adjust stock', roles: ['ADMIN', 'MANAGER', 'INVENTORY_MANAGER'] },

  // Orders
  { code: 'order.view', name: 'View orders', roles: ['ADMIN', 'MANAGER', 'SALES', 'CUSTOMER_SUPPORT', 'INVENTORY_MANAGER'] },
  { code: 'order.update_status', name: 'Update order status', roles: ['ADMIN', 'MANAGER', 'SALES', 'CUSTOMER_SUPPORT'] },
  { code: 'order.cancel', name: 'Cancel orders', roles: ['ADMIN', 'MANAGER', 'CUSTOMER_SUPPORT'] },
  { code: 'order.refund', name: 'Refund orders', roles: ['ADMIN', 'MANAGER'] },
  { code: 'order.update_tracking', name: 'Update tracking', roles: ['ADMIN', 'MANAGER', 'SALES', 'CUSTOMER_SUPPORT'] },

  // Customers
  { code: 'customer.view', name: 'View customers', roles: ['ADMIN', 'MANAGER', 'SALES', 'CUSTOMER_SUPPORT'] },
  { code: 'customer.update', name: 'Edit customers', roles: ['ADMIN', 'MANAGER', 'CUSTOMER_SUPPORT'] },
  { code: 'customer.disable', name: 'Disable customers', roles: ['ADMIN', 'MANAGER'] },
  { code: 'customer.note', name: 'Add customer notes', roles: ['ADMIN', 'MANAGER', 'SALES', 'CUSTOMER_SUPPORT'] },

  // Services
  { code: 'service.enquiry.view', name: 'View service enquiries', roles: ['ADMIN', 'MANAGER', 'SALES', 'CUSTOMER_SUPPORT'] },
  { code: 'service.enquiry.manage', name: 'Manage service enquiries', roles: ['ADMIN', 'MANAGER', 'CUSTOMER_SUPPORT'] },

  // Marketing
  { code: 'coupon.manage', name: 'Manage coupons', roles: ['ADMIN', 'MANAGER'] },
  { code: 'campaign.manage', name: 'Manage campaigns', roles: ['ADMIN', 'MANAGER'] },
  { code: 'banner.manage', name: 'Manage banners', roles: ['ADMIN', 'MANAGER', 'CONTENT_MANAGER'] },
  { code: 'faq.manage', name: 'Manage FAQs', roles: ['ADMIN', 'MANAGER', 'CONTENT_MANAGER'] },
  { code: 'review.moderate', name: 'Moderate reviews', roles: ['ADMIN', 'MANAGER', 'CONTENT_MANAGER', 'CUSTOMER_SUPPORT'] },

  // Shipping
  { code: 'shipping.manage', name: 'Manage shipping', roles: ['ADMIN', 'MANAGER'] },

  // Insights
  { code: 'analytics.view', name: 'View analytics', roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { code: 'report.view', name: 'View reports', roles: ['ADMIN', 'MANAGER'] },
  { code: 'report.export', name: 'Export reports', roles: ['ADMIN', 'MANAGER'] },

  // CMS
  { code: 'cms.manage', name: 'Manage homepage content', roles: ['ADMIN', 'MANAGER', 'CONTENT_MANAGER'] },

  // System
  { code: 'settings.manage', name: 'Manage store settings', roles: ['ADMIN'] },
  { code: 'staff.manage', name: 'Manage staff users', roles: ['ADMIN'] },
  { code: 'audit.view', name: 'View audit log', roles: ['ADMIN', 'MANAGER'] },
  { code: 'notification.view', name: 'View notifications', roles: ['ADMIN', 'MANAGER', 'SALES', 'CUSTOMER_SUPPORT', 'INVENTORY_MANAGER', 'CONTENT_MANAGER'] },
] as const

export type PermissionCode = (typeof PERMISSIONS)[number]['code']

// Build a Set of {role, code} pairs for quick lookup
const ROLE_PERMISSIONS = new Set<string>()
for (const p of PERMISSIONS) {
  for (const r of p.roles) {
    ROLE_PERMISSIONS.add(`${r}:${p.code}`)
  }
}

/**
 * Returns true if the given role has the given permission code.
 */
export function roleHasPermission(role: Role, code: string): boolean {
  // ADMIN is superuser — has every permission
  if (role === 'ADMIN') return true
  return ROLE_PERMISSIONS.has(`${role}:${code}`)
}

// ============================================================
// AUTH GATES
// ============================================================

/**
 * Require any staff member (any role other than CUSTOMER).
 * Re-fetches user from DB to ensure role is current.
 * Redirects to /admin/login if unauthenticated.
 */
export async function requireStaff() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/admin/login')
  }
  const u = session.user as { id: string; email: string; role: string }
  const dbUser = await db.user.findUnique({ where: { id: u.id } })
  if (!dbUser || dbUser.role === 'CUSTOMER' || !dbUser.active) {
    redirect('/admin/login')
  }
  return dbUser
}

/**
 * Require a staff member with a specific permission.
 * Returns the user or redirects (403 → /admin?forbidden=1).
 *
 * Usage in server actions:
 *   const user = await requireStaffWithPermission('order.refund')
 */
export async function requireStaffWithPermission(code: string) {
  const user = await requireStaff()
  if (!roleHasPermission(user.role, code)) {
    redirect('/admin?forbidden=1')
  }
  return user
}

/**
 * Require a super admin (ADMIN role only).
 * Use for actions that affect store security (settings, staff, etc.)
 */
export async function requireSuperAdmin() {
  const user = await requireStaff()
  if (user.role !== 'ADMIN') {
    redirect('/admin?forbidden=1')
  }
  return user
}

/**
 * Soft-check a permission (no redirect) — useful for showing/hiding UI
 * conditionally on the server. Returns the user object even if the
 * permission is denied, plus a `can(permission)` helper.
 */
export async function getStaffContext() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const u = session.user as { id: string; email: string; role: string }
  const dbUser = await db.user.findUnique({ where: { id: u.id } })
  if (!dbUser || dbUser.role === 'CUSTOMER' || !dbUser.active) return null

  return {
    user: dbUser,
    can: (code: string) => roleHasPermission(dbUser.role, code),
    isSuperAdmin: dbUser.role === 'ADMIN',
  }
}

/**
 * Return the list of permission codes the current user has, suitable for
 * passing to the AdminLayout sidebar to filter nav links.
 *
 * Returns an empty array if unauthenticated (so legacy callers render no
 * nav — but they should redirect via requireAdmin first).
 */
export async function getMyPermissionCodes(): Promise<string[]> {
  const ctx = await getStaffContext()
  if (!ctx) return []
  if (ctx.isSuperAdmin) {
    // Super-admin has all permissions — return empty array (legacy mode)
    return []
  }
  return PERMISSIONS.filter((p) => ctx.can(p.code)).map((p) => p.code)
}
