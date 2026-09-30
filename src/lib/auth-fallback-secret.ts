// Shared NextAuth fallback secret.
// Kept in its own module (no Prisma / DB imports) so that the Edge-runtime
// middleware can import it WITHOUT pulling the full auth stack into the
// Edge bundle.
//
// Used only when NEXTAUTH_SECRET is not set in the environment. In
// production you should always set NEXTAUTH_SECRET as a real env var.
export const FALLBACK_SECRET = 'qpeD1LhpzwbQBwjsFoLy2tTKyJKDx0XWxlZujeLSIuM='

/** The effective secret used to sign/verify NextAuth session tokens. */
export const authSecret = process.env.NEXTAUTH_SECRET || FALLBACK_SECRET
