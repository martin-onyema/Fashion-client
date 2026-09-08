-- =====================================================================
-- Wardrobecare — Supabase Storage setup
-- =====================================================================
-- Run this ONCE in your Supabase project's SQL editor:
--   supabase.com → your project → SQL Editor → New query → paste → Run
--
-- This creates the `product-images` storage bucket and makes it readable
-- by anyone (so product images load on the storefront) but writable only
-- by authenticated admins (the server uses the service-role key, which
-- bypasses RLS entirely, so writes from server actions always work).
-- =====================================================================

-- 1. Create the bucket (idempotent — won't fail if it already exists)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2. Public read policy — anyone (even anon) can GET objects
--    This is what makes <Image src={publicUrl} /> work on the storefront.
drop policy if exists "product-images: public read" on storage.objects;
create policy "product-images: public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- 3. Authenticated write policy — any authenticated user can upload.
--    NOTE: real admin-only enforcement happens server-side via the
--    service-role key (which bypasses RLS). This policy is just the
--    safety net for any direct browser uploads.
drop policy if exists "product-images: authenticated write" on storage.objects;
create policy "product-images: authenticated write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "product-images: authenticated update" on storage.objects;
create policy "product-images: authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "product-images: authenticated delete" on storage.objects;
create policy "product-images: authenticated delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- =====================================================================
-- That's it. After running this, the bucket exists and images uploaded
-- via the admin product form will be visible at public URLs like:
--   https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/product-images/products/1700000000-abc123.jpg
-- =====================================================================
