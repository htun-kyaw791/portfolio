import { cache } from "react";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../keystatic.config";
import type { About, Experience, Profile, Project, SocialLink, Tech } from "@/types";

// Content lives in content/ and is edited through Keystatic (/keystatic in dev).
// Everything here runs on the server at build time; client components get plain props.
const reader = createReader(process.cwd(), keystaticConfig);

/** Deployment setting, not content: set NEXT_PUBLIC_SITE_URL if the domain differs. */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.htunkyaw.optionenter.com";

export const getProfile = cache(async (): Promise<Profile> => {
  const p = await reader.singletons.profile.readOrThrow();
  return {
    ...p,
    github: p.github ?? "",
    linkedin: p.linkedin ?? "",
    gitlab: p.gitlab ?? "",
    photo: p.photo ?? "",
    resume: p.resume ?? "",
  };
});

export const getExperiences = cache(async (): Promise<Experience[]> => {
  const { roles } = await reader.singletons.experience.readOrThrow();
  return roles.map((r) => ({ ...r, url: r.url ?? "" }));
});

export const getAbout = cache(async (): Promise<About> => {
  const a = await reader.singletons.about.readOrThrow();
  return {
    ...a,
    education: a.education.map((e) => ({ ...e, url: e.url ?? "" })),
    certifications: a.certifications.map((c) => ({ ...c, link: c.link ?? "" })),
  };
});

export const getTechnos = cache(async (): Promise<Tech[]> => {
  const { technos } = await reader.singletons.techStack.readOrThrow();
  return technos.map((t) => ({ ...t, url: t.url ?? "" }));
});

export const getProjects = cache(async (): Promise<Project[]> => {
  const entries = await reader.collections.projects.all();
  return entries
    .sort((a, b) => (a.entry.order ?? 0) - (b.entry.order ?? 0) || a.entry.name.localeCompare(b.entry.name))
    .map(({ slug, entry: e }) => ({
      slug,
      name: e.name,
      description: e.description,
      date: e.date,
      type: e.type,
      technos: e.technos,
      link: e.link ?? "",
      repoLink: e.repoLink ?? "",
      image: e.image ?? undefined,
      role: e.role,
      scale: e.scale,
      businessImpact: e.businessImpact,
      responsibilities: e.responsibilities,
      achievements: e.achievements,
      architecture: e.architecture,
    }));
});

export async function getProject(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug);
}

/** Footer icons. */
export function socialLinks(p: Profile): SocialLink[] {
  return [
    { name: "github", href: p.github, icon: "github" as const },
    { name: "linkedin", href: p.linkedin, icon: "linkedin" as const },
  ].filter((l) => l.href);
}

/** Contact page "find-me-also-in" list. */
export function findMeAlso(p: Profile): SocialLink[] {
  return [
    { name: "GitHub", href: p.github, icon: "github" as const },
    { name: "LinkedIn", href: p.linkedin, icon: "linkedin" as const },
    { name: "GitLab", href: p.gitlab, icon: "gitlab" as const },
    { name: "Resume (PDF)", href: p.resume, icon: "resume" as const },
  ].filter((l) => l.href);
}
