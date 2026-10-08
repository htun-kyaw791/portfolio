import type { MetadataRoute } from "next";
import { getProjects, siteUrl } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/about-me", "/projects", "/contact-me"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const projectPages = (await getProjects()).map((p) => ({
    url: `${siteUrl}/projects/${p.slug}`,
    changeFrequency: "yearly" as const,
    priority: p.type.includes("favorite") ? 0.7 : p.type.includes("archive") ? 0.3 : 0.5,
  }));

  return [...pages, ...projectPages];
}
