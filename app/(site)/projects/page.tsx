import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getProfile, getProjects } from "@/lib/content";
import ProjectsExplorer from "@/components/projects/ProjectsExplorer";

export async function generateMetadata(): Promise<Metadata> {
  const [site, projects] = await Promise.all([getProfile(), getProjects()]);
  return pageMetadata({
    title: "Projects",
    description: `${projects.length} projects by ${site.name} — enterprise ERP portals, loan management, marketplaces, workflow platforms and frontend experiments.`,
    path: "/projects",
  });
}

export default async function ProjectsPage() {
  return <ProjectsExplorer projects={await getProjects()} />;
}
