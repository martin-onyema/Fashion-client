'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Trash2, Archive, Eye, EyeOff, Star, MoreHorizontal, Pencil, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { formatNGN, formatDateShort } from '@/lib/format'
import { adminBulkProductAction } from '@/actions/admin'

type Product = {
  id: string
  name: string
  slug: string
  sku: string
  price: number
  salePrice: number | null
  featured: boolean
  published: boolean
  status: string
  createdAt: Date | string
  images: { url: string }[]
  variants: { stock: number; lowStockThreshold: number }[]
  category: { name: string; parent: { name: string } | null }
}

export function ProductsTable({
  products,
  emptyMessage,
}: {
  products: Product[]
  emptyMessage: string
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, startBulk] = useTransition()

  const allSelected = products.length > 0 && selected.size === products.length
  const someSelected = selected.size > 0 && !allSelected

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(products.map((p) => p.id)))
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  async function runAction(
    action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'feature' | 'unfeature',
  ) {
    if (selected.size === 0) {
      toast.error('Select at least one product first')
      return
    }
    startBulk(async () => {
      const r = await adminBulkProductAction(action, Array.from(selected))
      if (r.ok) {
        toast.success(`Action complete · ${r.count} product${r.count === 1 ? '' : 's'} affected`)
        setSelected(new Set())
        router.refresh()
      } else {
        toast.error(r.error ?? 'Action failed')
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Bulk action bar */}
      {products.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-secondary/40 border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={toggleAll}
              aria-label="Select all visible"
            />
            <span className="text-sm">
              {selected.size > 0
                ? `${selected.size} of ${products.length} selected`
                : `${products.length} on this page`}
            </span>
          </div>
          {selected.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Bulk actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Publish</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => runAction('publish')}>
                  <Eye className="size-3.5 mr-2" /> Publish
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => runAction('unpublish')}>
                  <EyeOff className="size-3.5 mr-2" /> Unpublish
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Featured</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => runAction('feature')}>
                  <Star className="size-3.5 mr-2" /> Mark as featured
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => runAction('unfeature')}>
                  <Star className="size-3.5 mr-2" /> Remove featured
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => runAction('archive')}>
                  <Archive className="size-3.5 mr-2" /> Archive
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-700"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="size-3.5 mr-2" /> Delete…
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selected.size} products?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the selected products along with their
                        images, variants, and any order item references. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => runAction('delete')}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 w-[40px]">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Created</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-16 text-center text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => {
                  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0)
                  const lowStock = p.variants.some((v) => v.stock <= (v.lowStockThreshold ?? 5))
                  const outOfStock = totalStock <= 0
                  const catName = p.category.parent?.name ?? p.category.name
                  return (
                    <TableRow key={p.id} data-selected={selected.has(p.id)}>
                      <TableCell className="pl-6">
                        <Checkbox
                          checked={selected.has(p.id)}
                          onCheckedChange={() => toggleOne(p.id)}
                          aria-label={`Select ${p.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                          {p.images[0]?.url ? (
                            <Image
                              src={p.images[0].url}
                              alt={p.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                              No img
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="font-medium hover:underline"
                        >
                          {p.name}
                        </Link>
                        {p.featured && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">
                            Featured
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {p.sku}
                      </TableCell>
                      <TableCell className="text-sm">{catName}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        <div className="flex flex-col items-end">
                          <span>{formatNGN(p.salePrice ?? p.price)}</span>
                          {p.salePrice && p.salePrice < p.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatNGN(p.price)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            'tabular-nums ' +
                            (outOfStock
                              ? 'text-red-700 font-medium'
                              : lowStock
                                ? 'text-amber-700 font-medium'
                                : '')
                          }
                        >
                          {totalStock}
                        </span>
                        {(lowStock || outOfStock) && (
                          <AlertTriangle
                            className={
                              'inline ml-1 size-3 ' +
                              (outOfStock ? 'text-red-700' : 'text-amber-700')
                            }
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {p.published ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-200">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-secondary text-muted-foreground">
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDateShort(p.createdAt)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/products/${p.id}`}>
                            <Pencil className="size-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
