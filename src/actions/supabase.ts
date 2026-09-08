'use server'

import { revalidatePath } from 'next/cache'
import { supabaseServer, PRODUCT_IMAGES_BUCKET } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export type UploadResult = {
  ok: boolean
  url?: string
  path?: string
  error?: string
}

/**
 * Upload a product image to Supabase Storage.
 * Returns the public URL the admin can save against a product.
 *
 * Only admins can call this — server-side session check.
 */
export async function adminUploadProductImage(file: File): Promise<UploadResult> {
  // 1. Auth check — admin only
  const session = await getSession()
  const role = (session?.user as any)?.role
  if (!session || role !== 'ADMIN') {
    return { ok: false, error: 'Unauthorized' }
  }

  // 2. Validate file
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: 'File too large (5MB max)' }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: 'Unsupported file type. Use JPG, PNG, WebP, or GIF.' }
  }

  // 3. Generate a unique storage path
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const path = `products/${filename}`

  // 4. Upload with service-role client (bypasses RLS)
  const supabase = supabaseServer()
  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (uploadError) {
    return { ok: false, error: uploadError.message }
  }

  // 5. Get the public URL
  const { data: pub } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(path)

  return { ok: true, url: pub.publicUrl, path }
}

/**
 * Delete a product image from Supabase Storage.
 * Useful when admin removes an image from a product edit form.
 */
export async function adminDeleteProductImage(path: string): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession()
  const role = (session?.user as any)?.role
  if (!session || role !== 'ADMIN') {
    return { ok: false, error: 'Unauthorized' }
  }

  // Strip any leading slash — Supabase paths shouldn't start with /
  const cleanPath = path.replace(/^\/+/, '')

  const supabase = supabaseServer()
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([cleanPath])

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin/products')
  return { ok: true }
}
