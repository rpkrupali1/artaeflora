# ArtaeFlora — Architecture

Companion to [PLAN.md](PLAN.md). Diagrams are in Mermaid (rendered by GitHub, VS Code, and most Markdown viewers).

## 1. System Overview

One Next.js (App Router) application serves three surfaces — the public site, the admin panel, and the API routes — backed by Postgres and two external services (Stripe for payments, Cloudinary for image storage).

```mermaid
flowchart LR
    subgraph Client["Visitor / Owner Browser"]
        PUB["Public site<br/>Home · Shop · Paintings · Classes<br/>Events · Gallery · About · Contact"]
        CART["Cart (localStorage + React context)"]
        ADM["Admin panel /admin<br/>(owner only, login)"]
    end

    subgraph App["Next.js App (Node.js) — Vercel/Render"]
        SSR["Server components<br/>(pages, data fetching)"]
        API["API routes<br/>/api/checkout · /api/inquiries<br/>/api/admin/* · /api/upload · /api/webhooks/stripe"]
        AUTH["NextAuth (credentials)<br/>protects /admin + /api/admin/*"]
    end

    subgraph Data["Data & Services"]
        DB[("Postgres (Neon free tier)<br/>via Prisma ORM")]
        STRIPE["Stripe Checkout<br/>(cards, Apple/Google Pay)"]
        CLD["Cloudinary<br/>(product & gallery images)"]
    end

    WA["WhatsApp Business<br/>+1 (313) 355-4447"]

    PUB --> SSR
    CART -->|"checkout"| API
    ADM --> AUTH --> API
    SSR --> DB
    API --> DB
    API -->|"create session"| STRIPE
    STRIPE -->|"webhook: payment complete"| API
    API -->|"upload"| CLD
    PUB -.->|"floating button / inquiry links"| WA
```

**Key decisions**

- **Single app** — public site, admin, and API in one Next.js codebase; one deploy, one free-tier host.
- **Server components by default** — product/gallery/class data is fetched on the server (good SEO for local search); the cart is the main client-side piece.
- **Stripe Checkout (hosted page)** — card data never touches our app; we only create a session and receive a webhook. No PCI burden.
- **Images in Cloudinary, not the database** — DB stores URLs only; Cloudinary resizes/optimizes. Local-disk fallback in development.
- **Inquiry-first for custom work** — paintings/events/classes create `Inquiry` rows (plus WhatsApp deep links); only priced products go through Stripe.

## 2. Data Model (ERD)

```mermaid
erDiagram
    Category ||--o{ Category : "subcategories"
    Category ||--o{ Product : "has"
    Product ||--o{ ProductImage : "photos"
    Product ||--o{ OrderItem : "ordered as"
    Order ||--|{ OrderItem : "contains"

    AdminUser {
        string id PK
        string email
        string passwordHash
    }
    Category {
        string id PK
        string name
        string slug
        string parentId FK "nullable — subcategory"
    }
    Product {
        string id PK
        string name
        string slug
        string description
        int priceCents "null when inquiryOnly"
        boolean inquiryOnly "paintings/custom work"
        string occasions "tags: Diwali, Wedding, ..."
        boolean active
        string categoryId FK
    }
    ProductImage {
        string id PK
        string url "Cloudinary URL"
        int sortOrder
        string productId FK
    }
    Class {
        string id PK
        string title
        string description
        string locationType "STUDIO | VENUE | ONLINE"
        string scheduleText
        int priceCents
        int capacity "max 10"
        boolean active "false = placeholder page"
    }
    Order {
        string id PK
        string stripeSessionId
        string customerName
        string customerEmail
        string fulfillment "SHIPPING | PICKUP"
        string status "PAID | FULFILLED"
        int totalCents
        datetime createdAt
    }
    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        int quantity
        int unitPriceCents "price at purchase time"
    }
    Inquiry {
        string id PK
        string type "PAINTING | EVENT | CLASS | GENERAL"
        string name
        string email
        string phone
        string message
        string details "event date/headcount/venue etc."
        boolean handled
        datetime createdAt
    }
    GalleryItem {
        string id PK
        string url "Cloudinary URL"
        string caption
        string tag "candles | paintings | classes | events"
    }
    HeroSlide {
        string id PK
        string mediaType "IMAGE | VIDEO"
        string url "Cloudinary URL (jpeg, png, gif, mp4, webm)"
        string caption "optional overlay text"
        int sortOrder
        boolean active
    }
    SiteSetting {
        string key PK "e.g. announcementText, announcementEnabled"
        string value
    }
```

## 3. Checkout Flow (priced products)

