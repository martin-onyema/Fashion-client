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
import { slugify } from '@/lib/format'
import { adminCreateBrand, adminUpdateBrand, adminDeleteBrand } from '@/actions/admin'
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

type Brand = {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  country: string | null
  active: boolean
}

export function BrandForm({ brand }: { brand?: Brand | null }) {
  const router = useRouter()
  const [saving, startSave] = useTransition()
  const [deleting, startDelete] = useTransition()
  const isEdit = !!brand

  const [name, setName] = useState(brand?.name ?? '')
  const [slug, setSlug] = useState(brand?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!brand)
  const [description, setDescription] = useState(brand?.description ?? '')
  const [logoUrl, setLogoUrl] = useState(brand?.logoUrl ?? '')
  const [country, setCountry] = useState(brand?.country ?? '')
  const [active, setActive] = useState(brand?.active ?? true)

  const effectiveSlug = slugTouched ? slug : slugify(name)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startSave(async () => {
      const payload = {
        name,
        slug: effectiveSlug,
        description: description || undefined,
        logoUrl: logoUrl || null,
        country: country || undefined,
        active,
      }
      const r = isEdit
        ? await adminUpdateBrand(brand!.id, payload)
        : await adminCreateBrand(payload)
      if (r.ok) {
        toast.success(isEdit ? 'Brand updated' : 'Brand created')
        router.push('/admin/brands')
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not save')
      }
    })
  }

  function handleDelete() {
    startDelete(async () => {
      const r = await adminDeleteBrand(brand!.id)
      if (r.ok) {
        toast.success('Brand deleted')
        router.push('/admin/brands')
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
                placeholder="e.g. Falconieri"
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
                placeholder="Short brand description"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="/brand-logos/... or external URL"
              />
              {logoUrl && (
                <div className="mt-2 size-16 rounded bg-secondary overflow-hidden flex items-center justify-center">
                  <img src={logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Italy"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Visibility</CardTitle>
            <CardDescription>Control storefront visibility.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Active</Label>
                <p className="text-xs text-muted-foreground">Inactive brands are hidden.</p>
              </div>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isEdit ? 'Save changes' : 'Create brand'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/brands">Cancel</Link>
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
                    Delete brand
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this brand?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete <span className="font-medium">{name}</span>.
                      Products will keep their assignment but show no brand.
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
