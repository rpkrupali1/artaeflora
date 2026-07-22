// Exercises POST /api/checkout (mock mode) against the running dev server:
//  1. happy path — valid cart → order recorded with DB prices
//  2. inquiry-only product rejected
//  3. unknown product rejected
//  4. empty cart rejected
// Run: npx tsx --env-file=.env scripts/test-checkout.ts

import { createPrismaClient } from "../src/lib/db";

const BASE = "http://localhost:3000";
const db = createPrismaClient();

async function post(body: unknown) {
  const res = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function main() {
  const candle = await db.product.findUniqueOrThrow({ where: { slug: "lavender-soy-candle" } });
  const bouquet = await db.product.findUniqueOrThrow({ where: { slug: "clay-daisy-bouquet" } });
  const inquiryOnly = await db.product.findUniqueOrThrow({ where: { slug: "miniature-garden-scene" } });

  // 1. happy path: 2 candles + 1 bouquet, pickup
  const ok = await post({
    items: [
      { productId: candle.id, quantity: 2 },
      { productId: bouquet.id, quantity: 1 },
    ],
    fulfillment: "PICKUP",
  });
  const expectedTotal = (candle.priceCents ?? 0) * 2 + (bouquet.priceCents ?? 0);
  console.log("1. happy path:", ok.status, ok.data.url?.slice(0, 40));
  const orderId = new URL(BASE + ok.data.url).searchParams.get("order");
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId! },
    include: { items: true },
  });
  console.log(
    `   order total ${order.totalCents} (expected ${expectedTotal}) — ${order.totalCents === expectedTotal ? "PASS" : "FAIL"}`
  );
  console.log(
    `   items: ${order.items.map((i) => `${i.productName} x${i.quantity} @${i.unitPriceCents}`).join(", ")}`
  );

  // 2. inquiry-only product must be rejected
  const inq = await post({ items: [{ productId: inquiryOnly.id, quantity: 1 }], fulfillment: "PICKUP" });
  console.log(`2. inquiry-only rejected: ${inq.status} — ${inq.status === 409 ? "PASS" : "FAIL"}`);

  // 3. unknown product must be rejected
  const unknown = await post({ items: [{ productId: "nonexistent-id", quantity: 1 }], fulfillment: "PICKUP" });
  console.log(`3. unknown product rejected: ${unknown.status} — ${unknown.status === 409 ? "PASS" : "FAIL"}`);

  // 4. empty cart must be rejected
  const empty = await post({ items: [], fulfillment: "PICKUP" });
  console.log(`4. empty cart rejected: ${empty.status} — ${empty.status === 400 ? "PASS" : "FAIL"}`);

  // cleanup the test order
  await db.order.delete({ where: { id: order.id } });
  console.log("   (test order cleaned up)");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
