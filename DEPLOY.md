# Deploying Wardrobecare Clothing

This project is a **Next.js 16 (App Router) + Prisma** storefront with a full admin
dashboard. **Everything is pre-configured for deployment** — your production database
is live and fully loaded, and the environment variables are already bundled in the
project (`.env.production`). Unzip → deploy → done.

| Schema | Provider | Used for |
|---|---|---|
| `prisma/schema.prisma` | **PostgreSQL** | Production (Supabase — already connected & loaded) |
| `prisma/schema.sqlite.prisma` | SQLite | Local development (bundled `db/custom.db`) |

The whole site is **server-rendered on demand** (`dynamic = "force-dynamic"` in the
root layout). `next build` **never touches the database** — deploys succeed without
any database access, and admin-dashboard edits go live instantly (no rebuilds).

---

## ✅ Already done for you (nothing to repeat)

| Item | Status |
|---|---|
| Production database (Supabase, Ireland) | ✅ Live — schema pushed |
| Product catalogue | ✅ 532 products / 902 variants / 868 images imported |
| Categories, FAQs, store settings, homepage content | ✅ Seeded |
| Admin account | ✅ `admin@wardrobecare.com` / `wardrobecare2026` |
| Environment variables | ✅ Bundled in `.env.production` (loaded automatically) |
| Product photos | ✅ Included in the deployment (`public/products/`, 1,374 files) |
| Image config fix (`next.config.ts`) | ✅ Included — images render on Vercel |

> ⚠️ **Do NOT re-run** `scripts/import-wc.ts` or `scripts/seed.ts` against the
> production database — the catalogue is already loaded, and re-importing can
> duplicate products.

### One-time schema update — Digital Closet waitlist + gift card tables

The `/digital-closet` page (added after the initial deploy) stores waitlist
sign-ups in a new `WaitlistEntry` table, and the `/gift-card` checkout (added
later) stores purchases in a new `GiftCardPurchase` table. Push both to
production once, from the project folder:

```bash
npx prisma db push --schema=prisma/schema.prisma
```

It adds only the new tables — existing data is untouched. Until this runs, the
rest of the site works normally; only the Digital Closet "Notify Me" form and
the Gift Card checkout will error on submit.

> **Newer note (Google sign-in + email OTP):** the same command also pushes two
> additions the signup flow needs — an `emailVerified` column on the `User`
> table and a `SignupOtp` table for the 6-digit verification codes. If you ran
> the command after those shipped, both are already in place; if not, run it
> once more. Until then, password sign-up/sign-in will error on submit (Google
> sign-in is unaffected).

---

## 1. Deploy to Vercel (2 minutes)

### Option A — Vercel CLI (fastest)

