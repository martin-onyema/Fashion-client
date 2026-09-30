# Wardrobecare — Vercel deployment

## Fixes included

- Removed the obsolete `src/middleware.ts`; Next.js 16 uses `src/proxy.ts`.
- Restored the category-hub server wrapper expected by:
  - `/accessories`
  - `/clothing`
  - `/footwear`
  - `/fragrance-grooming`
- Restored `HubData` / `HubSection` types and `getHubData()` in `src/lib/queries.ts`.
- Kept the existing editorial category-hub UI in `src/components/shop/category-hub-content.tsx`.
- Expanded `.env.example` with the production variables used by the application.
- No real `.env` or `.env.production` files are included in this deployment package.

## Vercel settings

The repository can use the existing `vercel.json`:

- Framework: Next.js
- Install command: `npm install`
- Build command: `npm run vercel-build`

The build command runs:

```text
prisma generate && next build
```

## Required Vercel environment variables

Set these in Vercel Project Settings → Environment Variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ADMIN_ACCESS_PATH`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_SECRET_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `ADMIN_NOTIFY_EMAIL`

Also set:

- `NEXT_PUBLIC_SITE_NAME=Wardrobecare Clothing`

Use the production Supabase/Postgres connection strings for `DATABASE_URL` and `DIRECT_URL`; do not use the local SQLite `file:` URL in Vercel.

## After uploading/pushing

Run:

```powershell
npm install
npm run vercel-build
```

Then push the clean source:

```powershell
git add .
git commit -m "Fix Vercel build"
git push origin main
```

Do not force-push for this follow-up fix because the fresh `Fashion-client` history is already established.

## Production fixes applied

- Product image URLs now normalize legacy `/product-images/<slug>__<filename>` records to bundled `/images/<filename>` assets. Supabase Storage URLs continue to work unchanged.
- Prisma is reused across warm Vercel/serverless invocations and production query logging is disabled except for errors.
- The admin dashboard no longer performs a second database lookup just to calculate sidebar permissions after `requireAdmin()` has already validated the staff user.
- Recent admin orders now select only the fields rendered by the dashboard instead of loading full order items and user records.

### Supabase Storage

New product uploads still use the `product-images` public bucket. The SQL setup is in `scripts/supabase-storage.sql`.
