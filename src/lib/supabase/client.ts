'use client'

import { createBrowserClient } from '@supabase/ssr'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set. Add it to .env')
}

/**
 * Browser-side Supabase client. Uses the anon key — RLS policies apply.
 * Use this for client-side uploads (rare) or for direct reads from public
 * tables. For sensitive operations, use server actions instead.
 */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const PRODUCT_IMAGES_BUCKET = 'product-images'
