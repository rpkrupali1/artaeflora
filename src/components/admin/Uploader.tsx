"use client";

import { useRef, useState } from "react";

// Uploads a file to /api/upload and hands the URL back to the parent.
export default function Uploader({
  folder,
  accept = "image/*",
  onUploaded,
  label = "Upload",
}: {
  folder: "products" | "gallery" | "hero";
  accept?: string;
  onUploaded: (url: string, mediaType: "IMAGE" | "VIDEO") => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
      } else {
        onUploaded(data.url, data.mediaType);
      }
    } catch {
      setError("Upload failed — check your connection.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="rounded-full bg-sage-light px-4 py-2 text-sm font-medium text-leaf-dark transition-colors hover:bg-sage disabled:opacity-60"
      >
        {busy ? "Uploading…" : label}
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
