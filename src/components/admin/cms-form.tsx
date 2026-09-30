'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { adminUpdateHomepageContent } from '@/actions/store'

type HomepageContent = {
  heroTitle: string
  heroSubtitle: string
  heroImage?: string | null
  heroImageAlt?: string | null
  heroPrimaryCta: string
  heroPrimaryHref: string
  heroSecondaryCta: string
  heroSecondaryHref: string
  featuredTitle: string
  featuredSubtitle: string
  featuredImage?: string | null
  featuredHref: string
  fitTitle: string
  fitSubtitle: string
  instagramHandle: string
  instagramTitle: string
  instagramCta: string
  instagramImages?: string | null
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: 'text' | 'url'
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function CmsForm({ initial }: { initial: HomepageContent | null }) {
  const [saving, setSaving] = useState(false)
  const [heroTitle, setHeroTitle] = useState(initial?.heroTitle ?? 'THE MODERN WARDROBE')
  const [heroSubtitle, setHeroSubtitle] = useState(
    initial?.heroSubtitle ?? "Premium men's fashion, curated for everyday confidence.",
  )
  const [heroImage, setHeroImage] = useState(initial?.heroImage ?? '')
  const [heroImageAlt, setHeroImageAlt] = useState(initial?.heroImageAlt ?? '')
  const [heroPrimaryCta, setHeroPrimaryCta] = useState(initial?.heroPrimaryCta ?? 'SHOP COLLECTION')
  const [heroPrimaryHref, setHeroPrimaryHref] = useState(initial?.heroPrimaryHref ?? '/shop')
  const [heroSecondaryCta, setHeroSecondaryCta] = useState(
    initial?.heroSecondaryCta ?? 'EXPLORE NEW ARRIVALS',
  )
  const [heroSecondaryHref, setHeroSecondaryHref] = useState(
    initial?.heroSecondaryHref ?? '/shop?sort=newest',
  )
  const [featuredTitle, setFeaturedTitle] = useState(initial?.featuredTitle ?? 'REFINED EVERYDAY')
  const [featuredSubtitle, setFeaturedSubtitle] = useState(
    initial?.featuredSubtitle ??
      'Curated pieces for work, weekends, evenings and everything between.',
  )
  const [featuredImage, setFeaturedImage] = useState(initial?.featuredImage ?? '')
  const [featuredHref, setFeaturedHref] = useState(initial?.featuredHref ?? '/shop')
  const [fitTitle, setFitTitle] = useState(initial?.fitTitle ?? 'FIND YOUR FIT')
  const [fitSubtitle, setFitSubtitle] = useState(initial?.fitSubtitle ?? 'Explore by category.')
  const [instagramHandle, setInstagramHandle] = useState(
    initial?.instagramHandle ?? 'wardrobecareng',
  )
  const [instagramTitle, setInstagramTitle] = useState(
    initial?.instagramTitle ?? '@wardrobecareng',
  )
  const [instagramCta, setInstagramCta] = useState(
    initial?.instagramCta ?? 'FOLLOW THE JOURNEY',
  )
  const [instagramImagesText, setInstagramImagesText] = useState(() => {
    if (!initial?.instagramImages) return ''
    try {
      const arr = JSON.parse(initial.instagramImages) as string[]
      return Array.isArray(arr) ? arr.join('\n') : ''
    } catch {
      return ''
    }
  })

  const handleSave = async () => {
    setSaving(true)
    const imageUrls = instagramImagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    const payload = {
      heroTitle,
      heroSubtitle,
      heroImage: heroImage || null,
      heroImageAlt: heroImageAlt || null,
      heroPrimaryCta,
      heroPrimaryHref,
      heroSecondaryCta,
      heroSecondaryHref,
      featuredTitle,
      featuredSubtitle,
      featuredImage: featuredImage || null,
      featuredHref,
      fitTitle,
      fitSubtitle,
      instagramHandle,
      instagramTitle,
      instagramCta,
      instagramImages: JSON.stringify(imageUrls),
    }
    const result = await adminUpdateHomepageContent(payload)
    if (!result.ok) {
      toast.error(result.error ?? 'Could not save content')
      setSaving(false)
      return
    }
    toast.success('Homepage content updated')
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg">Hero Section</CardTitle>
          <CardDescription>The headline banner shown at the top of the homepage</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <Field label="Hero title" value={heroTitle} onChange={setHeroTitle} />
          <div className="flex flex-col gap-2">
            <Label>Hero subtitle</Label>
            <Textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Hero image URL"
              value={heroImage}
              onChange={setHeroImage}
              type="url"
              placeholder="https://…"
            />
            <Field
              label="Hero image alt text"
              value={heroImageAlt}
              onChange={setHeroImageAlt}
              placeholder="Editorial menswear"
            />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Primary CTA label" value={heroPrimaryCta} onChange={setHeroPrimaryCta} />
            <Field label="Primary CTA link" value={heroPrimaryHref} onChange={setHeroPrimaryHref} />
            <Field
              label="Secondary CTA label"
              value={heroSecondaryCta}
              onChange={setHeroSecondaryCta}
            />
            <Field
              label="Secondary CTA link"
              value={heroSecondaryHref}
              onChange={setHeroSecondaryHref}
            />
          </div>
        </CardContent>
      </Card>

      {/* Featured collection */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg">Featured Collection</CardTitle>
          <CardDescription>The mid-page editorial banner</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title" value={featuredTitle} onChange={setFeaturedTitle} />
            <Field label="Link" value={featuredHref} onChange={setFeaturedHref} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Subtitle</Label>
            <Textarea
              value={featuredSubtitle}
              onChange={(e) => setFeaturedSubtitle(e.target.value)}
              rows={2}
            />
          </div>
          <Field
            label="Featured image URL"
            value={featuredImage}
            onChange={setFeaturedImage}
            type="url"
            placeholder="https://…"
          />
        </CardContent>
      </Card>

      {/* Find your fit */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg">Find Your Fit Section</CardTitle>
          <CardDescription>The category navigation block</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title" value={fitTitle} onChange={setFitTitle} />
            <Field label="Subtitle" value={fitSubtitle} onChange={setFitSubtitle} />
          </div>
        </CardContent>
      </Card>

      {/* Instagram */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg">Instagram Section</CardTitle>
          <CardDescription>Social proof block at the bottom of the homepage</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Handle" value={instagramHandle} onChange={setInstagramHandle} />
            <Field label="Title" value={instagramTitle} onChange={setInstagramTitle} />
            <Field label="CTA label" value={instagramCta} onChange={setInstagramCta} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Instagram images</Label>
            <Textarea
              value={instagramImagesText}
              onChange={(e) => setInstagramImagesText(e.target.value)}
              rows={5}
              placeholder={'https://images.unsplash.com/photo-1\nhttps://images.unsplash.com/photo-2'}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              One image URL per line. These render as a grid in the Instagram section.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <div className="bg-card border border-border rounded-full shadow-md px-4 py-2 flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Changes publish immediately
          </span>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
