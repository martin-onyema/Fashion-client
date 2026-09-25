/**
 * Simple in-memory sliding-window rate limiter with automatic lockout.
 *
 * Zero-dependency and works everywhere (Node runtime in server actions and
 * the NextAuth `authorize` callback). On multi-instance serverless hosts the
 * map is per-instance, so it is best-effort — it still stops brute-force
 * bursts and is fully effective on single-instance deployments (Docker, FC,
 * small Vercel traffic). For strict multi-instance guarantees, swap the
 * storage for Upstash Redis later; the call sites stay identical.
 */

type Bucket = {
  hits: number[]
  blockedUntil?: number
}

const buckets = new Map<string, Bucket>()

const WINDOW_TTL = 15 * 60 * 1000 // keep hits max 15 min
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, bucket] of buckets) {
    const fresh = bucket.hits.filter((t) => now - t < WINDOW_TTL)
    const stillBlocked = bucket.blockedUntil && bucket.blockedUntil > now
    if (fresh.length === 0 && !stillBlocked) {
      buckets.delete(key)
    } else {
      bucket.hits = fresh
    }
  }
}

export type RateLimitResult = {
  /** true = request allowed */
  ok: boolean
  /** seconds until the caller may retry (0 when ok) */
  retryAfterSec: number
  /** how many attempts remain before lockout (when ok) */
  remaining: number
}

export function rateLimit(
  key: string,
  opts: {
    /** max attempts inside windowMs */
    limit?: number
    /** sliding window size (ms) */
    windowMs?: number
    /** lockout duration once limit exceeded (ms) */
    blockMs?: number
  } = {},
): RateLimitResult {
  const { limit = 8, windowMs = 10 * 60 * 1000, blockMs = 15 * 60 * 1000 } = opts
  const now = Date.now()
  cleanup(now)

  const bucket = buckets.get(key) ?? { hits: [] }

  // Locked out?
  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((bucket.blockedUntil - now) / 1000),
      remaining: 0,
    }
  }

  // Slide the window
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs)
  bucket.hits.push(now)

  if (bucket.hits.length > limit) {
    bucket.blockedUntil = now + blockMs
    buckets.set(key, bucket)
    return { ok: false, retryAfterSec: Math.ceil(blockMs / 1000), remaining: 0 }
  }

  buckets.set(key, bucket)
  return { ok: true, retryAfterSec: 0, remaining: Math.max(0, limit - bucket.hits.length) }
}

/** Best-effort client IP from proxy headers (server actions / route handlers). */
export function clientIpFromHeaders(h: Headers): string {
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'
  )
}
