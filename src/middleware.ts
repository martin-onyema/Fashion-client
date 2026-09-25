import { NextRequest, NextResponse } from 'next/server'
import { decode } from 'next-auth/jwt'
import { authSecret } from '@/lib/auth-fallback-secret'

/**
 * SECURITY MIDDLEWARE — stealth admin + access gating.
 *
 * 1. SECRET ADMIN PATH
 *    The admin console lives at /admin, but that path is never exposed:
 *    unauthenticated requests to ANY /admin/* route get a plain 404, exactly
 *    like a page that does not exist. Attackers and scanners cannot discover
 *    the admin panel or its login form.
 *
 *    The owner reaches it through a secret path instead:
 *        https://<site>/<ADMIN_ACCESS_PATH>            -> admin login page
 *        https://<site>/<ADMIN_ACCESS_PATH>/<anything> -> /admin/<anything>
 *    The browser URL keeps showing the secret path — /admin is never shown
 *    or linked until the user is actually signed in as staff.
 *
 *    Set ADMIN_ACCESS_PATH in the deployment environment to customise it.
 *    It must start with "/" and must NOT start with "/admin".
 *
 * 2. STEALTH RULE
 *    /admin/* is only served when the session JWT belongs to staff
 *    (any role except CUSTOMER). Everyone else — including signed-in
 *    customers, bots and anonymous visitors — receives 404 Not Found.
 *
 * 3. DEFENCE IN DEPTH
 *    Every admin page additionally calls requireAdmin() server-side
 *    (DB-backed role + active check), so the middleware is a first line,
 *    not the only line.
 */

const ADMIN_PREFIX = '/admin'

function normalizeSecretPath(raw: string | undefined): string {
  const fallback = '/wardrobe-hq-9xk2'
  if (!raw) return fallback
  let p = raw.trim()
  if (!p) return fallback
  if (!p.startsWith('/')) p = '/' + p
  p = p.replace(/\/+$/, '')
  if (p === ADMIN_PREFIX || p.startsWith(ADMIN_PREFIX + '/')) return fallback
  return p
}

const SECRET_PATH = normalizeSecretPath(process.env.ADMIN_ACCESS_PATH)

async function isStaff(req: NextRequest): Promise<boolean> {
  // Try both cookie names: __Secure- prefix is used on HTTPS deployments
  // (Vercel), the bare name on plain HTTP (local dev).
  const raw =
    req.cookies.get('__Secure-next-auth.session-token')?.value ??
    req.cookies.get('next-auth.session-token')?.value
  if (!raw) return false
  try {
    const token = await decode({ token: raw, secret: authSecret })
    if (!token) return false
    const role = (token as { role?: string }).role
    // Staff = any role except CUSTOMER (mirrors requireAdmin()).
    return !!role && role !== 'CUSTOMER'
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 1. Secret admin path: internal rewrite, browser URL unchanged ──
  if (pathname === SECRET_PATH || pathname.startsWith(SECRET_PATH + '/')) {
    const rest = pathname.slice(SECRET_PATH.length) // '' | '/orders' | '/login' ...
    const target = rest && rest !== '/' ? ADMIN_PREFIX + rest : ADMIN_PREFIX + '/login'
    const url = req.nextUrl.clone()
    url.pathname = target
    return NextResponse.rewrite(url)
  }

  // ── 2. Stealth gate on the real admin paths ──
  if (pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + '/')) {
    const staff = await isStaff(req)
    if (!staff) {
      // Indistinguishable from a non-existent page. No redirect, no hint.
      return new NextResponse(null, { status: 404 })
    }
  }

  return NextResponse.next()
}

export const config = {
  // Static assets and the public API surface are skipped; everything else
  // passes through so the secret path can live at any URL.
  matcher: [
    '/((?!api|_next/static|_next/image|images|uploads|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
