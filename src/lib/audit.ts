/**
 * Audit log helper.
 *
 * Wraps every admin action so we have a complete trail of:
 *   - WHO did it (actorId)
 *   - WHAT changed (action, entityType, entityId, before/after snapshots)
 *   - WHEN (createdAt)
 *   - WHY (description, reason)
 *
 * Usage:
 *   await auditLog({
 *     actorId: user.id,
 *     action: 'product.update',
 *     entityType: 'Product',
 *     entityId: product.id,
 *     before: existingSnapshot,
 *     after: updatedFields,
 *     description: `Updated product "${product.name}" (price ₦18,500 → ₦17,000)`,
 *   })
 *
 * Audit writes are best-effort — failures here should never break the
 * main operation. They're wrapped in try/catch internally.
 */
import { db } from '@/lib/db'
import { headers } from 'next/headers'

export type AuditLogInput = {
  actorId: string
  action: string  // e.g. 'product.create', 'order.refund', 'settings.update'
  entityType: string  // 'Product', 'Order', 'User', 'Coupon', 'Campaign'
  entityId?: string | null
  before?: any
  after?: any
  description: string
}

export async function auditLog(input: AuditLogInput) {
  try {
    const h = await headers()
    const ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      h.get('x-real-ip') ||
      null
    const userAgent = h.get('user-agent') || null

    await db.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        before: input.before ? safeStringify(input.before) : null,
        after: input.after ? safeStringify(input.after) : null,
        description: input.description,
        ip,
        userAgent,
      },
    })
  } catch (err) {
    // Audit log failure must never break the main operation
    console.error('[auditLog] failed to write audit entry:', err)
  }
}

/**
 * Stringify with circular-reference safety + size cap.
 */
function safeStringify(obj: any): string {
  try {
    const seen = new WeakSet()
    return JSON.stringify(
      obj,
      (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return '[Circular]'
          seen.add(value)
        }
        // Strip Prisma internal fields
        if (typeof value === 'function') return undefined
        return value
      },
      0,
    ).slice(0, 8000) // cap at 8KB
  } catch {
    return '[Unserializable]'
  }
}

/**
 * Helper to compute a diff of changed fields between two objects.
 * Returns an object with only the keys whose values changed.
 */
export function diffChangedFields(
  before: Record<string, any>,
  after: Record<string, any>,
): Record<string, { from: any; to: any }> {
  const out: Record<string, { from: any; to: any }> = {}
  const keys = new Set([...Object.keys(before), ...Object.keys(after)])
  for (const k of keys) {
    const a = before[k]
    const b = after[k]
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      out[k] = { from: a, to: b }
    }
  }
  return out
}

/**
 * Build a human-readable description of changed fields.
 */
export function describeChanges(
  changes: Record<string, { from: any; to: any }>,
  fieldLabels?: Record<string, string>,
): string {
  const parts: string[] = []
  for (const [field, { from, to }] of Object.entries(changes)) {
    const label = fieldLabels?.[field] ?? field
    parts.push(`${label}: ${formatVal(from)} → ${formatVal(to)}`)
  }
  return parts.length ? parts.join(', ') : 'no changes'
}

function formatVal(v: any): string {
  if (v == null) return '∅'
  if (typeof v === 'boolean') return v ? 'yes' : 'no'
  if (typeof v === 'number') return String(v)
  if (Array.isArray(v)) return `[${v.length} items]`
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 80)
  return String(v).slice(0, 80)
}
