import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { buildAboutSections } from "@/lib/about";
import { getAbout, getExperiences, getProfile, getProjects, getTechnos } from "@/lib/content";
import AboutExplorer from "@/components/about/AboutExplorer";
import PageTransition from "@/components/layout/PageTransition";

export async function generateMetadata(): Promise<Metadata> {
  const [site, experiences] = await Promise.all([getProfile(), getExperiences()]);
  const companies = experiences.map((e) => e.company).join(" and ");
  return pageMetadata({
    title: "About me",
    description: `${site.role}${companies ? `: experience at ${companies}` : ""}, education, certifications and tech stack.`,
    path: "/about-me",
  });
}

export default async function AboutPage() {
  const [profile, about, experiences, technos, projects] = await Promise.all([
    getProfile(),
    getAbout(),
    getExperiences(),
    getTechnos(),
    getProjects(),
  ]);
  // how many projects use each tech, for the globe's hover note
  const usage: Record<string, number> = {};
  for (const p of projects) for (const t of p.technos) usage[t] = (usage[t] ?? 0) + 1;
  return (
    <PageTransition>
      <AboutExplorer
        sections={buildAboutSections(profile, about, experiences)}
        profile={profile}
        experiences={experiences}
        technos={technos}
        usage={usage}
      />
    </PageTransition>
  );
}
