'use client'

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useUIStore } from '@/lib/stores/ui-store'
import Link from 'next/link'
import Image from 'next/image'
import { X, ChevronRight } from 'lucide-react'
import { SERVICES, SERVICE_GROUPS } from '@/lib/services-data'

const MENU_LINKS = [
  { label: 'New Arrivals', href: '/shop?sort=newest', desc: 'The latest additions' },
  { label: 'Clothing', href: '/shop?category=clothing', desc: 'Shirts, polos, tees, blazers, suits' },
  { label: 'Footwear', href: '/shop?category=footwear', desc: 'Loafers, dress shoes, sneakers' },
  { label: 'Accessories', href: '/shop?category=accessories', desc: 'Sunglasses, belts, ties, wallets' },
  { label: 'Fragrance & Grooming', href: '/shop?category=fragrance-grooming', desc: 'Eau de parfum, grooming kits' },
  { label: 'Essentials', href: '/shop?category=essentials', desc: 'Loungewear and daily essentials' },
]

export function MobileMenu() {
  const open = useUIStore((s) => s.mobileMenuOpen)
  const setOpen = useUIStore((s) => s.setMobileMenuOpen)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-md p-0 flex flex-col bg-background border-r border-border"
      >
        <SheetTitle className="sr-only">Wardrobecare menu</SheetTitle>
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center"
            aria-label="Wardrobecare Clothing"
          >
            <Image
              src="/logo-black.png"
              alt="Wardrobecare Clothing"
              width={78}
              height={28}
              className="h-7 w-auto"
            />
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-muted rounded-sm transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-6 py-4">
          {/* Services — expandable accordion item */}
          <Accordion type="single" collapsible className="border-b border-border/60">
            <AccordionItem value="services" className="border-0">
              <AccordionTrigger className="font-display text-xl tracking-wide py-5 hover:no-underline">
                Services
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <Link
                  href="/services"
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm text-foreground hover:text-foreground/70 transition-colors border-b border-border/40"
                >
                  View All Services →
                </Link>
                <div className="mt-3 space-y-4">
                  {SERVICE_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        {group.label}
                      </p>
                      <ul className="space-y-2.5">
                        {group.services.map((s) => (
                          <li key={s.slug}>
                            <Link
                              href={`/services/${s.slug}`}
                              onClick={() => setOpen(false)}
                              className="flex items-baseline gap-2 py-1"
                            >
                              <span className="text-[10px] text-muted-foreground/70 font-mono">
                                {s.number}
                              </span>
                              <span className="text-sm text-foreground hover:text-foreground/70 transition-colors">
                                {s.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <Link
                    href="/services?book=consultation"
                    onClick={() => setOpen(false)}
                    className="mt-4 block py-3 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] text-center"
                  >
                    Book a Consultation
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Standard shop links */}
          {MENU_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between py-5 border-b border-border/60 group"
            >
              <div>
                <p className="font-display text-xl tracking-wide">{l.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" strokeWidth={1.5} />
            </Link>
          ))}
        </nav>
        <div className="px-6 py-5 border-t border-border space-y-3">
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            About Wardrobecare
          </Link>
          <Link
            href="/track-order"
            onClick={() => setOpen(false)}
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            My Account
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
