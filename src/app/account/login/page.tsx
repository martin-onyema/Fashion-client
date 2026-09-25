import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { LoginForm } from '@/components/account/login-form'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session?.user) {
    // Role-aware redirect: staff users who land on the customer login page
    // (e.g. by following an old bookmark) should be sent to the admin console,
    // not the customer account page.
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
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground mt-4 max-w-xs mx-auto leading-relaxed">
              Sign in to access your orders, wishlist and saved addresses.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
            <Suspense
              fallback={<div className="h-64 animate-pulse bg-secondary rounded-md" />}
            >
              <LoginForm />
            </Suspense>
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-8">
            By signing in you agree to our{' '}
            <a href="/terms" className="link-underline">Terms</a> &{' '}
            <a href="/privacy" className="link-underline">Privacy Policy</a>
          </p>

          <p className="text-center text-[11px] text-muted-foreground mt-4">
            Staff?{' '}
            <Link href="/admin/login" className="link-underline">
              Sign in to the Admin Console
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
