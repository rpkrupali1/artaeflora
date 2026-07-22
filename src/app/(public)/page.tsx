import Link from "next/link";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/db";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = await db.product.findMany({
    where: { active: true, featured: true },
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    take: 4,
  });

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-14 text-center">
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
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <div className="flex items-end justify-between">
            <h2 className="font-script text-4xl text-leaf">Featured handmades</h2>
            <Link href="/shop" className="text-sm font-medium text-leaf hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {featured.map((p) => (
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
        </section>
      )}

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:grid-cols-2">
        <div className="rounded-2xl bg-olive p-8 text-cream">
          <h2 className="font-script text-3xl">Art classes</h2>
          <p className="mt-2 font-hand text-xl text-sage-light">{site.punchlines.classes}</p>
          <p className="mt-3 text-sm leading-6 text-cream/90">
            Small groups, all materials included, zero experience needed — at our
            Naperville studio, your venue, or online.
          </p>
          <Link
            href="/classes"
            className="mt-5 inline-block rounded-full bg-daisy px-6 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-cream"
          >
            Explore classes
          </Link>
        </div>
        <div className="rounded-2xl bg-sage-light p-8">
          <h2 className="font-script text-3xl text-leaf">Events & workshops</h2>
          <p className="mt-2 font-hand text-xl text-olive-dark">{site.punchlines.events}</p>
          <p className="mt-3 text-sm leading-6 text-charcoal/80">
            Corporate events, parties, celebrations — hands-on art activities your
            guests will actually remember.
          </p>
          <Link
            href="/events"
            className="mt-5 inline-block rounded-full bg-leaf px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-leaf-dark"
          >
            Plan an event
          </Link>
        </div>
      </section>
    </div>
  );
}
