import Link from "next/link";
import SnakeGame from "@/components/hello/SnakeGame";
import { getProfile } from "@/lib/content";

export default async function HelloPage() {
  const site = await getProfile();

  return (
    <section className="relative flex flex-1 items-center justify-center gap-24 overflow-y-auto overflow-x-hidden px-6 py-10 lg:justify-between lg:px-[8%]">
      {/* background blurs */}
      <div aria-hidden className="pointer-events-none absolute right-[8%] top-[20%] size-80 rounded-full bg-accent-green/40 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute bottom-[15%] right-[25%] size-80 rounded-full bg-accent-indigo/50 blur-[120px]" />

      <div className="relative z-10 max-w-xl">
        <p className="text-lg text-text-light">Hi all. I am</p>
        <h1 className="mt-2 text-5xl leading-tight text-text-light md:text-6xl">{site.name}</h1>
        <p className="mt-2 text-xl text-accent-green md:text-3xl md:text-accent-indigo">&gt; {site.role}</p>
        <p className="mt-6 max-w-lg text-sm leading-6">{site.summary}</p>
        {site.availability && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent-green/30 bg-accent-green/10 px-3 py-1 text-xs text-accent-green">
            <span aria-hidden className="size-2 rounded-full bg-accent-green glow-accent-green [--glow-blur:6px]" />
            {site.availability}
          </p>
        )}

        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
          {site.stats.map((s) => (
            <div key={s.label}>
              <dt className="text-2xl text-accent-orange">{s.value}</dt>
              <dd className="text-xs">{s.label}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 space-y-2 text-sm md:text-base">
          <p className="hidden lg:block">{"// complete the game to continue"}</p>
          {site.github && (
            <>
              <p>{"// find my profile on Github:"}</p>
              <p className="break-all">
                <span className="text-accent-indigo">const</span>{" "}
                <span className="text-accent-green">githubLink</span> <span className="text-white">=</span>{" "}
                <a href={site.github} target="_blank" rel="noreferrer" className="text-accent-coral hover:underline">
                  “{site.github}”
                </a>
              </p>
            </>
          )}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/projects" className="rounded-lg bg-btn-primary px-4 py-2.5 text-sm text-bg-deep transition-colors hover:bg-btn-primary-hover">
            view-projects
          </Link>
          <Link href="/about-me" className="rounded-lg bg-btn px-4 py-2.5 text-sm text-white transition-colors hover:bg-btn-hover">
            view-experience
          </Link>
          {site.resume && (
            <a
              href={site.resume}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-btn px-4 py-2.5 text-sm text-white transition-colors hover:bg-btn-hover"
            >
              download-cv
            </a>
          )}
        </div>
      </div>

      <div className="relative z-10 hidden lg:block">
        <SnakeGame />
      </div>
    </section>
  );
}
