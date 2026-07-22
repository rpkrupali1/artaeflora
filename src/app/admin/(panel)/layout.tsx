import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../auth-actions";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/hero", label: "Hero slides" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/users", label: "Admin users" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-sage bg-white">
        <Link href="/admin" className="flex flex-col items-start gap-1 px-5 py-5">
          <Image
            src="/brand/logo-full.png"
            alt="ArtaeFlora"
            width={111}
            height={80}
            className="h-16 w-auto"
          />
          <span className="font-hand text-lg text-charcoal/60">Shop admin</span>
        </Link>
        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-charcoal hover:bg-sage-light hover:text-leaf"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-sage p-3">
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-sm text-charcoal/70 hover:bg-sage-light"
          >
            ← View site
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-charcoal/70 hover:bg-sage-light"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-cream p-6 lg:p-10">{children}</main>
    </div>
  );
}
