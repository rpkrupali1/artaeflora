export function formatPrice(priceCents: number | null): string {
  if (priceCents === null) return "Price on request";
  return `$${(priceCents / 100).toFixed(2)}`;
}

export function occasionList(occasions: string): string[] {
  return occasions.split(",").map((o) => o.trim()).filter(Boolean);
}
