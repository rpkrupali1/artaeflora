import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events & Workshops",
  description:
    "Hire ArtaeFlora to run hands-on art activities at your corporate event, party, or celebration — Naperville, IL and beyond.",
};

const offerings = [
  {
    title: "Corporate team events",
    text: "A calm, creative break for your team — guided craft sessions that need zero art background and end with everyone taking something home.",
  },
  {
    title: "Parties & celebrations",
    text: "Birthdays, showers, festivals — we bring materials for a fun group make-along matched to your theme.",
  },
  {
    title: "Community & school workshops",
    text: "Hands-on sessions sized for classrooms and community groups, adapted to age and time available.",
  },
];

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-script text-5xl text-leaf">Events & Workshops</h1>
      <p className="mt-2 font-hand text-2xl text-charcoal/70">{site.punchlines.events}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {offerings.map((o) => (
          <div key={o.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
            <h2 className="font-semibold text-charcoal">{o.title}</h2>
            <p className="mt-2 text-sm leading-6 text-charcoal/70">{o.text}</p>
          </div>
        ))}
      </div>

      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-sage/50">
          <h2 className="text-xl font-semibold text-charcoal">Plan your event</h2>
          <p className="mt-1 mb-6 text-sm text-charcoal/60">
            Share the basics and we&apos;ll respond with activity ideas and a quote.
          </p>
          <InquiryForm
            type="EVENT"
            messageLabel="Tell us about your event"
            messagePlaceholder="The occasion, the vibe, and anything special you have in mind…"
            extraFields={[
              { name: "date", label: "Event date", type: "date" },
              { name: "headcount", label: "Guests", type: "number", placeholder: "e.g. 15" },
              { name: "venue", label: "Venue / city", placeholder: "e.g. Naperville office" },
            ]}
          />
        </div>
        <div className="flex flex-col justify-center rounded-2xl bg-olive p-8 text-cream">
          <p className="font-hand text-2xl">Planning something soon?</p>
          <p className="mt-2 text-sm leading-6 text-cream/90">
            Call or WhatsApp us — a five-minute chat is usually enough to shape the
            perfect activity for your group.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-daisy px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-cream"
            >
              WhatsApp us
            </a>
            <a
              href={site.phoneHref}
              className="rounded-full border-2 border-cream px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/20"
            >
              Call {site.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
