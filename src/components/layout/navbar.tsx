'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Search, Heart, User, ShoppingBag, Menu, ChevronDown } from 'lucide-react'
import { useUIStore } from '@/lib/stores/ui-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { SERVICE_GROUPS } from '@/lib/services-data'

type NavChild = { label: string; href: string }
type NavLink = { label: string; href: string; children?: NavChild[] }

// The top-level retail links now point to their dedicated category pages.
// Dropdown children continue to point to the filtered shop grids.
const NAV_LINKS: NavLink[] = [
  { label: 'New Arrivals', href: '/shop?sort=newest' },
  {
    label: 'Clothing',
    href: '/clothing',
    children: [
      { label: 'Blazers', href: '/shop?category=blazers' },
      { label: 'Bottoms', href: '/bottoms' },
      { label: 'Casual Shirts', href: '/shop?category=casual-shirts' },
      { label: 'Formal / Office Shirts', href: '/shop?category=formal-shirts' },
      { label: 'Hoodies & Sweatshirts', href: '/shop?category=hoodies-sweatshirts' },
      { label: 'Innerwear', href: '/shop?category=innerwear' },
      { label: 'Jackets', href: '/shop?category=jackets' },
      { label: 'Polo Shirts', href: '/shop?category=polo-shirts' },
      { label: 'Suits', href: '/shop?category=suits' },
      { label: 'T-Shirts', href: '/shop?category=t-shirts' },
    ],
  },
  {
    label: 'Footwear',
    href: '/footwear',
    children: [
      { label: 'Casual Shoes', href: '/shop?category=casual-shoes' },
      { label: 'Dress Shoes', href: '/shop?category=dress-shoes' },
      { label: 'Exotic Shoes', href: '/shop?category=exotic-shoes' },
      { label: 'Loafers', href: '/shop?category=loafers' },
    ],
  },
  {
    label: 'Accessories',
    href: '/accessories',
    children: [
      { label: 'Belts', href: '/shop?category=belts' },
      { label: 'Caps & Hats', href: '/shop?category=caps-hats' },
      { label: 'Pocket Squares', href: '/shop?category=pocket-squares' },
      { label: 'Socks', href: '/shop?category=socks' },
      { label: 'Sunglasses', href: '/shop?category=sunglasses' },
      { label: 'Ties', href: '/shop?category=ties' },
      { label: 'Wallets & Purses', href: '/shop?category=wallets-purses' },
    ],
  },
  {
    label: 'Fragrance & Grooming',
    href: '/fragrance-grooming',
    children: [
      { label: "Men's Fragrance", href: '/shop?category=mens-fragrance' },
      { label: "Men's Grooming", href: '/shop?category=mens-grooming' },
      { label: "Women's Fragrance", href: '/shop?category=womens-fragrance' },
    ],
  },
]

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [openKey, setOpenKey] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  useEffect(() => {
    setOpenKey(null)
  }, [pathname])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (closeTimer.current) clearTimeout(closeTimer.current)
        setOpenKey(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openMenu = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
    setOpenKey(key)
  }

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenKey(null), 160)
  }

  const closeNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
    setOpenKey(null)
  }

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
        <div className="border-b border-foreground/10">
          <div className="container-editorial">
            <div className="flex items-center justify-center h-9 text-[9px] md:text-[10px] uppercase tracking-[0.06em] md:tracking-[0.22em] text-foreground/70 whitespace-nowrap">
              <span className="truncate">
                <span className="sm:hidden">Book a consultation</span>
                <span className="hidden sm:inline">Book a wardrobe consultation this week</span>
                <span className="mx-2 md:mx-2.5 text-foreground/30" aria-hidden>·</span>
                Personal shopping via WhatsApp
                <span className="hidden xl:inline text-foreground/40">
                  <span className="mx-2.5 text-foreground/30" aria-hidden>·</span>
                  Complimentary delivery over ₦50,000
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="container-editorial">
          <div className={cn(
            'flex items-center justify-between gap-6 transition-all duration-300',
            scrolled ? 'h-14' : 'h-16 md:h-[72px]',
          )}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <Link
              href="/"
              className="flex-shrink-0 font-display text-[1.35rem] md:text-2xl leading-none tracking-[0.01em]"
              style={{ fontWeight: 500 }}
            >
              Wardrobecare
            </Link>

            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              <div
                className="relative"
                onMouseEnter={() => openMenu('services')}
                onMouseLeave={scheduleClose}
                onFocus={() => openMenu('services')}
                onBlur={scheduleClose}
              >
                <Link
                  href="/services"
                  aria-expanded={openKey === 'services'}
                  aria-haspopup="true"
                  className={cn(
                    'flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] px-4 py-2 rounded-full transition-all duration-300',
                    'bg-foreground text-background hover:bg-foreground/85',
                    onServicesPage && 'ring-1 ring-foreground/30',
                  )}
                >
                  Services
                  <ChevronDown
                    className={cn('h-3 w-3 transition-transform duration-200', openKey === 'services' && 'rotate-180')}
                    strokeWidth={2}
                  />
                </Link>

                {openKey === 'services' && (
                  <div className="absolute top-full left-0 pt-3 z-50">
                    <div className="w-[640px] bg-background border border-foreground/12 shadow-[0_24px_60px_-24px_rgba(18,17,16,0.25)]">
                      <div className="p-7">
                        <div className="grid grid-cols-3 gap-7">
                          {SERVICE_GROUPS.map((group) => (
                            <div key={group.label}>
                              <p className="eyebrow text-foreground/50 mb-4 pb-2.5 border-b border-foreground/10">{group.label}</p>
                              <ul className="space-y-3.5">
                                {group.services.map((service) => (
                                  <li key={service.slug}>
                                    <Link href={`/services/${service.slug}`} className="group block" onClick={closeNow}>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-[10px] text-foreground/40 tabular-nums">{service.number}</span>
                                        <span className="text-sm text-foreground group-hover:text-foreground/60 transition-colors">{service.name}</span>
                                      </div>
                                      <p className="text-[11px] text-foreground/50 mt-0.5 pl-6">{service.priceLabel}</p>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div className="mt-7 pt-4 border-t border-foreground/10 flex items-center justify-between">
                          <p className="text-xs text-foreground/60">Not sure which service you need?</p>
                          <Link href="/services#book" className="text-[11px] uppercase tracking-[0.18em] text-foreground link-underline" onClick={closeNow}>
                            Book a Consultation →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {NAV_LINKS.map((link) => (
                link.children ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => openMenu(link.label)}
                    onMouseLeave={scheduleClose}
                    onFocus={() => openMenu(link.label)}
                    onBlur={scheduleClose}
                  >
                    <Link
                      href={link.href}
                      aria-expanded={openKey === link.label}
                      aria-haspopup="true"
                      className={cn(
                        'flex items-center gap-1.5 px-3 xl:px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] text-foreground/70 hover:text-foreground transition-colors whitespace-nowrap',
                        openKey === link.label && 'text-foreground',
                      )}
                    >
                      {link.label}
                      <ChevronDown
                        className={cn('h-3 w-3 transition-transform duration-200', openKey === link.label && 'rotate-180')}
                        strokeWidth={2}
                      />
                    </Link>

                    {openKey === link.label && (
                      <div className="absolute top-full left-0 pt-3 z-50">
                        <div className="w-[460px] bg-background border border-foreground/12 shadow-[0_24px_60px_-24px_rgba(18,17,16,0.25)]">
                          <div className="p-6">
                            <p className="eyebrow text-foreground/50 mb-4 pb-2.5 border-b border-foreground/10">{link.label}</p>
                            <ul className="grid grid-cols-2 gap-x-6">
                              {link.children.map((child) => (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    onClick={closeNow}
                                    className="group flex items-center justify-between py-2 text-sm text-foreground/75 hover:text-foreground transition-colors"
                                  >
                                    <span className="group-hover:translate-x-0.5 transition-transform duration-300">{child.label}</span>
                                    <span className="text-foreground/30 group-hover:text-foreground transition-colors" aria-hidden>→</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="px-6 py-3.5 border-t border-foreground/10 flex items-center justify-between">
                            <p className="text-xs text-foreground/60">Everything in {link.label.toLowerCase()}.</p>
                            <Link href={link.href} onClick={closeNow} className="text-[11px] uppercase tracking-[0.18em] text-foreground link-underline">
                              Shop All →
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="px-3 xl:px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] text-foreground/70 hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <button onClick={() => setSearchOpen(true)} aria-label="Search" className="p-2 text-foreground/75 hover:text-foreground transition-colors">
                <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
              <Link href={session ? '/account' : '/account/login'} aria-label="Account" className="hidden sm:block p-2 text-foreground/75 hover:text-foreground transition-colors">
                <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </Link>
              <button onClick={() => setWishlistOpen(true)} aria-label="Wishlist" className="relative p-2 text-foreground/75 hover:text-foreground transition-colors">
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-foreground text-background text-[9px] font-medium rounded-full h-3.5 w-3.5 flex items-center justify-center tabular-nums">{wishlistCount}</span>
                )}
              </button>
              <button onClick={() => setCartOpen(true)} aria-label="Cart" className="relative p-2 text-foreground/75 hover:text-foreground transition-colors">
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-foreground text-background text-[9px] font-medium rounded-full h-3.5 w-3.5 flex items-center justify-center tabular-nums">{cartCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="h-[100px] md:h-[108px]" aria-hidden />
    </>
  )
}
