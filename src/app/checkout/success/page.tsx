"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useCart } from "@/lib/cart";

function SuccessContent() {
  const { clear } = useCart();
  const params = useSearchParams();
  const isMock = params.get("mock") === "1";

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-script text-5xl text-leaf">Thank you!</h1>
      <div className="mt-8 rounded-2xl bg-sage-light p-8">
        <p className="font-hand text-2xl text-leaf">Your order is in 🎉</p>
        <p className="mt-3 text-sm leading-6 text-charcoal/70">
          We&apos;ve received your order and will start making your pieces with
          love. You&apos;ll hear from us shortly about {" "}
          pickup or shipping details.
        </p>
        {isMock && (
          <p className="mt-4 rounded-lg bg-daisy/30 px-4 py-2 text-xs text-charcoal">
            Test mode: no payment was collected (Stripe keys not configured yet).
          </p>
        )}
      </div>
      <Link href="/shop" className="mt-6 inline-block text-sm text-leaf underline">
        ← Keep browsing
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
