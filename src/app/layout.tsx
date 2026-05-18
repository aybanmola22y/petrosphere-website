import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";
import { AppChrome } from "@/components/layout/AppChrome";
import { getSiteUrl } from "@/lib/site-url";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--app-font-sans",
  display: "swap",
});

const siteUrl = getSiteUrl();
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Petrosphere Incorporated | Training, Review, and Consultancy Company",
    template: "%s | Petrosphere",
  },
  description:
    "Premium safety, technical, and compliance training for enterprise clients.",
  keywords: [
    "Petrosphere",
    "safety training",
    "DOLE training",
    "BOSH",
    "COSH",
    "MESH",
    "ACLS",
    "corporate training Philippines",
  ],
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: siteUrl,
    siteName: "Petrosphere Incorporated",
    title: "Petrosphere Incorporated | Training, Review, and Consultancy Company",
    description:
      "Premium safety, technical, and compliance training for enterprise clients.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Petrosphere Incorporated",
    description:
      "Premium safety, technical, and compliance training for enterprise clients.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/weblogo.ico", type: "image/x-icon" }],
  },
  ...(googleVerification
    ? {
        verification: {
          google: googleVerification,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
