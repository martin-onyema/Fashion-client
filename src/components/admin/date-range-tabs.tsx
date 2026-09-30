'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const RANGES = [
  { code: 'today', label: 'Today' },
  { code: '7d', label: '7d' },
  { code: '30d', label: '30d' },
  { code: '90d', label: '90d' },
  { code: 'year', label: 'Year' },
]

export function DateRangeTabs({ currentRange }: { currentRange: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setRange(code: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', code)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="hidden md:flex items-center gap-1 mr-2">
      <Calendar className="size-3.5 text-muted-foreground mr-1" />
      <div className="flex items-center gap-0.5 bg-secondary/50 rounded-md p-0.5">
        {RANGES.map((r) => (
          <button
            key={r.code}
            onClick={() => setRange(r.code)}
            className={cn(
              'text-xs px-2.5 py-1 rounded-sm transition-all',
              currentRange === r.code
                ? 'bg-background text-foreground shadow-sm font-medium'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}
