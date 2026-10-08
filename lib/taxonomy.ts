// Fixed categories shared by the CMS schema (keystatic.config.ts) and the site.
// Adding one here makes it selectable in the admin and shows it on the site.

export const projectTypes = ["favorite", "web", "frontend", "business", "ecommerce", "finance", "archive"] as const;
export type ProjectType = (typeof projectTypes)[number];

/** Tech stack groups, in display order, with the variable name shown on the about page. */
export const techTypes = {
  language: "languages",
  framework: "frameworks",
  library: "libraries",
  database: "databases",
  "apis-integration": "apis",
  devops: "devops",
  "development-tool": "tools",
  "workflow-methodology": "methodologies",
} as const;
export type TechType = keyof typeof techTypes;
