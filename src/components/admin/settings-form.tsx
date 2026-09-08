'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { adminUpdateSettings } from '@/actions/store'

type Settings = {
  whatsappNumber?: string | null
  whatsappEnabled: boolean
  paystackPublicKey?: string | null
  paystackEnabled: boolean
  storeName: string
  storeTagline: string
  supportEmail?: string | null
  supportPhone?: string | null
  instagramUrl?: string | null
  facebookUrl?: string | null
  twitterUrl?: string | null
  tiktokUrl?: string | null
  defaultDeliveryFee: number
  freeDeliveryThreshold: number
  emailProvider?: string | null
  emailFrom?: string | null
  bankName?: string | null
  bankAccountName?: string | null
  bankAccountNumber?: string | null
  bankSortCode?: string | null
  bankTransferInstructions?: string | null
}

export function SettingsForm({ initial }: { initial: Settings | null }) {
  const [saving, setSaving] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState(initial?.whatsappNumber ?? '')
  const [whatsappEnabled, setWhatsappEnabled] = useState(initial?.whatsappEnabled ?? true)
  const [paystackPublicKey, setPaystackPublicKey] = useState(initial?.paystackPublicKey ?? '')
  const [paystackEnabled, setPaystackEnabled] = useState(initial?.paystackEnabled ?? true)
  const [storeName, setStoreName] = useState(initial?.storeName ?? 'Wardrobecare Clothing')
  const [storeTagline, setStoreTagline] = useState(
    initial?.storeTagline ?? "Your #1 Personal Shopper for premium men's fashion.",
  )
  const [supportEmail, setSupportEmail] = useState(initial?.supportEmail ?? '')
  const [supportPhone, setSupportPhone] = useState(initial?.supportPhone ?? '')
  const [instagramUrl, setInstagramUrl] = useState(initial?.instagramUrl ?? '')
  const [facebookUrl, setFacebookUrl] = useState(initial?.facebookUrl ?? '')
  const [twitterUrl, setTwitterUrl] = useState(initial?.twitterUrl ?? '')
  const [tiktokUrl, setTiktokUrl] = useState(initial?.tiktokUrl ?? '')
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState(
    String(initial?.defaultDeliveryFee ?? 2500),
  )
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    String(initial?.freeDeliveryThreshold ?? 50000),
  )
  const [emailProvider, setEmailProvider] = useState(initial?.emailProvider ?? '')
  const [emailFrom, setEmailFrom] = useState(initial?.emailFrom ?? '')
  const [bankName, setBankName] = useState(initial?.bankName ?? '')
  const [bankAccountName, setBankAccountName] = useState(initial?.bankAccountName ?? '')
  const [bankAccountNumber, setBankAccountNumber] = useState(initial?.bankAccountNumber ?? '')
  const [bankSortCode, setBankSortCode] = useState(initial?.bankSortCode ?? '')
  const [bankTransferInstructions, setBankTransferInstructions] = useState(
    initial?.bankTransferInstructions ?? '',
  )

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      whatsappNumber: whatsappNumber || null,
      whatsappEnabled,
      paystackPublicKey: paystackPublicKey || null,
      paystackEnabled,
      storeName,
      storeTagline,
      supportEmail: supportEmail || null,
      supportPhone: supportPhone || null,
      instagramUrl: instagramUrl || null,
      facebookUrl: facebookUrl || null,
      twitterUrl: twitterUrl || null,
      tiktokUrl: tiktokUrl || null,
      defaultDeliveryFee: Number(defaultDeliveryFee) || 0,
      freeDeliveryThreshold: Number(freeDeliveryThreshold) || 0,
      emailProvider: emailProvider || null,
      emailFrom: emailFrom || null,
      bankName: bankName || null,
      bankAccountName: bankAccountName || null,
      bankAccountNumber: bankAccountNumber || null,
      bankSortCode: bankSortCode || null,
      bankTransferInstructions: bankTransferInstructions || null,
    }
    const result = await adminUpdateSettings(payload)
    if (!result.ok) {
      toast.error(result.error ?? 'Could not save settings')
      setSaving(false)
      return
    }
    toast.success('Settings saved')
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Store */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg">Store Identity</CardTitle>
          <CardDescription>Brand name and tagline shown across the site</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="storeName">Store name</Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="storeTagline">Store tagline</Label>
            <Input
              id="storeTagline"
              value={storeTagline}
              onChange={(e) => setStoreTagline(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg">Support Contact</CardTitle>
          <CardDescription>Where customers can reach you</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="supportEmail">Support email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="hello@wardrobecare.com.ng"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="supportPhone">Support phone</Label>
              <Input
                id="supportPhone"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="+234 …"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg">WhatsApp</CardTitle>
          <CardDescription>Personal shopping via WhatsApp</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Enable WhatsApp ordering</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Show WhatsApp checkout option in cart
              </p>
            </div>
            <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="whatsappNumber">WhatsApp number</Label>
            <Input
              id="whatsappNumber"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="2348012345678"
            />
            <p className="text-xs text-muted-foreground">
              International format, digits only (no + or spaces).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Shipping */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg">Shipping</CardTitle>
          <CardDescription>Delivery fees applied at checkout</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="defaultDeliveryFee">Default delivery fee (₦)</Label>
              <Input
                id="defaultDeliveryFee"
                type="number"
                value={defaultDeliveryFee}
                onChange={(e) => setDefaultDeliveryFee(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="freeDeliveryThreshold">Free delivery threshold (₦)</Label>
              <Input
                id="freeDeliveryThreshold"
                type="number"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Orders at or above the threshold get free delivery automatically.
          </p>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg">Payment</CardTitle>
          <CardDescription>Paystack configuration</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Enable Paystack</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Allow card payments at checkout
              </p>
            </div>
            <Switch checked={paystackEnabled} onCheckedChange={setPaystackEnabled} />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="paystackPublicKey">Paystack public key</Label>
            <Input
              id="paystackPublicKey"
              value={paystackPublicKey}
              onChange={(e) => setPaystackPublicKey(e.target.value)}
              placeholder="pk_test_…"
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              The secret key lives in server env (PAYSTACK_SECRET_KEY) and is not editable here.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bank Transfer */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg">Bank Transfer</CardTitle>
          <CardDescription>
            Shown on the order success page when a customer selects bank transfer at checkout
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bankName">Bank name</Label>
              <Input
                id="bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Guaranty Trust Bank (GTBank)"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bankAccountName">Account name</Label>
              <Input
                id="bankAccountName"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                placeholder="Wardrobecare Clothing"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bankAccountNumber">Account number</Label>
              <Input
                id="bankAccountNumber"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="1000447933"
                className="font-mono"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bankSortCode">Sort code (optional)</Label>
              <Input
                id="bankSortCode"
                value={bankSortCode}
                onChange={(e) => setBankSortCode(e.target.value)}
                placeholder="058152052"
                className="font-mono"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bankTransferInstructions">Transfer instructions</Label>
            <textarea
              id="bankTransferInstructions"
              value={bankTransferInstructions}
              onChange={(e) => setBankTransferInstructions(e.target.value)}
              placeholder="Please make payment within 24 hours and send proof via WhatsApp."
              className="w-full min-h-[80px] resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Shown to customers after they place a bank transfer order.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg">Social Links</CardTitle>
          <CardDescription>Shown in the footer</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/wardrobecareng"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/…"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="twitterUrl">Twitter / X URL</Label>
              <Input
                id="twitterUrl"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="https://x.com/…"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tiktokUrl">TikTok URL</Label>
              <Input
                id="tiktokUrl"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://tiktok.com/@…"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg">Email Provider</CardTitle>
          <CardDescription>Transactional email configuration (optional)</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="emailProvider">Provider</Label>
              <Input
                id="emailProvider"
                value={emailProvider}
                onChange={(e) => setEmailProvider(e.target.value)}
                placeholder="resend / postmark / smtp"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="emailFrom">From address</Label>
              <Input
                id="emailFrom"
                type="email"
                value={emailFrom}
                onChange={(e) => setEmailFrom(e.target.value)}
                placeholder="hello@wardrobecare.com.ng"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <div className="bg-card border border-border rounded-full shadow-md px-4 py-2 flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Saved to AdminSettings
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
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
