# ArtaeFlora — Deployment Guide

Step-by-step path from this repo to a live artaeflora.com. Each phase is
independent — you can stop after any of them and pick up later. Estimated
total hands-on time: **2–3 hours** spread over a few sessions.

> Run all commands from `C:\kp\git\artaeflora`. Nothing here is executed for
> you — this project's workspace policy is that deployment is owner-performed.

## Costs at a glance

| Item | Cost | When |
|---|---|---|
| Neon Postgres | $0 (free tier) | already have it |
| Cloudinary images | $0 (free tier) | phase 3 |
| Stripe | $0 monthly — 2.9% + 30¢ per sale | phase 4 |
| Hosting | $0 to start (see phase 5 trade-off) | phase 5 |
| Domain artaeflora.com | ~$10–12/year | phase 6 |

## Phase 1 — Put the code on GitHub

Hosting platforms deploy from a git repo.

1. Create a **private** repo at github.com (e.g. `artaeflora`)
2. Push:
   ```powershell
   git remote add origin https://github.com/<your-user>/artaeflora.git
   git push -u origin main
   ```
3. Sanity check on github.com: `.env` must **NOT** appear in the repo
   (it's git-ignored; only `.env.example` should be there).

## Phase 2 — Production database (Neon)

Heads-up: Neon names a new project's default branch **`production`** — and all
development so far (sample products, test orders) has happened on it. So the
job is the reverse of what you might expect: move *development* onto its own
branch, then wipe `production` clean for real use.

1. In the [Neon console](https://console.neon.tech): **Branches → New branch**,
   name `development`, parent `production` (instant copy — sample data included)
2. Put the **development** branch's connection string into your local `.env`
   `DATABASE_URL`. Restart the dev server; `npm run db:query` should show the
   familiar sample products. All local work now happens here.
3. When ready to deploy, wipe and rebuild the `production` branch — temporarily
   point `.env`'s `DATABASE_URL` at the **production** string, then:
   ```powershell
   npm run db:push:http
   ```
   (drops the sample data, creates a fresh empty schema — intended!)
4. **Do not run `db:seed`** (no sample products in production).
   Create just the admin login:
   ```powershell
   $env:NEW_ADMIN_PASSWORD="a-long-strong-password-you-store-in-a-password-manager"
   npx tsx --env-file=.env scripts/set-admin-password.ts
   ```
5. Point `.env` back at the `development` string. The production string is
   used in exactly one more place: phase 5's environment variables.

## Phase 3 — Cloudinary (image/video hosting)

1. Sign up at [cloudinary.com](https://cloudinary.com) (free plan)
2. Dashboard → copy the **API environment variable** — it looks like
   `cloudinary://123456789:abcdefg@yourcloud`
3. Save it for phase 5 as `CLOUDINARY_URL`. Uploads from the admin panel
   land in `artaeflora/products|gallery|hero` folders automatically.

## Phase 4 — Stripe (payments)

1. Sign up at [stripe.com](https://stripe.com), complete business activation
   (identity + bank account for payouts — this is the longest wait, sometimes a day)
2. Developers → API keys → copy the **live** `sk_live_…` secret key and
   `pk_live_…` publishable key
3. Webhook (after phase 5 gives you a URL): Developers → Webhooks → Add endpoint
   - URL: `https://artaeflora.com/api/webhooks/stripe`
   - Event: `checkout.session.completed`
   - Copy the signing secret `whsec_…`
4. Save all three for phase 5.

Until these keys are set, production checkout returns a friendly
"temporarily unavailable — order via WhatsApp" message (mock mode is
dev-only by design).

## Phase 5 — Hosting

**The honest trade-off:**

| Option | Cost | Catch |
|---|---|---|
| **Vercel Hobby** | $0 | Best Next.js experience, but the Hobby plan's terms are for *non-commercial* use — fine while you validate, upgrade to Pro ($20/mo) once real sales flow |
| **Render free** | $0 | No commercial restriction, but the app sleeps when idle — first visitor after a quiet period waits ~30–50 s |
| Render Starter | $7/mo | Always-on, no restrictions — the cheapest "proper" option |

Recommendation: **Vercel** for the launch experience; budget the Pro upgrade
as part of "the business is working."

**What about AWS / Google Cloud?** Not cheaper in any way that matters at
launch: today's comparison is $0 (Vercel/Render free) vs ~$0 (cloud free
tiers), and the hyperscalers charge you in *time* instead — Dockerfile, build
pipeline, CDN/TLS/domain wiring, cold-start tuning, and self-hosting the
Next.js features (image optimization, ISR) that Vercel runs out of the box.
The trade-off only flips if the Vercel Pro fee ($20/mo) starts to rankle:
at that point **GCP Cloud Run** is the right alternative (~$3/mo, scales to
zero). Nothing in this codebase is Vercel-specific — standard Next.js + Neon
over HTTPS + Cloudinary — so that future migration is a Dockerfile and a
build pipeline, not a rewrite. AWS EC2/Lightsail (~$4/mo) is not recommended:
it makes you the sysadmin (patches, TLS renewal, deploys) to save three
dollars.

Vercel steps:
1. Sign up at [vercel.com](https://vercel.com) with your GitHub account
2. **Add New → Project** → import the `artaeflora` repo (build settings are
   auto-detected; `npm run build` already runs `prisma generate`)
3. Before the first deploy, add **Environment Variables**:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | production Neon string (phase 2) |
   | `AUTH_SECRET` | **fresh** secret — generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` — do NOT reuse the dev one |
   | `CLOUDINARY_URL` | from phase 3 |
   | `STRIPE_SECRET_KEY` | `sk_live_…` |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_…` (add after phase 4 step 3) |
   | `NEXT_PUBLIC_SITE_URL` | `https://artaeflora.com` |

4. Deploy → you get `artaeflora-xxx.vercel.app`. Use that URL to create the
   Stripe webhook (phase 4 step 3), add the `whsec_…` env var, redeploy.

## Phase 6 — Domain

1. Buy `artaeflora.com` — [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)
   (at-cost, ~$10/yr) or Namecheap
2. Vercel → project → Settings → Domains → add `artaeflora.com` and follow
   the DNS instructions it shows (two records at the registrar)
3. HTTPS certificate is automatic. Update the Stripe webhook URL to the real
   domain if you created it with the vercel.app URL.

## Phase 7 — Go-live checklist

- [ ] Sign in to `https://artaeflora.com/admin` with the phase-2 password
- [ ] Delete/replace sample-looking content; add real products with real photos
      (uploads now go to Cloudinary), set the hero slides, announcement, shipping rate
- [ ] **Real-money test**: buy a cheap product with your own card → confirm the
      order appears in Admin → Orders with address + shipping → refund yourself
      in the Stripe dashboard
- [ ] Submit each inquiry form once; confirm they land in Admin → Inquiries
- [ ] Phone check: browse, cart, checkout on your phone over cellular
- [ ] Share the URL in a WhatsApp chat — verify the branded share card appears
- [ ] Submit `https://artaeflora.com/sitemap.xml` in
      [Google Search Console](https://search.google.com/search-console) (verify the
      domain first) — this is what gets you into Google
- [ ] Create a [Google Business Profile](https://business.google.com) (Naperville
      handmade gifts) and link the website — biggest local-SEO lever there is
- [ ] Add the site link to your Instagram/Pinterest/Facebook bios

## Ongoing operations

- **Schema changes after launch**: `db:push:http` is destructive (drops data) —
  never point it at production once real orders exist. For additive changes,
  generate the SQL (`npx prisma migrate diff --from-url <prod-url> --to-schema-datamodel prisma/schema.prisma --script`
  from a network with port 5432, e.g. home) and apply it via Neon's SQL Editor.
- **Backups**: Neon free tier keeps ~24h point-in-time restore. Before risky
  changes, take a manual branch (Branches → New branch = instant snapshot).
- **Monitoring**: Vercel → Analytics (free tier) for traffic; Stripe emails you
  every sale; check Admin → Inquiries routinely (email notifications are Phase 2).
- **Upgrade triggers**: Vercel Pro when sales are real (ToS), Neon paid if you
  outgrow 0.5 GB (thousands of products — unlikely soon), Cloudinary paid at
  ~25 GB/month bandwidth.
