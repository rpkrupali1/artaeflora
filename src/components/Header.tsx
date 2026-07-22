"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/paintings", label: "Custom Paintings" },
  { href: "/classes", label: "Classes" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function IconLink({
  href,
  label,
  children,
  onClick,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-full p-2 text-leaf transition-colors hover:bg-sage-light"
    >
      {children}
    </Link>
  );
}

const icons = {
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  ),
  user: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  ),
  cart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 7h12l-1.2 12.2a1.8 1.8 0 0 1-1.8 1.8H9a1.8 1.8 0 0 1-1.8-1.8L6 7z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  ),
};

function CartIcon() {
  const { count } = useCart();
  return (
    <span className="relative inline-flex">
      {icons.cart}
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-daisy px-1 text-[10px] font-bold text-charcoal">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
}

export default function Header({ announcement }: { announcement?: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-sage bg-cream/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-2 lg:px-8">
        <Link href="/" className="-ml-3 flex items-center gap-2" onClick={close}>
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
          {announcement && (
            <div className="rounded-full bg-sage px-6 py-2 text-center text-sm font-medium text-leaf-dark">
              {announcement}
            </div>
          )}
          <div className="flex items-center justify-between gap-4 px-2">
            <nav className="flex items-center gap-6">
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
            <div className="flex items-center gap-1 border-l border-sage pl-3">
              <IconLink href="/search" label="Search">{icons.search}</IconLink>
              <IconLink href="/signin" label="Account">{icons.user}</IconLink>
              <IconLink href="/cart" label="Cart"><CartIcon /></IconLink>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <IconLink href="/search" label="Search" onClick={close}>{icons.search}</IconLink>
          <IconLink href="/cart" label="Cart" onClick={close}><CartIcon /></IconLink>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="rounded-md p-2 text-leaf hover:bg-sage-light"
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
      </div>

      {announcement && (
        <div className="bg-sage px-4 py-1.5 text-center text-xs font-medium text-leaf-dark lg:hidden">
          {announcement}
        </div>
      )}

      {open && (
        <nav className="border-t border-sage bg-cream px-4 pb-4 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={close}
              className="block rounded-md px-2 py-3 font-medium text-charcoal hover:bg-sage-light hover:text-leaf"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/signin"
            onClick={close}
            className="block rounded-md px-2 py-3 font-medium text-charcoal hover:bg-sage-light hover:text-leaf"
          >
            Account
          </Link>
        </nav>
      )}
    </header>
  );
}

