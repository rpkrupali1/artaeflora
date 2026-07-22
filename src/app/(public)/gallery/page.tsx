import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Past work by ArtaeFlora — candles, clay flowers, paintings, classes and events.",
};
export const dynamic = "force-dynamic";

const tags = [
  { key: undefined, label: "All" },
  { key: "candles", label: "Candles & crafts" },
  { key: "paintings", label: "Paintings" },
  { key: "classes", label: "Classes" },
  { key: "events", label: "Events" },
] as const;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;

  const items = await db.galleryItem.findMany({
    where: tag ? { tag } : {},
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-script text-5xl text-leaf">Gallery</h1>
      <p className="mt-2 font-hand text-2xl text-charcoal/70">A little of everything we&apos;ve made.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((t) => (
          <Link
            key={t.label}
            href={t.key ? `/gallery?tag=${t.key}` : "/gallery"}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tag === t.key || (!tag && !t.key)
                ? "bg-leaf text-cream"
                : "bg-sage-light text-leaf-dark hover:bg-sage"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-16 rounded-2xl bg-sage-light p-10 text-center">
          <p className="font-hand text-2xl text-leaf">Photos coming soon!</p>
        </div>
      ) : (
        <div className="mt-8 columns-2 gap-4 sm:columns-3 [&>figure]:mb-4">
          {items.map((item) => (
            <figure key={item.id} className="break-inside-avoid overflow-hidden rounded-2xl bg-sage-light">
              <Image
                src={item.url}
                alt={item.caption ?? "ArtaeFlora work"}
                width={600}
                height={600}
                className="w-full object-cover"
              />
              {item.caption && (
                <figcaption className="px-4 py-2 text-sm text-charcoal/70">{item.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
