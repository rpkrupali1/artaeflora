import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/db";
import { formatPrice, occasionList } from "@/lib/format";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: { include: { parent: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product || !product.active) notFound();

  const related = await db.product.findMany({
    where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
    take: 4,
  });

  const whatsappText = encodeURIComponent(
    `Hi ArtaeFlora! I'm interested in "${product.name}" — could you tell me more?`
  );

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: "ArtaeFlora" },
    ...(product.priceCents !== null
      ? {
          offers: {
            "@type": "Offer",
            price: (product.priceCents / 100).toFixed(2),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <nav className="text-sm text-charcoal/60">
        <Link href="/shop" className="hover:text-leaf">Shop</Link>
        {" / "}
        <Link href={`/shop?category=${product.category.parent?.slug ?? product.category.slug}`} className="hover:text-leaf">
          {product.category.parent ? `${product.category.parent.name} · ` : ""}
          {product.category.name}
        </Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-sage-light">
            <Image
              src={product.images[0]?.url ?? "/products/candles.png"}
              alt={product.images[0]?.alt ?? product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1).map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-sage-light">
                  <Image src={img.url} alt={img.alt ?? product.name} fill sizes="25vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-semibold text-charcoal">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-leaf">
            {product.inquiryOnly ? "Made to order" : formatPrice(product.priceCents)}
          </p>

          <p className="mt-6 leading-7 text-charcoal/80">{product.description}</p>

          {occasionList(product.occasions).length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
                Perfect for:
              </span>
              {occasionList(product.occasions).map((o) => (
                <Link
                  key={o}
                  href={`/shop?occasion=${encodeURIComponent(o)}`}
                  className="rounded-full bg-sage-light px-3 py-1 text-xs font-medium text-leaf-dark hover:bg-sage"
                >
                  {o}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {product.inquiryOnly ? (
              <>
                <a
                  href={`${site.whatsappHref}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-olive px-8 py-3 font-semibold text-cream transition-colors hover:bg-olive-dark"
                >
                  Inquire on WhatsApp
                </a>
                <Link
                  href="/contact"
                  className="rounded-full border-2 border-leaf px-8 py-3 font-semibold text-leaf transition-colors hover:bg-sage-light"
                >
                  Send an inquiry
                </Link>
              </>
            ) : (
              <>
                <AddToCart
                  productId={product.id}
                  slug={product.slug}
                  name={product.name}
                  priceCents={product.priceCents ?? 0}
                  imageUrl={product.images[0]?.url}
                />
                <a
                  href={`${site.whatsappHref}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border-2 border-leaf px-8 py-3 font-semibold text-leaf transition-colors hover:bg-sage-light"
                >
                  Order via WhatsApp
                </a>
              </>
            )}
          </div>

          <p className="mt-6 text-sm text-charcoal/60">
            Free local pickup in {site.city} · US shipping available
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-hand text-2xl text-leaf">You might also like</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
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
    </div>
  );
}
