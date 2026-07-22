import type { Metadata } from "next";
import Image from "next/image";
import InquiryForm from "@/components/InquiryForm";
import { db } from "@/lib/db";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Custom Paintings",
  description:
    "Commission a custom painting from ArtaeFlora — your story, painted by hand in Naperville, IL.",
};
export const dynamic = "force-dynamic";

export default async function PaintingsPage() {
  const works = await db.galleryItem.findMany({
    where: { tag: "paintings" },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-script text-5xl text-leaf">Custom Paintings</h1>
      <p className="mt-2 font-hand text-2xl text-charcoal/70">{site.punchlines.paintings}</p>

      <p className="mt-6 max-w-2xl leading-7 text-charcoal/80">
        Every painting is a commission — made for your story, your people, your
        walls. Share the moment you want captured (a wedding, a home, a memory)
        and we&apos;ll sketch an idea, agree on size and budget, and paint it by
        hand. Reference photos below show past commissions.
      </p>

      {works.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {works.map((w) => (
            <figure key={w.id} className="overflow-hidden rounded-2xl bg-sage-light">
              <div className="relative aspect-square">
                <Image
                  src={w.url}
                  alt={w.caption ?? "Custom painting by ArtaeFlora"}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              {w.caption && (
                <figcaption className="px-4 py-2 text-sm text-charcoal/70">{w.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-sage/50">
          <h2 className="text-xl font-semibold text-charcoal">Start your commission</h2>
          <p className="mt-1 mb-6 text-sm text-charcoal/60">
            Tell us your idea — we&apos;ll reply with questions, a sketch direction, and a quote.
          </p>
          <InquiryForm
            type="PAINTING"
            messageLabel="What would you like painted?"
            messagePlaceholder="The story, the scene, rough size, and when you need it by…"
          />
        </div>
        <div className="flex flex-col justify-center rounded-2xl bg-olive p-8 text-cream">
          <p className="font-hand text-2xl">Prefer to chat?</p>
          <p className="mt-2 text-sm leading-6 text-cream/90">
            WhatsApp is the fastest way to share reference photos and ideas back and forth.
          </p>
          <a
            href={site.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block w-fit rounded-full bg-daisy px-8 py-3 font-semibold text-charcoal transition-colors hover:bg-cream"
          >
            Message us on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
