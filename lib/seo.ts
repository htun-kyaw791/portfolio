import type { Metadata } from "next";
import { site } from "@/data/site";

// A page's `openGraph` replaces the root one (including the generated image), so the
// share image is always declared explicitly. Pass `image` for routes with their own.
const defaultImage = { url: "/opengraph-image", alt: `${site.name} — ${site.role}` };

/** Per-page title/description/canonical, mirrored into Open Graph and Twitter. */
export function pageMetadata({
  title,
  description,
  path,
  image = defaultImage,
}: {
  title: string;
  description: string;
  path: string;
  image?: { url: string; alt: string };
}): Metadata {
  const fullTitle = `${title} | ${site.name}`;
  const images = [{ ...image, width: 1200, height: 630 }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, siteName: site.name, title: fullTitle, description, images },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image.url] },
  };
}
