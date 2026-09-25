'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Instagram, ArrowRight } from 'lucide-react'
import { subscribeToNewsletter } from '@/actions/store'
import { usePathname } from 'next/navigation'
import { SERVICES } from '@/lib/services-data'

const FOOTER_LINKS = [
  {
    title: 'Shop',
    links: [
      { label: 'New Arrivals', href: '/shop?sort=newest' },
      { label: 'Clothing', href: '/shop?category=clothing' },
      { label: 'Bottoms', href: '/shop?category=bottoms' },
      { label: 'Footwear', href: '/shop?category=footwear' },
      { label: 'Accessories', href: '/shop?category=accessories' },
      { label: 'Fragrance & Grooming', href: '/shop?category=fragrance-grooming' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'About Wardrobecare', href: '/about' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'Order Tracking', href: '/track-order' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', href: '/account/login' },
      { label: 'Register', href: '/account/register' },
      { label: 'My Orders', href: '/account/orders' },
      { label: 'Wishlist', href: '/account/wishlist' },
      { label: 'Addresses', href: '/account/addresses' },
    ],
  },
]

export function Footer() {
  const pathname = usePathname()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')

  // Hide footer on admin
  if (pathname?.startsWith('/admin')) return null

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    const fd = new FormData()
    fd.set('email', email)
    const res = await subscribeToNewsletter(fd)
    setStatus(res.ok ? 'ok' : 'error')
    if (res.ok) setEmail('')
  }

  return (
    <footer className="mt-auto bg-[#121110] text-[#f7f6f3]">
      <div className="container-editorial py-16 lg:py-20">
        {/* Top — brand + newsletter */}
        <div className="grid lg:grid-cols-12 gap-12 pb-14 border-b border-white/12">
          <div className="lg:col-span-6">
            <Link
              href="/"
              className="font-display text-2xl md:text-[1.7rem] leading-none tracking-[0.01em]"
              style={{ fontWeight: 500 }}
            >
              Wardrobecare
            </Link>
            <p className="mt-5 text-sm text-white/60 leading-relaxed max-w-sm">
              Your personal shopper and stylist for distinguished men&apos;s fashion. Services
              first — curated pieces to match.
            </p>
            <a
              href="https://www.instagram.com/wardrobecareng/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.18em] text-white/75 hover:text-white transition-colors group"
            >
              <Instagram className="h-4 w-4" strokeWidth={1.5} />
              <span className="link-underline">@wardrobecareng</span>
            </a>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-end">
            <p className="eyebrow text-white/45 mb-4">The Wardrobecare List</p>
            <form onSubmit={onSubscribe} className="w-full">
              <div className="flex items-center border-b border-white/25 focus-within:border-white/70 transition-colors">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-white/35"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="group flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] py-3.5 pl-4 disabled:opacity-50 hover:text-white/70 transition-colors"
                >
                  Subscribe
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              {status === 'ok' && (
                <p className="mt-3 text-xs text-white/60">Welcome to the list.</p>
              )}
              {status === 'error' && (
                <p className="mt-3 text-xs text-white/60">Could not subscribe. Try again.</p>
              )}
            </form>
          </div>
        </div>

        {/* Link columns — Services first, per reference hierarchy */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-12 py-14">
          <div>
            <h3 className="eyebrow text-white/45 mb-5">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services"
                  className="text-sm text-white/80 hover:text-white link-underline"
                >
                  All Services
                </Link>
              </li>
              {SERVICES.slice(0, 5).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-sm text-white/80 hover:text-white link-underline"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow text-white/45 mb-5">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/80 hover:text-white link-underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} Wardrobecare Clothing. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/45">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/admin/login" className="hover:text-white transition-colors">Staff Portal</Link>
            <span>Lagos, Nigeria</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
