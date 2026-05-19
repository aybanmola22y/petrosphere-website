import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // D:\pnpm-lock.yaml exists outside this app; pin tracing to this package root.
  outputFileTracingRoot: rootDir,
  // Use the default Next.js dist directory (`.next`) for reliable caching on Windows.
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "petrosphere.vercel.app" }],
        destination: "https://petrosphere.petros-global.com/:path*",
        permanent: true,
      },
      {
        source: "/cybersecurity",
        destination: "https://elearning.petrosphere.com.ph/",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "petrosphere.com.ph",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
