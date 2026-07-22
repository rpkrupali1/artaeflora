import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Search" };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const products = query
    ? await db.product.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { occasions: { contains: query, mode: "insensitive" } },
            { category: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      })
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-script text-5xl text-leaf">Search</h1>

      <form action="/search" className="mt-6 flex max-w-xl gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="Search candles, clay flowers, Diwali gifts…"
          className="w-full rounded-full border border-sage bg-white px-5 py-3 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-leaf focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-olive px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-olive-dark"
        >
          Search
        </button>
      </form>

      {query && (
        <p className="mt-6 text-sm text-charcoal/60">
          {products.length === 0
            ? `No matches for "${query}" — try "candle", "clay", or an occasion like "Diwali".`
            : `${products.length} result${products.length === 1 ? "" : "s"} for "${query}"`}
        </p>
      )}

      {products.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              priceCents={p.priceCents}
              inquiryOnly={p.inquiryOnly}
              imageUrl={p.images[0]?.url}
              imageAlt={p.images[0]?.alt ?? p.name}
              categoryName={p.category.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
