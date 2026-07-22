import { db } from "@/lib/db";
import HeroClient, { type HeroSlideData } from "./HeroClient";

// Fallback when the admin hasn't configured any slides yet.
const defaultSlides: HeroSlideData[] = [
  { url: "/hero/slide-1.jpg", mediaType: "IMAGE", caption: "Handmade clay daisies" },
  { url: "/hero/slide-2.jpg", mediaType: "IMAGE", caption: "Sculpted petal by petal" },
];

export default async function Hero() {
  let slides = defaultSlides;
  try {
    const rows = await db.heroSlide.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length > 0) {
      slides = rows.map((r) => ({
        url: r.url,
        mediaType: r.mediaType === "VIDEO" ? "VIDEO" : "IMAGE",
        caption: r.caption,
      }));
    }
  } catch {
    // DB unreachable — static fallback keeps the home page alive.
  }
  return <HeroClient slides={slides} />;
}
