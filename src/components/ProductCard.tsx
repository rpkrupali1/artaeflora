import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

type ProductCardProps = {
  slug: string;
  name: string;
  priceCents: number | null;
  inquiryOnly: boolean;
  imageUrl?: string;
  imageAlt?: string;
  categoryName?: string;
};

export default function ProductCard({
  slug,
  name,
  priceCents,
  inquiryOnly,
  imageUrl,
  imageAlt,
  categoryName,
}: ProductCardProps) {
  return (
    <Link
      href={`/shop/${slug}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sage/50 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-sage-light">
        <Image
          src={imageUrl ?? "/products/candles.png"}
          alt={imageAlt ?? name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        {categoryName && (
          <p className="text-xs font-medium uppercase tracking-wide text-olive-dark">{categoryName}</p>
        )}
        <h3 className="mt-1 font-medium text-charcoal group-hover:text-leaf">{name}</h3>
        <p className="mt-1 text-sm font-semibold text-leaf">
          {inquiryOnly ? "Made to order — inquire" : formatPrice(priceCents)}
        </p>
      </div>
    </Link>
  );
}