```mermaid
sequenceDiagram
    actor C as Customer
    participant S as Next.js site
    participant API as /api/checkout
    participant ST as Stripe
    participant WH as /api/webhooks/stripe
    participant DB as Postgres

    C->>S: Add products to cart (localStorage)
    C->>S: Cart page — choose Shipping or Local Pickup (Naperville)
    S->>API: POST cart items + fulfillment choice
    API->>DB: Re-validate products, prices, active flags
    API->>ST: Create Checkout Session (line items, shipping option)
    ST-->>C: Hosted Stripe payment page (Visa/MC/Amex/Apple Pay/Google Pay)
    C->>ST: Pays
    ST->>WH: checkout.session.completed (signed webhook)
    WH->>DB: Create Order + OrderItems (status PAID)
    ST-->>C: Redirect to /checkout/success
    Note over DB: Order now visible in Admin → Orders,<br/>owner marks FULFILLED after shipping/pickup
```

## 4. Inquiry Flow (paintings · events · classes · general)

```mermaid
sequenceDiagram
    actor C as Customer
    participant S as Paintings/Events/Contact page
    participant API as /api/inquiries
    participant DB as Postgres
    actor O as Owner

    C->>S: Fill inquiry form (or tap WhatsApp button)
    S->>API: POST {type, name, email, phone, message, details}
    API->>DB: Insert Inquiry (handled = false)
    API-->>C: "Thanks — we'll get back to you" confirmation
    O->>DB: Admin → Inquiries inbox (new items highlighted)
    O->>C: Replies via email / WhatsApp / call
    O->>DB: Mark inquiry handled
```

## 5. Admin Content Flow

```mermaid
sequenceDiagram
    actor O as Owner
    participant A as /admin (NextAuth-protected)
    participant API as /api/admin/* + /api/upload
    participant CLD as Cloudinary
    participant DB as Postgres
    participant P as Public site

    O->>A: Log in (email + password, bcrypt-verified)
    O->>A: Create/edit product, class, category, or gallery item
    A->>API: Upload photos
    API->>CLD: Store image, get optimized URL
    A->>API: Save record (with image URLs)
    API->>DB: Insert/update row
    P->>DB: Next visitor request re-fetches — listing appears/updates immediately
```

## 6. Image & Asset Management

Two kinds of images, with different lifecycles:

**Brand assets** — the logo family. Change almost never, ship with the code.
- `brand-assets/` (repo root) — originals and source material (drawn logo, business cards). Never served to visitors; kept for reference and future design work.
- `public/brand/` — web-ready versions (transparent PNGs). Referenced by fixed paths in code (e.g. header logo).

**Content images** — products, gallery, hero. Grow forever, owned by the admin panel, referenced **only by URL stored in the database** (never hardcoded in code):

| | Development | Production |
|---|---|---|
| Storage | `public/uploads/{products,gallery,hero}/` (git-ignored) | Cloudinary folders `artaeflora/{products,gallery,hero}` |
| Naming | upload API assigns collision-proof IDs (cuid), never the original filename | same |
| Optimization | `next/image` resizes/serves WebP on the fly | Cloudinary `f_auto,q_auto` + `next/image` |
| Alt text / captions | stored in DB (`ProductImage.alt`, `GalleryItem.caption`) | same |

Rules that keep this scalable:
1. **The database is the source of truth.** Pages never enumerate image folders; they render whatever URLs the DB rows hold. Swapping storage backends is a URL-prefix change, not a code rewrite.
2. **Uploads are append-only with generated names** — no collisions, no accidental overwrites; deleting a product deletes its image rows (DB cascade) and the upload API removes the files.
3. **One upload path** (`/api/upload`) decides the backend: Cloudinary when `CLOUDINARY_URL` is set, local disk otherwise. Nothing else in the app knows or cares.
4. **Seed placeholders** (`public/products/*.png`) are repo-shipped stand-ins used only until real photos are uploaded; they get retired as products gain real images.
5. **Scale path**: Cloudinary free tier comfortably covers hundreds of products (~25 GB bandwidth/month); beyond that it's a paid-tier bump or a move to S3 + CDN — either way only the upload API changes (rule 3).

## 7. Environments & Configuration

| Environment | Database | Images | Payments | URL |
|---|---|---|---|---|
| Local dev | Neon (dev branch) or local fallback | Local `public/uploads` fallback | Stripe **test mode** | `localhost:3000` |
| Production | Neon (main branch, free tier) | Cloudinary (free tier) | Stripe **live mode** | `artaeflora.com` (to be purchased) |

Environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `CLOUDINARY_URL` — documented in the README; never committed to git.
