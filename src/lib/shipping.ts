import { db } from "./db";

export type ShippingConfig = {
  flatCents: number;
  freeThresholdCents: number | null;
};

// Flat-rate shipping, configured in SiteSetting (admin-editable).
// Phase 2 swaps this module's internals for live carrier rates (Shippo)
// without touching checkout callers.
export async function getShippingConfig(): Promise<ShippingConfig> {
  const rows = await db.siteSetting.findMany({
    where: { key: { in: ["shippingFlatCents", "freeShippingThresholdCents"] } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const flat = Number.parseInt(map.shippingFlatCents ?? "800", 10);
  const threshold = Number.parseInt(map.freeShippingThresholdCents ?? "", 10);
  return {
    flatCents: Number.isFinite(flat) ? flat : 800,
    freeThresholdCents: Number.isFinite(threshold) ? threshold : null,
  };
}

export function shippingCentsFor(
  subtotalCents: number,
  fulfillment: string,
  config: ShippingConfig
): number {
  if (fulfillment !== "SHIPPING") return 0;
  if (config.freeThresholdCents !== null && subtotalCents >= config.freeThresholdCents) {
    return 0;
  }
  return config.flatCents;
}
