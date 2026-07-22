"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const MAX_QTY = 99;

export default function AddToCart({
  productId,
  slug,
  name,
  priceCents,
  imageUrl,
}: {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl?: string;
}) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="h-10 w-10 rounded-full bg-sage-light text-lg font-semibold text-leaf-dark transition-colors hover:bg-sage"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={MAX_QTY}
          value={quantity}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isInteger(v)) setQuantity(Math.min(Math.max(v, 1), MAX_QTY));
          }}
          aria-label="Quantity"
          className="h-10 w-14 rounded-lg border border-sage bg-white text-center font-medium text-charcoal [appearance:textfield] focus:border-leaf focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
          className="h-10 w-10 rounded-full bg-sage-light text-lg font-semibold text-leaf-dark transition-colors hover:bg-sage"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          add({ productId, slug, name, priceCents, imageUrl }, quantity);
          setAdded(true);
          setTimeout(() => setAdded(false), 2500);
        }}
        className="rounded-full bg-olive px-8 py-3 font-semibold text-cream transition-colors hover:bg-olive-dark"
      >
        {added ? "Added ✓" : quantity > 1 ? `Add ${quantity} to cart` : "Add to cart"}
      </button>
      {added && (
        <Link href="/cart" className="text-sm font-medium text-leaf underline">
          View cart →
        </Link>
      )}
    </div>
  );
}
