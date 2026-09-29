import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // The dev-only route indicator defaults to the bottom-left, where it sits on
  // top of the admin sidebar's log out button. Errors still surface either way.
  devIndicators: {
    position: "bottom-right",
  },
  // No "X-Powered-By: Next.js": it tells attackers what to look for and helps no one.
  poweredByHeader: false,
  // Standard protections, on every response. No Content-Security-Policy yet: the
  // admin, Google Analytics, Google Translate and Cloudflare Turnstile would each
  // need allow-listing, and a wrong policy silently breaks them.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Browsers only ever use HTTPS for this site once they have seen it.
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          // Files are used as the type the server says, never guessed.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Other sites cannot frame these pages (clickjacking); the admin can.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Other sites see where a visitor came from, not the full address.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Device features the site never uses. Card payments added later
          // (e.g. Stripe's in-page wallet buttons) would need "payment" re-allowed.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), usb=(), payment=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
  // Old addresses that still carry search value or saved links.
  async redirects() {
    return [
      {
        // Concept project renamed so it doesn't resemble a real company.
        source: "/work/verve-coffee-co",
        destination: "/work/fernwhistle-coffee",
        permanent: true,
      },
    ];
  },
  experimental: {
    // The site and the admin each have their own root layout, so unmatched URLs
    // need a standalone 404 page rather than one composed from a shared layout.
    globalNotFound: true,
  },
};

export default withPayload(nextConfig);
