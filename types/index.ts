export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  name: string;
  href: string;
  icon: "github" | "linkedin" | "gitlab" | "mail" | "phone" | "resume";
};

export type TechType =
  | "language"
  | "framework"
  | "library"
  | "database"
  | "development-tool"
  | "devops"
  | "apis-integration"
  | "workflow-methodology";

export type Tech = {
  title: string;
  type: TechType;
  url: string;
};

export type ProjectType =
  | "favorite"
  | "web"
  | "frontend"
  | "business"
  | "ecommerce"
  | "finance"
  | "archive";

export type Project = {
  slug: string;
  name: string;
  description: string;
  date: string;
  type: ProjectType[];
  technos: string[];
  link: string;
  repoLink: string;
  image?: string;
  role?: string;
  scale?: string;
  businessImpact?: string;
  responsibilities?: string[];
  achievements?: string[];
  architecture?: string[];
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  url: string;
  highlights: string[];
  techs: string[];
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
  skills: string[];
};

/** A "file" shown in the about-me explorer. */
export type InfoFile = {
  id: string;
  label: string;
  lines: string[];
  techs?: string[];
};

export type InfoFolder = {
  id: string;
  label: string;
  color: string;
  files: InfoFile[];
};
