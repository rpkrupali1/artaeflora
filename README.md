# ArtaeFlora — artaeflora.com

> Handmade with love, as unique as your bond.

Website for **ArtaeFlora** (Naperville, IL) — handmade clay flowers, candles, custom paintings, art classes, and event workshops by Krupali & Ishna. Public shop + inquiry pages with an admin panel for managing products, classes, gallery, hero slides, and orders.

📋 [PLAN.md](PLAN.md) — approved feature plan and design system
🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) — system diagrams, data model (ERD), request flows, image strategy
🚀 [DEPLOYMENT.md](DEPLOYMENT.md) — owner-executed launch guide: GitHub → Neon prod → Cloudinary → Stripe → Vercel → domain → go-live checklist

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Styling | Tailwind CSS v4 (brand tokens in `src/app/globals.css`) |
| Database | Postgres on [Neon](https://neon.tech) via Prisma 6 + Neon serverless driver (HTTPS) |
| Payments | Stripe Checkout *(step 4)* |
| Auth (admin) | Custom session: bcrypt + HMAC-signed httpOnly cookie (`src/lib/auth.ts`) — NextAuth was planned, but the corporate registry serves a conflicting `@auth/core` package |
| Images | Cloudinary (prod) / `public/uploads` (dev) *(step 5)* |

## Getting Started

Prereqs: Node 22+, npm, a Neon database (free tier).

```powershell
git clone <repo> && cd artaeflora
npm install
copy .env.example .env     # then fill in DATABASE_URL (Neon connection string)
npm run db:push:http       # create tables (see network note below)
npm run db:seed            # sample categories/products/gallery + admin user
npm run dev                # http://localhost:3000
```

Secrets live only in `.env` (git-ignored). Never commit connection strings or keys; `.env.example` documents every variable.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:3000 (first page load compiles, ~5s) |
| `npm run build` / `start` | Production build / serve |
| `npm run db:push:http` | ⚠️ **Destructive** schema push over HTTPS: drops + recreates all tables from `prisma/schema.prisma`. Dev only — always `db:seed` after |
| `npm run db:push` | Standard Prisma push — only works on networks where TCP 5432 is open |
| `npm run db:seed` | Seed sample data (idempotent — safe to re-run) |
| `npm run db:query` | Query playground: edit `scripts/query.ts`, run, learn Prisma |
| `npm run db:studio` | Prisma Studio GUI — needs TCP 5432 (blocked on corp networks → use the [Neon Console](https://console.neon.tech) Tables/SQL Editor instead) |

## Corporate-Network Notes

Two constraints this repo already handles — don't fight them:

1. **npm 7-day cool-off** — the Artifactory registry blocks package versions published <7 days ago. The project `.npmrc` pins resolution with `before=`, so installs just work (~1 week behind latest). Bump the date occasionally.
2. **Outbound TCP 5432 blocked** — the app talks to Neon over **HTTPS (port 443)** via `@neondatabase/serverless` + Prisma driver adapter (`src/lib/db.ts`). This is also the recommended setup for serverless hosting, so dev and prod match. Schema changes use `db:push:http` (generates DDL locally, applies over HTTPS).

## Project Structure

```
brand-assets/        Original logo + business cards (reference only, never served)
docs/                Business questionnaire and reference docs
prisma/              schema.prisma, seed.ts
public/brand/        Web-ready transparent logos
public/hero/         Home hero slides (admin-managed from step 5)
public/products/     Placeholder product images until real photos are uploaded
scripts/             query.ts (playground), push-http.ts, test-neon.ts
src/app/             Pages (App Router) + globals.css (brand theme tokens)
src/components/      Header, Footer, Hero, WhatsAppButton, …
src/lib/             db.ts (Prisma + Neon adapter), site.ts (business facts: tagline,
                     contacts, socials, announcement — edit once, changes everywhere)
```

## Build Progress

- [x] **Step 1 — Scaffold + branding**: theme from business cards (olive/sage/daisy/cream), header with logo + announcement pill, rotating photo hero, footer, WhatsApp button
- [x] **Step 2 — Database**: 11-table schema on Neon Postgres, seeded (10 products, 11 categories, gallery, hero slides, settings, admin user)
- [x] **Step 3 — Public pages**: shop (category landing → product grids), product detail, search, paintings, classes, events, gallery, about, contact + header icons (search/user/cart)
- [x] **Step 4 — Cart + Stripe checkout**: localStorage cart, DB-validated pricing, flat-rate shipping (admin-configurable), Stripe Checkout with mock mode until keys exist; API tests in `scripts/test-checkout.ts`
- [x] **Step 5 — Admin panel**: products/categories/classes/gallery/hero/settings CRUD, orders + inquiries, image uploads (Cloudinary or local); auth tests in `scripts/test-admin-auth.ts`
- [x] **Step 6 — SEO + polish**: OpenGraph share card, LocalBusiness + Product JSON-LD, sitemap.xml, robots.txt, daisy favicon, branded 404
- [ ] **Step 7 — Deployment guide**: Neon prod branch, Cloudinary, Stripe live keys, Vercel/Render, artaeflora.com domain

**Phase 2 (post-launch):** customer accounts + order history, class online booking with seat caps, PayPal, live-chat widget, email notifications, reviews.

## Admin

Seeded admin login: `artaeflora@gmail.com` — password comes from `ADMIN_PASSWORD` in `.env` at seed time (or the placeholder in `prisma/seed.ts`). **Set a real password before deploying.** Admin panel UI arrives in step 5.
