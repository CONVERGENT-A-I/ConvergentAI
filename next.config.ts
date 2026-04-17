import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keyframe Labs packages are ESM-only — Next.js must transpile them
  transpilePackages: [
    "@keyframelabs/sdk",
    "@keyframelabs/elements",
    "@keyframelabs/react",
  ],
  typescript: {
    ignoreBuildErrors: true,
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
