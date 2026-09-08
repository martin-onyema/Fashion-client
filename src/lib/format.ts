/**
 * Format a price in NGN with no decimals and ₦ prefix.
 * Example: 18500 → "₦18,500"
 */
export function formatNGN(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '₦0'
  return '₦' + Math.round(amount).toLocaleString('en-NG')
}

/**
 * Format a price compactly (e.g. ₦18.5k) for tight UI.
 */
export function formatNGNCompact(amount: number): string {
  if (amount >= 1000) {
    return '₦' + (amount / 1000).toFixed(1).replace('.0', '') + 'k'
  }
  return formatNGN(amount)
}

/**
 * Compute effective price (salePrice if set and lower than price).
 */
export function effectivePrice(price: number, salePrice?: number | null): number {
  if (salePrice && salePrice > 0 && salePrice < price) return salePrice
  return price
}

/**
 * Format a date in a long, editorial style.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format a date in a short, numeric style.
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Generate a Wardrobecare-style order number.
 */
export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-5)
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5)
  return `WC-${ts}${rand}`
}

/**
 * Build a WhatsApp deep link with prefilled message.
 */
export function whatsappLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

/**
 * Convert a string to a URL-safe slug.
 */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Truncate a string to N chars with ellipsis.
 */
export function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return s.slice(0, n).trim() + '…'
}

/**
 * Nigerian states (for checkout dropdown).
 */
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

/**
 * Calculate delivery fee. Free above threshold.
 */
export function calculateDeliveryFee(
  subtotal: number,
  defaultFee: number = 2500,
  freeThreshold: number = 50000,
): number {
  if (subtotal >= freeThreshold) return 0
  return defaultFee
}

/**
 * Sort size labels in natural order: letter sizes (XXS→5XL) first, then
 * numeric sizes ascending (handles values like "36", "36 (Length 41\")"),
 * then anything else alphabetically. Deduplicates and drops empties.
 */
const LETTER_SIZE_ORDER = [
  'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL', '4XL', '5XL',
]

export function sortSizes(sizes: (string | null | undefined)[]): string[] {
  const unique = Array.from(new Set(sizes.map((s) => (s ?? '').trim()).filter(Boolean)))
  const letterRank = (s: string) => {
    const upper = s.toUpperCase()
    const idx = LETTER_SIZE_ORDER.indexOf(upper)
    return idx === -1 ? LETTER_SIZE_ORDER.length + 99 : idx
  }
  return unique.sort((a, b) => {
    const la = /^\d/.test(a) ? 1 : 0
    const lb = /^\d/.test(b) ? 1 : 0
    if (la !== lb) return la - lb // letter sizes first
    if (la === 0) return letterRank(a) - letterRank(b)
    // numeric — compare by leading number, then string
    const na = parseFloat(a) || 0
    const nb = parseFloat(b) || 0
    if (na !== nb) return na - nb
    return a.localeCompare(b)
  })
}
