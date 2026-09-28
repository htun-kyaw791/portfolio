import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { projects } from "@/data/projects";
import ProjectsExplorer from "@/components/projects/ProjectsExplorer";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description: `${projects.length} projects by Htun Kyaw — enterprise ERP portals, loan management, marketplaces, workflow platforms and frontend experiments.`,
  path: "/projects",
});

export default function ProjectsPage() {
  return <ProjectsExplorer />;
}
