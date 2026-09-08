'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, Heart, User, ShoppingBag, Menu, ChevronDown } from 'lucide-react'
import { useUIStore } from '@/lib/stores/ui-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { SERVICE_GROUPS } from '@/lib/services-data'

const NAV_LINKS = [
  { label: 'New Arrivals', href: '/shop?sort=newest' },
  { label: 'Clothing', href: '/shop?category=clothing' },
  { label: 'Footwear', href: '/shop?category=footwear' },
  { label: 'Accessories', href: '/shop?category=accessories' },
  { label: 'Fragrance & Grooming', href: '/shop?category=fragrance-grooming' },
]

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [servicesHoverTimer, setServicesHoverTimer] = useState<NodeJS.Timeout | null>(null)
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

  // Close services dropdown on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setServicesOpen(false)
  }, [pathname])

  // Hover handlers with small delay so the panel doesn't flicker.
  const onServicesEnter = () => {
    if (servicesHoverTimer) clearTimeout(servicesHoverTimer)
    setServicesOpen(true)
  }
  const onServicesLeave = () => {
    if (servicesHoverTimer) clearTimeout(servicesHoverTimer)
    const t = setTimeout(() => setServicesOpen(false), 150)
    setServicesHoverTimer(t)
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
            {/* Mobile — menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-foreground"
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

            {/* Desktop nav — Services first, retail after */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {/* Services — filled pill, primary destination */}
              <div
                className="relative"
                onMouseEnter={onServicesEnter}
                onMouseLeave={onServicesLeave}
              >
                <Link
                  href="/services"
                  aria-expanded={servicesOpen}
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
                      servicesOpen && 'rotate-180',
                    )}
                    strokeWidth={2}
                  />
                </Link>

                {/* Mega dropdown panel */}
                {servicesOpen && (
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
                                      onClick={() => setServicesOpen(false)}
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
                        <div className="mt-7 pt-4 border-t border-foreground/10 flex items-center justify-between">
                          <p className="text-xs text-foreground/60">
                            Not sure which service you need?
                          </p>
                          <Link
                            href="/services#book"
                            className="text-[11px] uppercase tracking-[0.18em] text-foreground link-underline"
                            onClick={() => setServicesOpen(false)}
                          >
                            Book a Consultation →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="px-3 xl:px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] text-foreground/70 hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {l.label}
                </Link>
              ))}
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
