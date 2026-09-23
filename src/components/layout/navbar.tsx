'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Search, Heart, User, ShoppingBag, Menu, ChevronDown } from 'lucide-react'
import { useUIStore } from '@/lib/stores/ui-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { SERVICE_GROUPS } from '@/lib/services-data'
import { NAV_ITEMS, type NavItem } from '@/lib/nav-data'

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)
  const setCartOpen = useUIStore((s) => s.setCartOpen)
  const setWishlistOpen = useUIStore((s) => s.setWishlistOpen)
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0))
  const wishlistCount = useWishlistStore((s) => s.lines.length)
  const { data: session } = useSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close any open dropdown on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenMenu(null)
  }, [pathname])

  // Hover handlers with small delay so the panel doesn't flicker.
  const onMenuEnter = (key: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setOpenMenu(key)
  }
  const onMenuLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setOpenMenu(null), 150)
  }

  // Hide navbar on admin pages
  if (pathname?.startsWith('/admin')) return null

  const onServicesPage = pathname === '/services' || pathname?.startsWith('/services/')

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-500 bg-background',
          scrolled
            ? 'border-b border-foreground/10 shadow-[0_1px_0_rgba(18,17,16,0.02)]'
            : 'border-b border-transparent',
        )}
      >
        {/* Top announcement bar — booking first, retail second */}
        <div className="border-b border-foreground/10">
          <div className="container-editorial">
            <div className="flex items-center justify-center h-9 text-[9px] md:text-[10px] uppercase tracking-[0.06em] md:tracking-[0.22em] text-foreground/70 whitespace-nowrap">
              <span className="truncate">
                <span className="sm:hidden">Book a consultation</span>
                <span className="hidden sm:inline">Book a wardrobe consultation this week</span>
                <span className="mx-2 md:mx-2.5 text-foreground/30" aria-hidden>
                  ·
                </span>
                Personal shopping via WhatsApp
                <span className="hidden xl:inline text-foreground/40">
                  <span className="mx-2.5 text-foreground/30" aria-hidden>
                    ·
                  </span>
                  Complimentary delivery over ₦50,000
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="container-editorial">
          <div
            className={cn(
              'flex items-center justify-between gap-6 transition-all duration-300',
              scrolled ? 'h-14' : 'h-16 md:h-[72px]',
            )}
          >
            {/* Mobile / tablet — menu trigger (desktop nav only fits from xl up) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="xl:hidden p-2 -ml-2 text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>

            {/* Logo — wordmark image, left */}
            <Link href="/" className="flex-shrink-0 flex items-center" aria-label="Wardrobecare Clothing">
              <Image
                src="/logo-black.png"
                alt="Wardrobecare Clothing"
                width={112}
                height={40}
                priority
                className="h-9 md:h-10 w-auto"
              />
            </Link>

            {/* Desktop nav — Services first, retail after (xl+: below that the
                row cannot fit every link plus the action icons, so those
                widths use the mobile menu instead) */}
            <nav className="hidden xl:flex items-center gap-1">
              {/* Services — filled pill, primary destination */}
              <div
                className="relative"
                onMouseEnter={() => onMenuEnter('services')}
                onMouseLeave={onMenuLeave}
              >
                <Link
                  href="/services"
                  aria-expanded={openMenu === 'services'}
                  className={cn(
                    'flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] px-4 py-2 rounded-full transition-all duration-300',
                    'bg-foreground text-background hover:bg-foreground/85',
                    onServicesPage && 'ring-1 ring-foreground/30',
                  )}
                >
                  Services
                  <ChevronDown
                    className={cn(
                      'h-3 w-3 transition-transform duration-200',
                      openMenu === 'services' && 'rotate-180',
                    )}
                    strokeWidth={2}
                  />
                </Link>

                {/* Mega dropdown panel */}
                {openMenu === 'services' && (
                  <div className="absolute top-full left-0 pt-3 z-50">
                    <div className="w-[640px] bg-background border border-foreground/12 shadow-[0_24px_60px_-24px_rgba(18,17,16,0.25)]">
                      <div className="p-7">
                        <div className="grid grid-cols-3 gap-7">
                          {SERVICE_GROUPS.map((group) => (
                            <div key={group.label}>
                              <p className="eyebrow text-foreground/50 mb-4 pb-2.5 border-b border-foreground/10">
                                {group.label}
                              </p>
                              <ul className="space-y-3.5">
                                {group.services.map((s) => (
                                  <li key={s.slug}>
                                    <Link
                                      href={`/services/${s.slug}`}
                                      className="group block"
                                      onClick={() => setOpenMenu(null)}
                                    >
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-[10px] text-foreground/40 tabular-nums">
                                          {s.number}
                                        </span>
                                        <span className="text-sm text-foreground group-hover:text-foreground/60 transition-colors">
                                          {s.name}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-foreground/50 mt-0.5 pl-6">
                                        {s.comingSoon ? 'Coming soon' : s.priceLabel}
                                      </p>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        {/* Digital Closet — featured subscription row */}
                        <Link
                          href="/digital-closet"
                          onClick={() => setOpenMenu(null)}
                          className="group mt-6 flex items-center justify-between gap-6 border border-foreground/12 bg-foreground/[0.03] px-4 py-3.5 transition-colors hover:bg-foreground/[0.06]"
                        >
                          <div>
                            <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-foreground/50">
                              Coming Soon
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              Digital Closet &amp; Capsule Wardrobe
                            </p>
                            <p className="mt-0.5 text-[11px] text-foreground/55">
                              Hold what you own — get capsule combinations from it.
                            </p>
                          </div>
                          <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.18em] text-foreground link-underline">
                            Preview →
                          </span>
                        </Link>
                        <div className="mt-7 pt-4 border-t border-foreground/10 flex items-center justify-between">
                          <p className="text-xs text-foreground/60">
                            Not sure which service you need?
                          </p>
                          <Link
                            href="/services#book"
                            className="text-[11px] uppercase tracking-[0.18em] text-foreground link-underline"
                            onClick={() => setOpenMenu(null)}
                          >
                            Book a Consultation →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shop links — items with `mega` groups get a dropdown panel */}
              {NAV_ITEMS.map((item) =>
                item.mega ? (
                  <MegaNavItem
                    key={item.label}
                    item={item}
                    open={openMenu === item.label}
                    onEnter={() => onMenuEnter(item.label)}
                    onLeave={onMenuLeave}
                    onNavigate={() => setOpenMenu(null)}
                  />
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-2.5 xl:px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-foreground/70 hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2 text-foreground/75 hover:text-foreground transition-colors"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
              <Link
                href={session ? '/account' : '/account/login'}
                aria-label="Account"
                className="hidden sm:block p-2 text-foreground/75 hover:text-foreground transition-colors"
              >
                <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </Link>
              <button
                onClick={() => setWishlistOpen(true)}
                aria-label="Wishlist"
                className="relative p-2 text-foreground/75 hover:text-foreground transition-colors"
              >
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-foreground text-background text-[9px] font-medium rounded-full h-3.5 w-3.5 flex items-center justify-center tabular-nums">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Cart"
                className="relative p-2 text-foreground/75 hover:text-foreground transition-colors"
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-foreground text-background text-[9px] font-medium rounded-full h-3.5 w-3.5 flex items-center justify-center tabular-nums">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Spacer to offset fixed header (announcement 36px + bar 64/72px) */}
      <div className="h-[100px] md:h-[108px]" aria-hidden />
    </>
  )
}

/**
 * Nav item with a Services-style mega dropdown.
 * Rendered automatically for any NAV_ITEMS entry that defines `mega` groups.
 */
function MegaNavItem({
  item,
  open,
  onEnter,
  onLeave,
  onNavigate,
}: {
  item: NavItem
  open: boolean
  onEnter: () => void
  onLeave: () => void
  onNavigate: () => void
}) {
  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Link
        href={item.href}
        aria-expanded={open}
        className={cn(
          'flex items-center gap-1 px-2.5 xl:px-3 py-2 text-[11px] uppercase tracking-[0.16em] whitespace-nowrap transition-colors',
          open ? 'text-foreground' : 'text-foreground/70 hover:text-foreground',
        )}
      >
        {item.label}
        <ChevronDown
          className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')}
          strokeWidth={2}
        />
      </Link>

      {open && (
        <div
          className={cn(
            'absolute top-full pt-3 z-50',
            item.panelAlign === 'right' ? 'right-0' : 'left-0',
          )}
        >
          <div
            className={cn(
              'bg-background border border-foreground/12 shadow-[0_24px_60px_-24px_rgba(18,17,16,0.25)]',
              item.mega!.length > 1 ? 'w-[560px]' : 'w-[300px]',
            )}
          >
            <div className="p-7">
              <div className={cn(item.mega!.length > 1 && 'grid grid-cols-2 gap-7')}>
                {item.mega!.map((group) => (
                  <div key={group.label}>
                    <p className="eyebrow text-foreground/50 mb-4 pb-2.5 border-b border-foreground/10">
                      {group.label}
                    </p>
                    <ul className="space-y-3.5">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            onClick={onNavigate}
                            className={cn(
                              'group block text-sm leading-snug transition-colors',
                              link.emphasized
                                ? 'text-foreground font-medium'
                                : 'text-foreground/75 hover:text-foreground',
                            )}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {item.megaFooter && (
                <div className="mt-7 pt-4 border-t border-foreground/10 flex items-center justify-between">
                  <p className="text-xs text-foreground/60">{item.megaFooter.text}</p>
                  <Link
                    href={item.megaFooter.href}
                    onClick={onNavigate}
                    className="text-[11px] uppercase tracking-[0.18em] text-foreground link-underline"
                  >
                    {item.megaFooter.cta} →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
