import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getShippingConfig, shippingCentsFor } from "@/lib/shipping";

const log = logger.child({ scope: "checkout" });

// POST /api/checkout
// Body: { items: [{ productId, quantity }], fulfillment: "PICKUP" | "SHIPPING" }
//
// Never trusts client prices: every product is re-read from the DB, and the
// Stripe session (or mock order) is built from DB values only.
//
// Mock mode: when STRIPE_SECRET_KEY is unset, the order is recorded directly
// and the buyer skips payment — lets the full flow run before a Stripe
// account exists. Remove nothing to go live; just set the env keys.

type CheckoutBody = {
  items?: { productId?: string; quantity?: number }[];
  fulfillment?: string;
};

export async function POST(req: Request) {
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const fulfillment = body.fulfillment === "SHIPPING" ? "SHIPPING" : "PICKUP";
  const requested = (body.items ?? [])
    .filter((i) => typeof i.productId === "string" && Number.isInteger(i.quantity))
    .map((i) => ({ productId: i.productId as string, quantity: Math.min(Math.max(i.quantity as number, 1), 99) }));

  if (requested.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const products = await db.product.findMany({
    where: {
      id: { in: requested.map((i) => i.productId) },
      active: true,
      inquiryOnly: false,
      priceCents: { not: null },
    },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const lines = requested.flatMap((r) => {
    const product = products.find((p) => p.id === r.productId);
    return product ? [{ product, quantity: r.quantity }] : [];
  });

  if (lines.length !== requested.length) {
    log.warn("checkout.rejected_stale_items", {
      requested: requested.map((r) => r.productId),
      valid: lines.map((l) => l.product.id),
    });
    return NextResponse.json(
      { error: "Some items are no longer available — please refresh your cart." },
      { status: 409 }
    );
  }

  const subtotalCents = lines.reduce(
    (sum, l) => sum + (l.product.priceCents ?? 0) * l.quantity,
    0
  );
  const shippingConfig = await getShippingConfig();
  const shippingCents = shippingCentsFor(subtotalCents, fulfillment, shippingConfig);

  // ---- Mock mode (no Stripe account configured yet) ---------------------
  // Development convenience ONLY. In production a missing key is a hard
  // error — never silently give products away.
  if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === "production") {
    log.error("checkout.stripe_not_configured_in_production");
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable. Please order via WhatsApp." },
      { status: 503 }
    );
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    const order = await db.order.create({
      data: {
        stripeSessionId: `mock_${crypto.randomUUID()}`,
        fulfillment,
        status: "PAID",
        shippingCents,
        totalCents: subtotalCents + shippingCents,
        customerName: "Mock checkout (no Stripe keys)",
        items: {
          create: lines.map((l) => ({
            productId: l.product.id,
            productName: l.product.name,
            quantity: l.quantity,
            unitPriceCents: l.product.priceCents ?? 0,
          })),
        },
      },
    });
    log.info("checkout.mock_order_created", {
      orderId: order.id,
      totalCents: subtotalCents + shippingCents,
      items: lines.length,
      fulfillment,
    });
    return NextResponse.json({ url: `/checkout/success?mock=1&order=${order.id}` });
  }

  // ---- Real Stripe Checkout ---------------------------------------------
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: "usd",
        unit_amount: l.product.priceCents ?? 0,
        product_data: {
          name: l.product.name,
          ...(l.product.images[0]?.url.startsWith("http")
            ? { images: [l.product.images[0].url] }
            : {}),
        },
      },
    })),
    phone_number_collection: { enabled: true },
    ...(fulfillment === "SHIPPING"
      ? {
          shipping_address_collection: { allowed_countries: ["US"] as const },
          shipping_options: [
            {
              shipping_rate_data: {
                display_name: shippingCents === 0 ? "Free US shipping" : "US shipping",
                type: "fixed_amount" as const,
                fixed_amount: { amount: shippingCents, currency: "usd" },
              },
            },
          ],
        }
      : {}),
    metadata: {
      fulfillment,
      items: JSON.stringify(lines.map((l) => ({ i: l.product.id, q: l.quantity }))),
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
  });

  log.info("checkout.stripe_session_created", {
    sessionId: session.id,
    subtotalCents,
    shippingCents,
    items: lines.length,
    fulfillment,
  });
  return NextResponse.json({ url: session.url });
}
