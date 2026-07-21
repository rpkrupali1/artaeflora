import Link from "next/link";
import { site } from "@/lib/site";

const socials = [
  {
    label: "Instagram",
    href: site.instagram,
    path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 1.8c-3.1 0-3.5 0-4.8.1-1.1.1-1.5.2-1.8.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.3-.3.7-.3 1.8-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.5.3 1.8.2.5.4.8.7 1.1.3.3.6.5 1.1.7.3.1.7.3 1.8.3 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.5-.2 1.8-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.3.3-.7.3-1.8.1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.5-.3-1.8-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.3-.1-.7-.3-1.8-.3-1.3-.1-1.7-.1-4.8-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zm6.2-8.3a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0z",
  },
  {
    label: "Pinterest",
    href: site.pinterest,
    path: "M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.9 6.4 9.3-.1-.8-.2-2 .04-2.9l1.15-4.9s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.85 0 1.26.64 1.26 1.4 0 .86-.55 2.14-.83 3.33-.24 1 .5 1.8 1.48 1.8 1.78 0 3.14-1.87 3.14-4.58 0-2.4-1.72-4.07-4.18-4.07-2.85 0-4.52 2.13-4.52 4.34 0 .86.33 1.78.74 2.28a.3.3 0 0 1 .07.29l-.28 1.13c-.04.18-.15.22-.34.13-1.25-.58-2.03-2.4-2.03-3.87 0-3.15 2.29-6.04 6.6-6.04 3.47 0 6.16 2.47 6.16 5.77 0 3.44-2.17 6.21-5.18 6.21-1.01 0-1.96-.53-2.29-1.15l-.62 2.37c-.22.87-.83 1.96-1.24 2.62.93.29 1.92.45 2.95.45 5.5 0 10-4.5 10-10S17.5 2 12 2z",
  },
  {
    label: "Facebook",
    href: site.facebook,
    path: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z",
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-olive text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-script text-4xl">ArtaeFlora</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-cream/90">{site.tagline}</p>
          <p className="mt-2 text-sm text-cream/80">By {site.by} · {site.city}</p>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-wide text-sage-light">Get in touch</p>
          <ul className="space-y-2">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-daisy">{site.email}</a>
            </li>
            <li>
              <a href={site.phoneHref} className="hover:text-daisy">{site.phone}</a>
            </li>
            <li>
              <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-daisy">
                WhatsApp {site.whatsappNumber}
              </a>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-wide text-sage-light">Follow along</p>
          <div className="flex gap-4">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="rounded-full bg-cream/10 p-2 transition-colors hover:bg-cream/25"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
          <p className="mt-4 text-cream/80">@artaeflora everywhere</p>
        </div>
      </div>
      <div className="border-t border-cream/20 py-4 text-center text-xs text-cream/70">
        © {new Date().getFullYear()} ArtaeFlora · Naperville, IL ·{" "}
        <Link href="/contact" className="underline hover:text-daisy">Contact us</Link>
      </div>
    </footer>
  );
}
