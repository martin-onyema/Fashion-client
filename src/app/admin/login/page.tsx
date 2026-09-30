import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AdminLoginForm } from '@/components/admin/admin-login-form'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Admin Sign In',
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions)
  if (session?.user) {
    redirect('/admin')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="text-center mb-10">
          <p className="label-uppercase text-muted-foreground mb-3">Wardrobecare Clothing</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">Admin Console</h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">
            Sign in to manage products, orders, customers and store content.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
          <Suspense fallback={<div className="h-64 animate-pulse bg-secondary rounded-md" />}>
            <AdminLoginForm />
          </Suspense>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-8">
          © {new Date().getFullYear()} Wardrobecare Clothing · Admin access only
        </p>
      </div>
    </main>
  )
}
