'use client'

import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Builds a CSV string from the provided rows, creates a Blob, downloads
 * it to the user's browser, and shows a toast.
 *
 * Client-side only — no server round-trip needed. The page passes the
 * already-fetched rows; we just format + download.
 */
export function ExportCsvButton({
  filename,
  rows,
  label = 'Export CSV',
}: {
  filename: string
  rows: (string | number)[][]
  label?: string
}) {
  const [busy, setBusy] = useState(false)

  function handleExport() {
    setBusy(true)
    try {
      // Escape each cell: wrap in quotes if contains comma/quote/newline
      const escape = (val: string | number) => {
        const s = String(val ?? '')
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`
        }
        return s
      }
      const csv = rows.map((r) => r.map(escape).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      disabled={busy || rows.length <= 1}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {label}
    </Button>
  )
}
