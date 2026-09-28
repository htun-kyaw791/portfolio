import type { Metadata, Viewport } from "next";
import { firaCode } from "@/lib/fonts";
import { site } from "@/data/site";
import Frame from "@/components/layout/Frame";
import JsonLd from "@/components/seo/JsonLd";
import "./globals.css";

const title = `${site.name} | ${site.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s | ${site.name}`,
  },
  description: site.summary,
  keywords: site.keywords,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: site.name,
    title,
    description: site.summary,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.summary,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#011627",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${firaCode.variable} antialiased`}>
      <body>
        <JsonLd />
        <Frame>{children}</Frame>
      </body>
    </html>
  );
}
