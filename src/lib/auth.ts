import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

/**
 * Google sign-in is wired but dormant until the site owner sets
 * GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET. NextAuth throws on a Google
 * provider with empty credentials, so the provider is only registered
 * when both env vars exist. Server pages read this flag and pass it to
 * the auth forms so the button can respond honestly when it's not set up.
 */
export const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
)

// Stable fallback secret — only used when NEXTAUTH_SECRET is not set in the
// environment (e.g. a misconfigured FC instance). This keeps session cookies
// readable across cold starts instead of throwing or generating a random
// per-process secret that immediately invalidates every signed-in user.
// In production you should always set NEXTAUTH_SECRET as a real env var.
const FALLBACK_SECRET = 'qpeD1LhpzwbQBwjsFoLy2tTKyJKDx0XWxlZujeLSIuM='

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/account/login',
  },
  providers: [
    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // A customer who registered with email + password and later
            // signs in with the same address via Google gets one account,
            // not a blocked session. Safe here: Google has verified the
            // email before we ever link it.
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })
        if (!user || !user.passwordHash) return null
        // Defensive: inactive accounts cannot sign in.
        if (user.active === false) return null
        // Customers must finish email OTP verification before a password
        // sign-in is allowed (staff accounts are exempt — they are
        // provisioned internally, not via public signup). Google users are
        // always verified by the adapter, so this never blocks them.
        if (user.role === 'CUSTOMER' && !user.emailVerified) return null
        const ok = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!ok) return null
        // Stamp lastLoginAt so the dashboard can show the most recent login.
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch(() => { /* non-fatal */ })
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || FALLBACK_SECRET,
}
