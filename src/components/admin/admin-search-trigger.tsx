'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminGlobalSearch } from '@/components/admin/admin-global-search'

/**
 * Search trigger button that opens the AdminGlobalSearch dialog.
 * Listens for Cmd/Ctrl+K to open the dialog from anywhere on the page.
 */
export function AdminSearchTrigger() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Cmd/Ctrl + K opens search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      // Esc closes (handled by Dialog internally)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 min-w-[200px] justify-between"
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <Search className="size-3.5" />
          <span className="text-xs">Search admin…</span>
        </span>
        <kbd className="text-[10px] text-muted-foreground/60 font-mono bg-secondary px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="md:hidden size-9 p-0"
        aria-label="Search admin"
      >
        <Search className="size-4" />
      </Button>
      <AdminGlobalSearch open={open} onOpenChange={setOpen} />
    </>
  )
}
