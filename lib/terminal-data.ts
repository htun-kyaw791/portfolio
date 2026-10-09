import { getExperiences, getProfile, getProjects, getTechnos } from "@/lib/content";
import type { TerminalData } from "@/components/terminal/types";

/** Content for the terminal, trimmed to what it prints (it ends up in the client payload). */
export async function getTerminalData(): Promise<TerminalData> {
  const [profile, projects, technos, experiences] = await Promise.all([getProfile(), getProjects(), getTechnos(), getExperiences()]);
  return {
    profile: {
      name: profile.name,
      handle: profile.handle,
      role: profile.role,
      availability: profile.availability,
      summary: profile.summary,
      location: profile.location,
      email: profile.email,
      phone: profile.phone,
      github: profile.github,
      linkedin: profile.linkedin,
      resume: profile.resume,
    },
    projects: projects.map(({ slug, name, description, date, role, technos, link, repoLink }) => ({
      slug,
      name,
      description,
      date,
      role,
      technos,
      link,
      repoLink,
    })),
    technos: technos.map(({ title, type }) => ({ title, type })),
    experiences: experiences.map(({ id, company, role, period }) => ({ id, company, role, period })),
  };
}
