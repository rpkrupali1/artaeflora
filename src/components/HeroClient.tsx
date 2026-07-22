"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

export type HeroSlideData = {
  url: string;
  mediaType: "IMAGE" | "VIDEO";
  caption: string | null;
};

const ROTATE_MS = 5000;

export default function HeroClient({ slides }: { slides: HeroSlideData[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      {slides.map((s, i) =>
        s.mediaType === "VIDEO" ? (
          <video
            key={s.url}
            src={s.url}
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <Image
            key={s.url}
            src={s.url}
            alt={i === index ? (s.caption ?? "ArtaeFlora handmade work") : ""}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        )
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-charcoal/60" />

      <div className="relative z-10 flex flex-col items-center px-4 py-24 text-center">
        <h1 className="font-script text-6xl text-cream drop-shadow-md sm:text-7xl">
          {site.name}
        </h1>
        <p className="mt-6 max-w-xl font-hand text-2xl text-cream/95 drop-shadow sm:text-3xl">
          {site.tagline}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/shop"
            className="rounded-full bg-daisy px-8 py-3 font-semibold text-charcoal transition-colors hover:bg-cream"
          >
            Shop handmades
          </Link>
          <Link
            href="/classes"
            className="rounded-full border-2 border-cream px-8 py-3 font-semibold text-cream transition-colors hover:bg-cream/20"
          >
            Join a class
          </Link>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-5 z-10 flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.url}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-8 bg-daisy" : "w-2.5 bg-cream/60 hover:bg-cream"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
