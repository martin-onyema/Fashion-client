import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set. Add it to .env')
}

/**
 * Server-side Supabase client using the **service role** key.
 * Bypasses RLS — only use in trusted server contexts (server actions, route
 * handlers, server components). Never expose this client to the browser.
 */
export function supabaseServer(): SupabaseClient {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies().set(name, value, options),
            )
          } catch {
            // Called from a Server Component — cookies can't be set. Safe to ignore.
          }
        },
      },
    },
  )
}

/**
 * Server-side Supabase client using the **anon** key + RLS. Use this when you
 * want database row-level security to apply (e.g. user-scoped reads).
 */
export function supabaseServerAnon(): SupabaseClient {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies().set(name, value, options),
            )
          } catch {
            // ignore
          }
        },
      },
    },
  )
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

/** Storage bucket name for product images. Must exist in your Supabase project. */
export const PRODUCT_IMAGES_BUCKET = 'product-images'
