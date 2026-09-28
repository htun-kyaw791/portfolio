import type { NavItem, SocialLink } from "@/types";

export const site = {
  // Set NEXT_PUBLIC_SITE_URL in production if the domain differs.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.htunkyaw.optionenter.com",
  handle: "htun-kyaw",
  name: "Htun Kyaw",
  role: "Senior Full Stack Developer",
  // Shown on the hello page and about-me; edit when your situation changes.
  availability: "Open to senior / lead full stack roles — remote or Yangon",
  location: "Yangon, Myanmar",
  email: "htunkyaw.791481@gmail.com",
  phone: "+95 9 772 481 290",
  github: "https://github.com/htun-kyaw791",
  githubUser: "htun-kyaw791",
  linkedin: "https://www.linkedin.com/in/htun-kyaw/",
  resume: "/Htun-Kyaw_Resume.pdf",
  photo: "/me.jpg",
  summary:
    "Senior Full Stack Developer and technical lead building scalable Laravel, Vue, React, Node, and Odoo-connected enterprise systems.",
  keywords: [
    "Htun Kyaw",
    "Senior Full Stack Developer",
    "Senior Web Developer",
    "Laravel Developer",
    "Vue.js Developer",
    "React Developer",
    "Next.js",
    "Odoo Integration",
    "Myanmar Web Developer",
    "Yangon",
  ],
};

export const stats = [
  { value: "5+", label: "years building" },
  { value: "3K", label: "daily active users" },
  { value: "20+", label: "sites maintained" },
  { value: "5+", label: "core platforms" },
];

export const navItems: NavItem[] = [
  { label: "_hello", href: "/" },
  { label: "_about-me", href: "/about-me" },
  { label: "_projects", href: "/projects" },
];

export const contactNav: NavItem = { label: "_contact-me", href: "/contact-me" };

export const socials: SocialLink[] = [
  { name: "github", href: site.github, icon: "github" },
  { name: "linkedin", href: site.linkedin, icon: "linkedin" },
];

export const findMeAlso: SocialLink[] = [
  { name: "GitHub", href: site.github, icon: "github" },
  { name: "LinkedIn", href: site.linkedin, icon: "linkedin" },
  { name: "GitLab", href: "https://gitlab.com/my-projects3800633", icon: "gitlab" },
  { name: "Resume (PDF)", href: site.resume, icon: "resume" },
];
