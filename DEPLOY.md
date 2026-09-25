# Wardrobecare Clothing — Deployment Guide

Complete instructions for taking this project live on Vercel with a Supabase
Postgres database, Resend email, Paystack payments and a hidden admin console.

---

## 1. Deploy to Vercel

**Option A — Vercel CLI (recommended, keeps dotfiles intact):**

```bash
npm i -g vercel
cd <unzipped project folder>
vercel login
vercel --prod
```

**Option B — GitHub web upload:** create a repo, drag-and-drop the files,
then import the repo at vercel.com/new.
⚠️ GitHub's web uploader silently DROPS dotfiles (`.env.example`,
`.env.production`). Use the CLI, `git push`, or re-add them manually.

During import, Vercel auto-detects Next.js. Build command and start command
come from `package.json` (the build runs `prisma generate` first, so the
Postgres client is always generated on any machine).

---

## 2. Environment variables (paste in Vercel)

Vercel Dashboard → your project → Settings → Environment Variables.
Add ALL of these (Production + Preview):

| Variable | Value | Where to get it |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true` | Supabase → Project Settings → Database → **Connection pooling** |
| `NEXTAUTH_SECRET` | 32-byte random string | terminal: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://wardrobecare.com.ng` (while domain not connected: your `https://<project>.vercel.app`) | your own URL |
| `ADMIN_ACCESS_PATH` | `/wardrobe-hq-9xk2` (or any private path you prefer) | you choose it |
| `RESEND_API_KEY` | `re_...` | resend.com → API Keys (already created) |
| `EMAIL_FROM` | `Wardrobecare <codes@wardrobecare.com.ng>` | fixed — domain already verified |
| `PAYSTACK_PUBLIC_KEY` | `pk_live_...` (or `pk_test_...` first) | paystack.com → Settings → API Keys |
| `PAYSTACK_SECRET_KEY` | `sk_live_...` (or `sk_test_...` first) | paystack.com → Settings → API Keys |

Optional:
| `ADMIN_NOTIFY_EMAIL` | `owner@wardrobecare.com.ng` | you choose — fallback alert address for new-order notifications when the store's Support Email setting is empty |

Optional (Google sign-in, when ready):
`GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` from
console.cloud.google.com → Credentials → OAuth client (redirect URI:
`https://<your-site>/api/auth/callback/google`).

---

## 3. Connect the domain

Vercel → Settings → Domains → add `wardrobecare.com.ng` and
`www.wardrobecare.com.ng`. At your registrar, point DNS to the records Vercel
shows (A `76.76.21.21` or CNAME `cname.vercel-dns.com`). HTTPS is automatic.

**After the domain connects:** make sure `NEXTAUTH_URL` matches the URL you
actually browse, then redeploy. A `NEXTAUTH_URL`/browser-URL mismatch
silently breaks every login (this is the #1 cause of "can't sign in").

---

## 4. Admin console access (SECURE)

The admin console is **hidden**:

- Every `/admin/*` URL returns **404 Not Found** to anyone who is not signed
  in as staff — scanners and visitors see nothing, not even a login form.
- You reach it ONLY through your secret path:

  ```
  https://wardrobecare.com.ng/wardrobe-hq-9xk2
  ```

- After signing in, the console loads at the normal `/admin` URLs.
- To change the secret path: edit `ADMIN_ACCESS_PATH` in Vercel → redeploy.

**Default credentials:**

```
URL:      https://<your-domain>/wardrobe-hq-9xk2
Email:    admin@wardrobecare.com
Password: wardrobecare2026
```

**CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN:**
Admin console → Staff → open the admin user → set a new password
(minimum 8 characters). Never reuse the demo password in production.
Credentials are never displayed anywhere in the app.

---

## 5. Security features (built in)

- **Stealth admin route** — `src/middleware.ts` 404s all `/admin/*` for
  non-staff; the secret path internally rewrites to the admin routes without
  ever exposing them in the browser address bar.
- **Brute-force lockout** — logins allow 8 attempts per email per 10 minutes,
  then a 15-minute lockout. The response is identical to a wrong password, so
  attackers learn nothing. Registrations are capped at 5 per hour per IP.
- **Security headers** — `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, HSTS (2 years) and `Cross-Origin-Opener-Policy` are
  sent on every response (`next.config.ts`).
- **Session security** — signed, encrypted NextAuth JWT sessions; staff role
  is re-verified against the database on every admin page load
  (`requireAdmin()`), and deactivated accounts cannot sign in.
- **Payment integrity** — Paystack webhooks are verified with HMAC-SHA512
  signatures before any order state changes.
- **Input validation** — every form/server action validates input with Zod;
  passwords are bcrypt-hashed (never stored in plain text).

## 5b. Transactional emails (Resend — activated by the 2 variables in §2)

Once `RESEND_API_KEY` + `EMAIL_FROM` are set in Vercel, the store
automatically sends (no further setup — emails come from your verified
domain `codes@wardrobecare.com.ng`):

| Email | When it fires | To |
|---|---|---|
| Order confirmation | order placed (WhatsApp or Paystack) | customer |
| Payment receipt | Paystack confirms payment (webhook or verification) | customer |
| Shipping/tracking update | staff adds or changes a tracking number | customer |
| Refund confirmation | refund processed in admin | customer |
| New-order alert | every new order | store owner |

Emails are fully optional: without the key the store runs normally and
simply skips sending (nothing breaks, nothing blocks checkout). If the
Support Email is set in Admin → Settings, customer emails get a working
reply-to and the owner receives the new-order alerts there.

---

## 6. Troubleshooting

**Build fails with `URL must start with the protocol postgresql://`**
Already fixed in this codebase: DB-touching pages (`sitemap`, gift-card
checkout, service pages) are dynamic and tolerate a missing `DATABASE_URL`
at build time, and the build command runs `prisma generate` first. If you
still see it, confirm `DATABASE_URL` is set for *Production* in Vercel.

**Can't sign in anywhere (admin or customer)**
`NEXTAUTH_URL` doesn't match the URL in your browser's address bar.
Fix the variable (or browse the matching URL) and redeploy. Also avoid
incognito windows that block cookies.

**Admin returns 404 for me**
You opened `/admin` directly. Use your secret path
(`/wardrobe-hq-9xk2`) to sign in first — after that `/admin` works.

**Locked out by rate limiting**
15 minutes. It resets automatically — another reason to set a password
you remember before deploying.

**Windows unzip dropped `.env.production`**
Some Windows unzip tools hide dotfiles; the file is inside the zip. Use
`7-Zip` or `Explorer → View → Show → Hidden items` to see it. It is a
reference template only — Vercel env vars come from the dashboard.

**Emails not sending**
Check `RESEND_API_KEY` + `EMAIL_FROM` are set in Vercel, and that the
`EMAIL_FROM` address uses the verified domain
(`codes@wardrobecare.com.ng` — verified).

---

## 7. Post-launch checklist

- [ ] All 8 environment variables set in Vercel (§2)
- [ ] First deploy succeeded (`vercel --prod` or GitHub import)
- [ ] Domain connected + HTTPS active (§3)
- [ ] `NEXTAUTH_URL` = the URL you actually browse
- [ ] Paystack switched to live keys; webhook URL
      `https://<your-domain>/api/webhooks/paystack` added in Paystack dashboard
- [ ] Admin password changed from the demo default (§4)
- [ ] Smoke test: browse store → add to cart → checkout → order appears in admin
- [ ] Smoke test: customer sign-up + sign-in
- [ ] Optional: Google OAuth keys added
- [ ] Optional: back up `DATABASE_URL` credentials in a password manager
