import type { Metadata, Viewport } from "next";
import { firaCode } from "@/lib/fonts";
import { colors } from "@/lib/colors";
import { getProfile, siteUrl } from "@/lib/content";
import { prefsInlineScript } from "@/lib/prefs-script";

// Shared by the portfolio and the /keystatic admin, so it holds no styles or chrome;
// those live in app/(site)/layout.tsx.

export async function generateMetadata(): Promise<Metadata> {
  const site = await getProfile();
  const title = `${site.name} | ${site.role}`;
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${site.name}`,
    },
    description: site.summary,
    keywords: [...site.keywords],
    authors: [{ name: site.name, url: siteUrl }],
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
}

export const viewport: Viewport = {
  themeColor: colors.bg,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme/data-motion are set by the inline script before React hydrates
    <html lang="en" className={`${firaCode.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsInlineScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
