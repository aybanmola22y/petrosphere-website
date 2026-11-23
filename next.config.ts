import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const mediaBaseUrl = process.env.HOSTINGER_MEDIA_BASE_URL?.trim();
let mediaHostname: string | undefined;
try {
  if (mediaBaseUrl) mediaHostname = new URL(mediaBaseUrl).hostname;
} catch {
  mediaHostname = undefined;
}

const cmsSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_WEBSITE?.trim();
let cmsSupabaseHostname: string | undefined;
try {
  if (cmsSupabaseUrl) cmsSupabaseHostname = new URL(cmsSupabaseUrl).hostname;
} catch {
  cmsSupabaseHostname = undefined;
}

const nextConfig: NextConfig = {
  // D:\pnpm-lock.yaml exists outside this app; pin tracing to this package root.
  outputFileTracingRoot: rootDir,
  // Use the default Next.js dist directory (`.next`) for reliable caching on Windows.
  reactStrictMode: true,
  // Avoid dev-only RSC manifest errors from the segment explorer (Next.js 15.5+).
  experimental: {
    devtoolSegmentExplorer: false,
    // Allow testimonial videos up to ~50MB through middleware body cloning.
    middlewareClientMaxBodySize: "50mb",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/sitemap.xml",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400",
          },
          {
            key: "Content-Type",
            value: "application/xml; charset=utf-8",
          },
        ],
      },
      {
        source: "/google-sitemap.xml",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400",
          },
          {
            key: "Content-Type",
            value: "application/xml; charset=utf-8",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml/",
        destination: "/sitemap.xml",
      },
      {
        source: "/google-sitemap.xml",
        destination: "/sitemap.xml",
      },
      {
        source: "/google-sitemap.xml/",
        destination: "/sitemap.xml",
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
    qualities: [75, 88, 92],
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
      ...(mediaHostname && mediaHostname !== "petrosphere.com.ph"
        ? [{ protocol: "https" as const, hostname: mediaHostname, pathname: "/**" }]
        : []),
      ...(cmsSupabaseHostname
        ? [{ protocol: "https" as const, hostname: cmsSupabaseHostname, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
};

export default nextConfig;
