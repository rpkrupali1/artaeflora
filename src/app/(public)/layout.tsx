import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";
import { db } from "@/lib/db";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Announcement bar is admin-managed (SiteSetting) with site.ts as fallback.
  let announcement = site.announcement as string;
  try {
    const rows = await db.siteSetting.findMany({
      where: { key: { in: ["announcementText", "announcementEnabled"] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    announcement = map.announcementEnabled === "true" ? (map.announcementText ?? "") : "";
  } catch {
    // DB unreachable — fall back to the static default rather than erroring the whole site.
  }

  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.name,
    description: `${site.descriptor} — handmade clay flowers, candles, custom paintings, art classes and event workshops.`,
    email: site.email,
    telephone: "+1-224-715-0463",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    image: "/og.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Naperville",
      addressRegion: "IL",
      addressCountry: "US",
    },
    sameAs: [site.instagram, site.pinterest, site.facebook],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
      />
      <Header announcement={announcement} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
