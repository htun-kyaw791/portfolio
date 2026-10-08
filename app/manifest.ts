import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/content";
import { colors } from "@/lib/colors";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getProfile();
  return {
    name: `${site.name} — ${site.role}`,
    short_name: site.name,
    description: site.summary,
    start_url: "/",
    display: "standalone",
    background_color: colors.deep,
    theme_color: colors.bg,
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
