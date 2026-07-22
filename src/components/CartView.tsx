"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export default function CartView({
  shippingFlatCents,
  freeThresholdCents,
}: {
  shippingFlatCents: number;
  freeThresholdCents: number | null;
}) {
  const { items, subtotalCents, setQuantity, remove } = useCart();
  const [fulfillment, setFulfillment] = useState<"PICKUP" | "SHIPPING">("PICKUP");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const freeShipping =
    freeThresholdCents !== null && subtotalCents >= freeThresholdCents;
  const shippingCents =
    fulfillment === "SHIPPING" ? (freeShipping ? 0 : shippingFlatCents) : 0;
  const totalCents = subtotalCents + shippingCents;

  async function checkout() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          fulfillment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed — please try again.");
        setSubmitting(false);
        return;
      }
      if (data.url.startsWith("/")) {
        router.push(data.url);
      } else {
        window.location.href = data.url;
      }
    } catch {
      setError("Checkout failed — please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-script text-5xl text-leaf">Your cart</h1>
        <div className="mt-8 rounded-2xl bg-sage-light p-8">
          <p className="font-hand text-2xl text-leaf">Your cart is empty</p>
          <p className="mt-3 text-sm text-charcoal/70">
            Every piece is handmade and one of a kind — go find yours!
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-full bg-olive px-8 py-3 font-semibold text-cream transition-colors hover:bg-olive-dark"
          >
            Browse the shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-script text-5xl text-leaf">Your cart</h1>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sage/50"
          >
            <Link href={`/shop/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sage-light">
              <Image
                src={item.imageUrl ?? "/products/candles.png"}
                alt={item.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/shop/${item.slug}`} className="font-medium text-charcoal hover:text-leaf">
                {item.name}
              </Link>
              <p className="mt-0.5 text-sm text-charcoal/60">{formatPrice(item.priceCents)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Decrease quantity of ${item.name}`}
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="h-8 w-8 rounded-full bg-sage-light font-semibold text-leaf-dark hover:bg-sage"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                type="button"
                aria-label={`Increase quantity of ${item.name}`}
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className="h-8 w-8 rounded-full bg-sage-light font-semibold text-leaf-dark hover:bg-sage"
              >
                +
              </button>
            </div>
            <p className="w-20 text-right font-semibold text-leaf">
              {formatPrice(item.priceCents * item.quantity)}
            </p>
            <button
              type="button"
              aria-label={`Remove ${item.name}`}
              onClick={() => remove(item.productId)}
              className="rounded-full p-2 text-charcoal/40 hover:bg-sage-light hover:text-charcoal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
        <h2 className="font-semibold text-charcoal">How would you like to receive it?</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="fulfillment"
              checked={fulfillment === "PICKUP"}
              onChange={() => setFulfillment("PICKUP")}
              className="accent-leaf"
            />
            Free local pickup ({site.city})
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="fulfillment"
              checked={fulfillment === "SHIPPING"}
              onChange={() => setFulfillment("SHIPPING")}
              className="accent-leaf"
            />
            Ship to me (US) —{" "}
            {freeShipping ? "free" : formatPrice(shippingFlatCents)}
            {freeThresholdCents !== null && !freeShipping && (
              <span className="text-charcoal/50">
                (free over {formatPrice(freeThresholdCents)})
              </span>
            )}
          </label>
        </div>

        <div className="mt-6 space-y-2 border-t border-sage pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-charcoal/70">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotalCents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-charcoal/70">
              {fulfillment === "SHIPPING" ? "Shipping" : "Pickup"}
            </span>
            <span className="font-medium">
              {shippingCents === 0 ? "Free" : formatPrice(shippingCents)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-sage pt-2">
            <span className="font-semibold text-charcoal">Total</span>
            <span className="text-xl font-semibold text-leaf">{formatPrice(totalCents)}</span>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-daisy/20 px-4 py-2 text-sm text-charcoal">{error}</p>
        )}

        <button
          type="button"
          onClick={checkout}
          disabled={submitting}
          className="mt-5 w-full rounded-full bg-olive px-8 py-3.5 font-semibold text-cream transition-colors hover:bg-olive-dark disabled:opacity-60"
        >
          {submitting ? "Preparing checkout…" : "Checkout securely"}
        </button>
        <p className="mt-3 text-center text-xs text-charcoal/50">
          Name, email &amp; address are collected on the secure Stripe payment page ·
          Cards, Apple Pay &amp; Google Pay · or{" "}
          <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="underline">
            order on WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
