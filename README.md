# htun-kyaw — portfolio

Personal portfolio of **Htun Kyaw**, Senior Full Stack Developer (Laravel · Vue · React · Odoo-connected enterprise systems).

Designed as a code editor, based on the [Portfolio for Developers Concept V.2](https://www.figma.com/design/B41zi0BpgS6nm54S85bU7B/Portfolio-for-Developers-Concept-V.2.1--Community-) Figma community file: explorer sidebars, editor tabs, line-numbered "files", and a playable snake game on the landing page.

## Stack

- **Next.js 16** (App Router; every portfolio page is prerendered)
- **React 19**, **TypeScript**
- **Tailwind CSS v4** — design tokens live in `app/globals.css` under `@theme`
- **Fira Code**, self-hosted via `next/font/local` (no request to Google at runtime)
- `react-icons`, `clsx` on the site; **Keystatic** for the content admin (`/keystatic`, dev only)

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
content/                   ALL content, edited through the admin (or by hand)
  profile.json             name, role, availability, contacts, photo, resume, stats
  experience.json          jobs, newest first
  about.json               bio, principles, domain knowledge, education, certifications, hobbies
  tech-stack.json          technologies by group
  projects/<slug>.json     one file per project
keystatic.config.ts        the admin's forms (fields, labels, help text)
lib/                       content loader, about-me tree, SEO + share-image helpers, cn()
types/                     shared TypeScript types
assets/                    self-hosted font + TTFs used by generated images
public/                    profile/ (photo, resume), projects/<slug>/ (screenshots)
```

## Editing content

Content is managed with [Keystatic](https://keystatic.com), a CMS that saves to files in this repo instead of a database.

1. `npm run dev`
2. Open **http://localhost:3000/keystatic**
3. Edit and press **Save**. The files in `content/` (and any uploaded images in `public/`) change, and the site at http://localhost:3000 updates straight away.
4. Commit and push. The host rebuilds and the live site updates.

Common tasks:

- **New project**: Projects → Add. Set **Order** to place it (lower = earlier; existing projects use 10, 20, 30… so 15 sits between the first two). Upload a screenshot or leave it empty for a generated cover. The detail page and share image are created automatically.
- **Hide an old project**: tick the `archive` category; it only shows when the archive filter is on.
- **Job change / availability**: Experience, and Availability under Profile.
- **New resume**: Profile → Resume. The old `/Htun-Kyaw_Resume.pdf` link redirects to it.

### Two ways to edit

- **On your computer** (`npm run dev` → `/keystatic`): saves go straight to the files; commit and push yourself.
- **On the live site** (`https://<your-domain>/keystatic`): sign in with GitHub. Each save is a commit to `main`, and Vercel redeploys in about a minute. Only accounts with write access to the repo can sign in.

### One-time setup for editing on the live site

1. Stop any running dev server, then start one in GitHub mode:
   `NEXT_PUBLIC_KEYSTATIC_GITHUB=1 npm run dev`
2. Open http://localhost:3000/keystatic and start the setup. Enter the live site URL when asked (this registers its sign-in callback), click **Create GitHub App**, keep or change the suggested name, and confirm on GitHub.
3. When GitHub asks where to install the app, choose **Only select repositories → htun-kyaw791/portfolio**.
4. Back at localhost you're signed in. Setup wrote four values to `.env` (git-ignored; keep them secret):
   `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
5. In Vercel → project → **Settings → Environment Variables**, add all four for **Production**, then **Redeploy** (the `NEXT_PUBLIC_` one is baked in at build time).

Until those variables exist on Vercel, `/keystatic` on the live site simply returns 404.

## Deployment

Vercel is the simplest host. Every portfolio page is prerendered; only the (disabled in production) admin API is a server route.

Set the public URL so canonical links, the sitemap and share images point at the right domain:

```
NEXT_PUBLIC_SITE_URL=https://www.htunkyaw.optionenter.com
```

(That value is also the default when the variable is unset.)
