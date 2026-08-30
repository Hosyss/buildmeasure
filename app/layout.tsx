import type { Metadata } from "next";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { ClarityConsent } from "@/components/clarity-consent";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import "./professional.css";
import "./home-product.css";
import "./home-anchor.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BuildNumbers — Construction & DIY Calculators",
    template: "%s | BuildNumbers",
  },
  description:
    "Reference-backed construction and DIY calculators for concrete, paint, flooring, landscaping, and more.",
  applicationName: "BuildNumbers",
  category: "Construction",
  keywords: [
    "construction calculator",
    "material calculator",
    "concrete calculator",
    "DIY calculator",
  ],
  authors: [{ name: "Hosyss", url: "https://github.com/Hosyss" }],
  creator: "Hosyss",
  publisher: "BuildNumbers",
  other: {
    "google-adsense-account": "ca-pub-3369551572403499",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "BuildNumbers",
    title: "BuildNumbers — Construction & DIY Calculators",
    description:
      "Transparent, practical material estimates for construction and DIY projects.",
  },
  twitter: {
    card: "summary",
    title: "BuildNumbers — Construction & DIY Calculators",
    description:
      "Transparent, practical material estimates for construction and DIY projects.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AnalyticsTracker />
        <ClarityConsent />
        {children}
      </body>
    </html>
  );
}
