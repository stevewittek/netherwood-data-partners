# Netherwood Data Partners

The public website for Netherwood Data Partners.

## Update the site

Most content lives in `app/page.tsx`; the visual styling lives in `app/globals.css`.
Push approved changes to the `main` branch to publish them.

## Work locally

Requirements: Node.js 22.13 or newer and pnpm.

```bash
pnpm install
pnpm run dev
pnpm run build
```

The production build is Cloudflare Worker-compatible and hosted through Sites.
Git history provides the rollback path: revert a commit or redeploy a prior saved version.
