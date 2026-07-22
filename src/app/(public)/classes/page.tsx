import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Art Classes",
  description:
    "Small-group art classes in Naperville, at your venue, or online — sculpt, paint, and unwind with ArtaeFlora.",
};
export const dynamic = "force-dynamic";

const locationLabel: Record<string, string> = {
  STUDIO: "At our studio",
  VENUE: "At your venue",
  ONLINE: "Online",
};

export default async function ClassesPage() {
  const classes = await db.class.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-script text-5xl text-leaf">Art Classes</h1>
      <p className="mt-2 font-hand text-2xl text-charcoal/70">{site.punchlines.classes}</p>

      <p className="mt-6 max-w-2xl leading-7 text-charcoal/80">
        Small groups (max 10), all materials included, zero experience needed.
        We host classes at our Naperville studio, bring them to your venue, or
        meet you online — fixed schedules and private by-appointment sessions.
      </p>

      {classes.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {classes.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-charcoal">{c.title}</h2>
                <span className="rounded-full bg-sage-light px-3 py-1 text-xs font-medium text-leaf-dark">
                  {locationLabel[c.locationType] ?? c.locationType}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-charcoal/80">{c.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                {c.priceCents !== null && (
                  <span className="font-semibold text-leaf">{formatPrice(c.priceCents)} / person</span>
                )}
                <span className="text-charcoal/60">Up to {c.capacity} people</span>
                {c.scheduleText && <span className="text-charcoal/60">{c.scheduleText}</span>}
              </div>
              <a
                href={`${site.whatsappHref}?text=${encodeURIComponent(`Hi! I'd like to join the "${c.title}" class.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block rounded-full bg-olive px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-olive-dark"
              >
                Reserve a spot
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl bg-sage-light p-10 text-center">
          <p className="font-hand text-3xl text-leaf">New class dates coming soon!</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-charcoal/70">
            We&apos;re planning the next round of workshops. Leave your details below
            and we&apos;ll let you know the moment dates open up — or tell us what
            you&apos;d love to learn.
          </p>
        </div>
      )}

      <section className="mt-14 max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-sage/50">
          <h2 className="text-xl font-semibold text-charcoal">
            {classes.length > 0 ? "Ask about classes" : "Join the waitlist"}
          </h2>
          <p className="mt-1 mb-6 text-sm text-charcoal/60">
            Private group? Kids&apos; party? Team event? We tailor classes to the occasion.
          </p>
          <InquiryForm
            type="CLASS"
            messageLabel="What are you interested in?"
            messagePlaceholder="e.g. A weekend clay-flower workshop for 6 friends…"
          />
        </div>
      </section>
    </div>
  );
}
