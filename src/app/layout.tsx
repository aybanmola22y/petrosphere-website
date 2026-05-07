import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";
import { AppChrome } from "@/components/layout/AppChrome";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--app-font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Petrosphere Incorporated | Training, Review, and Consultancy Company",
    template: "%s | Petrosphere",
  },
  description:
    "Premium safety, technical, and compliance training for enterprise clients.",
  icons: {
    icon: [{ url: "/weblogo.ico", type: "image/x-icon" }],
  },
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
