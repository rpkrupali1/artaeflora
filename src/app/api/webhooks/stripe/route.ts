import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

// POST /api/webhooks/stripe — called by Stripe's servers after payment.
// Signature-verified; idempotent (stripeSessionId is unique, replays are ignored).

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const existing = await db.order.findUnique({
      where: { stripeSessionId: session.id },
    });
    if (existing) return NextResponse.json({ received: true });

    const requested: { i: string; q: number }[] = JSON.parse(
      session.metadata?.items ?? "[]"
    );
    const products = await db.product.findMany({
      where: { id: { in: requested.map((r) => r.i) } },
    });

    await db.order.create({
      data: {
        stripeSessionId: session.id,
        customerName: session.customer_details?.name ?? null,
        customerEmail: session.customer_details?.email ?? null,
        fulfillment: session.metadata?.fulfillment === "SHIPPING" ? "SHIPPING" : "PICKUP",
        status: "PAID",
        totalCents: session.amount_total ?? 0,
        items: {
          create: requested.flatMap((r) => {
            const p = products.find((prod) => prod.id === r.i);
            return p
              ? [{
                  productId: p.id,
                  productName: p.name,
                  quantity: r.q,
                  unitPriceCents: p.priceCents ?? 0,
                }]
              : [];
          }),
        },
      },
    });
  }

  return NextResponse.json({ received: true });
}
