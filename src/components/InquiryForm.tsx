"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryState } from "@/app/actions";

type ExtraField = {
  name: string;
  label: string;
  type?: "text" | "date" | "number";
  placeholder?: string;
};

const initialState: InquiryState = { ok: false };

const inputClass =
  "w-full rounded-lg border border-sage bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-leaf focus:outline-none";

export default function InquiryForm({
  type,
  messageLabel = "Your message",
  messagePlaceholder = "Tell us what you have in mind…",
  extraFields = [],
}: {
  type: "PAINTING" | "EVENT" | "CLASS" | "GENERAL";
  messageLabel?: string;
  messagePlaceholder?: string;
  extraFields?: ExtraField[];
}) {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState);

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-sage-light p-8 text-center">
        <p className="font-hand text-2xl text-leaf">Thank you!</p>
        <p className="mt-2 text-sm text-charcoal/80">
          We received your inquiry and will get back to you within a day or two —
          usually faster on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="type" value={type} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${type}-name`} className="mb-1 block text-sm font-medium text-leaf-dark">
            Name *
          </label>
          <input id={`${type}-name`} name="name" required className={inputClass} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor={`${type}-email`} className="mb-1 block text-sm font-medium text-leaf-dark">
            Email *
          </label>
          <input id={`${type}-email`} name="email" type="email" required className={inputClass} placeholder="you@example.com" />
        </div>
      </div>

      <div>
        <label htmlFor={`${type}-phone`} className="mb-1 block text-sm font-medium text-leaf-dark">
          Phone <span className="font-normal text-charcoal/50">(optional, for WhatsApp)</span>
        </label>
        <input id={`${type}-phone`} name="phone" className={inputClass} placeholder="(xxx) xxx-xxxx" />
      </div>

      {extraFields.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {extraFields.map((f) => (
            <div key={f.name}>
              <label htmlFor={`${type}-${f.name}`} className="mb-1 block text-sm font-medium text-leaf-dark">
                {f.label}
              </label>
              <input
                id={`${type}-${f.name}`}
                name={`detail_${f.name}`}
                type={f.type ?? "text"}
                className={inputClass}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <label htmlFor={`${type}-message`} className="mb-1 block text-sm font-medium text-leaf-dark">
          {messageLabel} *
        </label>
        <textarea
          id={`${type}-message`}
          name="message"
          required
          rows={4}
          className={inputClass}
          placeholder={messagePlaceholder}
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-daisy/20 px-4 py-2 text-sm text-charcoal">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-olive px-8 py-3 font-semibold text-cream transition-colors hover:bg-olive-dark disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
