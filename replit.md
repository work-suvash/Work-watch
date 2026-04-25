# WORKWATCH Website

The WORKWATCH (WorkWatch) website — "The largest collection of free stuff on the internet!"

## Tech Stack

- **Framework**: VitePress 1.x (Vue 3, Vite)
- **Styling**: UnoCSS, SCSS
- **Package Manager**: pnpm 10.x
- **Runtime**: Node.js 24
- **PWA**: vite-plugin-pwa
- **Optional API**: Nitro (in `api/`) — used for the deployed Cloudflare Workers backend; not required to run the docs site.

## Project Structure

- `docs/` — VitePress documentation source (Markdown content for the site)
- `docs/.vitepress/` — VitePress configuration, theme overrides, hooks
- `docs/public/` — Static assets served at the site root
- `api/` — Nitro API (Cloudflare Workers, optional, deployed separately via wrangler)
- `pests-repellent/` — Companion sub-project
- `scripts/` — Markdown lint helpers

## Development on Replit

The dev server is configured to bind to `0.0.0.0:5000` and trust the Replit proxy
(`allowedHosts: true`). This is set in `docs/.vitepress/config.mts` under `vite.server`.

Workflow: `Start application` → `pnpm run docs:dev` → port 5000 (webview).

## Deployment

Configured as a **static** deployment:

- Build: `pnpm run docs:build`
- Public dir: `docs/.vitepress/dist`

The Nitro API in `api/` is intended for Cloudflare Workers (`wrangler deploy`)
and is independent of the docs site deployment.

## Notes

- `package.json` declares `engines.node >= 25.2.1`. We run on Node 24 (the highest
  Replit module available); `package-manager-strict=false` in `.npmrc` keeps this
  as a warning rather than a hard error.

## Custom Home Page (WorkWatchHome)

The home page features grid is replaced by a custom Vue component:
`docs/.vitepress/theme/components/WorkWatchHome.vue`

Features:
- Smart search with auto-suggestions (filters categories live)
- Category filter chips (All / Tools / Media / Platforms / Learn)
- Grid / list view toggle (persists to localStorage)
- Trending section (curated)
- Recently viewed (auto-tracked via router hook in `theme/index.ts`)
- Bookmark system (heart toggle on each card, persisted to localStorage)

Wiring:
- Component is rendered via `home-features-before` slot in `theme/Layout.vue`.
- The default VitePress feature grid is hidden via `.VPHome .VPFeatures { display:none }`
  in `theme/styles/workwatch.scss`.
- Recently viewed tracking lives in `theme/index.ts` (`router.onAfterRouteChanged`).

LocalStorage keys: `workwatch-bookmarks`, `workwatch-recent`, `workwatch-view-mode`.

## Category Page Card Layout

Category pages (e.g. `/video`, `/audio`, `/gaming`, `/privacy`, etc.) are
post-processed at runtime by `theme/Layout.vue` (`transformCategoryPage()`):

- VitePress demotes the markdown body's H1 to `<h2>` (since the page already
  has a frontmatter title), and `## ▷ Sub-section` becomes `<h3>`. Both H2
  and H3 are treated as section dividers — each one starts its own box.
- A top-level H2 that has **no link list of its own** (it just parents
  several H3 sub-sections) is rendered as a slim gradient banner
  (`.ww-cat-banner`) instead of an empty card, so the page reads
  "Major Category" → boxes for each sub-category beneath it.
- Every `<ul>` inside a section that contains links is converted into a tile
  grid (`.ww-cat-grid`); each `<li>` is rewritten so only the primary site
  name is shown as a big tile (`.ww-tile-link`). Description text and
  mirror/extra links are collapsed into a hover popover (`.ww-tile-meta`).
  Lists with no links (e.g. a leading "Note") stay as `.ww-cat-note`.
- Tile favicons use `data-src` + an IntersectionObserver, so they're only
  fetched when the tile nears the viewport, and tiles fade-up on reveal.
- The default VitePress sidebar (left nav) is kept; the right per-page TOC
  is hidden on category pages so the grid uses the full content width.

Styles live in `theme/styles/workwatch.scss` under the
"Category-page card grid" section.

The category path list lives in `theme/Layout.vue` (`CATEGORY_PATHS`).
Add new paths there if you create more boxed category pages.

## Feedback Widget (Removed)

The "Got feedback? — Share Feedback" banner and the inline mail icons next
to `h2` headings have been removed:

- `transformer/constants.ts` no longer injects `<Feedback />` in `getHeader()`.
- `markdown/headers.ts` is now a no-op plugin (kept exported so existing
  imports continue to work).
- `theme/components/Feedback.vue` is still defined and globally registered,
  but is not used anywhere in the rendered pages.
