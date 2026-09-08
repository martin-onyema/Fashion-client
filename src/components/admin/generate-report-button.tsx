'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function GenerateReportButton({ label }: { label?: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => toast.info('Export under construction — coming soon')}
    >
      {label ?? 'Generate'}
    </Button>
  )
}
