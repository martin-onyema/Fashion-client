'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  FileText,
  Settings,
  Store,
  LogOut,
  Menu,
  Tag,
  Star,
  Truck,
  Percent,
  Megaphone,
  Layers,
  ShieldCheck,
  BellRing,
  ScrollText,
  Boxes,
  Ticket,
  FolderTree,
  Flag,
  FileBarChart,
  UserCog,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  ConciergeBell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

// Permission list passed in by server components via the `permissions`
// prop (string[] of permission codes the current user has). Empty array
// means "show all" (legacy mode for the original ADMIN-only flow).
type NavItem = {
  label: string
  href: string
  icon: any
  permission?: string
  badge?: string
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package, permission: 'product.update' },
      { label: 'Categories', href: '/admin/categories', icon: FolderTree, permission: 'category.manage' },
      { label: 'Brands', href: '/admin/brands', icon: Flag, permission: 'brand.manage' },
      { label: 'Inventory', href: '/admin/inventory', icon: Boxes, permission: 'inventory.view' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, permission: 'order.view' },
      { label: 'Coupons', href: '/admin/coupons', icon: Ticket, permission: 'coupon.manage' },
      { label: 'Shipping', href: '/admin/shipping', icon: Truck, permission: 'shipping.manage' },
    ],
  },
  {
    label: 'Customers',
    items: [
      { label: 'Customers', href: '/admin/customers', icon: Users, permission: 'customer.view' },
      { label: 'Reviews', href: '/admin/reviews', icon: Star, permission: 'review.moderate' },
    ],
  },
  {
    label: 'Services',
    items: [
      { label: 'Enquiries', href: '/admin/services/enquiries', icon: ConciergeBell, permission: 'service.enquiry.view' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Campaigns', href: '/admin/marketing', icon: Megaphone, permission: 'campaign.manage' },
      { label: 'Banners', href: '/admin/banners', icon: LayoutGrid, permission: 'banner.manage' },
      { label: 'FAQs', href: '/admin/faqs', icon: FileText, permission: 'faq.manage' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: 'analytics.view' },
      { label: 'Reports', href: '/admin/reports', icon: FileBarChart, permission: 'report.view' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Notifications', href: '/admin/notifications', icon: BellRing, permission: 'notification.view' },
      { label: 'Audit Log', href: '/admin/audit', icon: ScrollText, permission: 'audit.view' },
      { label: 'Staff', href: '/admin/staff', icon: UserCog, permission: 'staff.manage' },
      { label: 'CMS', href: '/admin/cms', icon: Layers, permission: 'cms.manage' },
      { label: 'Settings', href: '/admin/settings', icon: Settings, permission: 'settings.manage' },
    ],
  },
]

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(href + '/')
}

function hasPermission(perms: string[] | undefined, code: string | undefined): boolean {
  // Empty/undefined perms = legacy mode (full ADMIN, show everything)
  if (!perms || perms.length === 0) return true
  if (!code) return true
  return perms.includes(code)
}

function NavLinks({
  pathname,
  onNavigate,
  permissions,
}: {
  pathname: string | null
  onNavigate?: () => void
  permissions?: string[]
}) {
  return (
    <nav className="flex flex-col gap-5 px-3 py-4 overflow-y-auto" aria-label="Admin navigation">
      {NAV_GROUPS.map((group) => {
        const visibleItems = group.items.filter((item) =>
          hasPermission(permissions, item.permission),
        )
        if (visibleItems.length === 0) return null
        return (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="label-uppercase text-[10px] text-muted-foreground/60 px-3 mb-1">
              {group.label}
            </p>
            {visibleItems.map((link) => {
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
          </div>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <Link href="/admin" className="flex flex-col gap-0.5 px-6 py-6 border-b border-border">
      <Image src="/logo-black.png" alt="Wardrobecare Clothing" width={67} height={24} className="h-6 w-auto" />
      <span className="label-uppercase text-muted-foreground">Admin Console</span>
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
      router.push('/admin/login')
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
        target="_blank"
        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Store className="size-4 shrink-0" />
        <span>View Store</span>
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

function SidebarInner({
  pathname,
  onNavigate,
  permissions,
}: {
  pathname: string | null
  onNavigate?: () => void
  permissions?: string[]
}) {
  return (
    <div className="flex h-full flex-col">
      <Brand />
      <NavLinks pathname={pathname} onNavigate={onNavigate} permissions={permissions} />
      <FooterActions onNavigate={onNavigate} />
    </div>
  )
}

export function AdminLayout({
  title,
  description,
  actions,
  children,
  permissions,
  headerExtras,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  // New optional props for the upgraded functionality (preserved for legacy callers)
  permissions?: string[]
  headerExtras?: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <SidebarInner pathname={pathname} permissions={permissions} />
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarInner
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
            permissions={permissions}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4 lg:px-8 py-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden inline-flex size-9 items-center justify-center rounded-md border border-border"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl leading-tight truncate">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">{description}</p>
            )}
          </div>
          {headerExtras}
          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </header>

        {/* Page body */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
