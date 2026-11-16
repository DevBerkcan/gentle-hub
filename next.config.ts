import type { NextConfig } from "next";

const sharedHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      // The hub itself can never be framed.
      { source: "/((?!vorschau/).*)", headers: [{ key: "X-Frame-Options", value: "DENY" }, ...sharedHeaders] },
      // Customer previews: shown inside the Vorgang page (same origin only) and never indexed.
      {
        source: "/vorschau/:path*",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }, ...sharedHeaders],
      },
    ];
  },
};

export default nextConfig;
