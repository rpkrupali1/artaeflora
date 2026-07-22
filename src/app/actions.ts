"use server";

import { db } from "@/lib/db";

export type InquiryState = {
  ok: boolean;
  error?: string;
};

const INQUIRY_TYPES = ["PAINTING", "EVENT", "CLASS", "GENERAL"] as const;

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData
): Promise<InquiryState> {
  const type = String(formData.get("type") ?? "GENERAL");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!INQUIRY_TYPES.includes(type as (typeof INQUIRY_TYPES)[number])) {
    return { ok: false, error: "Invalid inquiry type." };
  }
  if (!name || !email || !message) {
    return { ok: false, error: "Please fill in your name, email, and message." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "That email address doesn't look right." };
  }

  // Extra structured fields (event date, headcount, venue…) arrive as
  // detail_* inputs and are stored as a readable string.
  const details = [...formData.entries()]
    .filter(([k, v]) => k.startsWith("detail_") && String(v).trim())
    .map(([k, v]) => `${k.replace("detail_", "")}: ${String(v).trim()}`)
    .join(" | ");

  await db.inquiry.create({
    data: {
      type,
      name,
      email,
      phone: phone || null,
      message,
      details: details || null,
    },
  });

  return { ok: true };
}
