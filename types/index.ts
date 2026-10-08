import type { ProjectType, TechType } from "@/lib/taxonomy";

export type { ProjectType, TechType };

export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  name: string;
  href: string;
  icon: "github" | "linkedin" | "gitlab" | "mail" | "phone" | "resume";
};

export type Tech = {
  title: string;
  type: TechType;
  url: string;
};

export type Project = {
  slug: string;
  name: string;
  description: string;
  date: string;
  type: readonly ProjectType[];
  technos: readonly string[];
  link: string;
  repoLink: string;
  image?: string;
  role?: string;
  scale?: string;
  businessImpact?: string;
  responsibilities?: readonly string[];
  achievements?: readonly string[];
  architecture?: readonly string[];
};

/** Editable profile (content/profile.json). Optional fields are "" when empty. */
export type Profile = {
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
  gitlab: string;
  photo: string;
  resume: string;
  stats: readonly { value: string; label: string }[];
  keywords: readonly string[];
};

export type About = {
  bio: readonly string[];
  principles: readonly string[];
  domainKnowledge: readonly { title: string; description: string }[];
  education: readonly Education[];
  certifications: readonly Certification[];
  hobbies: readonly { emoji: string; title: string }[];
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  url: string;
  highlights: readonly string[];
  techs: readonly string[];
};

export type Education = {
  id: string;
  title: string;
  institution: string;
  period: string;
  url: string;
  description: string;
};

export type Certification = {
  title: string;
  issuer: string;
  date: string;
  status: "Completed" | "In Progress";
  link: string;
  skills: readonly string[];
};

/** A "file" shown in the about-me explorer. */
export type InfoFile = {
  id: string;
  label: string;
  lines: readonly string[];
  techs?: readonly string[];
};

export type InfoFolder = {
  id: string;
  label: string;
  color: string;
  files: InfoFile[];
};
