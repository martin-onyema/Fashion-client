'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Minus,
  Ruler,
  UserRound,
  Users,
} from 'lucide-react'

type ManagedProfile = {
  id: string
  name: string
  relation: string
}

const LS_PROFILES = 'wc_managed_profiles'
const LS_ACTIVE = 'wc_active_profile'

// ─── Managed profiles (Mockup 32) ────────────────────────────────────────
// "Shopping-for-someone-else pattern: profile switcher, retrofit checklist."
// Honest implementation: profiles are stored on this device only — there is no
// pretence of a synced family-account backend.

// Module-level store so useSyncExternalStore can hydrate safely. getSnapshot
// MUST return a stable reference between renders, so the parsed value is
// cached against the raw localStorage string and rebuilt only when it changes.
const EMPTY_PROFILES: ManagedProfile[] = []
let listeners: Array<() => void> = []
function emit() {
  listeners.forEach((l) => l())
}
function subscribe(cb: () => void) {
  listeners.push(cb)
  window.addEventListener('storage', cb)
  return () => {
    listeners = listeners.filter((l) => l !== cb)
    window.removeEventListener('storage', cb)
  }
}
let cachedRaw: string | null = null
let cachedProfiles: ManagedProfile[] = EMPTY_PROFILES
function readProfiles(): ManagedProfile[] {
  let raw: string
  try {
    raw = localStorage.getItem(LS_PROFILES) ?? '[]'
  } catch {
    return EMPTY_PROFILES
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      const p = JSON.parse(raw) as ManagedProfile[]
      cachedProfiles = Array.isArray(p)
        ? p.filter((x) => x && typeof x.id === 'string')
        : EMPTY_PROFILES
    } catch {
      cachedProfiles = EMPTY_PROFILES
    }
  }
  return cachedProfiles
}
function readActiveId(): string {
  try {
    return localStorage.getItem(LS_ACTIVE) ?? 'self'
  } catch {
    return 'self'
  }
}
function serverProfiles(): ManagedProfile[] {
  return EMPTY_PROFILES
}
function serverActiveId(): string {
  return 'self'
}
function write(next: ManagedProfile[], active: string) {
  try {
    localStorage.setItem(LS_PROFILES, JSON.stringify(next))
    localStorage.setItem(LS_ACTIVE, active)
  } catch {
    // storage unavailable (private mode) — state lives for this session only
  }
  emit()
}

