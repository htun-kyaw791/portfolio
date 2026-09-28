import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about-me", "/projects", "/contact-me"].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const projectPages = projects.map((p) => ({
    url: `${site.url}/projects/${p.slug}`,
    changeFrequency: "yearly" as const,
    priority: p.type.includes("favorite") ? 0.7 : p.type.includes("archive") ? 0.3 : 0.5,
  }));

  return [...pages, ...projectPages];
}
