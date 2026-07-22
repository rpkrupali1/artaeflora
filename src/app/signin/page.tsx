import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-script text-5xl text-leaf">Sign in</h1>
      <div className="mt-8 rounded-2xl bg-sage-light p-8">
        <p className="font-hand text-2xl text-leaf">Customer accounts are coming soon!</p>
        <p className="mt-3 text-sm leading-6 text-charcoal/70">
          You don&apos;t need an account to order — checkout works as a guest, and
          your receipt arrives by email. Accounts with order history are on the way.
        </p>
        <p className="mt-4 text-sm text-charcoal/70">
          Questions about an order?{" "}
          <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="font-medium text-leaf underline">
            WhatsApp us
          </a>
          .
        </p>
      </div>
      <p className="mt-6 text-xs text-charcoal/50">
        Shop owner? <Link href="/admin" className="underline hover:text-leaf">Admin sign-in</Link>
      </p>
    </div>
  );
}
