'use client'

/**
 * ChatWidget — floating AI shopping assistant for Wardrobecare Clothing.
 *
 * Behaviour:
 * - Floating button (bottom-right) on every page (mounted in root layout).
 * - Click opens a chat panel with message history, streaming responses,
 *   and suggested prompts on first open.
 * - Conversation history persisted in localStorage so it survives navigation
 *   and page refreshes.
 * - Auto-scroll to bottom on new tokens.
 * - Markdown-lite renderer: URLs become clickable links (including /shop, /cart etc).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MessageCircle, X, Send, Sparkles, ArrowDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

type ChatRole = 'user' | 'assistant'
interface ChatMessage {
  role: ChatRole
  content: string
  ts: number
}

const STORAGE_KEY = 'wc_chat_history_v1'
const SESSION_KEY = 'wc_chat_session_v1'
const MAX_HISTORY = 30

const SUGGESTED_PROMPTS = [
  { label: 'What do you sell?', text: 'What kind of products do you sell?' },
  { label: 'Help me pick a shirt', text: "I'm looking for a smart shirt for work — what do you recommend?" },
  { label: 'Track my order', text: 'How do I track my order?' },
  { label: 'Sizing help', text: 'How do your sizes run? I usually wear M.' },
]

function newSessionId() {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/** Render markdown-lite: turn URLs (incl. paths like /shop) into clickable links. */
function renderContent(text: string) {
  // Split on URL or path-like patterns
  const urlRegex =
    /(\bhttps?:\/\/[^\s<>"']+|(?<![a-zA-Z0-9])\/(?:shop|cart|checkout|account(?:\/wishlist)?|contact-us|faqs|order-tracking|admin\/login|refund-returns-2)(?:\?[^\s<>"']+)?(?:#[^\s<>"']+)?)/g
  const parts = text.split(urlRegex)

  return parts.map((part, i) => {
    if (!part) return null
    if (urlRegex.test(part) && (part.startsWith('http') || part.startsWith('/'))) {
      const isInternal = part.startsWith('/')
      const href = isInternal ? part : part
      return (
        <a
          key={i}
          href={href}
          target={isInternal ? undefined : '_blank'}
          rel={isInternal ? undefined : 'noopener noreferrer'}
          className="underline decoration-foreground/40 underline-offset-2 hover:decoration-foreground transition-colors"
        >
          {part}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function ChatWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [atBottom, setAtBottom] = useState(true)

  // ---------- Persistence ----------
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const sess = localStorage.getItem(SESSION_KEY)
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

  // ---------- Auto-scroll on new content ----------
  useEffect(() => {
    if (scrollRef.current && atBottom) {
      const el = scrollRef.current
      el.scrollTop = el.scrollHeight
    }
  }, [messages, atBottom])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // ---------- Initial greeting ----------
  useEffect(() => {
    if (open && !hasGreeted) {
      setHasGreeted(true)
      setMessages([
        {
          role: 'assistant',
          content:
            "Hi, I'm Wally — your shopping assistant at Wardrobecare. 👔\n\nLooking for something specific, or want me to show you around?",
          ts: Date.now(),
        },
      ])
    }
  }, [open, hasGreeted])

  // ---------- Send message ----------
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || sending) return
      setInput('')
      setSending(true)

      const userMsg: ChatMessage = { role: 'user', content: trimmed, ts: Date.now() }
      const assistantMsg: ChatMessage = { role: 'assistant', content: '', ts: Date.now() }
      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setAtBottom(true)

      // Build payload from current history + new message (omit empty assistant placeholder)
      const history = messages
        .filter((m) => m.content.length > 0)
        .map((m) => ({ role: m.role, content: m.content }))
      const payload = {
        messages: [...history, { role: 'user', content: trimmed }],
        sessionId: sessionId || undefined,
      }

      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: ac.signal,
        })
        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`)
        }
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let acc = ''
        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          acc += decoder.decode(value, { stream: true })
          // Update last assistant message
          setMessages((prev) => {
            if (prev.length === 0) return prev
            const next = [...prev]
            const last = next[next.length - 1]
            if (last && last.role === 'assistant') {
              next[next.length - 1] = { ...last, content: acc }
            }
            return next
          })
        }
        if (!acc) {
          setMessages((prev) => {
            const next = [...prev]
            const last = next[next.length - 1]
            if (last && last.role === 'assistant') {
              next[next.length - 1] = {
                ...last,
                content:
                  "Sorry, I didn't catch that. Could you rephrase? Or visit /contact-us to chat with our team.",
              }
            }
            return next
          })
        }
      } catch (e: unknown) {
        if ((e as { name?: string })?.name === 'AbortError') return
        setMessages((prev) => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last && last.role === 'assistant') {
            next[next.length - 1] = {
              ...last,
              content:
                "I'm having trouble replying right now — please try again in a moment.",
            }
          }
          return next
        })
      } finally {
        setSending(false)
        abortRef.current = null
      }
    },
    [sending, messages, sessionId],
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

  const scrollToBottom = () => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }

  // Don't show on admin pages — admin is a working console, not a storefront
  const isAdmin = pathname?.startsWith('/admin')
  if (isAdmin) return null

  return (
    <>
      {/* Floating trigger button */}
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

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat with Wally"
          className={cn(
            'fixed z-50 bottom-24 right-3 left-3 sm:left-auto sm:right-5 lg:right-6',
            'sm:w-[400px] lg:w-[420px]',
            'max-h-[78vh] h-[78vh] sm:max-h-[600vh]',
            'flex flex-col',
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
              <p className="text-[11px] uppercase tracking-wider opacity-80">
                AI Shopping Assistant
              </p>
            </div>
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
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-6">
                Ask me anything about our products, sizing, or your order.
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  m.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words',
                    m.role === 'user'
                      ? 'bg-foreground text-background rounded-br-sm'
                      : 'bg-background border border-border rounded-bl-sm',
                  )}
                >
                  {m.content
                    ? renderContent(m.content)
                    : sending && i === messages.length - 1
                      ? (
                          <span className="inline-flex gap-1 py-0.5">
                            <span className="size-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="size-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '120ms' }} />
                            <span className="size-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '240ms' }} />
                          </span>
                        )
                      : null}
                </div>
              </div>
            ))}

            {/* Suggested prompts (only when first greeting shown and no user message yet) */}
            {messages.length === 1 &&
              messages[0].role === 'assistant' &&
              !sending && (
                <div className="pt-2 flex flex-col gap-2">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground px-1">
                    Try
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_PROMPTS.map((p) => (
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
                onClick={scrollToBottom}
                aria-label="Scroll to latest message"
                className="sticky bottom-0 ml-auto flex items-center justify-center size-8 rounded-full bg-foreground text-background shadow-lg hover:scale-105 transition-transform"
              >
                <ArrowDown className="size-4" />
              </button>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={onSubmit}
            className="flex items-center gap-2 px-3 py-3 border-t border-border bg-card"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Wally anything…"
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
      )}
    </>
  )
}
