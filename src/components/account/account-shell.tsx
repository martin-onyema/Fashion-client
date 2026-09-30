'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  User,
  LogOut,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const NAV_LINKS = [
  { label: 'Overview', href: '/account', icon: LayoutDashboard },
  { label: 'Orders', href: '/account/orders', icon: Package },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Profile', href: '/account/profile', icon: User },
]

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === '/account') return pathname === '/account'
  return pathname === href || pathname.startsWith(href + '/')
}

function NavLinks({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Account navigation">
      {NAV_LINKS.map((link) => {
        const active = isActive(pathname, link.href)
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all',
              active
                ? 'bg-foreground text-background font-medium'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <Link href="/account" className="flex flex-col gap-0.5 px-6 py-6 border-b border-border">
      <span className="font-display text-xl leading-none">Wardrobecare</span>
      <span className="label-uppercase text-muted-foreground">My Account</span>
    </Link>
  )
}

function FooterActions({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut({ redirect: false })
      toast.success('Signed out')
      router.push('/account/login')
    } catch {
      toast.error('Could not sign out')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="mt-auto flex flex-col gap-1 border-t border-border px-3 py-4">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <span className="size-4 shrink-0 text-center text-[10px] uppercase tracking-wider">↗</span>
        <span>Continue Shopping</span>
      </Link>
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
      >
        <LogOut className="size-4 shrink-0" />
        <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>
      </button>
    </div>
  )
}

function SidebarInner({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Brand />
      <NavLinks pathname={pathname} onNavigate={onNavigate} />
      <FooterActions onNavigate={onNavigate} />
    </div>
  )
}

export function AccountShell({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex-1 flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar sticky top-28 self-start h-[calc(100vh-7rem)]">
        <SidebarInner pathname={pathname} />
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Account navigation</SheetTitle>
          <SidebarInner pathname={pathname} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 border-b border-border bg-background px-4 lg:px-10 py-5">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden inline-flex size-9 items-center justify-center rounded-md border border-border"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl md:text-3xl leading-tight truncate">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">{description}</p>
            )}
          </div>
          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </header>

        {/* Page body */}
        <main className="flex-1 p-4 lg:p-10 overflow-x-hidden">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

// Standalone Sign Out button (used on overview page)
export function SignOutButton() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut({ redirect: false })
      toast.success('Signed out')
      router.push('/account/login')
    } catch {
      toast.error('Could not sign out')
    } finally {
      setSigningOut(false)
    }
  }
  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignOut}
      disabled={signingOut}
      className="w-full sm:w-auto"
    >
      <LogOut className="size-4" />
      {signingOut ? 'Signing out…' : 'Sign Out'}
    </Button>
  )
}
