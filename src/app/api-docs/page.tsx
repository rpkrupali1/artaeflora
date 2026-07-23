import type { Metadata } from "next";
import SwaggerViewer from "@/components/SwaggerViewer";

export const metadata: Metadata = {
  title: "API documentation",
  robots: { index: false, follow: false },
};

// Interactive API docs (Swagger UI) for /openapi.yaml — "Try it out" sends
// real requests to this same host. Ships with every deployment, so the docs
// always match the deployed contract. Noindexed; for owner/developer use.
//
// Notes for trying endpoints:
// - /api/checkout works directly (mock mode in dev).
// - /api/upload needs the admin session: sign in at /admin first in the same
//   browser — the cookie is sent automatically (withCredentials).
// - /api/webhooks/stripe will 503/400 by design without Stripe's signature.
export default function ApiDocsPage() {
  return <SwaggerViewer />;
}
