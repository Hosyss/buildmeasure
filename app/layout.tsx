import type { Metadata } from "next";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BuildMeasure — Construction & DIY Calculators",
    template: "%s | BuildMeasure",
  },
  description:
    "Reference-backed construction and DIY calculators for concrete, paint, flooring, landscaping, and more.",
  applicationName: "BuildMeasure",
  category: "Construction",
  keywords: [
    "construction calculator",
    "material calculator",
    "concrete calculator",
    "DIY calculator",
  ],
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "BuildMeasure",
    title: "BuildMeasure — Construction & DIY Calculators",
    description:
      "Transparent, practical material estimates for construction and DIY projects.",
  },
  twitter: {
    card: "summary",
    title: "BuildMeasure — Construction & DIY Calculators",
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
        {children}
      </body>
    </html>
  );
}