1. Install Node.js 18+ ([nodejs.org](https://nodejs.org), LTS installer) if you
   don't have it, then open a terminal **inside the unzipped project folder**:
   - Windows: open the folder → click the address bar → type `cmd` → Enter
   - Mac: Terminal → type `cd ` → drag the folder in → Enter
2. Run:

   ```bash
   npx vercel login          # sign in with your Vercel account (free)
   npx vercel --prod         # deploy — accept the defaults it suggests
   ```

   First run asks a few questions (project name, framework) — **press Enter to
   accept the detected defaults**. The build runs `prisma generate && next build`
   automatically (the `vercel-build` script) and needs no database access.

3. When it finishes it prints your live URL — e.g.
   `https://fashion-client-7npv.vercel.app`. Open it: products, images and the AI
   chatbot are live, straight from your Supabase database.

### Option B — GitHub

1. Create a **private** repository on GitHub and upload the unzipped project
   (`git init && git add -A && git commit -m "Wardrobecare" && git push`). The
   pre-configured `.env.production` ships with the repo (gitignore already allows it).
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo →
   **Deploy**. No env vars to type, no settings to change.

> Prefer not to include `.env.production` in git? Delete it and instead paste the
> four variables from §2 into Vercel → Settings → Environment Variables — both
> routes produce the same result.

---

## 2. Environment variables (pre-configured)

These already live in **`.env.production`** and are loaded automatically during
build and runtime. You only need them if you prefer dashboard setup, or if you
change something later:

| Variable | Value (pre-set) |
|---|---|
| `DATABASE_URL` | `postgresql://postgres.uvnuhhazklixymhtcshq:mm4you,,A..@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepared_statements=false` |
| `DIRECT_URL` | `postgresql://postgres.uvnuhhazklixymhtcshq:mm4you,,A..@aws-1-eu-west-1.pooler.supabase.com:5432/postgres` |
| `NEXTAUTH_SECRET` | `hhzNdctvn9smxilpARymKf9I9QDcSx6rm22VJ5m2BUY=` |
| `NEXTAUTH_URL` | `https://fashion-client-7npv.vercel.app` |

Notes:
- `DATABASE_URL` uses Supabase's **transaction pooler** (port 6543 + PgBouncer) —
  required on Vercel's serverless runtime. `DIRECT_URL` (session pooler, 5432) is
  used by Prisma CLI for schema operations.
- **Keep these values private** — anyone with them can read your database.
  If you ever need to rotate: change the Supabase password in Project Settings →
  Database, then update both URLs here (and redeploy).
- Vercel-dashboard variables (if any) **override** `.env.production`.

---

## 3. Custom domain (e.g. wardrobecare.com.ng)

1. Vercel → your project → **Settings → Domains** → add the domain.
2. Point DNS as Vercel instructs (A record `76.76.21.21` or CNAME).
3. Edit `.env.production`: set `NEXTAUTH_URL=https://wardrobecare.com.ng`
4. Redeploy (`npx vercel --prod`). Done.

> Login breaks if `NEXTAUTH_URL` doesn't exactly match the address in the browser
> bar (scheme + host), so this step matters when you switch domains.

---

## 3b. Turn on card payments (Paystack) — 2 minutes, no code

1. Create a [paystack.com](https://paystack.com) account (free) and complete
   business verification when you're ready to accept real money.
2. Copy your API keys: dashboard → **Settings → API Keys** → the **Secret Key**
   (`sk_test_…` for testing, `sk_live_…` for real payments) and the
   **Public Key** (`pk_…`).
3. In your site: **Admin → Settings → Payment** → paste the **public key**, paste
   the **secret key**, switch **Enable Paystack** on → **Save**.
4. Checkout now shows "Pay Online" (card, bank transfer, USSD). Payments verify
   automatically and orders flip to **PAID** — stock updates too.
5. In the Paystack dashboard → **Settings → Webhooks**, set the URL to:
   `https://<your-domain>/api/webhooks/paystack`
   (this guarantees payment confirmation even if the customer closes the tab).

> Keys are stored in your database, never in the code. Swap `sk_test_…` for
> `sk_live_…` whenever you're ready — no redeploy needed.

---

## 3c. Turn on Google sign-in + email OTP codes — 10 minutes, no code

New accounts created with email + password must now verify their address with a
**6-digit code** before they can sign in (the code expires in 10 minutes, wrong
entries are capped at 5, resends wait 60 seconds). Customers who sign up with
**Google** skip the code entirely — Google has already verified their address.

Both features are already wired into the site. They switch on with two free
environment variables; until then the signup page says exactly what's missing.

### Email the OTP codes (Resend) — required for production

Without this, the site runs in demo mode: the verification code is **shown on
the screen** instead of being emailed. Fine for testing, not for real customers.

**Your API key is already inside this download** — `.env.production` ships with
a working send-only Resend key, and the build copies it into the standalone
output automatically. Two things remain:

1. **Verify your sending domain** (required before strangers can get mail):
   [resend.com](https://resend.com) → **Domains** → add `wardrobecare.com.ng`
   → add the DNS records Resend shows at your domain registrar → wait for the
   green "Verified" tick.
2. **Tell the site who emails come from** — in Vercel → your project →
   **Settings → Environment Variables** → add:
   - `RESEND_API_KEY` = the `re_…` key (already in `.env.production`; paste it
     here too, Vercel does not read committed env files at runtime)
   - `EMAIL_FROM` = `Wardrobecare <codes@wardrobecare.com.ng>` (only AFTER the
     domain shows Verified — sending from an unverified domain fails)
3. Redeploy. Signup codes now arrive by email.

> Until the domain is verified, Resend only delivers to the account owner's
> own address (`martinonyema90@gmail.com`) — perfect for testing the signup
> flow with your own email, and the exact restriction that domain verification
> lifts.

### Google sign-in (Google Cloud Console)

1. Go to [console.cloud.google.com](https://console.cloud.google.com) →
   **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. Application type: **Web application**.
3. **Authorized redirect URIs** — add both:
   - `https://wardrobecare.com.ng/api/auth/callback/google`
   - `https://fashion-client-7npv.vercel.app/api/auth/callback/google`
   (use your real domains; every address customers can reach you on needs one)
4. Copy the **Client ID** and **Client secret**, then add them in Vercel as:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
5. Redeploy. "Continue with Google" appears on the sign-in and sign-up pages
   and works immediately — existing email customers who use the same address
   land in their original account (no duplicates).

> Until these variables exist, clicking the Google button shows an honest
> "not set up on this site yet" message instead of an error page — that's the
> expected behaviour, not a bug.

---

## 4. Local development (from the download)

The SQLite database (`db/custom.db`) is **included**, and the Prisma client
generates automatically:

```bash
npm install        # or: bun install
npm run dev        # http://localhost:3000
```

`.env` (bundled) keeps local development on SQLite — production values in
`.env.production` do not affect `npm run dev`.

Admin login: `admin@wardrobecare.com` / `wardrobecare2026` → `/admin/login`.

---

## 5. Post-deploy checklist

- [ ] Open `https://<your-domain>` — homepage renders with product photos.
- [ ] Product page → photos, sizes and prices all render.
- [ ] `/admin/login` → sign in → dashboard shows real stats.
- [ ] Ask the AI chatbot (bottom-right): *"show me office shirts under 50000"* —
      it should reply with real product cards from the catalogue.
- [ ] Place a **bank-transfer test order** end-to-end (checkout shows Sparkle
      Bank / Wardrobecare Nigeria Enterprises / 1000447933) and confirm it appears
      in Admin → Orders (mark it cancelled afterwards to keep data clean).
- [ ] WhatsApp links open `wa.me/2348026133770` (footer, services, product pages).
- [ ] `/sitemap.xml` returns product + category URLs.

---

## 6. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Build error: *"the URL must start with the protocol postgresql://"* | **Fixed in this codebase** — pages don't query the DB at build time. If you ever add a static page that queries Prisma, add `export const dynamic = "force-dynamic"`. |
| *"prepared statement s0 already exists"* at runtime | Non-pooled connection in use. `DATABASE_URL` must be the **transaction pooler** URL (port 6543, `?pgbouncer=true&prepared_statements=false`). |
| 500 on every page after deploy | Database unreachable. Check Vercel → Deployments → Runtime Logs; verify `DATABASE_URL` (dashboard overrides `.env.production`). |
| Login loops / CSRF error | `NEXTAUTH_URL` doesn't match the browser address exactly — see §3. |
| Images 404 / broken after a fresh deploy | Make sure the `public/` folder was included (the zip ships it complete; if deploying via git, don't delete `public/products`). |
| "Pay Online" missing at checkout | Paystack isn't fully configured yet — add BOTH keys (public + secret) in Admin → Settings → Payment and enable the toggle. |
| Chatbot replies but shows no product cards | Product search needs the live DB; if the DB is unreachable the bot still answers with general help. Check the runtime logs. |
