# Netherwood Data Partners

The public website for Netherwood Data Partners.

The site focuses on small business data migration and systems modernization,
with database engineering as its technical foundation. Migration intake and the
ungated readiness check reuse the existing static architecture. See
[`docs/MIGRATION_IMPLEMENTATION.md`](docs/MIGRATION_IMPLEMENTATION.md) for this
revision, checks, file inventory and next phase.

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
