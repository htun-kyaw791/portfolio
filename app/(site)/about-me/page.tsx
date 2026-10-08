import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { buildAboutSections } from "@/lib/about";
import { getAbout, getExperiences, getProfile, getTechnos } from "@/lib/content";
import AboutExplorer from "@/components/about/AboutExplorer";

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
  const [profile, about, experiences, technos] = await Promise.all([getProfile(), getAbout(), getExperiences(), getTechnos()]);
  return (
    <AboutExplorer
      sections={buildAboutSections(profile, about, experiences)}
      profile={profile}
      experiences={experiences}
      technos={technos}
    />
  );
}
