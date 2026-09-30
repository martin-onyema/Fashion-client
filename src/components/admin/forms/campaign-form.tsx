'use client'

import { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Save, Trash, X, ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { adminCreateCampaign, adminUpdateCampaign, adminDeleteCampaign } from '@/actions/admin'
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

type ProductOption = { id: string; name: string }

type Campaign = {
  id: string
  name: string
  description: string | null
  type: 'PROMOTION' | 'FLASH_SALE' | 'FEATURED' | 'SEASONAL'
  active: boolean
  startsAt: Date | string
  endsAt: Date | string
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING'
  discountValue: number
  audienceTags: string | null
  usageLimit: number | null
  productIds: string[]
}

function toDateInput(d: Date | string | null | undefined): string {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

export function CampaignForm({
  campaign,
  products,
}: {
  campaign?: Campaign | null
  products: ProductOption[]
}) {
  const router = useRouter()
  const [saving, startSave] = useTransition()
  const [deleting, startDelete] = useTransition()
  const isEdit = !!campaign

  const [name, setName] = useState(campaign?.name ?? '')
  const [description, setDescription] = useState(campaign?.description ?? '')
  const [type, setType] = useState<'PROMOTION' | 'FLASH_SALE' | 'FEATURED' | 'SEASONAL'>(
    campaign?.type ?? 'PROMOTION',
  )
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING'>(
    campaign?.discountType ?? 'PERCENTAGE',
  )
  const [discountValue, setDiscountValue] = useState<number>(campaign?.discountValue ?? 0)
  const [startsAt, setStartsAt] = useState(toDateInput(campaign?.startsAt ?? null))
  const [endsAt, setEndsAt] = useState(toDateInput(campaign?.endsAt ?? null))
  const [active, setActive] = useState(campaign?.active ?? true)
  const [usageLimit, setUsageLimit] = useState<string>(
    campaign?.usageLimit != null ? String(campaign.usageLimit) : '',
  )
  const [audienceTags, setAudienceTags] = useState(campaign?.audienceTags ?? '')
  const [productIds, setProductIds] = useState<string[]>(campaign?.productIds ?? [])
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedProducts = useMemo(
    () =>
      productIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is ProductOption => !!p),
    [productIds, products],
  )

  const filtered = useMemo(() => {
    const needle = search.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(needle))
  }, [products, search])

  function toggleProduct(id: string) {
    setProductIds((cur) =>
      cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id],
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startSave(async () => {
      if (!startsAt || !endsAt) {
        toast.error('Start and end times are required')
        return
      }
      const payload = {
        name,
        description: description || undefined,
        type,
        discountType,
        discountValue: Number(discountValue),
        startsAt,
        endsAt,
        active,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
        audienceTags: audienceTags || undefined,
        productIds,
      }
      const r = isEdit
        ? await adminUpdateCampaign(campaign!.id, payload)
        : await adminCreateCampaign(payload)
      if (r.ok) {
        toast.success(isEdit ? 'Campaign updated' : 'Campaign created')
        router.push('/admin/marketing')
        router.refresh()
      } else {
        toast.error(r.error ?? 'Could not save')
      }
    })
  }

  function handleDelete() {
    startDelete(async () => {
      const r = await adminDeleteCampaign(campaign!.id)
      if (r.ok) {
        toast.success('Campaign deleted')
        router.push('/admin/marketing')
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
            <CardDescription>Name, type, and discount.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Summer Markdown Sale"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Internal note"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROMOTION">Promotion</SelectItem>
                    <SelectItem value="FLASH_SALE">Flash sale</SelectItem>
                    <SelectItem value="FEATURED">Featured collection</SelectItem>
                    <SelectItem value="SEASONAL">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="discountType">Discount type</Label>
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as any)}>
                  <SelectTrigger id="discountType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed amount</SelectItem>
                    <SelectItem value="FREE_SHIPPING">Free shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="discountValue">
                Discount value {discountType === 'PERCENTAGE' ? '(%)' : '(NGN)'}
              </Label>
              <Input
                id="discountValue"
                type="number"
                min={0}
                step={discountType === 'PERCENTAGE' ? 1 : 100}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                required
                disabled={discountType === 'FREE_SHIPPING'}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Products</CardTitle>
            <CardDescription>
              Choose which products this campaign applies to.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Selected products</Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className="justify-between font-normal"
                  >
                    <span className="text-muted-foreground">
                      {productIds.length === 0
                        ? 'Select products…'
                        : `${productIds.length} selected`}
                    </span>
                    <ChevronDown className="size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search products…"
                      value={search}
                      onValueChange={setSearch}
                    />
                    <CommandList className="max-h-72">
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup>
                        {filtered.map((p) => {
                          const selected = productIds.includes(p.id)
                          return (
                            <CommandItem
                              key={p.id}
                              value={p.id}
                              onSelect={() => toggleProduct(p.id)}
                            >
                              <Check
                                className={
                                  'size-4 mr-2 ' +
                                  (selected ? 'opacity-100' : 'opacity-0')
                                }
                              />
                              {p.name}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedProducts.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedProducts.map((p) => (
                    <Badge
                      key={p.id}
                      variant="secondary"
                      className="text-xs pl-2 pr-1 py-0.5 gap-1"
                    >
                      {p.name}
                      <button
                        type="button"
                        onClick={() => toggleProduct(p.id)}
                        className="hover:bg-background/50 rounded p-0.5"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  No products selected — discount applies to whole cart.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="font-display text-lg">Schedule</CardTitle>
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
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endsAt">Ends at</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  required
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
                <p className="text-xs text-muted-foreground">Inactive campaigns don't apply.</p>
              </div>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="usageLimit">Total usage limit</Label>
              <Input
                id="usageLimit"
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="No limit"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="audienceTags">Audience tags</Label>
              <Input
                id="audienceTags"
                value={audienceTags}
                onChange={(e) => setAudienceTags(e.target.value)}
                placeholder="VIP, newsletter, wholesale"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated customer tags this campaign targets.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isEdit ? 'Save changes' : 'Create campaign'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/marketing">Cancel</Link>
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
                    Delete campaign
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this campaign?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Permanently deletes <span className="font-medium">{name}</span>.
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
