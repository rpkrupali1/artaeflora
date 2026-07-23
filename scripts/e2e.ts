// End-to-end verification suite — run against a local dev server:
//   npx tsx --env-file=.env scripts/e2e.ts
//
// Covers: every public route + content, SEO endpoints, inquiry creation,
// checkout API (mock mode), admin auth + authorized pages, upload API
// (auth + happy path + rejection). Cleans up everything it creates.

import bcrypt from "bcryptjs";
import { submitInquiry } from "../src/app/actions";
import { createSessionToken, SESSION_COOKIE } from "../src/lib/auth";
import { createPrismaClient } from "../src/lib/db";

const BASE = "http://localhost:3000";
const db = createPrismaClient();

let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "  PASS" : "✗ FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function get(path: string, cookie?: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: cookie ? { cookie } : {},
    redirect: "manual",
  });
  const text = res.status === 200 ? await res.text() : "";
  return { status: res.status, text, location: res.headers.get("location") };
}

async function main() {
  console.log("— Public pages —");
  const pages: [string, string][] = [
    ["/", "Featured handmades"],
    ["/shop", "What would you like to explore?"],
    ["/shop?category=candles", "Lavender Soy Candle"],
    ["/shop?occasion=Diwali", "Diya Festive Candle Set"],
    ["/shop/clay-daisy-bouquet", "$45.00"],
    ["/shop/miniature-garden-scene", "Made to order"],
    ["/search?q=rakhi", "Clay Flower Earrings"],
    ["/paintings", "Start your commission"],
    ["/classes", "coming soon"],
    ["/events", "Plan your event"],
    ["/gallery", "Gallery"],
    ["/about", "Krupali"],
    ["/contact", "Send a message"],
    ["/signin", "coming soon"],
    ["/cart", "cart"],
  ];
  for (const [path, marker] of pages) {
    const r = await get(path);
    check(`GET ${path}`, r.status === 200 && r.text.toLowerCase().includes(marker.toLowerCase()),
      r.status !== 200 ? `status ${r.status}` : !r.text.toLowerCase().includes(marker.toLowerCase()) ? `missing "${marker}"` : "");
  }
  const nf = await fetch(`${BASE}/this-does-not-exist`);
  check("404 page", nf.status === 404);

  console.log("— SEO endpoints —");
  for (const p of ["/sitemap.xml", "/robots.txt", "/og.png", "/icon.png"]) {
    const r = await fetch(`${BASE}${p}`);
    check(`GET ${p}`, r.status === 200);
  }
  const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
  check("sitemap includes products", sm.includes("/shop/lavender-soy-candle"));

  console.log("— Inquiry flow —");
  const inquiryResult = await submitInquiry(
    { ok: false },
    (() => {
      const fd = new FormData();
      fd.set("type", "EVENT");
      fd.set("name", "E2E Test");
      fd.set("email", "e2e@test.local");
      fd.set("message", "Automated end-to-end verification inquiry.");
      fd.set("detail_headcount", "12");
      return fd;
    })()
  );
  check("submitInquiry accepts valid input", inquiryResult.ok);
  const badInquiry = await submitInquiry(
    { ok: false },
    (() => {
      const fd = new FormData();
      fd.set("type", "EVENT");
      fd.set("name", "E2E Test");
      fd.set("email", "not-an-email");
      fd.set("message", "x");
      return fd;
    })()
  );
  check("submitInquiry rejects bad email", !badInquiry.ok);
  const savedInquiry = await db.inquiry.findFirst({
    where: { email: "e2e@test.local" },
    orderBy: { createdAt: "desc" },
  });
  check("inquiry persisted with details", savedInquiry?.details === "headcount: 12");

  console.log("— Checkout API (mock mode) —");
  const candle = await db.product.findUniqueOrThrow({ where: { slug: "lavender-soy-candle" } });
  const co = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: [{ productId: candle.id, quantity: 2 }], fulfillment: "SHIPPING" }),
  });
  const coData = await co.json();
  check("checkout returns success url", co.status === 200 && coData.url?.includes("/checkout/success"));
  const orderId = coData.url ? new URL(BASE + coData.url).searchParams.get("order") : null;
  const order = orderId
    ? await db.order.findUnique({ where: { id: orderId }, include: { items: true } })
    : null;
  const flat = Number.parseInt(
    (await db.siteSetting.findUniqueOrThrow({ where: { key: "shippingFlatCents" } })).value, 10);
  check("order total = items + shipping", order?.totalCents === (candle.priceCents ?? 0) * 2 + flat);
  check("order records shippingCents", order?.shippingCents === flat);

  console.log("— Admin auth & pages —");
  const admin = await db.adminUser.findFirstOrThrow();
  check("admin password bcrypt-verifiable",
    await bcrypt.compare(process.env.ADMIN_PASSWORD ?? "ChangeMe@ArtaeFlora1", admin.passwordHash));
  const cookie = `${SESSION_COOKIE}=${await createSessionToken(admin.email)}`;
  const unauth = await get("/admin/orders");
  check("unauthenticated admin redirects", unauth.status === 307 && unauth.location === "/admin/login");
  const adminPages: [string, string][] = [
    ["/admin", "Dashboard"],
    ["/admin/orders", "Mock checkout"],
    ["/admin/inquiries", "e2e@test.local"],
    ["/admin/products", "New product"],
    ["/admin/categories", "Add category"],
    ["/admin/classes", "Add class"],
    ["/admin/gallery", "Add photo"],
    ["/admin/hero", "Add slide"],
    ["/admin/settings", "Announcement bar"],
    ["/admin/users", "Add admin"],
  ];
  for (const [path, marker] of adminPages) {
    const r = await get(path, cookie);
    check(`GET ${path} (authed)`, r.status === 200 && r.text.includes(marker),
      r.status !== 200 ? `status ${r.status}` : "");
  }

  console.log("— Upload API —");
  const noAuth = await fetch(`${BASE}/api/upload`, { method: "POST", body: new FormData() });
  check("upload rejects unauthenticated", noAuth.status === 401);
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  const upForm = new FormData();
  upForm.set("file", new File([png], "e2e.png", { type: "image/png" }));
  upForm.set("folder", "gallery");
  const up = await fetch(`${BASE}/api/upload`, { method: "POST", headers: { cookie }, body: upForm });
  const upData = await up.json();
  check("upload stores image", up.status === 200 && upData.url?.startsWith("/uploads/gallery/"));
  const badForm = new FormData();
  badForm.set("file", new File([png], "e2e.txt", { type: "text/plain" }));
  badForm.set("folder", "gallery");
  const bad = await fetch(`${BASE}/api/upload`, { method: "POST", headers: { cookie }, body: badForm });
  check("upload rejects wrong file type", bad.status === 415);

  console.log("— Cleanup —");
  if (order) await db.order.delete({ where: { id: order.id } });
  if (savedInquiry) await db.inquiry.delete({ where: { id: savedInquiry.id } });
  if (upData.url) {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    await fs.unlink(path.join(process.cwd(), "public", upData.url)).catch(() => {});
  }
  console.log("  test order, inquiry, and upload removed");

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
