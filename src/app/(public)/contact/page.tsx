import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with ArtaeFlora — Naperville, IL. WhatsApp, phone, email, or the contact form.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-script text-5xl text-leaf">Contact</h1>
      <p className="mt-2 font-hand text-2xl text-charcoal/70">We&apos;d love to hear from you.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-sage/50">
          <h2 className="mb-6 text-xl font-semibold text-charcoal">Send a message</h2>
          <InquiryForm type="GENERAL" />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-sage-light p-6">
            <h2 className="font-semibold text-leaf-dark">Reach us directly</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="font-medium text-leaf hover:underline">
                  WhatsApp {site.whatsappNumber}
                </a>{" "}
                <span className="text-charcoal/60">— fastest reply</span>
              </li>
              <li>
                <a href={site.phoneHref} className="font-medium text-leaf hover:underline">{site.phone}</a>
                <span className="text-charcoal/60"> — call or text</span>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="font-medium text-leaf hover:underline">{site.email}</a>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-sage-light p-6">
            <h2 className="font-semibold text-leaf-dark">Find us</h2>
            <p className="mt-2 text-sm text-charcoal/80">
              {site.city} — free local pickup for orders; classes at our studio,
              your venue, or online.
            </p>
          </div>

          <div className="rounded-2xl bg-sage-light p-6">
            <h2 className="font-semibold text-leaf-dark">Follow along</h2>
            <p className="mt-2 text-sm text-charcoal/80">
              New pieces and class dates land on social first — @artaeflora everywhere:
            </p>
            <div className="mt-3 flex gap-4 text-sm font-medium">
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="text-leaf hover:underline">Instagram</a>
              <a href={site.pinterest} target="_blank" rel="noopener noreferrer" className="text-leaf hover:underline">Pinterest</a>
              <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="text-leaf hover:underline">Facebook</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
