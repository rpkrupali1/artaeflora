import type { Metadata } from "next";
import CartView from "@/components/CartView";
import { getShippingConfig } from "@/lib/shipping";

export const metadata: Metadata = { title: "Cart" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const shipping = await getShippingConfig();
  return (
    <CartView
      shippingFlatCents={shipping.flatCents}
      freeThresholdCents={shipping.freeThresholdCents}
    />
  );
}
