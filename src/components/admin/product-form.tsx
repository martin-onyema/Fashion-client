'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Plus, Trash2, Save, Loader2, ArrowLeft, AlertTriangle, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from '@/actions/store'
import { adminUploadProductImage } from '@/actions/supabase'
import { slugify } from '@/lib/format'

type Category = { id: string; name: string; slug: string; parent?: { name: string } | null }

type VariantInput = {
  id?: string
  size: string
  sku: string
  price: string
  stock: string
  lowStockThreshold: string
  imageUrl: string
}

type ExistingProduct = {
  id: string
  name: string
  slug: string
  description: string
  features?: string | null
  material?: string | null
  fit?: string | null
  care?: string | null
  sku: string
  price: number
  salePrice?: number | null
  categoryId: string
  tags?: string | null
  featured: boolean
  published: boolean
  images: { id: string; url: string; altText?: string | null; position: number }[]
  variants: {
    id: string
    size?: string | null
    sku?: string | null
    price?: number | null
    stock: number
    lowStockThreshold: number
    imageUrl?: string | null
  }[]
}

function slugifyValue(s: string) {
  return slugify(s)
}

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[]
  product?: ExistingProduct | null
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!product)
  const [description, setDescription] = useState(product?.description ?? '')
  const [features, setFeatures] = useState(product?.features ?? '')
  const [material, setMaterial] = useState(product?.material ?? '')
  const [fit, setFit] = useState(product?.fit ?? '')
  const [care, setCare] = useState(product?.care ?? '')
  const [sku, setSku] = useState(product?.sku ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [salePrice, setSalePrice] = useState(
    product?.salePrice ? String(product.salePrice) : '',
  )
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? '')
  const [tags, setTags] = useState(product?.tags ?? '')
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const [published, setPublished] = useState(product?.published ?? true)
  const [imagesText, setImagesText] = useState(
    product?.images.map((i) => i.url).join('\n') ?? '',
  )
  const [uploading, setUploading] = useState(false)

  // Derived list of image URLs (split from the textarea) — used to render
  // the thumbnail previews.
  const imageUrls = useMemo(
    () =>
      imagesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    [imagesText],
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    try {
      const results = await Promise.all(files.map((f) => adminUploadProductImage(f)))
      const newUrls: string[] = []
      for (const r of results) {
        if (r.ok && r.url) {
          newUrls.push(r.url)
        } else {
          toast.error(r.error ?? 'Upload failed')
        }
      }
      if (newUrls.length > 0) {
        const combined = [...imageUrls, ...newUrls].join('\n')
        setImagesText(combined)
        toast.success(`${newUrls.length} image${newUrls.length === 1 ? '' : 's'} uploaded`)
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
      // Reset input so the same file can be re-selected
      if (e.target) e.target.value = ''
    }
  }

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= imageUrls.length) return
    const next = [...imageUrls]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setImagesText(next.join('\n'))
  }

  const removeImage = (index: number) => {
    const next = imageUrls.filter((_, i) => i !== index)
    setImagesText(next.join('\n'))
  }

  const [variants, setVariants] = useState<VariantInput[]>(
    product?.variants.length
      ? product.variants.map((v) => ({
          id: v.id,
          size: v.size ?? '',
          sku: v.sku ?? '',
          price: v.price != null ? String(v.price) : '',
          stock: String(v.stock),
          lowStockThreshold: String(v.lowStockThreshold),
          imageUrl: v.imageUrl ?? '',
        }))
      : [
          {
            size: 'S',
            sku: '',
            price: '',
            stock: '0',
            lowStockThreshold: '5',
            imageUrl: '',
          },
        ],
  )

  // Auto slug from name
  const effectiveSlug = useMemo(() => {
    if (slugTouched) return slug
    return slugifyValue(name)
  }, [slugTouched, slug, name])

  const addVariant = () => {
    setVariants((v) => [
      ...v,
      {
        size: '',
        sku: '',
        price: '',
        stock: '0',
        lowStockThreshold: '5',
        imageUrl: '',
      },
    ])
  }

  const updateVariant = (i: number, field: keyof VariantInput, value: string) => {
    setVariants((v) => v.map((variant, idx) => (idx === i ? { ...variant, [field]: value } : variant)))
  }

  const removeVariant = (i: number) => {
    setVariants((v) => v.filter((_, idx) => idx !== i))
  }

  const handleDelete = async () => {
    if (!product) return
    setDeleting(true)
    try {
      const result = await adminDeleteProduct(product.id)
      if (!result.ok) {
        toast.error(result.error ?? 'Could not delete product')
        setDeleting(false)
        setDeleteOpen(false)
        return
      }
      toast.success('Product deleted')
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not delete product')
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !description.trim() || !sku.trim() || !categoryId) {
      toast.error('Please fill in name, description, SKU and category.')
      return
    }
    const imageUrls = imagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    if (imageUrls.length === 0) {
      toast.error('Please add at least one product image URL.')
      return
    }
    if (variants.length === 0) {
      toast.error('Please add at least one variant.')
      return
    }

    setSaving(true)
    const payload = {
      name: name.trim(),
      slug: effectiveSlug.trim() || slugifyValue(name),
      description: description.trim(),
      features: features.trim() || undefined,
      material: material.trim() || undefined,
      fit: fit.trim() || undefined,
      care: care.trim() || undefined,
      sku: sku.trim(),
      price: Number(price) || 0,
      salePrice: salePrice ? Number(salePrice) : undefined,
      categoryId,
      tags: tags.trim() || undefined,
      featured,
      published,
      images: imageUrls,
      variants: variants.map((v) => ({
        size: v.size.trim() || 'ONE SIZE',
        sku: v.sku.trim() || undefined,
        price: v.price ? Number(v.price) : undefined,
        stock: Number(v.stock) || 0,
        lowStockThreshold: Number(v.lowStockThreshold) || 5,
        imageUrl: v.imageUrl.trim() || undefined,
      })),
    }

    try {
      const result = product
        ? await adminUpdateProduct(product.id, payload)
        : await adminCreateProduct(payload)
      if (!result.ok) {
        toast.error(result.error ?? 'Could not save product')
        setSaving(false)
        return
      }
      toast.success(product ? 'Product updated' : 'Product created')
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/products" className="hover:text-foreground inline-flex items-center gap-1.5">
          <ArrowLeft className="size-3.5" />
          Products
        </Link>
        <span>/</span>
        <span className="text-foreground">{product ? 'Edit' : 'New'}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-lg">Basics</CardTitle>
              <CardDescription>Core product information shown to customers</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Product name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!slugTouched) setSlug(slugifyValue(e.target.value))
                  }}
                  placeholder="e.g. Cotton Twill Overshirt"
                  required
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
                <p className="text-xs text-muted-foreground">
                  URL: /product/<span className="font-mono">{effectiveSlug || '…'}</span>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe the product, its character and craftsmanship…"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-lg">Details</CardTitle>
              <CardDescription>Optional attributes that enrich the product page</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="e.g. 100% organic cotton"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fit">Fit</Label>
                  <Input
                    id="fit"
                    value={fit}
                    onChange={(e) => setFit(e.target.value)}
                    placeholder="e.g. Regular fit"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="features">Features</Label>
                <Textarea
                  id="features"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  rows={3}
                  placeholder="One feature per line"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="care">Care instructions</Label>
                <Textarea
                  id="care"
                  value={care}
                  onChange={(e) => setCare(e.target.value)}
                  rows={3}
                  placeholder="e.g. Machine wash cold, do not bleach, hang dry"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="comma, separated, tags"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-lg">Variants</CardTitle>
              <CardDescription>Size / stock combinations customers can pick</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {variants.map((v, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 md:grid-cols-12 gap-3 items-end p-3 border border-border rounded-md bg-secondary/30"
                  >
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Size</Label>
                      <Input
                        value={v.size}
                        onChange={(e) => updateVariant(i, 'size', e.target.value)}
                        placeholder="M"
                      />
                    </div>
                    <div className="md:col-span-3 flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Variant SKU</Label>
                      <Input
                        value={v.sku}
                        onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                        placeholder="auto"
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Price</Label>
                      <Input
                        type="number"
                        value={v.price}
                        onChange={(e) => updateVariant(i, 'price', e.target.value)}
                        placeholder="base"
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Stock</Label>
                      <Input
                        type="number"
                        value={v.stock}
                        onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Low threshold</Label>
                      <Input
                        type="number"
                        value={v.lowStockThreshold}
                        onChange={(e) => updateVariant(i, 'lowStockThreshold', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(i)}
                        aria-label="Remove variant"
                        disabled={variants.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addVariant} className="w-fit">
                <Plus className="size-4" />
                Add variant
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-lg">Images</CardTitle>
              <CardDescription>Upload files via Supabase Storage, or paste external URLs — first image is the cover</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4">
              {/* Preview thumbnails */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {imageUrls.map((url, i) => (
                    <div key={url + i} className="relative aspect-square border border-border bg-muted overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 bg-foreground text-background text-[9px] uppercase tracking-wider px-1.5 py-0.5">
                          Cover
                        </span>
                      )}
                      <div className="absolute top-1 right-1 flex gap-1">
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(i, i - 1)}
                            className="bg-background/80 hover:bg-background p-1 text-[10px]"
                            aria-label="Move left"
                            title="Make cover"
                          >
                            ←
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="bg-background/80 hover:bg-background p-1"
                          aria-label="Remove image"
                          title="Remove"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload zone */}
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-foreground/50 transition-colors py-8 px-4 cursor-pointer text-center"
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-6 animate-spin mb-2 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Uploading…</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-6 mb-2 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-xs text-foreground">Click to upload or drag and drop</span>
                    <span className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WebP, GIF — 5MB max</span>
                  </>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>

              {/* External URL fallback */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="images" className="text-xs text-muted-foreground">
                  Or paste image URLs (one per line)
                </Label>
                <Textarea
                  id="images"
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  rows={3}
                  placeholder={'https://images.unsplash.com/photo-1\nhttps://images.unsplash.com/photo-2'}
                  className="font-mono text-xs"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: the first image becomes the cover shown in product cards. Use the arrows on thumbnails to reorder.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-lg">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="price">Base price (₦) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="18500"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="salePrice">Sale price (₦)</Label>
                <Input
                  id="salePrice"
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="leave blank for no sale"
                />
                {salePrice && price && Number(salePrice) >= Number(price) && (
                  <p className="text-xs text-destructive">
                    Sale price should be lower than base price.
                  </p>
                )}
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. WC-OSH-001"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.parent ? `${c.parent.name} — ` : ''}
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-lg">Visibility</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published" className="text-sm">Published</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visible to customers in the store
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured" className="text-sm">Featured</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shown on home & shop highlights
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  {product ? 'Save Changes' : 'Create Product'}
                </>
              )}
            </Button>
            <Button asChild variant="ghost" type="button">
              <Link href="/admin/products">Cancel</Link>
            </Button>
          </div>

          {product && (
            <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
              <CardHeader className="border-b border-red-200/60 dark:border-red-900/60">
                <CardTitle className="font-display text-lg text-red-700 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="size-4" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Permanently remove this product from the store. This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleting}>
                      {deleting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Deleting…
                        </>
                      ) : (
                        <>
                          <Trash2 className="size-4" />
                          Delete Product
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete &quot;{product.name}&quot;?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove the product, its variants, and all
                        associated images. Existing orders referencing this product will keep
                        their line-item snapshots. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deleting ? 'Deleting…' : 'Delete permanently'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </form>
  )
}
