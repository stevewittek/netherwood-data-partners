# Netherwood Data Partners

The public website for Netherwood Data Partners.

## Update the site

Most content lives in `app/page.tsx`; the visual styling lives in `app/globals.css`.
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
