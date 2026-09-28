import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";
import { getProject, projects } from "@/data/projects";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";
import TabBar from "@/components/ui/TabBar";
import ProjectCover from "@/components/projects/ProjectCover";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return pageMetadata({
    title: project.name,
    description: project.description,
    path: `/projects/${project.slug}`,
    image: { url: `/projects/${project.slug}/opengraph-image`, alt: `${project.name} — project by ${site.name}` },
  });
}

function ListBlock({ name, items }: { name: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <section>
      <p>
        <span className="text-accent-indigo">const</span> <span className="text-accent-green">{name}</span>{" "}
        <span className="text-white">=</span> [
      </p>
      <ul className="space-y-1 py-2 pl-6">
        {items.map((item) => (
          <li key={item} className="text-accent-coral">
            &quot;{item}&quot;,
          </li>
        ))}
      </ul>
      <p>];</p>
    </section>
  );
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TabBar label={`${project.slug}.tsx`} closeHref="/projects" closeLabel="Back to projects" />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12">
        <div className="mx-auto max-w-5xl">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm hover:text-white">
            <FiArrowLeft /> _projects
          </Link>

          <header className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-4">
              <p className="text-sm">{`// ${project.type.join(" · ")} · ${project.date}`}</p>
              <h1 className="text-3xl text-text-light md:text-4xl">{project.name}</h1>
              {project.role && <p className="text-accent-indigo">&gt; {project.role}</p>}
              <p className="leading-7">{project.description}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-btn-primary px-4 py-2.5 text-sm text-bg-deep hover:bg-btn-primary-hover"
                  >
                    <FiExternalLink /> view-live
                  </a>
                )}
                {project.repoLink && (
                  <a
                    href={project.repoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-btn px-4 py-2.5 text-sm text-white hover:bg-btn-hover"
                  >
                    <FaGithub /> source-code
                  </a>
                )}
                {!project.link && !project.repoLink && (
                  <span className="text-sm">{"// private / internal project"}</span>
                )}
              </div>
            </div>
            <ProjectCover project={project} priority className="h-64 rounded-2xl border border-line lg:h-auto lg:min-h-64" />
          </header>

          <div className="mt-12 grid gap-10 text-sm leading-7 lg:grid-cols-2">
            <div className="space-y-8">
              {(project.scale || project.businessImpact) && (
                <section className="space-y-2">
                  {project.scale && <p><span className="text-white">{"// scale: "}</span>{project.scale}</p>}
                  {project.businessImpact && <p><span className="text-white">{"// impact: "}</span>{project.businessImpact}</p>}
                </section>
              )}
              <ListBlock name="responsibilities" items={project.responsibilities} />
              <ListBlock name="achievements" items={project.achievements} />
            </div>
            <div className="space-y-8">
              <ListBlock name="architecture" items={project.architecture} />
              <ListBlock name="stack" items={project.technos} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
