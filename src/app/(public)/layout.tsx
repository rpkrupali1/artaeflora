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

  return (
    <>
      <Header announcement={announcement} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
