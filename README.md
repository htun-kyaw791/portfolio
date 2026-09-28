# htun-kyaw — portfolio

Personal portfolio of **Htun Kyaw**, Senior Full Stack Developer (Laravel · Vue · React · Odoo-connected enterprise systems).

Designed as a code editor, based on the [Portfolio for Developers Concept V.2](https://www.figma.com/design/B41zi0BpgS6nm54S85bU7B/Portfolio-for-Developers-Concept-V.2.1--Community-) Figma community file: explorer sidebars, editor tabs, line-numbered "files", and a playable snake game on the landing page.

## Stack

- **Next.js 16** (App Router, fully static — every route is prerendered)
- **React 19**, **TypeScript**
- **Tailwind CSS v4** — design tokens live in `app/globals.css` under `@theme`
- **Fira Code**, self-hosted via `next/font/local` (no request to Google at runtime)
- `react-icons`, `clsx` — nothing else at runtime

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the build
npm run lint
```

Node 20+.

## Project structure

```
app/                       routes
  page.tsx                 _hello — intro, stats, snake game
  about-me/                _about-me — experience, bio, education, tech stack
  projects/                _projects — filterable list
  projects/[slug]/         project detail + per-project share image
  contact-me/              _contact-me — form (opens the visitor's mail client)
  opengraph-image.tsx      generated share image
  icon.tsx, apple-icon.tsx generated favicons
  sitemap.ts, robots.ts, manifest.ts
components/
  layout/                  Frame, Header, Footer
  ui/                      Button, Sidebar, SidebarSection, TabBar, CodeBlock, SocialIcon
  seo/                     JSON-LD (schema.org Person)
  hello/ about/ projects/ contact/   page-specific components
data/                      ALL content — edit these to update the site
  site.ts                  name, role, availability, contacts, stats, nav
  experience.ts            bio, roles, domain knowledge, education, certifications, hobbies
  projects.ts              projects (type "archive" = hidden unless filtered)
  technos.ts               tech stack by category
  about.ts                 builds the about-me folder tree from the above
lib/                       fonts, SEO + share-image helpers, cn()
types/                     shared TypeScript types
assets/                    self-hosted font; TTFs + photo used by generated images
public/                    photo, resume PDF, project screenshots
```

## Updating content

- **New project** — add an entry at the top of `data/projects.ts`. Put a screenshot at `public/projects/<slug>.webp` and set `image`; without one a generated cover is shown. A detail page and share image are created automatically.
- **Job change / availability** — `data/experience.ts` and `site.availability` in `data/site.ts`.
- **Resume** — replace `public/Htun-Kyaw_Resume.pdf`.

## Deployment

Any static-capable Next.js host works; Vercel is the simplest.

Set the public URL so canonical links, the sitemap and share images point at the right domain:

```
NEXT_PUBLIC_SITE_URL=https://www.htunkyaw.optionenter.com
```

(That value is also the default when the variable is unset.)
