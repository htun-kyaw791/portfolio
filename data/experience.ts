import type { Certification, Education, Experience } from "@/types";

export const bio = [
  "Highly pragmatic Senior Full Stack Developer and technical lead with 5 years of professional experience building high-performance enterprise web applications, e-commerce ecosystems, and internal workflow platforms.",
  "My current work focuses on scalable architecture: Domain-Driven Design, modular Laravel systems, Vue/React frontends, optimized database schemas, RBAC, Redis caching, and web layers over corporate ERP systems such as Odoo.",
  "At UMG Myanmar, I lead and mentor a web team of up to 5 developers and maintain core platforms including WinFinance, EMS, TIS, WebPortal, and 15+ auxiliary corporate sites.",
  "I partner directly with business units, branches, and division heads to turn operating workflows into reliable production software.",
  "Before UMG, I built and optimized multi-tenant marketplace products at Panacea-Soft, covering classified apps, custom fields, payments, real-time chat, service workers, deployment tooling, and customer support hotfixes.",
  "My academic foundation in High-Performance Computing keeps me close to computational logic, structural data modeling, and aggressive system-wide performance optimization.",
  "I care about systems that stay understandable after launch: clear boundaries, measurable performance, secure permissions, and code review habits that help teams move without creating avoidable defects.",
  "The work I enjoy most sits where business complexity, backend architecture, and practical user experience meet.",
];

export const principles = [
  "Domain-Driven Design",
  "Modular architecture",
  "Database performance",
  "Secure RBAC",
  "ERP web layers",
  "Team leadership",
];

export const experiences: Experience[] = [
  {
    id: "umg-myanmar",
    company: "UMG Myanmar",
    role: "Senior Web Developer",
    period: "Jul 2024 - Present",
    url: "https://www.umgmyanmar.com/",
    highlights: [
      "Led and mentored a team of up to 5 developers and interns, ran technical interviews, and transitioned delivery toward React, Vue, Node, DDD, and modular architecture practices.",
      "Architected project setup, directory structure, ERDs, and database schemas for incoming corporate software installations.",
      "Maintained and developed WinFinance, EMS, TIS, and WebPortal for roughly 6,000 total users and 3,000 daily active users.",
      "Built an enterprise Odoo web portal layer to centralize workflow pipelines and reduce ERP user-licensing costs.",
      "Engineered Redis server-side caching for Odoo master data, removing redundant external API loading latency.",
      "Created custom RBAC engines with Spatie and Laravel policies to enforce strict data security.",
      "Consolidated cloud assets across AWS, Alibaba Cloud, and DigitalOcean with backups and server decommissioning.",
      "Partnered with business units, branches, and division heads to align software behavior with corporate operations.",
    ],
    techs: ["Laravel", "Vue.js", "React", "Node.js", "Odoo API", "Redis", "Docker", "Nginx", "Spatie RBAC", "DDD"],
  },
  {
    id: "panacea-soft",
    company: "Panacea Soft",
    role: "Junior Frontend Developer → Full Stack Developer",
    period: "Jul 2021 - Dec 2023",
    url: "https://www.panacea-soft.com/",
    highlights: [
      "Progressed from frontend to full stack on large-scale configurable products sold to international customers.",
      "Accelerated legacy page speeds by up to 6x through database indexing and nested-loop cleanup.",
      "Engineered a dynamic row-based custom fields system for admin-controlled schema flexibility.",
      "Built a centralized deployment dashboard for one-click core installations and script updates.",
      "Implemented frontend Service Workers for fast real-time product filtering and client-side data mapping.",
      "Integrated secure OAuth workflows for Email, Phone, Google, Apple, and Facebook sign-ins.",
      "Built live chat, Firebase push notifications, Google Maps, and Stripe/PayPal payment integrations.",
      "Managed customer support tickets, diagnosed production bugs, and delivered rapid hotfixes.",
      "Took part in code reviews, sprint planning, and architecture discussions in an Agile team.",
    ],
    techs: ["Laravel", "Vue.js", "TypeScript", "Tailwind CSS", "MySQL", "CodeIgniter", "Firebase", "Service Workers", "Stripe", "PayPal", "Google Map", "REST API"],
  },
];

export const domainKnowledge = [
  {
    title: "Enterprise ERP Web Layers",
    description:
      "Architected Odoo-connected portal layers, workflow pipelines, RBAC boundaries, and Redis caching strategies that reduce ERP licensing and external API latency.",
  },
  {
    title: "Financial & Loan Management Systems",
    description:
      "Built WinFinance loan workflows with complex interest logic, guarantor tracking, approval pipelines, Odoo API integration, SMS alerts, and Firebase notifications.",
  },
  {
    title: "Workflow & Training Platforms",
    description:
      "Delivered meeting, KPI, task, and training systems across corporate branches with multi-database data mapping, PostgreSQL read-only layers, and MySQL application logic.",
  },
  {
    title: "E-commerce & Classified Ecosystems",
    description:
      "Engineered multi-vendor marketplaces with custom fields, real-time chat, location services, multi-channel OAuth, payment gateways, deployment tooling, and re-skinning workflows.",
  },
  {
    title: "Performance & Architecture",
    description:
      "Applies DDD, modular architecture, MVC/MVVM boundaries, database indexing, queue handling, and HPC-informed reasoning to keep systems fast and maintainable.",
  },
];

export const education: Education[] = [
  {
    id: "ncc",
    title: "NCC Level 5 Diploma in Computing",
    institution: "Twinkle College",
    period: "2023 - 2025",
    url: "https://www.nccedu.com/",
    description:
      "NCC Level 5 Diploma pathway through Twinkle College, focused on UK computing fundamentals, software engineering, systems analysis, and professional development.",
  },
  {
    id: "ucsm",
    title: "High-Performance Computing",
    institution: "University of Computer Studies Mandalay",
    period: "2017 - 2020",
    url: "https://www.ucsm.edu.mm/",
    description:
      "Computer Science and High-Performance Computing background with coursework in algorithms, software engineering, mathematics, and computational problem solving.",
  },
];

export const certifications: Certification[] = [
  {
    title: "The Ultimate DevOps Bootcamp",
    issuer: "Udemy",
    date: "2025",
    status: "In Progress",
    link: "https://www.udemy.com/course/the-complete-devops-bootcamp/",
    skills: ["Docker and Containers", "Container Orchestration", "Kubernetes Concepts", "IaC with Terraform"],
  },
  {
    title: "JavaScript Algorithms and Data Structures",
    issuer: "freeCodeCamp",
    date: "2025",
    status: "Completed",
    link: "https://freecodecamp.org/learn/",
    skills: ["JavaScript", "Algorithms", "Data Structures"],
  },
  {
    title: "Responsive Web Design",
    issuer: "freeCodeCamp",
    date: "2025",
    status: "Completed",
    link: "https://freecodecamp.org/learn/",
    skills: ["HTML", "CSS", "Flexbox", "Grid"],
  },
  {
    title: "PHP Web Development",
    issuer: "MMIC Yangon",
    date: "2019",
    status: "Completed",
    link: "",
    skills: ["Laravel Foundations", "REST API Design", "MySQL Optimization"],
  },
];

export const hobbies = [
  { title: "Reading", emoji: "📖" },
  { title: "Gaming", emoji: "🕹️" },
  { title: "Programming", emoji: "⌨️" },
  { title: "Computer Science", emoji: "🖥️" },
  { title: "Movie & TV", emoji: "📺" },
];
