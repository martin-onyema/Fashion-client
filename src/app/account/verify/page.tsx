import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { VerifyForm } from '@/components/account/verify-form'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Verify Your Email',
  robots: { index: false, follow: false },
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (session?.user) {
    // Already signed in — nothing to verify here.
    redirect('/account')
  }

  const { email } = await searchParams
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    // Deep-linked without an address — send them back to signup.
    redirect('/account/register')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-md px-6 py-16 md:py-24">
          {/* Editorial heading — same cadence as the register page */}
          <div className="text-center mb-10">
            <p className="label-uppercase text-muted-foreground mb-3">Almost there</p>
            <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em]">
              Verify your email
            </h1>
            <p className="text-sm text-muted-foreground mt-4 max-w-xs mx-auto leading-relaxed">
              We sent a 6-digit code to{' '}
              <span className="text-foreground font-medium">{email}</span>. It
              stays valid for 10 minutes.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
            <VerifyForm email={email} />
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-8">
            Wrong address?{' '}
            <a href="/account/register" className="link-underline">
              Start again with a different email
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
