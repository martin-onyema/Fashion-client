'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Save, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { slugify } from '@/lib/format'
import { adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '@/actions/admin'
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

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  image: string | null
  order: number
  featured: boolean
  active: boolean
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
}

type CategoryOption = { id: string; name: string; slug: string }

export function CategoryForm({
  category,
  parents,
}: {
  category?: Category | null
  parents: CategoryOption[]
}) {
  const router = useRouter()
  const [saving, startSave] = useTransition()
  const [deleting, startDelete] = useTransition()
  const isEdit = !!category

  const [name, setName] = useState(category?.name ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!category)
  const [description, setDescription] = useState(category?.description ?? '')
  const [parentId, setParentId] = useState<string>(category?.parentId ?? '__none__')
  const [image, setImage] = useState(category?.image ?? '')
  const [order, setOrder] = useState<number>(category?.order ?? 0)
  const [featured, setFeatured] = useState(category?.featured ?? false)
  const [active, setActive] = useState(category?.active ?? true)
  const [seoTitle, setSeoTitle] = useState(category?.seoTitle ?? '')
  const [seoDescription, setSeoDescription] = useState(category?.seoDescription ?? '')
  const [seoKeywords, setSeoKeywords] = useState(category?.seoKeywords ?? '')

  const effectiveSlug = slugTouched ? slug : slugify(name)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startSave(async () => {
      const payload = {
        name,
        slug: effectiveSlug,
        description: description || undefined,
        parentId: parentId === '__none__' ? null : parentId,
        image: image || null,
        order,
        featured,
        active,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords || undefined,
      }
      const r = isEdit
        ? await adminUpdateCategory(category!.id, payload)
        : await adminCreateCategory(payload)
      if (r.ok) {
        toast.success(isEdit ? 'Category updated' : 'Category created')
        router.push('/admin/categories')
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not save')
      }
    })
  }

  function handleDelete() {
    startDelete(async () => {
      const r = await adminDeleteCategory(category!.id)
      if (r.ok) {
        toast.success('Category deleted')
        router.push('/admin/categories')
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not delete')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Basics</CardTitle>
            <CardDescription>Name, slug, description.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!slugTouched) setSlug(slugify(e.target.value))
                }}
                required
                placeholder="e.g. Casual Shirts"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={effectiveSlug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugTouched(true)
                }}
                placeholder="auto-generated-from-name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Short description shown above product listing"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/product-images/... or external URL"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">SEO Metadata</CardTitle>
            <CardDescription>Optional — overrides the defaults on category pages.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea id="seoDescription" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="seoKeywords">SEO Keywords</Label>
              <Input id="seoKeywords" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="comma-separated" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Hierarchy</CardTitle>
            <CardDescription>Where does this category live?</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="parentId">Parent category</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="parentId">
                  <SelectValue placeholder="No parent (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No parent (top-level)</SelectItem>
                  {parents.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="order">Sort order</Label>
              <Input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Visibility</CardTitle>
            <CardDescription>Control storefront visibility.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Active</Label>
                <p className="text-xs text-muted-foreground">Hidden categories aren't shown to customers.</p>
              </div>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="featured">Featured</Label>
                <p className="text-xs text-muted-foreground">Appears on the homepage.</p>
              </div>
              <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isEdit ? 'Save changes' : 'Create category'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/categories">Cancel</Link>
          </Button>
        </div>

        {isEdit && (
          <Card className="border-red-200">
            <CardHeader className="border-b border-red-100">
              <CardTitle className="font-display text-lg text-red-700">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-700 border-red-200 hover:bg-red-50">
                    <Trash className="size-4" />
                    Delete category
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this category?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete <span className="font-medium">{name}</span>.
                      Child categories will be promoted to top-level.
                      Products will keep their category assignment.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deleting ? 'Deleting…' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </form>
  )
}
