import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "ArtaeFlora — unique handmades by Krupali & Ishna, clay artists in Naperville, IL.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col items-center text-center">
        <Image
          src="/brand/logo-full.png"
          alt="ArtaeFlora logo"
          width={266}
          height={192}
          className="h-40 w-auto"
        />
        <h1 className="mt-6 font-script text-5xl text-leaf">Our story</h1>
      </div>

      <div className="mx-auto mt-8 max-w-2xl space-y-5 leading-8 text-charcoal/85">
        <p>
          ArtaeFlora is the work of <strong>Krupali &amp; Ishna</strong> — clay
          artists in {site.city} who believe a gift should feel like the person
          it&apos;s for. What started with sculpting natural-looking flowers from
          clay grew into a little studio of handmade things: candles and candle
          holders, bonsais, mugs, jewelry, magnets, miniatures, and custom
          paintings.
        </p>
        <p>
          Everything is made by hand, one piece at a time. No molds-by-the-thousand,
          no two ever quite alike — that&apos;s the point. Whether it&apos;s a Diwali
          gift, a wedding keepsake, or a tiny magnet that makes someone smile at the
          fridge, we make it with the person receiving it in mind.
        </p>
        <p>
          And because making things feels as good as giving them, we teach:
          small-group classes at our studio, workshops at your venue or online,
          and hands-on art activities for parties and corporate events.{" "}
          <em>{site.punchlines.classes}</em>
        </p>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <Link
          href="/shop"
          className="rounded-full bg-olive px-8 py-3 font-semibold text-cream transition-colors hover:bg-olive-dark"
        >
          Browse the shop
        </Link>
        <Link
          href="/contact"
          className="rounded-full border-2 border-leaf px-8 py-3 font-semibold text-leaf transition-colors hover:bg-sage-light"
        >
          Say hello
        </Link>
      </div>
    </div>
  );
}
