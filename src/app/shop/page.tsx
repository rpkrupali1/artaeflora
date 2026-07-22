import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/db";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Handmade candles, clay flowers, mugs, jewelry and more — unique handmade gifts from ArtaeFlora, Naperville IL.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; occasion?: string }>;
}) {
  const { category, occasion } = await searchParams;

  const categories = await db.category.findMany({
    where: { parentId: null },
    include: {
      children: { orderBy: { sortOrder: "asc" } },
      products: {
        where: { active: true },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        take: 1,
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  // Browse mode: no filters selected → show the category landing.
  if (!category && !occasion) {
    const counts = await db.product.groupBy({
      by: ["categoryId"],
      where: { active: true },
      _count: true,
    });
    const countByCategory = new Map(counts.map((c) => [c.categoryId, c._count]));
    const totalFor = (c: (typeof categories)[number]) =>
      (countByCategory.get(c.id) ?? 0) +
      c.children.reduce((sum, ch) => sum + (countByCategory.get(ch.id) ?? 0), 0);

    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-script text-5xl text-leaf">Shop</h1>
        <p className="mt-2 font-hand text-xl text-charcoal/70">
          What would you like to explore?
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {categories.map((c) => {
            const count = totalFor(c);
            const image = c.products[0]?.images[0]?.url ?? `/products/${c.slug}.png`;
            return (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sage/50 transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-sage-light">
                  <Image
                    src={image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between p-4">
                  <h2 className="font-medium text-charcoal group-hover:text-leaf">{c.name}</h2>
                  <span className="rounded-full bg-sage-light px-2.5 py-0.5 text-xs font-medium text-leaf-dark">
                    {count}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="font-hand text-xl text-leaf">{site.punchlines.occasions}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {site.occasions.map((o) => (
              <Link
                key={o}
                href={`/shop?occasion=${encodeURIComponent(o)}`}
                className="rounded-full bg-sage-light px-5 py-2 text-sm font-medium text-leaf-dark transition-colors hover:bg-sage"
              >
                {o}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Product mode: a category and/or occasion is selected.
  const selected = category
    ? categories.find((c) => c.slug === category)
    : undefined;
  const categoryIds = selected
    ? [selected.id, ...selected.children.map((ch) => ch.id)]
    : undefined;

  const products = await db.product.findMany({
    where: {
      active: true,
      ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
      ...(occasion ? { occasions: { contains: occasion } } : {}),
    },
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const filterHref = (params: { category?: string; occasion?: string }) => {
    const q = new URLSearchParams();
    if (params.category) q.set("category", params.category);
    if (params.occasion) q.set("occasion", params.occasion);
    const s = q.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-sm text-charcoal/60">
        <Link href="/shop" className="hover:text-leaf">Shop</Link>
        {selected && ` / ${selected.name}`}
        {occasion && ` / ${occasion}`}
      </nav>
      <h1 className="mt-2 font-script text-5xl text-leaf">
        {selected?.name ?? `For ${occasion}`}
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className="rounded-full bg-sage-light px-4 py-1.5 text-sm font-medium text-leaf-dark transition-colors hover:bg-sage"
        >
          ← All categories
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={filterHref({ category: c.slug, occasion })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === c.slug ? "bg-leaf text-cream" : "bg-sage-light text-leaf-dark hover:bg-sage"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
          Occasion:
        </span>
        {site.occasions.map((o) => (
          <Link
            key={o}
            href={filterHref({ category, occasion: occasion === o ? undefined : o })}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              occasion === o ? "bg-daisy text-charcoal" : "bg-white text-charcoal/70 ring-1 ring-sage hover:bg-sage-light"
            }`}
          >
            {o}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="mt-16 rounded-2xl bg-sage-light p-10 text-center">
          <p className="font-hand text-2xl text-leaf">Nothing here yet!</p>
          <p className="mt-2 text-sm text-charcoal/70">
            Try a different filter — or{" "}
            <a href={site.whatsappHref} className="font-medium text-leaf underline">
              message us on WhatsApp
            </a>{" "}
            for a custom order.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
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
