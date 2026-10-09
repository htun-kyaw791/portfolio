import Image from "next/image";
import { ViewTransition } from "react";
import type { Project } from "@/types";
import { cn } from "@/lib/cn";

/**
 * Screenshot, or a generated code-style cover for projects without one.
 * `morph`: the card's cover and the project page's cover share a view
 * transition name, so opening a project grows the image into place.
 */
export default function ProjectCover({
  project,
  className,
  priority,
  morph = true,
}: {
  project: Project;
  className?: string;
  priority?: boolean;
  morph?: boolean;
}) {
  const cover = (
    <div className={cn("relative overflow-hidden bg-[linear-gradient(135deg,var(--color-btn),var(--color-bg))]", className)}>
      {project.image ? (
        <Image
          src={project.image}
          alt={`${project.name} screenshot`}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover object-top"
        />
      ) : (
        <div className="flex h-full flex-col justify-center gap-1 px-6 text-sm">
          <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-accent-green/30 blur-3xl" />
          <div aria-hidden className="absolute -bottom-10 left-10 size-40 rounded-full bg-accent-indigo/40 blur-3xl" />
          <span className="relative text-text">{"// new project"}</span>
          <span className="relative text-lg text-white">{project.name}</span>
          <span className="relative text-accent-coral">{project.technos.join(" · ")}</span>
        </div>
      )}
    </div>
  );
  if (!morph) return cover;
  return (
    <ViewTransition name={`cover-${project.slug}`} share="morph" default="none">
      {cover}
    </ViewTransition>
  );
}
