"use client";

import Script from "next/script";

declare global {
  interface Window {
    SwaggerUIBundle?: (config: Record<string, unknown>) => void;
  }
}

export default function SwaggerViewer() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
      />
      <div id="swagger-ui" />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.SwaggerUIBundle?.({
            url: "/openapi.yaml",
            dom_id: "#swagger-ui",
            tryItOutEnabled: true,
            displayRequestDuration: true,
            withCredentials: true,
          });
        }}
      />
    </div>
  );
}
