# Netherwood Data Partners

The public website for Netherwood Data Partners.

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

The static production build is published by GitHub Pages. A private Sites release
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
HTML preview, SEO metadata, publish/unpublish, archive, and guarded deletion.

Authoring is disabled unless both the separate article-author SQL identity and
the API publishing token are configured. See
[`docs/ARTICLES_CMS.md`](docs/ARTICLES_CMS.md) for setup, security, publishing,
preview, export, and recovery details.
