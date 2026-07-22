# ArtaeFlora Website — Implementation Plan

## Context

Build a website from scratch for **ArtaeFlora** (Naperville, IL) — a handmade-gifts business selling candles and custom paintings, plus art classes and event workshops. Requirements come from [Business_and_Content_Questions.txt](Business_and_Content_Questions.txt) and follow-up answers:

- **Products with a price** (e.g., candles) → real listings with cart + online checkout
- **Paintings** → inquiry-only (custom work, gallery of reference photos)
- **Workshops/Events** → inquiry-only (form + WhatsApp/call)
- **Classes** → placeholder section for now; admin can add/update class listings later (schema built now, booking in phase 2)
- **Admin panel** → owner can add/remove/update listings, manage gallery, view orders and inquiries
- **Payments** → US-standard cards (Visa/Mastercard/Amex) via **Stripe Checkout**; PayPal possible later
- **Hosting** → free tier initially, scale to paid if traffic grows
- English only, local SEO for Naperville, IL

## Business Details (from business cards in `images/`)

- **Brand**: ArtaeFlora — "Unique Handmades" / "Clay Crafts n More", by Krupali & Ishna (clay artists)
- **Tagline**: "Handmade with love, as unique as your bond." — used in hero, browser title, footer
- **Section punchlines**: Classes — "Unplug. Create. Take home something beautiful." · Paintings — "Your story, painted by hand." · Events — "We bring the art studio to your celebration." · Occasions — "A handmade touch for every celebration — Diwali to Christmas."
- **Product range**: handmade natural-looking clay flowers, candles & candle holders, bonsais, mugs, jewelry, magnets, miniatures, custom paintings, and more
- **Email**: artaeflora@gmail.com
- **Phone**: 224-715-0463 · **WhatsApp Business**: +1 (313) 355-4447 (used for the WhatsApp button)
- **Social**: [Instagram](https://www.instagram.com/artaeflora/) · [Pinterest](https://www.pinterest.com/artaeflora/) · Facebook (@artaeflora)
- **Logos**: primary logo `logo.png` (hand-drawn flower wordmark); secondary candles-line logo (`images/2.png`)

## Brand & UI Design System (from `logo.png` + `images/1-4.png`)

**Color tokens** (Tailwind theme):

| Token | Hex | Source / Use |
|---|---|---|
| `olive` | `#A79A3D` | Card background gold-green — headers, footer, section bands, primary buttons |
| `leaf` | `#2C5F2D` | Dark green card text — headings, links, button hover |
| `sage` | `#BCD79E` | Light green highlight band — badges, pills, hover fills, form accents |
| `daisy` | `#F5C842` | Daisy center yellow — accents, icons, star/highlight details, CTAs |
| `cream` | `#FAF9F2` | Off-white — page background |
| `charcoal` | `#2B2B2B` | Logo black — body text |

**Typography** (Google Fonts): script display font for brand headings (e.g., *Great Vibes* — matches the card's "ArtaeFlora" script), a casual handwritten secondary (e.g., *Caveat* — matches the logo lettering), and a soft rounded sans for body/UI (e.g., *Quicksand*).

**Visual language**: rounded-2xl cards with soft shadows on cream; olive section bands with sage line-art floral/ginkgo accents (as on the cards); sage pill badges for occasions/categories; daisy-yellow accents used sparingly; real product photography front and center; WhatsApp green floating button bottom-right.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router, TypeScript)** | One Node.js app = public site + admin panel + API. (NestJS rejected: backend-only, would need a second app.) |
| Styling | Tailwind CSS | Brand theme per the design system below (green/yellow/white palette from the business cards + logo) |
| Database | Postgres on **Neon** (free tier) via **Prisma ORM** | Free 0.5 GB, works from any host, easy migrations |
| Images | **Cloudinary** free tier | Product/gallery photo uploads from the admin panel, automatic resizing/optimization |
| Auth (admin) | **NextAuth (Auth.js)** credentials provider, single admin user, bcrypt-hashed password | Simple, no third-party signup needed |
| Payments | **Stripe Checkout** (test mode during build) | Visa/MC/Amex/Discover + Apple Pay/Google Pay; no monthly fee |
| Hosting | **Vercel** (primary recommendation) or Render free tier — deployment documented, executed by the owner | $0 to start; upgrade path documented |

## Site Structure (public)

1. **Home** — rotating hero (admin-managed slides: JPEG/PNG/GIF images or short muted looping videos, crossfading with tagline + CTAs in front; falls back to built-in daisy photos when none are configured), featured products, shop-by-occasion strip (Diwali, Birthdays, Weddings, Rakhi, Corporate, Christmas), classes/events teasers, Instagram/Pinterest/Facebook links
2. **Shop** (`/shop`) — priced products, filter by category (Candles + subcategories, Clay Flowers, Candle Holders, Bonsais, Mugs, Jewelry, Magnets, Miniatures) and occasion; product detail page with photo gallery, add-to-cart
3. **Cart & Checkout** (`/cart`) — cart page → Stripe Checkout; shipping **or local pickup (Naperville)** choice; success/cancel pages
4. **Custom Paintings** (`/paintings`) — reference-work gallery + inquiry form + WhatsApp button (no prices, no cart)
5. **Classes** (`/classes`) — placeholder page ("Classes coming soon — join the list / inquire"); when admin adds a class it renders as a detail card (title, description, location type: studio/venue/online, max 10 seats, price) with an inquiry CTA
6. **Events** (`/events`) — art activities for corporate events/parties; inquiry form (event type, date, headcount, venue) + contact methods
7. **Gallery** (`/gallery`) — portfolio of past work, filterable (candles / paintings / classes / events)
8. **About & Contact** (`/about`, `/contact`) — story, Naperville location, WhatsApp/call/email, social links

Cross-cutting: WhatsApp floating button on every page (this is the chat channel for launch; a live-chat widget like Tawk.to is a post-launch decision); SEO metadata + `LocalBusiness` JSON-LD (Naperville, IL); mobile-first responsive.

**Header utility icons** (right of nav, built in step 3):
- **Search** — icon opens a search box; `/search?q=` queries products by name, description, and occasion tags
- **User** — links to a sign-in page: admin login + "customer accounts coming soon" note (full customer accounts are Phase 2; launch uses guest checkout — Stripe collects the buyer's email)
- **Cart** — icon with live item-count badge (cart logic lands in step 4)

## Admin Panel (`/admin`, login-protected)

- **Dashboard** — recent orders + new inquiries at a glance
- **Products** — CRUD: name, description, category/subcategory, occasion tags, price OR "inquiry-only" flag, multiple photos (Cloudinary upload), in-stock/active toggle
- **Categories** — CRUD (Candles subcategories etc.)
- **Classes** — CRUD (title, description, location type, schedule text, price, capacity, active) — powers the placeholder → live transition
- **Gallery** — upload/tag/delete portfolio images
- **Hero slides** — upload image (JPEG/PNG/GIF) or short video (MP4/WebM) slides for the home hero; reorder, caption, activate/deactivate
- **Site settings** — announcement-bar text (promo strip above the header) with show/hide toggle; extensible key-value store for future settings
- **Orders** — list Stripe orders with status (paid/fulfilled), mark fulfilled
- **Inquiries** — inbox of painting/event/class/general inquiries, mark handled

## Data Model (Prisma)

`AdminUser`, `Category` (self-relation for subcategories), `Product` (+ `inquiryOnly` flag, occasion tags), `ProductImage`, `Class`, `Order` + `OrderItem` (Stripe session id, fulfillment status, shipping vs pickup), `Inquiry` (type enum: PAINTING | EVENT | CLASS | GENERAL), `GalleryItem`, `HeroSlide` (mediaType IMAGE | VIDEO, url, caption, sortOrder, active), `SiteSetting` (key-value, e.g. announcement text + enabled flag).

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) — system overview, data model (ERD), and the checkout/inquiry/admin request flows.

## Implementation Steps

1. **Scaffold** — `create-next-app` (TS, Tailwind, App Router) in `C:\kp\git\artaeflora`, git init, brand theme tokens from logo, base layout (header/nav/footer, WhatsApp button)
2. **Database** — Prisma schema (models above). Postgres via `DATABASE_URL` from day one (a free Neon database works for both dev and prod — no local Postgres install needed; documented in README). Seed script: sample categories, ~8 sample products, gallery items, admin user
3. **Public pages** — Home, Shop + product detail, Paintings, Classes placeholder, Events, Gallery, About/Contact; inquiry forms writing to `Inquiry`
4. **Cart + Stripe** — client cart (localStorage + React context), checkout API route creating a Stripe Checkout Session (test keys), webhook to record `Order`, success/cancel pages, pickup-vs-shipping option
5. **Admin panel** — NextAuth credentials login, protected `/admin` layout, CRUD screens for products/categories/classes/gallery, orders + inquiries views, Cloudinary upload widget
6. **SEO & polish** — metadata, OpenGraph, JSON-LD, sitemap, favicon from logo, responsive pass
7. **Docs** — README with: env vars needed (`DATABASE_URL`, `NEXTAUTH_SECRET`, Stripe keys, Cloudinary keys), how to run locally, and a step-by-step **deployment guide** (Neon + Cloudinary + Stripe live keys + Vercel/Render + buying `artaeflora.com` ~$12/yr). Per workspace policy I build and verify locally; the owner performs the actual external deployment.

## Out of Scope (Phase 2, noted in README)

- **Customer accounts / user management** — registration, login, password reset (requires an email service), order history. Launch uses guest checkout; the header user icon links to a "coming soon" sign-in page in the meantime.
- **Live-chat widget** (e.g., Tawk.to) — WhatsApp is the chat channel at launch; revisit based on customer behavior.
- Class online booking with seat caps + payment, PayPal, email notifications, reviews.

## Verification

- `npm run dev` locally; browse every public page via the browser preview
- Admin: log in, create/edit/delete a product with photo upload, verify it appears in the shop
- Submit painting + event inquiry forms, confirm they show in admin inbox
- Cart → Stripe **test-mode** checkout with test card `4242…`, confirm webhook records the order and it appears in admin orders
- Mobile viewport check (responsive) and Lighthouse-style sanity pass on SEO metadata
