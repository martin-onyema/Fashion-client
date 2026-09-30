/**
 * Resolve product image URLs for production.
 *
 * Older product records use /product-images/<product-slug>__<filename>.
 * The shipped catalogue assets live in public/images, so strip the product
 * slug prefix and serve the bundled asset. Newly uploaded Supabase Storage
 * URLs (and normal /images URLs) are returned unchanged.
 */
export function resolveProductImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined

  let value = url.trim()
  if (!value) return undefined

  // Keep fully-qualified remote URLs unchanged (e.g. Supabase Storage).
  if (/^https?:\/\//i.test(value)) return value

  // Database records have existed with several equivalent local formats:
  // /products/file.jpg, products/file.jpg, /public/products/file.jpg, etc.
  // Always normalize them to an absolute public URL so nested routes on
  // Vercel never turn them into relative paths such as /clothing/products/....
  value = value.replace(/\\/g, '/')
  value = value.replace(/^\.\//, '')
  value = value.replace(/^public\//i, '')
  if (!value.startsWith('/')) value = `/${value}`

  if (value.startsWith('/images/') || value.startsWith('/products/')) return value

  if (value.startsWith('/product-images/')) {
    const rest = value.slice('/product-images/'.length)
    const separator = rest.lastIndexOf('__')
    if (separator >= 0 && separator < rest.length - 2) {
      return `/images/${rest.slice(separator + 2)}`
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/product-images/${rest}`
    }
  }

  return value
}

export function resolveProductImages<T extends { url: string }>(images: T[]): T[] {
  return images.map((image) => ({
    ...image,
    url: resolveProductImageUrl(image.url) ?? image.url,
  }))
}
