"use client";

import Image from "next/image";
import { useState } from "react";
import { saveHeroSlide } from "@/app/admin/actions";
import Uploader from "./Uploader";

const input =
  "rounded-lg border border-sage bg-white px-3 py-1.5 text-sm focus:border-leaf focus:outline-none";

export default function AddHeroSlide() {
  const [pending, setPending] = useState<{ url: string; mediaType: "IMAGE" | "VIDEO" } | null>(null);

  if (!pending) {
    return (
      <Uploader
        folder="hero"
        accept="image/*,video/mp4,video/webm"
        label="Upload image, GIF, or video"
        onUploaded={(url, mediaType) => setPending({ url, mediaType })}
      />
    );
  }

  return (
    <form action={saveHeroSlide} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="url" value={pending.url} />
      <input type="hidden" name="mediaType" value={pending.mediaType} />
      <input type="hidden" name="active" value="on" />
      {pending.mediaType === "VIDEO" ? (
        <video src={pending.url} muted loop autoPlay className="h-16 w-24 rounded-xl object-cover" />
      ) : (
        <div className="relative h-16 w-24 overflow-hidden rounded-xl bg-sage-light">
          <Image src={pending.url} alt="" fill sizes="96px" className="object-cover" />
        </div>
      )}
      <input name="caption" placeholder="Caption (optional)" className={input} />
      <input name="sortOrder" type="number" defaultValue={99} className={`${input} w-20`} />
      <button type="submit" className="rounded-full bg-olive px-5 py-2 text-sm font-semibold text-cream hover:bg-olive-dark">
        Add slide
      </button>
      <button type="button" onClick={() => setPending(null)} className="text-sm text-charcoal/60 underline">
        Cancel
      </button>
    </form>
  );
}
