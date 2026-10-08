import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import type { Project } from "@/types";
import ProjectCover from "./ProjectCover";

export default function ProjectCard({
  project,
  number,
  priority,
}: {
  project: Project;
  number: number;
  priority?: boolean;
}) {
  return (
    <article className="flex min-w-0 flex-col">
      <h2 className="mb-4 truncate text-sm">
        <span className="font-bold text-accent-indigo">Project {number}</span>
        {" // "}_{project.slug}
      </h2>
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-bg-input">
        <Link href={`/projects/${project.slug}`} className="block border-b border-line">
          <ProjectCover project={project} className="h-40" priority={priority} />
        </Link>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <p className="text-xs text-accent-orange">
            {project.date}
            {project.role && <span className="text-text">{` · ${project.role}`}</span>}
          </p>
          <p className="line-clamp-3 text-sm">{project.description}</p>
          <ul className="flex flex-wrap gap-1.5">
            {project.technos.slice(0, 5).map((t) => (
              <li key={t} className="rounded-md border border-line px-2 py-0.5 text-xs text-accent-coral">
                {t}
              </li>
            ))}
            {project.technos.length > 5 && <li className="px-1 text-xs">+{project.technos.length - 5}</li>}
          </ul>
          <div className="mt-auto flex items-center gap-3 pt-2">
            <Link
              href={`/projects/${project.slug}`}
              className="rounded-lg bg-btn px-4 py-2.5 text-sm text-white transition-colors hover:bg-btn-hover"
            >
              view-project
            </Link>
            {project.link && (
              <a href={project.link} target="_blank" rel="noreferrer" aria-label="Live site" className="p-2 text-lg hover:text-white">
                <FiExternalLink />
              </a>
            )}
            {project.repoLink && (
              <a href={project.repoLink} target="_blank" rel="noreferrer" aria-label="Source code" className="p-2 text-lg hover:text-white">
                <FaGithub />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
