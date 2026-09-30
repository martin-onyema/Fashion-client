import Link from 'next/link'
import { ArrowRight, Gift } from 'lucide-react'

// ─── Gift Card strip (compact variant) ───────────────────────────────────────
// Artifact "gc-compact": a lighter strip for secondary placements — footer,
// order-confirmation upsell. One line, one link. tone="light" for light pages,
// tone="dark" for the dark footer.

export function GiftCardCompact({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const isDark = tone === 'dark'
  return (
    <aside
      aria-label="Wardrobecare gift card"
      className={
        isDark ? 'border-b border-white/12 bg-white/[0.03]' : 'border-y border-border bg-secondary/40'
      }
    >
      <div
        className={`${
          isDark ? 'container-editorial' : 'mx-auto max-w-[1600px] px-6 lg:px-10'
        } py-5 md:py-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6`}
      >
        <p
          className={`flex items-start sm:items-center gap-3 text-sm leading-relaxed flex-1 ${
            isDark ? 'text-white/60' : 'text-muted-foreground'
          }`}
        >
          <Gift
            className={`h-4 w-4 shrink-0 ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}
            strokeWidth={1.5}
            aria-hidden
          />
          <span>
            <span className={`${isDark ? 'text-white' : 'text-foreground'} font-medium`}>
              Not sure what to pick? Send a gift card.
            </span>{' '}
            From ₦100,000 — he chooses, we notify him.
          </span>
        </p>
        <Link
          href="/gift-card"
          className={`group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${
            isDark ? 'text-white/80 hover:text-white' : 'text-foreground'
          }`}
        >
          <span className="link-underline">Send a Gift Card</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </aside>
  )
}
