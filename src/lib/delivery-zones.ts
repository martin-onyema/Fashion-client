// ─── Delivery Charges by Location ────────────────────────────────────────────
// Single source of truth for delivery fees (Mockup 24 table, as embedded in
// the Gift Card checkout artifact: "don't maintain a second copy of that
// pricing anywhere"). Consumed by the gift card checkout; retail delivery
// pricing should read from here too as zones roll out.

export type DeliveryZone = {
  name: string
  fee: number
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  { name: 'Lagos Island, Onikan', fee: 4000 },
  { name: 'Victoria Island, Ikoyi, Obalende', fee: 5000 },
  { name: 'Lekki Phase 1', fee: 5000 },
  { name: 'Lekki (beyond Phase 1), VGC', fee: 6500 },
  { name: 'Ajah and further', fee: 7000 },
  { name: 'Surulere', fee: 2000 },
  { name: 'Yaba, Ebute Metta, Costain', fee: 3000 },
  { name: 'Gbagada, Festac, Maryland, Anthony, Ilupeju', fee: 4000 },
  { name: 'Ikeja, Alapere, Isheri (CMD Road)', fee: 5000 },
  {
    name: 'Ketu, Berger, Alausa, Ogba, Magodo, Omole, Agege, Iju, Iyana Ipaja, Egbeda, Ikorodu',
    fee: 6000,
  },
  {
    name: 'Ota, Sango, Ikorodu (further), Iyana Iba, Agbara, Badagri',
    fee: 7000,
  },
]

/** Look up the delivery fee for an exact zone name. Returns null when unknown. */
export function getDeliveryFee(zoneName: string): number | null {
  const zone = DELIVERY_ZONES.find((z) => z.name === zoneName)
  return zone ? zone.fee : null
}

// ─── Zone groups (Mockup 24: Lagos Island 5 tiers & Mainland 6 tiers) ────────
// Derived from the canonical flat list above — order matters.

export type ZoneArea = 'island' | 'mainland'

export type DeliveryZoneGroup = {
  area: ZoneArea
  label: string
  note: string
  zones: DeliveryZone[]
}

export const DELIVERY_ZONE_GROUPS: DeliveryZoneGroup[] = [
  {
    area: 'island',
    label: 'Lagos Island',
    note: 'From the city centre out through Lekki and Ajah.',
    zones: DELIVERY_ZONES.slice(0, 5),
  },
  {
    area: 'mainland',
    label: 'Lagos Mainland',
    note: 'Surulere outward — including the corridors beyond Ikeja.',
    zones: DELIVERY_ZONES.slice(5),
  },
]
