'use client'

/**
 * ChatWidget — "Wally", the AI shopping assistant (fully functional upgrade).
 *
 * New in this version:
 * - Product cards: real matches from the live catalogue render inside the chat
 *   with photo, price, available sizes and a direct link to the product page.
 * - Order cards: paste a WC-… order number and the live status renders as a
 *   tracking card.
 * - Size memory: tell Wally your size once and it's remembered (locally) and
 *   sent with every message so recommendations match.
 * - Context awareness: the widget reports the current page and shows contextual
 *   suggested prompts (home vs shop vs product vs tracking vs checkout).
 * - Quick chips: one-tap access to size guide, delivery info, new arrivals and
 *   order tracking above the input.
 * - First-visit teaser bubble + upgraded markdown-lite (bold + real links).
 *
 * Wire protocol with /api/chat (NDJSON, one JSON per line):
 *   {"type":"meta","products":[…],"order":{…}|null}
 *   {"type":"token","v":"…"}
 *   {"type":"end"}
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Sparkles, ArrowDown, Ruler, Truck, PackageSearch, ShoppingBag, UserRound } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ChatRole = 'user' | 'assistant'
interface CardProduct {
  name: string
  slug: string
  price: number
  wasPrice: number | null
  currency: string
  img: string | null
  sizes: string[]
  inStock: boolean
}
interface OrderCard {
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  currency: string
  trackingNumber: string | null
  carrier: string | null
  itemCount: number
  placedAt: string
}
interface ChatMessage {
  role: ChatRole
  content: string
  ts: number
  products?: CardProduct[]
  order?: OrderCard | null
}

interface Profile {
  size?: string
}

const STORAGE_KEY = 'wc_chat_history_v2'
const SESSION_KEY = 'wc_chat_session_v1'
const PROFILE_KEY = 'wc_chat_profile_v1'
const TEASER_KEY = 'wc_chat_teaser_v2'
const MAX_HISTORY = 30

const QUICK_CHIPS = [
  { icon: Ruler, label: 'Size guide', text: 'Help me find my size — how do your sizes run?' },
  { icon: ShoppingBag, label: 'New in', text: 'Show me your newest arrivals' },
  { icon: Truck, label: 'Delivery', text: 'How much is delivery and how long does it take?' },
  { icon: PackageSearch, label: 'Track order', text: 'I want to track my order' },
]

const CONTEXT_PROMPTS: { match: (p: string) => boolean; prompts: { label: string; text: string }[] }[] = [
  {
    match: (p) => p.startsWith('/product/'),
    prompts: [
      { label: 'How does it fit?', text: 'How does the sizing run on this?' },
      { label: 'Do you have it in my size?', text: 'What sizes is this available in?' },
      { label: 'Complete my look', text: 'What can I pair with this to complete the outfit?' },
      { label: 'Delivery time', text: 'How long does delivery take?' },
    ],
  },
  {
    match: (p) => p.startsWith('/shop'),
    prompts: [
      { label: 'Office shirts', text: 'Show me formal shirts for the office' },
      { label: 'Under ₦30,000', text: 'What can I get under ₦30,000?' },
      { label: 'Gift ideas', text: 'I need a gift idea for a man' },
      { label: 'Weekend looks', text: 'Something casual for the weekend' },
    ],
  },
  {
    match: (p) => p.startsWith('/track-order'),
    prompts: [
      { label: 'Track my order', text: 'Please check my order status' },
      { label: 'Delivery times', text: 'How long does delivery take?' },
    ],
  },
  {
    match: (p) => p.startsWith('/checkout') || p.startsWith('/cart'),
    prompts: [
      { label: 'Payment options', text: 'What payment methods do you accept?' },
      { label: 'Delivery fee', text: 'How much is delivery?' },
      { label: 'Is checkout safe?', text: 'Is it safe to pay on this site?' },
    ],
  },
]

const DEFAULT_PROMPTS = [
  { label: 'Show me around', text: 'I\'m new here — show me around the store' },
  { label: 'Shirts for work', text: 'I\'m looking for a smart shirt for work under ₦30,000' },
  { label: 'Find my size', text: 'Help me find my size — I usually wear L' },
  { label: 'Gift for him', text: 'I need a birthday gift for a man, budget ₦50,000' },
]

function newSessionId() {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function detectSize(text: string): string | null {
  const letter = text.match(/\b(?:i\s+(?:wear|take|am)|my size is|size)\s*(?:a\s*|an\s*)?(xs|s|m|l|xl|xxl|xxxl|3xl)\b/i)
  if (letter) {
    const v = letter[1].toUpperCase()
    return v === 'XXXL' ? '3XL' : v
  }
  const numeric = text.match(/\bsize\s*(\d{2})\b/i)
  if (numeric) return numeric[1]
  return null
}

const fmtPrice = (n: number) => `₦${n.toLocaleString()}`

/** markdown-lite: **bold**, internal routes and https URLs become links */
function renderContent(text: string) {
  const pattern =
    /(\*\*[^*]+\*\*)|(https?:\/\/[^\s<>"']+)/g
  const internalPattern = /(^|[\s(])((?:\/(?:shop|product|cart|checkout|account|track-order|faq|returns|shipping|about|services|contact))(?:\/[^\s<>"']*)?(?:\?[^\s<>"']*)?)/g

  // pass 1: split by bold + external links
  const chunks: { type: 'text' | 'bold' | 'link'; v: string; external?: boolean }[] = []
  let last = 0
  for (const m of text.matchAll(pattern)) {
    const idx = m.index ?? 0
    if (idx > last) chunks.push({ type: 'text', v: text.slice(last, idx) })
    if (m[1]) chunks.push({ type: 'bold', v: m[1].slice(2, -2) })
    else if (m[2]) chunks.push({ type: 'link', v: m[2], external: true })
    last = idx + m[0].length
  }
  if (last < text.length) chunks.push({ type: 'text', v: text.slice(last) })

  return chunks.map((c, i) => {
    if (c.type === 'bold') return <strong key={i} className="font-semibold">{c.v}</strong>
    if (c.type === 'link') {
      return (
        <a key={i} href={c.v} target="_blank" rel="noopener noreferrer" className="underline decoration-foreground/40 underline-offset-2 hover:decoration-foreground transition-colors">
          {c.v.replace(/^https?:\/\/(www\.)?/, '')}
        </a>
      )
    }
    // pass 2: internal route links inside plain text
    const parts: React.ReactNode[] = []
    let l = 0
    for (const m of c.v.matchAll(internalPattern)) {
      const idx = m.index ?? 0
      const lead = m[1] ?? ''
      const leadStart = idx + lead.length
      if (leadStart > l) parts.push(<span key={`${i}-t${l}`}>{c.v.slice(l, leadStart)}</span>)
      parts.push(
        <a key={`${i}-l${idx}`} href={m[2]} className="underline decoration-foreground/40 underline-offset-2 hover:decoration-foreground transition-colors">
          {m[2]}
        </a>,
      )
      l = leadStart + m[2].length
    }
    if (l < c.v.length) parts.push(<span key={`${i}-t${l}`}>{c.v.slice(l)}</span>)
    return <span key={i}>{parts}</span>
  })
}

function ProductCards({ products }: { products: CardProduct[] }) {
  if (products.length === 0) return null
  return (
    <div className="mt-2 space-y-1.5">
      {products.map((p, i) => (
        <a
          key={p.slug}
          href={`/product/${p.slug}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-background p-2 hover:border-foreground/40 hover:bg-accent/50 transition-colors group"
        >
          <span className="text-[10px] tabular-nums text-muted-foreground w-3 shrink-0">{i + 1}</span>
          <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
            {p.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.img} alt={p.name} loading="lazy" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-muted-foreground"><ShoppingBag className="size-4" /></span>
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium leading-snug line-clamp-2 group-hover:underline">{p.name}</span>
            <span className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
              <span className="text-sm font-semibold tabular-nums">{fmtPrice(p.price)}</span>
              {p.wasPrice ? <span className="text-[11px] text-muted-foreground line-through tabular-nums">{fmtPrice(p.wasPrice)}</span> : null}
            </span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-muted-foreground">
              {p.sizes.length > 0 ? `Sizes ${p.sizes.join(' · ')}` : 'One size'}{p.inStock ? '' : ' · Out of stock'}
            </span>
          </span>
        </a>
      ))}
    </div>
  )
}

const STATUS_TONE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-900 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-900 border-blue-200',
  PAID: 'bg-blue-100 text-blue-900 border-blue-200',
  PROCESSING: 'bg-blue-100 text-blue-900 border-blue-200',
  PACKED: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  READY_FOR_DISPATCH: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  SHIPPED: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  DELIVERED: 'bg-emerald-600 text-white border-emerald-600',
  CANCELLED: 'bg-red-100 text-red-900 border-red-200',
  REFUNDED: 'bg-muted text-foreground border-border',
  PARTIALLY_REFUNDED: 'bg-muted text-foreground border-border',
}

function OrderStatusCard({ order }: { order: OrderCard }) {
  const tone = STATUS_TONE[order.status] ?? 'bg-muted text-foreground border-border'
  return (
    <a href="/track-order" className="mt-2 block rounded-xl border border-border bg-background p-3 hover:border-foreground/40 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold">{order.orderNumber}</p>
        <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide', tone)}>
          {order.status.replace(/_/g, ' ').toLowerCase()}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {order.itemCount} item{order.itemCount === 1 ? '' : 's'} · {fmtPrice(Number(order.total))} · payment {order.paymentStatus.toLowerCase()}
        {order.trackingNumber ? ` · ${order.carrier ?? 'Tracking'}: ${order.trackingNumber}` : ''}
      </p>
      <p className="mt-1 text-[11px] underline underline-offset-2 decoration-foreground/30">View tracking details →</p>
    </a>
  )
}

export function ChatWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile>({})
  const [teaser, setTeaser] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [atBottom, setAtBottom] = useState(true)

  // ---------- Persistence ----------
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const sess = localStorage.getItem(SESSION_KEY)
      const prof = localStorage.getItem(PROFILE_KEY)
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.slice(-MAX_HISTORY))
          setHasGreeted(true)
        }
      }
      if (sess) setSessionId(sess)
      else {
        const s = newSessionId()
        setSessionId(s)
        localStorage.setItem(SESSION_KEY, s)
      }
      if (prof) setProfile(JSON.parse(prof))
    } catch {
      // ignore — start fresh
    }
  }, [])

  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)))
      }
    } catch {
      // ignore
    }
  }, [messages])

  // ---------- First-visit teaser bubble ----------
  useEffect(() => {
    if (pathname?.startsWith('/admin')) return
    let dismissed = false
    try {
      dismissed = localStorage.getItem(TEASER_KEY) === '1'
    } catch {
      // ignore
    }
    if (dismissed) return
    const t = setTimeout(() => {
      setMessages((prev) => {
        if (prev.length === 0) setTeaser(true)
        return prev
      })
    }, 4000)
    return () => clearTimeout(t)
  }, [pathname])

  const dismissTeaser = () => {
    setTeaser(false)
    try {
      localStorage.setItem(TEASER_KEY, '1')
    } catch {
      // ignore
    }
  }

  // ---------- Auto-scroll ----------
  useEffect(() => {
    if (scrollRef.current && atBottom) {
      const el = scrollRef.current
      el.scrollTop = el.scrollHeight
    }
  }, [messages, atBottom])

  // ---------- Escape closes ----------
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // ---------- Greeting on first open ----------
  useEffect(() => {
    if (open && !hasGreeted) {
      setHasGreeted(true)
      dismissTeaser()
      setMessages([
        {
          role: 'assistant',
          content:
            "Hi, I'm **Wally** — your personal shopper at Wardrobecare. 👋\n\nI can show you around, hunt down the right piece for any occasion, sort your sizing, or track an order. What brings you in today?",
          ts: Date.now(),
        },
      ])
    }
  }, [open, hasGreeted])

  // ---------- Send ----------
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || sending) return
      setInput('')
      setSending(true)
      dismissTeaser()

      // remember size mentions client-side
      const detected = detectSize(trimmed)
      if (detected) {
        setProfile((prev) => {
          const next = { ...prev, size: detected }
          try {
            localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
          } catch {
            // ignore
          }
          return next
        })
      }

      const userMsg: ChatMessage = { role: 'user', content: trimmed, ts: Date.now() }
      const assistantMsg: ChatMessage = { role: 'assistant', content: '', ts: Date.now() }
      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setAtBottom(true)

      const history = messages
        .filter((m) => m.content.length > 0)
        .slice(-16)
        .map((m) => ({ role: m.role, content: m.content }))
      const payload = {
        messages: [...history, { role: 'user', content: trimmed }],
        sessionId: sessionId || undefined,
        page: pathname || '/',
        profile: (detected ? { ...profile, size: detected } : profile) as Profile,
      }

      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac

      const patchLast = (patch: (m: ChatMessage) => ChatMessage) =>
        setMessages((prev) => {
          if (prev.length === 0) return prev
          const next = [...prev]
          const last = next[next.length - 1]
          if (last && last.role === 'assistant') next[next.length - 1] = patch(last)
          return next
        })

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: ac.signal,
        })
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let acc = ''
        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            const s = line.trim()
            if (!s) continue
            try {
              const evt = JSON.parse(s)
              if (evt.type === 'token' && typeof evt.v === 'string') {
                acc += evt.v
                patchLast((m) => ({ ...m, content: acc }))
              } else if (evt.type === 'meta') {
                patchLast((m) => ({
                  ...m,
                  products: Array.isArray(evt.products) ? evt.products : [],
                  order: evt.order ?? null,
                }))
              }
            } catch {
              // skip malformed line
            }
          }
        }
        if (!acc) {
          patchLast((m) => ({
            ...m,
            content:
              (m.content = m.content ||
                "Sorry, I didn't catch that — could you rephrase? Or reach our team on WhatsApp at 08026133770."),
          }))
        }
      } catch (e: unknown) {
        if ((e as { name?: string })?.name === 'AbortError') return
        patchLast((m) => ({
          ...m,
          content:
            m.content ||
            "I'm having trouble replying right now — please try again in a moment.",
        }))
      } finally {
        setSending(false)
        abortRef.current = null
      }
    },
    [sending, messages, sessionId, pathname, profile],
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send(input)
  }

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setAtBottom(distanceFromBottom < 80)
  }

  const clearChat = () => {
    setMessages([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    setHasGreeted(false)
  }

  const clearProfile = () => {
    setProfile({})
    try {
      localStorage.removeItem(PROFILE_KEY)
    } catch {
      // ignore
    }
  }

  // Admin pages: no storefront widget
  if (pathname?.startsWith('/admin')) return null

  const contextSet = CONTEXT_PROMPTS.find((c) => c.match(pathname || '/'))
  const prompts = contextSet?.prompts ?? DEFAULT_PROMPTS
  const showPrompts = messages.length <= 1 && messages[0]?.role === 'assistant' && !sending

  return (
    <>
      {/* Teaser bubble */}
      {teaser && !open && (
        <div className="fixed z-50 bottom-24 right-5 lg:right-6 max-w-[240px] animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="relative rounded-2xl rounded-br-sm bg-foreground text-background px-4 py-3 text-xs leading-relaxed shadow-xl">
            <button
              onClick={dismissTeaser}
              aria-label="Dismiss"
              className="absolute -top-2 -left-2 size-5 rounded-full bg-background border border-border text-foreground shadow flex items-center justify-center hover:scale-110 transition-transform"
            >
              <X className="size-3" />
            </button>
            Need help finding your size or style? I&apos;m Wally — ask me anything.
          </div>
        </div>
      )}

      {/* Floating trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open chat with Wally'}
        aria-expanded={open}
        className={cn(
          'fixed z-50 bottom-5 right-5 lg:bottom-6 lg:right-6',
          'size-14 rounded-full shadow-xl',
          'bg-foreground text-background',
          'hover:scale-105 active:scale-95 transition-transform',
          'flex items-center justify-center',
          open && 'rotate-90',
        )}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat with Wally"
          className={cn(
            'fixed z-50 bottom-24 right-3 left-3 sm:left-auto sm:right-5 lg:right-6',
            'sm:w-[400px] lg:w-[420px]',
            'h-[min(620px,80vh)] flex flex-col',
            'bg-card border border-border rounded-2xl shadow-2xl overflow-hidden',
            'animate-in fade-in-0 slide-in-from-bottom-4 duration-200',
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-foreground text-background">
            <div className="relative flex size-9 items-center justify-center rounded-full bg-background/15">
              <Sparkles className="size-4" />
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-base leading-tight">Wally</p>
              <p className="text-[11px] uppercase tracking-wider opacity-80">AI Personal Shopper</p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                aria-label="Clear conversation"
                title="Clear conversation"
                className="rounded-md p-1.5 text-[10px] uppercase tracking-wider opacity-70 hover:opacity-100 hover:bg-background/15 transition-all"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-md p-1 hover:bg-background/15 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/20 relative"
          >
            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[88%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words',
                    m.role === 'user'
                      ? 'bg-foreground text-background rounded-br-sm'
                      : 'bg-background border border-border rounded-bl-sm',
                  )}
                >
                  {m.content ? (
                    renderContent(m.content)
                  ) : sending && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1 py-0.5">
                      <span className="size-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="size-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '120ms' }} />
                      <span className="size-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '240ms' }} />
                    </span>
                  ) : null}
                  {m.role === 'assistant' && <ProductCards products={m.products ?? []} />}
                  {m.role === 'assistant' && m.order && <OrderStatusCard order={m.order} />}
                </div>
              </div>
            ))}

            {/* Suggested prompts (contextual) */}
            {showPrompts && (
              <div className="pt-2 flex flex-col gap-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground px-1">Try</p>
                <div className="flex flex-wrap gap-2">
                  {prompts.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => send(p.text)}
                      className="text-xs rounded-full px-3 py-1.5 bg-background border border-border hover:border-foreground/40 hover:bg-accent transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!atBottom && (
              <button
                onClick={() => {
                  const el = scrollRef.current
                  if (el) el.scrollTop = el.scrollHeight
                }}
                aria-label="Scroll to latest message"
                className="sticky bottom-0 ml-auto flex items-center justify-center size-8 rounded-full bg-foreground text-background shadow-lg hover:scale-105 transition-transform"
              >
                <ArrowDown className="size-4" />
              </button>
            )}
          </div>

          {/* Quick chips + profile + input */}
          <div className="border-t border-border bg-card">
            <div className="flex items-center gap-1.5 px-3 pt-2 overflow-x-auto [scrollbar-width:none]">
              {profile.size && (
                <button
                  onClick={clearProfile}
                  title="Click to forget"
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] rounded-full px-2.5 py-1 bg-foreground text-background"
                >
                  <UserRound className="size-3" /> Size {profile.size} <X className="size-2.5" />
                </button>
              )}
              {QUICK_CHIPS.map((c) => (
                <button
                  key={c.label}
                  onClick={() => send(c.text)}
                  disabled={sending}
                  className="shrink-0 inline-flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1 bg-muted/60 border border-border hover:border-foreground/40 hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <c.icon className="size-3" />
                  {c.label}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 py-2.5">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={pathname?.startsWith('/track-order') ? 'Paste your WC-… order number…' : 'Ask Wally anything…'}
                disabled={sending}
                aria-label="Message Wally"
                className="flex-1 h-10 rounded-full bg-muted/40 border-transparent focus-visible:bg-background focus-visible:border-border"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || sending}
                className="size-10 rounded-full"
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
