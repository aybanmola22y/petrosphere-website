import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // D:\pnpm-lock.yaml exists outside this app; pin tracing to this package root.
  outputFileTracingRoot: rootDir,
  // Use the default Next.js dist directory (`.next`) for reliable caching on Windows.
  reactStrictMode: true,
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
