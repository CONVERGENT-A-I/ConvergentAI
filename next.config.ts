import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

// Prevents the CDN / reverse-proxy in front of the GCP VM from caching HTML
// pages indefinitely. Next.js by default emits s-maxage=31536000 for fully
// static pages which means a new deployment is invisible until the CDN TTL
// expires. Setting no-store on HTML routes fixes this.
// Static assets (/_next/static/**) are EXCLUDED from this rule — they use
// content-hash filenames so long-lived caching there is safe and desirable.
const noCacheHeader = [
  {
    key: "Cache-Control",
    value: "no-store, must-revalidate",
  },
];

const nextConfig: NextConfig = {
  // Keyframe Labs packages are ESM-only — Next.js must transpile them
  transpilePackages: [
    "@keyframelabs/sdk",
    "@keyframelabs/elements",
    "@keyframelabs/react",
  ],
  async headers() {
    return [
      // Security headers on every response
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Disable CDN caching for HTML pages only (not static assets)
      {
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: noCacheHeader,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
