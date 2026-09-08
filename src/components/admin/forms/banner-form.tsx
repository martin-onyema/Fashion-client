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
import { adminCreateBanner, adminUpdateBanner, adminDeleteBanner } from '@/actions/admin'
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

type Banner = {
  id: string
  title: string
  subtitle: string | null
  image: string | null
  ctaText: string | null
  ctaHref: string | null
  active: boolean
  order: number
  startsAt: Date | string | null
  endsAt: Date | string | null
}

function toDateInput(d: Date | string | null | undefined): string {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

export function BannerForm({ banner }: { banner?: Banner | null }) {
  const router = useRouter()
  const [saving, startSave] = useTransition()
  const [deleting, startDelete] = useTransition()
  const isEdit = !!banner

  const [title, setTitle] = useState(banner?.title ?? '')
  const [subtitle, setSubtitle] = useState(banner?.subtitle ?? '')
  const [image, setImage] = useState(banner?.image ?? '')
  const [ctaText, setCtaText] = useState(banner?.ctaText ?? '')
  const [ctaHref, setCtaHref] = useState(banner?.ctaHref ?? '')
  const [order, setOrder] = useState<number>(banner?.order ?? 0)
  const [active, setActive] = useState(banner?.active ?? true)
  const [startsAt, setStartsAt] = useState(toDateInput(banner?.startsAt ?? null))
  const [endsAt, setEndsAt] = useState(toDateInput(banner?.endsAt ?? null))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startSave(async () => {
      const payload = {
        title,
        subtitle: subtitle || undefined,
        image: image || null,
        ctaText: ctaText || undefined,
        ctaHref: ctaHref || undefined,
        order,
        active,
        startsAt: startsAt || null,
        endsAt: endsAt || null,
      }
      const r = isEdit
        ? await adminUpdateBanner(banner!.id, payload)
        : await adminCreateBanner(payload)
      if (r.ok) {
        toast.success(isEdit ? 'Banner updated' : 'Banner created')
        router.push('/admin/banners')
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not save')
      }
    })
  }

  function handleDelete() {
    startDelete(async () => {
      const r = await adminDeleteBanner(banner!.id)
      if (r.ok) {
        toast.success('Banner deleted')
        router.push('/admin/banners')
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
            <CardTitle className="font-display text-lg">Content</CardTitle>
            <CardDescription>What the banner shows.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Summer Collection"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={2}
                placeholder="Supporting copy"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/banners/... or external URL"
              />
              {image && (
                <div className="mt-2 aspect-video rounded bg-secondary overflow-hidden max-w-md">
                  <img src={image} alt="Banner preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ctaText">CTA text</Label>
                <Input
                  id="ctaText"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Shop Now"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ctaHref">CTA link</Label>
                <Input
                  id="ctaHref"
                  value={ctaHref}
                  onChange={(e) => setCtaHref(e.target.value)}
                  placeholder="/shop/summer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Schedule (optional)</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startsAt">Starts at</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endsAt">Ends at</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Active</Label>
                <p className="text-xs text-muted-foreground">Inactive banners are hidden.</p>
              </div>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
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

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isEdit ? 'Save changes' : 'Create banner'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/banners">Cancel</Link>
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
                    Delete banner
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this banner?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Permanently deletes <span className="font-medium">{banner!.title}</span>.
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
