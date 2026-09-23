import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { RegisterForm } from '@/components/account/register-form'
import { getServerSession } from 'next-auth'
import { authOptions, googleEnabled } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Create Account',
  robots: { index: false, follow: false },
}

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)
  if (session?.user) {
    // Role-aware redirect (mirrors the login page): staff go to /admin, customers to /account.
    const role = (session.user as any).role
    if (role && role !== 'CUSTOMER') {
      redirect('/admin')
    }
    redirect('/account')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-md px-6 py-16 md:py-24">
          {/* Editorial heading */}
          <div className="text-center mb-10">
            <p className="label-uppercase text-muted-foreground mb-3">Account</p>
            <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em]">
              Join Wardrobecare
            </h1>
            <p className="text-sm text-muted-foreground mt-4 max-w-xs mx-auto leading-relaxed">
              Create an account for faster checkout, order tracking and a personal wishlist.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
            <RegisterForm googleEnabled={googleEnabled} />
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-8">
            By creating an account you agree to our{' '}
            <a href="/terms" className="link-underline">Terms</a> &{' '}
            <a href="/privacy" className="link-underline">Privacy Policy</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