export function ProfilesClient({
  userName,
  addressesCount,
  hasContact,
}: {
  userName: string
  addressesCount: number
  hasContact: boolean
}) {
  const profiles = useSyncExternalStore(subscribe, readProfiles, serverProfiles)
  const activeId = useSyncExternalStore(subscribe, readActiveId, serverActiveId)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('')

  function addProfile() {
    const n = name.trim()
    if (!n) return
    const profile: ManagedProfile = { id: `mp-${Date.now()}`, name: n, relation: relation.trim() }
    write([...profiles, profile], profile.id)
    setName('')
    setRelation('')
    setAdding(false)
  }

  function removeProfile(id: string) {
    const next = profiles.filter((p) => p.id !== id)
    write(next, activeId === id ? 'self' : activeId)
  }

  const activeIsSelf = activeId === 'self'
  const activeProfile = profiles.find((p) => p.id === activeId)
  const activeLabel = activeIsSelf ? userName : activeProfile?.name || userName

  const checklist = [
    {
      label: 'Delivery address saved',
      done: addressesCount > 0,
      body:
        addressesCount > 0
          ? `${addressesCount} ${addressesCount === 1 ? 'address' : 'addresses'} on file — deliveries for anyone you shop for can start here.`
          : 'Save at least one delivery address so orders for someone else have somewhere to land.',
      href: '/account/addresses',
      cta: addressesCount > 0 ? 'Review addresses' : 'Add an address',
    },
    {
      label: 'Contact details current',
      done: hasContact,
      body:
        hasContact
          ? 'A phone or WhatsApp number is on file — the courier calls this number on delivery day.'
          : 'Add a phone or WhatsApp number. Every delivery is confirmed by a call ahead.',
      href: '/account/profile',
      cta: hasContact ? 'Review profile' : 'Add contact details',
    },
    {
      label: 'Measurements handy',
      done: false,
      body: 'Sizes for someone else live with your stylist, not in this account — keep the eight key measurements ready and share them in a brief.',
      href: '/measurement-guide',
      cta: 'Open the measurement guide',
    },
  ] as const

  return (
    <div className="space-y-10">
      {/* ─── Profile switcher ─── */}
      <section aria-label="Profile switcher">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="label-uppercase text-muted-foreground mb-1">Shopping for</p>
            <h2 className="font-display text-2xl md:text-3xl">{activeLabel}</h2>
          </div>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors link-underline"
          >
            {adding ? 'Cancel' : '+ Add profile'}
          </button>
        </div>

        {adding && (
          <div className="border border-border rounded-lg bg-card p-6 mb-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="label-uppercase text-muted-foreground text-[10px] block mb-2">
                  Their name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daddy"
                  className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
                />
              </label>
              <label className="block">
                <span className="label-uppercase text-muted-foreground text-[10px] block mb-2">
                  Relationship
                </span>
                <input
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  placeholder="e.g. Father, partner, brother"
                  className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={addProfile}
              disabled={!name.trim()}
              className="mt-5 inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Save profile
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Self profile — always present, cannot be removed */}
          <button
            type="button"
            onClick={() => write(profiles, 'self')}
            aria-pressed={activeIsSelf}
            className={`text-left border p-6 transition-colors ${
              activeIsSelf
                ? 'border-foreground bg-card'
                : 'border-border bg-card hover:border-foreground/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <UserRound className="size-5 text-muted-foreground" strokeWidth={1.5} />
              {activeIsSelf && (
                <span className="inline-flex items-center border border-foreground text-[10px] uppercase tracking-[0.14em] px-3 py-1.5">
                  Active
                </span>
              )}
            </div>
            <h3 className="font-display text-xl mt-5">{userName}</h3>
            <p className="text-sm text-muted-foreground mt-1">You — the account owner.</p>
          </button>

          {/* Managed profiles */}
          {profiles.map((p) => (
            <div
              key={p.id}
              className={`relative text-left border p-6 transition-colors ${
                activeId === p.id
                  ? 'border-foreground bg-card'
                  : 'border-border bg-card hover:border-foreground/30'
              }`}
            >
              <button
                type="button"
                onClick={() => write(profiles, p.id)}
                className="absolute inset-0 z-10"
                aria-label={`Switch to ${p.name}`}
                aria-pressed={activeId === p.id}
              />
              <div className="flex items-start justify-between gap-3">
                <Users className="size-5 text-muted-foreground" strokeWidth={1.5} />
                {activeId === p.id && (
                  <span className="inline-flex items-center border border-foreground text-[10px] uppercase tracking-[0.14em] px-3 py-1.5">
                    Active
                  </span>
                )}
              </div>
              <h3 className="font-display text-xl mt-5">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {p.relation || 'Managed profile'}
              </p>
              <button
                type="button"
                onClick={() => removeProfile(p.id)}
                className="relative z-20 mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Minus className="size-3" />
                Remove
              </button>
            </div>
          ))}

          {/* Add-profile invitation card */}
          {!adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="border border-dashed border-border p-6 text-left hover:border-foreground/40 transition-colors"
            >
              <Users className="size-5 text-muted-foreground" strokeWidth={1.5} />
              <h3 className="font-display text-xl mt-5">Shop for someone else</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add a profile for a partner, father, or brother — keep their details separate from
                yours.
              </p>
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Profiles are stored on this device only — not synced to a server, not shared with
          anyone.
        </p>
      </section>

      {/* ─── Retrofit checklist ─── */}
      <section aria-label="Account readiness checklist">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="label-uppercase text-muted-foreground mb-1">Before you shop for him</p>
            <h2 className="font-display text-2xl md:text-3xl">Readiness Checklist</h2>
          </div>
        </div>
        <div className="border-t border-border">
          {checklist.map((item) => (
            <div
              key={item.label}
              className="grid md:grid-cols-12 gap-3 md:gap-10 py-6 border-b border-border/60 items-start"
            >
              <div className="md:col-span-1 md:pt-1">
                {item.done ? (
                  <CheckCircle2 className="size-5 text-foreground" strokeWidth={1.5} />
                ) : (
                  <Circle className="size-5 text-muted-foreground/50" strokeWidth={1.5} />
                )}
              </div>
              <div className="md:col-span-6">
                <h3 className="font-display text-lg md:text-xl">{item.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">{item.body}</p>
              </div>
              <div className="md:col-span-5 md:text-right">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground"
                >
                  <span className="link-underline">{item.cta}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6 flex items-center gap-2">
          <Ruler className="size-4" strokeWidth={1.5} />
          Not sure of his sizes? The measurement guide walks through all eight — or book a Home
          Fitting and we&apos;ll take them properly.
        </p>
      </section>

      {/* ─── Where profiles are used ─── */}
      <section aria-label="Where profiles are used">
        <p className="label-uppercase text-muted-foreground mb-1">Make it count</p>
        <h2 className="font-display text-2xl md:text-3xl mb-6">Use a Profile With</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/services/personal-shopping"
            className="group border border-border bg-card p-6 md:p-8 hover:border-foreground/30 transition-colors"
          >
            <Check className="size-5 text-muted-foreground mb-4" strokeWidth={1.5} />
            <h3 className="font-display text-xl md:text-2xl mb-2">A Personal Shopping brief</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Tell us who you&apos;re shopping for — sizes, budget, and taste — and we source to
              that brief.
            </p>
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground">
              <span className="link-underline">Start a brief</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link
            href="/services/outfit-gifting"
            className="group border border-border bg-card p-6 md:p-8 hover:border-foreground/30 transition-colors"
          >
            <Check className="size-5 text-muted-foreground mb-4" strokeWidth={1.5} />
            <h3 className="font-display text-xl md:text-2xl mb-2">An Outfit Gifting delivery</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              A styled, gift-wrapped outfit delivered to him directly — on the date you choose.
            </p>
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground">
              <span className="link-underline">Plan a gift</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  )
}
