import type { TechType } from "@/lib/taxonomy";

/** Plain, serialisable content the terminal can read (passed from the server layout). */
export type TerminalData = {
  profile: {
    name: string;
    handle: string;
    role: string;
    availability: string;
    summary: string;
    location: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
    resume: string;
  };
  projects: readonly {
    slug: string;
    name: string;
    description: string;
    date: string;
    role?: string;
    technos: readonly string[];
    link: string;
    repoLink: string;
  }[];
  technos: readonly { title: string; type: TechType }[];
  experiences: readonly { id: string; company: string; role: string; period: string }[];
};

export type LineKind = "input" | "out" | "err" | "muted";

export type CommandContext = {
  args: readonly string[];
  data: TerminalData;
  pathname: string;
  history: readonly string[];
  print: (node: React.ReactNode, kind?: LineKind) => void;
  clear: () => void;
  navigate: (href: string) => void;
  /** Close the drawer (no-op on the /terminal page). */
  close: () => void;
  setMode: (mode: "vim" | null) => void;
};

export type Command = {
  name: string;
  summary: string;
  usage?: string;
  /** Not listed by `help` (easter eggs). */
  hidden?: boolean;
  /** Values for Tab completion of the first argument. */
  complete?: (data: TerminalData) => readonly string[];
  run: (ctx: CommandContext) => void;
};
