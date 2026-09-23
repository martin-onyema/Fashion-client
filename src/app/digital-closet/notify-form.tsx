'use client'

import { useState } from 'react'
import { joinWaitlist } from '@/actions/store'

/**
 * Waitlist capture form for the Digital Closet page.
 * Accepts a phone number OR an email — whatever the customer prefers.
 * Styled for the dark waitlist band (#121110) in the site's editorial language.
 */
export function NotifyForm() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setError('')
    const fd = new FormData()
    fd.set('name', name)
    fd.set('contact', contact)
    const res = await joinWaitlist(fd)
    if (res.ok) {
      setStatus('ok')
      setName('')
      setContact('')
    } else {
      setStatus('error')
      setError(res.error ?? 'Could not join the waitlist. Try again.')
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          aria-label="Full name"
          className="h-[52px] flex-1 min-w-0 bg-transparent border border-white/25 px-4 text-sm text-[#f7f6f3] placeholder:text-white/40 outline-none focus:border-white/70 transition-colors"
        />
        <input
          type="text"
          required
          minLength={7}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Phone or email"
          aria-label="Phone or email"
          className="h-[52px] flex-1 min-w-0 bg-transparent border border-white/25 px-4 text-sm text-[#f7f6f3] placeholder:text-white/40 outline-none focus:border-white/70 transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="h-[52px] bg-[#f7f6f3] text-[#121110] px-8 text-[11px] uppercase tracking-[0.2em] hover:bg-white transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {status === 'loading' ? 'Sending…' : 'Notify Me'}
        </button>
      </div>
      {status === 'ok' && (
        <p className="mt-4 text-[13px] text-white/70">
          You&apos;re on the list — we&apos;ll reach out the moment the free trial opens.
        </p>
      )}
      {status === 'error' && <p className="mt-4 text-[13px] text-red-400">{error}</p>}
    </form>
  )
}
