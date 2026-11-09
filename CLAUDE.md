# anirudh.dev

Personal site for Anirudh Kanakatte (GitHub: `anikanakatte`). Today it's a single static landing page with social links. A full redesign is planned (below).

## Current setup
- Plain HTML/CSS, no build step. `index.html`, `css/`, `assets/`, `404.html`, `robots.txt`, `sitemap.xml`.
- Hosted on Netlify. `netlify.toml` sets security headers (including a CSP that allows only self + Google Fonts) and asset caching. Publish directory is `/`, no build command.
- Netlify deploys on push to `master` through its GitHub integration, not GitHub Actions. PRs get deploy previews.
- Domain `anirudh.dev` is registered with Squarespace Domains. The bare domain currently redirects to `www.anirudh.dev`, so the canonical URL, `og:url`, robots.txt and sitemap use `www`. Update all four if the primary domain changes.
- Repo: `git@github.com:anikanakatte/portfolio-landing-page.git`, default branch `master`.

## Conventions
- Commits use the GitHub no-reply email from the global git config. Never set `user.email` in this repo, because GitHub rejects pushes that expose a private email.
- Icons are inline SVGs (Font Awesome Free 6.5.2, CC BY 4.0). Keep the attribution comment.
- If you add a new external resource, update the CSP in `netlify.toml` or the browser will block it.

## Status (as of 2026-11-09)
- Phase 1 done: the quick fixes were merged to `master` (#1).
- Phase 2 in progress on `feat/the-stacks`. The repo is now a pnpm monorepo (`apps/site` = Astro, `packages/tokens` = design tokens). Netlify builds with `pnpm build` and publishes `apps/site/dist`. The old root `index.html`/`css/` are no longer deployed and get removed at the end of phase 2.
- Toolchain: Node 22.23.4 (`.nvmrc`; run `nvm use`), pnpm 10.34.9 via corepack, Astro 7.4.2.
- Done in phase 2: step 1 (scaffold) and step 2 (Base layout, cabinet header with theme toggle, footer, IndexCard, Hero). Draft PR #2.

## Decisions (2026-11-10)
- Hero copy: "Hi, I'm Anirudh. Welcome to my corner of the internet." / "I'm a Full Stack AI Engineer. Here I share what I'm building, what I'm reading, what I'm writing about, and whatever else has my attention lately." Start year 2018.
- No "Main entry" eyebrow; the surname-first "Kanakatte, Anirudh." stays only on the catalog card.
- Repo count on the hero card comes from the GitHub API at build time (`apps/site/src/lib/github.ts`). Never hard-code it. The stack line is static by choice: `SITE.stack` in `apps/site/src/lib/site.ts` (TypeScript, React, Node.js, Python).
- Projects come from GitHub, not `projects.yaml`: repos tagged with the topic `portfolio`. Description = first README paragraph (fallback: repo About), link = repo Website field (fallback: first hosting link in README, dead links dropped). A daily scheduled rebuild keeps it fresh.
- GitHub fetch failure: production build fails (Netlify keeps the last deploy), dev warns and renders without the data. Set `GITHUB_TOKEN` in Netlify to avoid rate limits.
- Theme toggle in the header (`apps/site/public/js/theme.js`, loaded blocking in head); defaults to the device setting.
- "Reading room" button and RSS link are hidden behind `SITE.blogEnabled` in `apps/site/src/lib/site.ts` until the blog ships.

## Planned redesign: "The Stacks"
The site becomes a personal library card catalog.
- Design brief with live mockups: https://claude.ai/artifact/9rfj21zeeV5Km1UVbd4MFj
- Mockup source: `design/` (`prototype.html` = home, `blog.html` = reading room, `brief.html` = brief). Most content in them is placeholder.

Sections (nav labels are Dewey Decimal classes):

| Class | Section | Treatment |
|---|---|---|
| 005 | Projects | Typed index cards: call number, year, description, "Subjects" for tech stack |
| 331.7 | Work | A date-due slip with violet stamped dates |
| 808 | Writing | Latest posts on the home page; the full blog is a separate "reading room" app |
| 028 | Bookshelf | Clickable book spines on a shelf, with a detail card |
| 384 | Contact | A "request slip" form, stamped RECEIVED on submit. Keep the email address off the page. |

Visual system:
- Green cabinet bands, brass label holders, card stock with one red header rule, blue ruling and a rod hole.
- Type: Young Serif (display), Courier Prime (typed card text), Public Sans (UI), Newsreader (blog body).
- Light and dark themes, both via CSS tokens.

Architecture decisions:
- Main site: Astro, static output, minimal JS. Content in `projects.yaml`, `work.yaml` and `books.yaml`.
- Blog: a separate Astro app with `base: "/blog"` on its own Netlify site, served at `anirudh.dev/blog` through a proxy rule in the main site's netlify.toml:
  ```toml
  [[redirects]]
    from = "/blog/*"
    to = "https://anirudh-blog.netlify.app/blog/:splat"
    status = 200
    force = true
  ```
  Use MDX, Shiki, RSS and generated share images.
- Possibly a pnpm monorepo: `apps/site`, `apps/blog`, `packages/tokens`.
- Contact form: Netlify Forms with a honeypot field.
- Keep the `anirudh.dev` domain. Optionally buy `anirudhkanakatte.com` and redirect it here.

Phases:
1. Merge the quick fixes.
2. Build the main site in Astro with The Stacks design.
3. Build the blog app and proxy rule, and add RSS.
4. Add a /now page, book sync, privacy-friendly analytics and drawer view transitions.

## History
The full desktop chat that produced the above is in `design/chat-transcript.md`. It's kept out of git. Read it only when you need the reasoning behind a decision.
