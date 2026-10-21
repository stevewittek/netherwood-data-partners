# Netherwood Data Partners

**Independent software, SQL Server database engineering, and data tools.**

Created by **Steven Wittek**, a New Jersey-based database engineer with 17+ years of production SQL Server experience. This repository contains the public Netherwood website, product pages, articles, and selected application and data integrations.

**Live website:** https://netherwooddatapartners.com/  
**Engineering background:** [About Steven](https://netherwooddatapartners.com/about/) | [GitHub](https://github.com/stevewittek) | [LinkedIn](https://www.linkedin.com/in/steven-wittek-64956965)

## Selected engineering work

| Project | Problem addressed | Explore |
| --- | --- | --- |
| **QueryVault** | Preserve completed SQL Server Query Store periods before older history ages out or a load-test database is refreshed. Compare meaningful baselines and later windows for performance investigation. | [Source, screenshots, validation](https://github.com/stevewittek/Databases) · [Use case](https://github.com/stevewittek/Databases/blob/master/docs/USE_CASES.md) |
| **PageMover** | Inspect SQL Server indexes and heaps, visualise physical pages, review proposed maintenance SQL and measured results. | [Product overview](https://netherwooddatapartners.com/products/sql-server-index-maintenance-visualizer/) (private-source developer preview) |
| **Motion Relay** | Connect current Garmin workout metrics to native phone companions and an optional conversational assistant. | [Product and beta information](https://netherwooddatapartners.com/products/garmin-ai-connector/) |

### QueryVault in practice

QueryVault grew out of the need to keep load-testing evidence when SQL Server Query Store no longer retained the original period. For a larger tuning effort, an archived July baseline and a comparable October capture can help show what changed in query plans, waits, CPU, logical reads and execution counts after a quarter of work.

![Actual QueryVault archived-period Grafana dashboard](https://raw.githubusercontent.com/stevewittek/Databases/master/docs/images/grafana-overview-period.jpg)

*Actual SQL Server lab capture from September 2026. See [screenshot record](https://github.com/stevewittek/Databases/blob/master/docs/SCREENSHOT_PLAN.md) and [validation report](https://github.com/stevewittek/Databases/blob/master/docs/VALIDATION_REPORT.md). The July-to-October example is illustrative, not a claimed customer performance result.*

## Website development

The public website for Netherwood Data Partners.

The site presents an independent data and software business: apps, data
connections and database tools, with consulting for focused projects.
The existing theme, Motion branding, beta signup and business inquiry forms
remain in place. See [the editorial revision](docs/EDITORIAL_REVISION.md)
for the local candidate and validation status.

The public forms preserve a bounded first campaign touch in session storage and
include only allowlisted UTM fields, the opaque `nwd_campaign` code and a path-only
landing page with an inquiry. No cookie, referrer URL, advertising identifier or
browsing history is collected. Run `pnpm test:migration` for readiness and
attribution contract tests.

## Update the site

Route content lives under `app/`; shared visual styling lives in
`app/globals.css`.
Push changes to the `main` branch to publish them automatically. GitHub Pages
builds and releases the site on every push; there are no pull-request or manual
release gates.

## Work locally

Requirements: Node.js 22.13 or newer and pnpm.

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run build:pages
```

The static production build includes build-time rendered HTML and is published by GitHub Pages. A private Sites release
is kept as a fallback. Git history provides the rollback path: revert a commit or
redeploy a prior saved version.

## Private backend

Voyager 2 provides optional chat, telemetry, and private article-authoring
services. It is intentionally not required to render or publish the static
site. See
[`docs/VOYAGER2_BACKEND.md`](docs/VOYAGER2_BACKEND.md) for the architecture and
[`backend/sql/README.md`](backend/sql/README.md) for the gated SQL Server setup.

## Articles publishing

The Articles section is a database-backed CMS with public routes at
`/articles` and `/articles/{slug}` and a private publishing desk at
`/admin/articles`. Voyager serves current published content through the API;
the Pages build retains an exported snapshot so the last exported articles
remain readable during a Voyager outage. Once an approved Voyager API URL is
configured and reachable, publishing does not require a source edit, Git
commit, or site deployment.

Ten initial consulting articles are installed by an idempotent SQL seed and
included in the tracked outage snapshot. The public index supports featured
content, categories, and search; the private desk supports drafts, sanitized
HTML preview, SEO metadata, editable UTC publication dates,
publish/unpublish, archive, and guarded deletion.

Authoring is disabled unless both the separate article-author SQL identity and
the API publishing token are configured. See
[`docs/ARTICLES_CMS.md`](docs/ARTICLES_CMS.md) for setup, security, publishing,
preview, export, and recovery details.
Voyager 1 integration details and response contracts are in
[`docs/VOYAGER1_ARTICLES_INTEGRATION.md`](docs/VOYAGER1_ARTICLES_INTEGRATION.md).

## Private marketing desk

Company lists, suppression, deliberate campaign approval, local email previews
and attribution reporting live in the isolated [marketing module](marketing/README.md).
Run `pnpm marketing:setup` then `pnpm marketing` locally. The shipped provider
cannot send real mail. See [marketing handoff](docs/MARKETING-HANDOFF.md) and
[Voyager 2 integration](docs/VOYAGER2-INTEGRATION.md) before production outreach.

## Software products

The reusable catalog is `app/content/products.ts`. Cards and details live in
`app/components/ProductPages.tsx`; `app/products/` supplies the Vinext routes.
The Pages generator creates the same routes and includes them in the sitemap.
Add only verified public source/docs/distribution links. Empty fields do not
render controls or sections. Run `node --experimental-strip-types scripts/qa-products.mjs` against the
local preview for responsive, navigation and no-JavaScript acceptance; set
`NDP_PLAYWRIGHT_MODULE` to an existing Playwright module URL when needed.
See `docs/PRODUCTS_AUDIT.md` and `docs/PRODUCTS_VERIFICATION.md`.
