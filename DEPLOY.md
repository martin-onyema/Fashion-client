# Deploying Wardrobecare Clothing

This project is a **Next.js 16 (App Router) + Prisma** storefront with a full admin
dashboard. It ships with two Prisma schemas:

| Schema | Provider | Used for |
|---|---|---|
| `prisma/schema.prisma` | **PostgreSQL** | Production (Supabase / Neon / Railway / any Postgres) |
| `prisma/schema.sqlite.prisma` | SQLite | Local development (uses the bundled `db/custom.db`) |

The whole site is **server-rendered on demand** (`dynamic = "force-dynamic"` in the root
layout). `next build` therefore **never touches the database** — deploys succeed even
before your production database exists, and content edited in the admin dashboard is
live immediately (no rebuilds needed).

---

## 1. Environment variables

| Variable | Required | Example / notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres connection string (see §2). Pooled URL on Supabase/Vercel. |
| `DIRECT_URL` | ✅ for DB setup | Direct (non-pooled) URL. Used by `prisma db push` / migrations. Can equal `DATABASE_URL` on simple providers. |
| `NEXTAUTH_SECRET` | ✅ | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | Your live URL, e.g. `https://wardrobecare.com.ng` (no trailing slash) |
| `PAYSTACK_SECRET_KEY` | ⬜ later | Payments phase — the checkout hides "Pay Online" until enabled |

> The bundled `.env` is tuned for **local development** (SQLite). On any hosting
> platform, environment variables you set in the dashboard **override** it.

---

## 2. Option A — Vercel + Supabase (recommended)

### Step 1 — Create the production database (Supabase)
1. Create a project at [supabase.com](https://supabase.com) (region close to Nigeria, e.g. `eu-central-1` / `eu-west-2`).
2. Open **Project Settings → Database → Connection string** and copy:
   - **Transaction pooler** (port `6543`) → this is `DATABASE_URL`.
     Append `?pgbouncer=true&prepared_statements=false` if not present.
     Example:
     `postgresql://postgres.<ref>:<PASSWORD>@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepared_statements=false`
   - **Direct connection** (port `5432`) → this is `DIRECT_URL`.
     Example:
     `postgresql://postgres.<ref>:<PASSWORD>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`

### Step 2 — Push the schema and seed the catalogue
Run these **from your machine** in the project folder (Postgres client is generated
automatically — your local SQLite setup is untouched afterwards as long as you
re-run `bun run db:generate:local` at the end):

```bash
bunx prisma generate                          # generates the PostgreSQL client
DATABASE_URL="<DATABASE_URL>" \
DIRECT_URL="<DIRECT_URL>" \
  bunx prisma db push                         # creates all tables

DATABASE_URL="<DATABASE_URL>" bun scripts/seed.ts        # categories, settings, admin user
DATABASE_URL="<DATABASE_URL>" bun scripts/import-wc.ts   # full 532-product catalogue + images
```

The seed prints your admin login at the end
(`admin@wardrobecare.com` / `wardrobecare2026` — keep these private).

### Step 3 — Deploy to Vercel
1. Push this project to a **GitHub repo** (or use `vercel` CLI: `bunx vercel`).
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
   The `vercel-build` script (`prisma generate && next build`) runs automatically.
3. Before the first deploy, open **Settings → Environment Variables** and add:

   ```
   DATABASE_URL   = <transaction pooler URL from Step 1>
   DIRECT_URL     = <direct URL from Step 1>
   NEXTAUTH_SECRET = <openssl rand -base64 32 output>
   NEXTAUTH_URL   = https://<your-vercel-domain>   (or your custom domain)
   ```

4. Deploy. The build completes without any database access.
5. **Custom domain** (optional): Project → Settings → Domains → add
   `wardrobecare.com.ng`, then point your DNS (A record `76.76.21.21` or CNAME as
   Vercel instructs). Update `NEXTAUTH_URL` to the final domain and redeploy.

---

## 3. Option B — Any Node server (VPS, Railway, Render, Docker)

```bash
bun install                       # or: npm install
bunx prisma generate              # PostgreSQL client from the default schema
bun run build                     # next build + copies assets into .next/standalone

# start (standalone server, no bun required at runtime):
NODE_ENV=production node .next/standalone/server.js
# or with bun:
bun run start
```

The server listens on `PORT` (default 3000). Set the four environment variables
from §1 in your platform's dashboard (or export them in the shell / `.env`).

---

## 4. Local development (from the download)

The database (`db/custom.db`) is **included** — no setup beyond:

```bash
bun install
bun run db:generate:local     # generate the SQLite client
bun run dev                   # http://localhost:3000
```

`.env` (bundled, portable relative path):

```
DATABASE_URL=file:../db/custom.db
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

Admin login: `admin@wardrobecare.com` / `wardrobecare2026` → `/admin/login`.

### Local production preview (optional)

```bash
bun run db:generate:local     # SQLite client + sqlite URL = consistent locally
bun run build
bun run start                 # production server on :3000 using the local DB
```

---

## 5. Post-deploy checklist

- [ ] Open `https://<domain>` — homepage renders products.
- [ ] `/admin/login` → sign in with the seeded admin account → dashboard shows real stats.
- [ ] Place a **bank-transfer test order** end-to-end (checkout shows Sparkle Bank /
      Wardrobecare Nigeria Enterprises / 1000447933) and confirm it appears in
      Admin → Orders. Mark it cancelled afterwards to keep data clean.
- [ ] WhatsApp links open `wa.me/2348026133770` (footer, services, product pages).
- [ ] `/sitemap.xml` returns product + category URLs.
- [ ] Product images load (they are served from `/images/products/...` inside the app).

---

## 6. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Build error: *"the URL must start with the protocol postgresql://"* on `/about` | **Fixed in this codebase** — pages no longer query the DB at build time. If you ever re-introduce a static page that queries Prisma, add `export const dynamic = "force-dynamic"` to it. |
| *"prepared statement s0 already exists"* at runtime | You're using the direct URL with PgBouncer. Use the **transaction pooler** URL (port 6543) with `?pgbouncer=true&prepared_statements=false` as `DATABASE_URL`. |
| 500 on every page after deploy | `DATABASE_URL` missing/wrong in the platform dashboard. Check the platform's runtime logs — storefront queries log `[queries] ... failed` before degrading. |
| Login loops / CSRF error | `NEXTAUTH_URL` doesn't match the address in the browser bar (scheme + host must match exactly). |
| "Pay Online" missing at checkout | Intentional — Paystack activates in the payments phase when keys are added and enabled in Admin → Settings. |
