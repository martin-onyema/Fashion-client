'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { adminDeleteCategory, adminReorderCategory } from '@/actions/admin'

type Category = {
  id: string
  name: string
  slug: string
  parentId: string | null
}

export function CategoryActions({ category }: { category: Category }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    setBusy(true)
    const r = await adminDeleteCategory(category.id)
    if (r.ok) {
      toast.success('Category deleted')
      router.refresh()
    } else {
      toast.error(r.error ?? 'Could not delete')
    }
    setBusy(false)
  }

  async function handleReorder(dir: 'up' | 'down') {
    setBusy(true)
    const r = await adminReorderCategory(category.id, dir)
    if (r.ok) {
      router.refresh()
    } else {
      toast.error(r.error ?? 'Could not reorder')
    }
    setBusy(false)
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="size-8 p-0"
      >
        <Link href={`/admin/categories/${category.id}`}>
          <Pencil className="size-3.5" />
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="size-8 p-0">
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleReorder('up')}>
            <ArrowUp className="size-3.5 mr-2" /> Move up
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleReorder('down')}>
            <ArrowDown className="size-3.5 mr-2" /> Move down
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700"
                onSelect={(e) => e.preventDefault()}
                disabled={busy}
              >
                <Trash2 className="size-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete category?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete <span className="font-medium">{category.name}</span>.
                  Children will be unparented and products reassigned to no category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
