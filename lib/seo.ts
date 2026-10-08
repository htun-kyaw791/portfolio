import type { Metadata } from "next";
import { getProfile } from "@/lib/content";

/** Per-page title/description/canonical, mirrored into Open Graph and Twitter. */
export async function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  /** `false` for routes with their own opengraph-image file, which Next links itself. */
  image?: false;
}): Promise<Metadata> {
  const site = await getProfile();
  const fullTitle = `${title} | ${site.name}`;
  // A page's `openGraph` replaces the root one (including the generated image), so other
  // pages point at the root share image explicitly.
  const shareImage = { url: "/opengraph-image", alt: `${site.name} — ${site.role}` };
  const ogImages = image === false ? {} : { images: [{ ...shareImage, width: 1200, height: 630 }] };
  const twImages = image === false ? {} : { images: [shareImage.url] };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, siteName: site.name, title: fullTitle, description, ...ogImages },
    twitter: { card: "summary_large_image", title: fullTitle, description, ...twImages },
  };
}
