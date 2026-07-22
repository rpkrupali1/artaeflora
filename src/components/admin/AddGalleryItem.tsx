"use client";

import Image from "next/image";
import { useState } from "react";
import { saveGalleryItem } from "@/app/admin/actions";
import Uploader from "./Uploader";

const input =
  "rounded-lg border border-sage bg-white px-3 py-1.5 text-sm focus:border-leaf focus:outline-none";
const TAGS = ["candles", "paintings", "classes", "events"];

export default function AddGalleryItem() {
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  if (!pendingUrl) {
    return <Uploader folder="gallery" label="Upload photo" onUploaded={(url) => setPendingUrl(url)} />;
  }

  return (
    <form action={saveGalleryItem} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="url" value={pendingUrl} />
      <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-sage-light">
        <Image src={pendingUrl} alt="" fill sizes="64px" className="object-cover" />
      </div>
      <input name="caption" placeholder="Caption (optional)" className={input} />
      <select name="tag" defaultValue="candles" className={input}>
        {TAGS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <button
        type="submit"
        onClick={() => setTimeout(() => setPendingUrl(null), 100)}
        className="rounded-full bg-olive px-5 py-2 text-sm font-semibold text-cream hover:bg-olive-dark"
      >
        Save to gallery
      </button>
      <button type="button" onClick={() => setPendingUrl(null)} className="text-sm text-charcoal/60 underline">
        Cancel
      </button>
    </form>
  );
}
