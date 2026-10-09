"use client";

import { games, isGameId } from "@/components/arcade/games";
import { summonBlackHole, toast } from "@/lib/events";
import { getPrefs, setPrefs } from "@/lib/prefs";
import { techTypes, type TechType } from "@/lib/taxonomy";
import { getTheme, isThemeId, themes } from "@/lib/themes";
import Run from "./Run";
import type { Command, CommandContext, TerminalData } from "./types";

// A tiny pretend shell over the portfolio content. Output is JSX so commands
// can print coloured text and clickable follow-up commands.

const PAGES: Record<string, string> = {
  "~": "/",
  "/": "/",
  hello: "/",
  "about-me": "/about-me",
  about: "/about-me",
  projects: "/projects",
  arcade: "/arcade",
  "contact-me": "/contact-me",
  contact: "/contact-me",
  terminal: "/terminal",
};

const FILES = ["about.md", "contact.md", "experience.log", "skills.json", "resume.pdf"] as const;
const DIRS = ["about-me/", "projects/", "arcade/", "contact-me/"] as const;

export function cwd(pathname: string) {
  return pathname === "/" ? "~" : `~${pathname}`;
}

function external(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

function Key({ children }: { children: React.ReactNode }) {
  return <span className="text-accent-orange">{children}</span>;
}

function Str({ children }: { children: React.ReactNode }) {
  return <span className="text-accent-coral">&quot;{children}&quot;</span>;
}

function findProject(data: TerminalData, arg: string | undefined) {
  if (!arg) return undefined;
  const slug = arg.replace(/^projects\//, "").replace(/\/$/, "").toLowerCase();
  return data.projects.find((p) => p.slug === slug) ?? data.projects.find((p) => p.slug.startsWith(slug));
}

function catProject(ctx: CommandContext, slug: string) {
  const p = findProject(ctx.data, slug);
  if (!p) return ctx.print(`cat: ${slug}: No such file or directory`, "err");
  ctx.print(
    <div className="space-y-1">
      <p className="text-text-light">
        # {p.name} <span className="text-text">({p.date})</span>
      </p>
      {p.role && <p className="text-accent-indigo">&gt; {p.role}</p>}
      <p>{p.description}</p>
      <p>
        <Key>stack</Key>: {p.technos.map((t, i) => <span key={t}>{i ? ", " : ""}<Str>{t}</Str></span>)}
      </p>
      <p className="flex flex-wrap gap-x-4">
        <Run cmd={`open ${p.slug}`}>open {p.slug}</Run>
        {p.link && (
          <a href={p.link} target="_blank" rel="noreferrer" className="text-accent-green hover:underline">
            live ↗
          </a>
        )}
        {p.repoLink && (
          <a href={p.repoLink} target="_blank" rel="noreferrer" className="text-accent-green hover:underline">
            source ↗
          </a>
        )}
      </p>
    </div>,
  );
}

function skillsByType(data: TerminalData) {
  return (Object.keys(techTypes) as TechType[])
    .map((type) => [type, data.technos.filter((t) => t.type === type).map((t) => t.title)] as const)
    .filter(([, list]) => list.length);
}

/** Short stable hash for fake git commits. */
function shortHash(s: string) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

const LOGO = [
  " ██╗        ",
  " ╚██╗       ",
  "  ╚██╗      ",
  "  ██╔╝      ",
  " ██╔╝ █████╗",
  " ╚═╝  ╚════╝",
];

const commandList: Command[] = [
  {
    name: "help",
    summary: "list commands",
    run: (ctx) => {
      const width = Math.max(...commands.filter((c) => !c.hidden).map((c) => c.name.length));
      ctx.print(
        <div>
          <p className="mb-1">available commands (click to run, Tab to complete):</p>
          {commands
            .filter((c) => !c.hidden)
            .map((c) => (
              <p key={c.name} className="whitespace-pre">
                {"  "}
                <Run cmd={c.usage ? c.name + " " : c.name}>{c.name.padEnd(width)}</Run>
                {"  "}
                <span className="text-text">{c.summary}</span>
                {c.usage && <span className="text-text/70">{`  ${c.usage}`}</span>}
              </p>
            ))}
          <p className="mt-1 text-text">{"// there may also be a few undocumented ones…"}</p>
        </div>,
      );
    },
  },
  {
    name: "whoami",
    summary: "who built this",
    run: ({ data, print }) =>
      print(
        <div>
          <p className="text-text-light">{data.profile.name}</p>
          <p className="text-accent-indigo">&gt; {data.profile.role}</p>
          <p>{data.profile.location}</p>
          {data.profile.availability && <p className="text-accent-green">● {data.profile.availability}</p>}
        </div>,
      ),
  },
  {
    name: "ls",
    summary: "list files",
    usage: "[projects|skills]",
    complete: () => ["projects", "skills"],
    run: (ctx) => {
      const target = ctx.args[0]?.replace(/\/$/, "");
      if (!target || target === "~" || target === ".") {
        ctx.print(
          <p className="flex flex-wrap gap-x-5">
            {DIRS.map((d) => (
              <Run key={d} cmd={d === "projects/" ? "ls projects" : `cd ${d.slice(0, -1)}`} className="text-accent-indigo hover:underline">
                {d}
              </Run>
            ))}
            {FILES.map((f) => (
              <Run key={f} cmd={f === "resume.pdf" ? "open resume.pdf" : `cat ${f}`} className="text-text-light hover:underline">
                {f}
              </Run>
            ))}
          </p>,
        );
      } else if (target === "projects") {
        ctx.print(
          <div className="grid gap-x-6 sm:grid-cols-2">
            {ctx.data.projects.map((p) => (
              <p key={p.slug} className="truncate">
                <Run cmd={`cat ${p.slug}`}>{p.slug}</Run> <span className="text-text">{p.date}</span>
              </p>
            ))}
          </div>,
        );
      } else if (target === "skills") {
        commands.find((c) => c.name === "cat")!.run({ ...ctx, args: ["skills.json"] });
      } else {
        ctx.print(`ls: cannot access '${target}': No such file or directory`, "err");
      }
    },
  },
  {
    name: "cat",
    summary: "print a file",
    usage: "<file>",
    complete: (data) => [...FILES.filter((f) => f !== "resume.pdf"), ...data.projects.map((p) => p.slug)],
    run: (ctx) => {
      const { data, print } = ctx;
      const file = ctx.args[0];
      if (!file) return print("cat: missing file operand (try: cat about.md)", "err");
      switch (file) {
        case "about.md":
          return print(
            <div className="space-y-1">
              <p className="text-text-light"># {data.profile.name}</p>
              <p>{data.profile.summary}</p>
              <p>
                <Key>location</Key>: {data.profile.location}
              </p>
              {data.profile.availability && (
                <p>
                  <Key>status</Key>: <span className="text-accent-green">{data.profile.availability}</span>
                </p>
              )}
              <p>
                more: <Run cmd="cat experience.log" /> · <Run cmd="cat skills.json" /> · <Run cmd="cd about-me" />
              </p>
            </div>,
          );
        case "contact.md":
          return print(
            <div className="space-y-0.5">
              {data.profile.email && (
                <p>
                  <Key>email</Key>:{" "}
                  <a href={`mailto:${data.profile.email}`} className="text-accent-green hover:underline">
                    {data.profile.email}
                  </a>
                </p>
              )}
              {data.profile.phone && (
                <p>
                  <Key>phone</Key>: {data.profile.phone}
                </p>
              )}
              {data.profile.github && (
                <p>
                  <Key>github</Key>:{" "}
                  <a href={data.profile.github} target="_blank" rel="noreferrer" className="text-accent-green hover:underline">
                    {data.profile.github.replace(/^https?:\/\//, "")}
                  </a>
                </p>
              )}
              {data.profile.linkedin && (
                <p>
                  <Key>linkedin</Key>:{" "}
                  <a href={data.profile.linkedin} target="_blank" rel="noreferrer" className="text-accent-green hover:underline">
                    {data.profile.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </p>
              )}
            </div>,
          );
        case "experience.log":
          return commands.find((c) => c.name === "git")!.run({ ...ctx, args: ["log"] });
        case "skills.json":
          return print(
            <div>
              <p>{"{"}</p>
              {skillsByType(data).map(([type, list], i, all) => (
                <p key={type} className="pl-4">
                  <Str>{techTypes[type]}</Str>: [{list.map((t, j) => <span key={t}>{j ? ", " : ""}<Str>{t}</Str></span>)}]
                  {i < all.length - 1 ? "," : ""}
                </p>
              ))}
              <p>{"}"}</p>
            </div>,
          );
        case "resume.pdf":
          return print(
            <p>
              cat: resume.pdf: binary file. try <Run cmd="open resume.pdf" />
            </p>,
            "err",
          );
        default:
          return catProject(ctx, file);
      }
    },
  },
  {
    name: "open",
    summary: "open a project, resume or profile",
    usage: "<project|resume.pdf|github|linkedin>",
    complete: (data) => ["resume.pdf", "github", "linkedin", ...data.projects.map((p) => p.slug)],
    run: (ctx) => {
      const { data, print } = ctx;
      const arg = ctx.args[0];
      if (!arg) return print("open: what should I open? (try: ls projects)", "err");
      if (arg === "resume.pdf" || arg === "resume") {
        if (!data.profile.resume) return print("open: no resume published yet", "err");
        print("opening resume.pdf…", "muted");
        return external(data.profile.resume);
      }
      if (arg === "github" || arg === "linkedin") {
        const href = data.profile[arg];
        if (!href) return print(`open: no ${arg} profile`, "err");
        print(`opening ${arg}…`, "muted");
        return external(href);
      }
      const p = findProject(data, arg);
      if (!p) return print(`open: ${arg}: not found (try: ls projects)`, "err");
      print(`opening ${p.name}…`, "muted");
      ctx.navigate(`/projects/${p.slug}`);
    },
  },
  {
    name: "cd",
    summary: "go to a page",
    usage: "<page>",
    complete: () => ["about-me", "projects", "arcade", "contact-me", "terminal", "~"],
    run: (ctx) => {
      const arg = (ctx.args[0] ?? "~").replace(/\/$/, "").replace(/^~\//, "");
      if (arg === "..") return ctx.navigate("/");
      const project = arg.startsWith("projects/") ? findProject(ctx.data, arg) : undefined;
      if (project) return ctx.navigate(`/projects/${project.slug}`);
      const href = PAGES[arg];
      if (!href) return ctx.print(`cd: ${arg}: No such file or directory`, "err");
      ctx.navigate(href);
    },
  },
  {
    name: "pwd",
    summary: "where am I",
    run: (ctx) => ctx.print(cwd(ctx.pathname)),
  },
  {
    name: "theme",
    summary: "list or switch colour themes",
    usage: "[name]",
    complete: () => themes.map((t) => t.id),
    run: (ctx) => {
      const id = ctx.args[0];
      if (!id) {
        const current = getPrefs().theme;
        return ctx.print(
          <div>
            {themes.map((t) => (
              <p key={t.id}>
                {t.id === current ? <span className="text-accent-green">* </span> : "  "}
                <Run cmd={`theme ${t.id}`}>{t.id}</Run>{" "}
                {t.swatches.map((s) => (
                  <span key={s} style={{ color: s }}>
                    ●
                  </span>
                ))}
              </p>
            ))}
          </div>,
        );
      }
      if (!isThemeId(id)) return ctx.print(`theme: unknown theme '${id}' (run: theme)`, "err");
      setPrefs({ theme: id });
      ctx.print(`theme set to ${getTheme(id).label}`, "muted");
    },
  },
  {
    name: "play",
    summary: "launch an arcade game",
    usage: "<game>",
    complete: () => games.map((g) => g.id),
    run: (ctx) => {
      const id = ctx.args[0];
      if (!id || !isGameId(id)) {
        return ctx.print(
          <p>
            games:{" "}
            {games.map((g, i) => (
              <span key={g.id}>
                {i ? " · " : ""}
                <Run cmd={`play ${g.id}`}>{g.id}</Run>
              </span>
            ))}
          </p>,
          id ? "err" : "out",
        );
      }
      ctx.print(`loading ${id}…`, "muted");
      if (window.location.pathname === "/arcade") window.location.hash = id;
      else ctx.navigate(`/arcade#${id}`);
    },
  },
  {
    name: "neofetch",
    summary: "system info",
    run: ({ data, print }) => {
      const langs = data.technos.filter((t) => t.type === "language").map((t) => t.title);
      const frameworks = data.technos.filter((t) => t.type === "framework").map((t) => t.title);
      const info: [string, string][] = [
        ["OS", "Portfolio OS (Next.js 16)"],
        ["Shell", "hksh 1.0"],
        ["Theme", getTheme(getPrefs().theme).label],
        ["Role", data.profile.role],
        ["Location", data.profile.location],
        ["Languages", langs.slice(0, 5).join(", ")],
        ["Frameworks", frameworks.slice(0, 5).join(", ")],
        ["Projects", String(data.projects.length)],
      ];
      print(
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <pre aria-hidden className="leading-tight">
            {LOGO.map((line, i) => (
              <span key={i} className="block">
                <span className="text-accent-green">{line.slice(0, 6)}</span>
                <span className="text-accent-orange">{line.slice(6)}</span>
              </span>
            ))}
          </pre>
          <div>
            <p>
              <span className="text-accent-green">guest</span>@<span className="text-accent-green">{data.profile.handle}</span>
            </p>
            <p className="text-text">{"-".repeat(data.profile.handle.length + 6)}</p>
            {info.map(([k, v]) => (
              <p key={k}>
                <Key>{k}</Key>: {v}
              </p>
            ))}
            <p className="mt-1 flex gap-1" aria-hidden>
              {["bg-accent-coral", "bg-accent-orange", "bg-accent-green", "bg-accent-indigo", "bg-accent-purple", "bg-text"].map((c) => (
                <span key={c} className={`inline-block h-3 w-5 ${c}`} />
              ))}
            </p>
          </div>
        </div>,
      );
    },
  },
  {
    name: "git",
    summary: "my history, as commits",
    usage: "<log|status>",
    complete: () => ["log", "status"],
    run: (ctx) => {
      const sub = ctx.args[0];
      if (sub === "status") {
        return ctx.print(
          <div>
            <p>On branch main</p>
            <p>Your career is up to date with &apos;origin/main&apos;.</p>
            <p className="mt-1 text-accent-green">nothing to commit, working tree clean</p>
            {ctx.data.profile.availability && <p className="text-text">{`(but ${ctx.data.profile.availability.toLowerCase()})`}</p>}
          </div>,
        );
      }
      if (sub !== "log") return ctx.print("usage: git <log|status>", "err");
      ctx.print(
        <div className="space-y-2">
          {ctx.data.experiences.map((e, i) => (
            <div key={e.id}>
              <p className="text-accent-orange">
                commit {shortHash(e.id + e.company)}
                {i === 0 && <span className="text-accent-green"> (HEAD -&gt; main)</span>}
              </p>
              <p>
                Author: {ctx.data.profile.name} &lt;{ctx.data.profile.email}&gt;
              </p>
              <p>Date: {e.period}</p>
              <p className="pl-4 text-text-light">
                {e.role} @ {e.company}
              </p>
            </div>
          ))}
          <div>
            <p className="text-accent-orange">commit 0000000</p>
            <p className="pl-4 text-text-light">initial commit: hello, world</p>
          </div>
        </div>,
      );
    },
  },
  {
    name: "history",
    summary: "previous commands",
    run: (ctx) =>
      ctx.print(
        <div>
          {ctx.history.map((h, i) => (
            <p key={i} className="whitespace-pre">
              <span className="text-text">{String(i + 1).padStart(4)}</span>
              {"  "}
              <Run cmd={h} className="text-text-light hover:underline">
                {h}
              </Run>
            </p>
          ))}
        </div>,
      ),
  },
  {
    name: "echo",
    summary: "print text",
    usage: "<text>",
    run: (ctx) => ctx.print(ctx.args.join(" ")),
  },
  {
    name: "date",
    summary: "current time here and in Yangon",
    run: (ctx) => {
      const now = new Date();
      const yangon = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Yangon" }).format(now);
      ctx.print(
        <div>
          <p>{now.toString()}</p>
          <p className="text-text">{`// my time (Yangon): ${yangon}`}</p>
        </div>,
      );
    },
  },
  {
    name: "clear",
    summary: "clear the screen (Ctrl+L)",
    run: (ctx) => ctx.clear(),
  },
  {
    name: "exit",
    summary: "close the terminal",
    run: (ctx) => ctx.close(),
  },

  // --- undocumented -------------------------------------------------------
  {
    name: "sudo",
    summary: "",
    hidden: true,
    run: (ctx) => {
      const what = ctx.args.join(" ");
      if (what === "hire-me" || what === "hire me") {
        ctx.print("[sudo] password for recruiter: ********", "muted");
        setTimeout(() => {
          ctx.print(
            <div>
              <p className="text-accent-green">✔ access granted. great decision.</p>
              {ctx.data.profile.email && (
                <p>
                  next step:{" "}
                  <a href={`mailto:${ctx.data.profile.email}?subject=Let%27s%20talk`} className="text-accent-green hover:underline">
                    mail {ctx.data.profile.email}
                  </a>{" "}
                  or <Run cmd="cd contact-me" />
                </p>
              )}
            </div>,
          );
        }, 900);
        return;
      }
      if (ctx.args[0] === "rm") return commands.find((c) => c.name === "rm")!.run({ ...ctx, args: ctx.args.slice(1) });
      ctx.print(`guest is not in the sudoers file. This incident will be reported. (try: sudo hire-me)`, "err");
    },
  },
  {
    name: "rm",
    summary: "",
    hidden: true,
    run: (ctx) => {
      const target = ctx.args.filter((a) => !a.startsWith("-"));
      const recursive = ctx.args.some((a) => /^-\w*r/.test(a));
      if (recursive && (target.includes("/") || target.includes("/*") || target.includes("~"))) {
        ctx.print("rm: removing everything… this may cause a gravitational anomaly.", "err");
        setTimeout(summonBlackHole, 600);
        return;
      }
      ctx.print(`rm: cannot remove '${target[0] ?? ""}': Read-only portfolio`, "err");
    },
  },
  {
    name: "vim",
    summary: "",
    hidden: true,
    run: (ctx) => {
      ctx.setMode("vim");
      ctx.print(
        <div>
          <p className="text-accent-purple">~</p>
          <p className="text-accent-purple">~ VIM - Vi IMproved</p>
          <p className="text-accent-purple">~ you are now trapped. good luck.</p>
          <p className="text-accent-purple">~</p>
        </div>,
      );
    },
  },
  {
    name: "coffee",
    summary: "",
    hidden: true,
    run: (ctx) =>
      ctx.print(
        <pre className="text-accent-orange">{`   ( (
    ) )
  ........
  |      |]
  \\      /
   \`----'   418 I'm a teapot. brewing anyway ☕`}</pre>,
      ),
  },
  {
    name: "ping",
    summary: "",
    hidden: true,
    run: (ctx) => ctx.print("pong 🏓 (0.42 ms, from Yangon)"),
  },
  {
    name: "hello",
    summary: "",
    hidden: true,
    run: (ctx) => {
      toast("hello to you too 👋");
      ctx.print("hi! try `help`, or `sudo hire-me` if you're in a hurry.");
    },
  },
];

const aliases: Record<string, string> = {
  "?": "help",
  man: "help",
  dir: "ls",
  ll: "ls",
  cls: "clear",
  vi: "vim",
  nano: "vim",
  emacs: "vim",
  quit: "exit",
  about: "whoami",
  contact: "cat",
  resume: "open",
};

/** Arguments implied by some aliases (`contact` → `cat contact.md`). */
const aliasArgs: Record<string, readonly string[]> = {
  contact: ["contact.md"],
  resume: ["resume.pdf"],
};

export const commands: readonly Command[] = commandList;

export function resolveCommand(name: string, args: readonly string[]) {
  const lower = name.toLowerCase();
  const real = aliases[lower] ?? lower;
  const command = commands.find((c) => c.name === real);
  return { command, args: aliasArgs[lower] && !args.length ? aliasArgs[lower] : args };
}

export function commandNames() {
  return commands.filter((c) => !c.hidden).map((c) => c.name);
}
