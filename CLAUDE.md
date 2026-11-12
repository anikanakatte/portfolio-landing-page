# anirudh.dev

Source for www.anirudh.dev, a personal site built as "The Stacks": a library card-catalog design. GitHub owner: `anikanakatte`.

## Setup
- pnpm monorepo: `apps/site` is the Astro site (static output), `packages/tokens` holds the light/dark design tokens (CSS custom properties).
- Toolchain: Node 22.23.4 (`.nvmrc`; run `nvm use`), pnpm 10.34.9 via corepack, Astro 7.4.2.
- Commands (repo root): `pnpm dev` (http://localhost:4321), `pnpm build`, `pnpm preview`. Builds read GitHub, so set `GITHUB_TOKEN` locally to avoid rate limits.
- Hosted on Netlify via its GitHub integration: pushes to `master` deploy production, PRs get deploy previews. `netlify.toml` builds with `pnpm build` and publishes `apps/site/dist`.
- Canonical host is `www.anirudh.dev` (the bare domain redirects to it). Canonical URLs, `og:url`, robots.txt and the sitemap use `www`.
- Repo default branch: `master`. Work on a branch from an up-to-date `master` and open a PR.

## Conventions
- Never set `user.email` in this repo. Commits use the GitHub no-reply address from the global git config.
- Icons are inline SVGs (Font Awesome Free 6.5.2, CC BY 4.0). Keep the attribution comment in `apps/site/src/components/SocialIcon.astro`.
- Client JS stays minimal: today only `apps/site/public/js/theme.js` (theme toggle, loaded blocking in `<head>`). No UI framework runtime.
- Never put a phone number, email address or postal address on the site or in the repo (it's public).

## Security headers
- The Content-Security-Policy is NOT in `netlify.toml`. `apps/site/integrations/csp-headers.mjs` writes it to `dist/_headers` per Netlify `CONTEXT`. Deploy previews also allow `frame-src https://app.netlify.com` for the Netlify Drawer; production stays strict. Two CSP headers would both be enforced, so don't add one to `netlify.toml`.
- Scripts must be same-origin files (`script-src 'self'`). Inline styles are allowed because Astro inlines small stylesheets.
- Adding an external resource means updating `BASE` in `csp-headers.mjs`.

## Content and data
- Hero copy: "Hi, I'm Anirudh. Welcome to my corner of the internet." / "I'm a Full Stack AI Engineer. Here I share what I'm building, what I'm reading, what I'm writing about, and whatever else has my attention lately." The catalog card shows the static stack in `SITE.stack` (`apps/site/src/lib/site.ts`) and the start year `SITE.since` (2018). No repo count.
- Projects (005): built at build time from public, non-fork repos tagged with the topic `portfolio` (`apps/site/src/lib/projects.ts`, using `apps/site/src/lib/github.ts`). Title and description come from the README's H1 and first paragraph (fallback: repo About description). The live link comes from the repo's Website field (fallback: first hosting link in the README); dead links are dropped. Newest push first.
- GitHub failure: production builds fail (Netlify keeps the last good deploy); dev logs a warning and renders without projects. Netlify has `GITHUB_TOKEN` set.
- Work (331.7): `apps/site/src/content/work.yaml`, sorted by date on the site, 2 bullets per role, outcome first.
- Résumé: the "View full résumé (PDF)" button under the Work slip opens `/resume.pdf`, served by `netlify/functions/resume.mjs`. It proxies the public Google Doc's PDF export (doc ID in `DEFAULT_RESUME_DOC_ID`, overridable with the `RESUME_DOC_ID` env var) and sends it `inline` so it opens in the browser's PDF viewer. It's cached for 1 hour in Netlify's durable CDN cache and returns an uncached 502 if Google stops serving a PDF (for example, the doc's sharing changed). Update the résumé by editing the Google Doc; no PDF lives in the repo.
- Writing (808): placeholder card until the blog ships. The "Reading room" button and RSS link are behind `SITE.blogEnabled`.

## Rebuilds
- `.github/workflows/rebuild.yml` runs daily at 06:00 IST. It fingerprints the `portfolio`-tagged repos and calls the `NETLIFY_BUILD_HOOK` repo secret only when the fingerprint differs from the last rebuild (kept in the Actions cache). A manual run with `force` rebuilds regardless. There are no unconditional scheduled builds.

## Design: "The Stacks"
Mockups are in `design/` (`prototype.html` = home, `blog.html` = reading room, `brief.html` = brief). Most text in them is placeholder.

Sections (nav labels are Dewey Decimal classes):

| Class | Section | Treatment |
|---|---|---|
| 005 | Projects | Typed index cards: call number, year, description, "Subjects" for tech stack |
| 331.7 | Work | A date-due slip with violet stamped dates |
| 808 | Writing | Latest posts on the home page; the full blog is a separate "reading room" app |
| 028 | Bookshelf | Clickable book spines on a shelf, with a detail card |
| 384 | Contact | A "request slip" form, stamped RECEIVED on submit. No email address on the page. |

Visual system:
- Green cabinet bands, brass label holders, card stock with one red header rule, blue ruling and a rod hole.
- Type: Young Serif (display), Courier Prime (typed card text), Public Sans (UI), Newsreader (blog body).
- Light and dark themes, both via CSS tokens.

## Roadmap
- Phase 2 (in progress): main site.
  - Done: scaffold, layout/header/theme toggle/footer, hero, Projects, Work, Writing placeholder, résumé route, rebuild-on-change.
  - Next: Bookshelf (028) with `books.yaml`; Contact (384) with Netlify Forms and a honeypot; a styled 404; remove the old root `index.html`, `css/`, `404.html` and `sitemap.xml` (no longer deployed).
- Phase 3: blog, a separate Astro app in `apps/blog` with `base: "/blog"` on its own Netlify site, served at `/blog` by the proxy rule already in `netlify.toml`. MDX, Shiki, RSS and generated share images. Then set `SITE.blogEnabled`.
- Phase 4: /now page, book sync, privacy-friendly analytics, drawer view transitions.

## History
`design/chat-transcript.md` holds the design discussion behind these decisions. It's git-ignored; read it only when you need the reasoning.
