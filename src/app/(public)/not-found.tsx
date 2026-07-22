import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <Image src="/brand/logo-mini.png" alt="" width={53} height={80} className="h-20 w-auto opacity-80" />
      <h1 className="mt-6 font-script text-5xl text-leaf">Oops!</h1>
      <p className="mt-4 font-hand text-2xl text-charcoal/70">
        This page seems to have wandered off the shelf.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-full bg-olive px-8 py-3 font-semibold text-cream transition-colors hover:bg-olive-dark"
        >
          Back home
        </Link>
        <Link
          href="/shop"
          className="rounded-full border-2 border-leaf px-8 py-3 font-semibold text-leaf transition-colors hover:bg-sage-light"
        >
          Browse the shop
        </Link>
      </div>
    </div>
  );
}
