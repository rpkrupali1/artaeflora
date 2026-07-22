"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { site } from "@/lib/site";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/paintings", label: "Custom Paintings" },
  { href: "/classes", label: "Classes" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-sage bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <Link href="/" className="-ml-3 flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image
            src="/brand/logo-full.png"
            alt="ArtaeFlora — unique handmades"
            width={133}
            height={96}
            priority
            className="h-24 w-auto"
          />
        </Link>

        <div className="hidden flex-col items-stretch gap-3 lg:flex">
          {site.announcement && (
            <div className="rounded-full bg-sage px-6 py-2 text-center text-sm font-medium text-leaf-dark">
              {site.announcement}
            </div>
          )}
          <nav className="flex items-center justify-between gap-6 px-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-charcoal transition-colors hover:text-leaf"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 text-leaf hover:bg-sage-light lg:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {site.announcement && (
        <div className="bg-sage px-4 py-1.5 text-center text-xs font-medium text-leaf-dark lg:hidden">
          {site.announcement}
        </div>
      )}

      {open && (
        <nav className="border-t border-sage bg-cream px-4 pb-4 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-3 font-medium text-charcoal hover:bg-sage-light hover:text-leaf"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
