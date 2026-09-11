# Netherwood Data Partners agent rules

Applies repository-wide. Before changing anything, read:

1. `docs/PROJECT_STATE.md`
2. `docs/DESIGN_SYSTEM.md`
3. `docs/BRAND_VOICE.md`
4. `docs/SITE_ARCHITECTURE.md`
5. `docs/LAUNCH_AUDIT.md`
6. `docs/LAUNCH_CHECKLIST.md`

## Scope and ownership

- Start from a clean, current branch: inspect `git status`, pull
  `origin/main`, list related branches, and preserve unrelated work.
- Make one focused change per branch/commit. Do not mix content, design,
  backend, infrastructure, database, or cleanup work unless the task explicitly
  requires each area.
- Inspect the production/static path as well as the Next/Vinext path. GitHub
  Pages is the public release: `pages-site/`, `vite.pages.config.ts`,
  `scripts/generate-static-pages.mjs`, and `.github/workflows/deploy-pages.yml`.
- `app/globals.css`, `app/about/about.css`, `app/layout.tsx`,
  `app/components/SiteChrome.tsx`, shared buttons/forms, and public imagery are
  protected visual areas.
- `app/components/ContactForm.tsx` and its Formspark integration already exist
  on `codex/formspark-contact` at `f982599`. Inspect and integrate that work;
  never recreate, overwrite, or expose account credentials.
- Public pages, published articles, and contact must work without Voyager,
  SQL Server, Docker, Ollama, tunnels, home Internet, or AI. Dynamic features
  must fail quietly; the visible business email remains the contact fallback.
- Never commit `.env`, credentials, API/tunnel tokens, private keys, or private
  backups. Browser code receives no AI/SQL secret. A public Formspark action URL
  is not a private credential.
- Never invent business claims. Follow `docs/BRAND_VOICE.md` and require owner
  approval for biography, staffing, clients, testimonials, counts,
  certifications, awards, tenure, SLAs, guarantees, pricing, or results.
- Do not change public exposure, DNS, router/firewall rules, database storage,
  SQL permissions, Docker volumes, or credentials without an explicit task and
  approval. Never expose TCP 1433 or use router port forwarding.

## Visual change policy

No AI agent may perform a general redesign or aesthetic cleanup unless explicitly instructed to do so.

Global CSS, typography, color tokens, page-width rules, navigation, shared buttons and major layout primitives are considered protected design-system components.

Changes to protected components require:
1. an explicit task describing the desired visual result,
2. screenshots before and after,
3. responsive verification,
4. confirmation that unrelated pages did not visually regress.

"Improve", "modernize", "polish", "clean up" or "make professional" are not sufficient requirements for global visual changes.

## Validation before merge

- Run checks in the supported Node/pnpm versions: `pnpm lint`, `pnpm test`,
  `pnpm build:pages`, and `git diff --check` unless the scoped task documents
  why one cannot run.
- For backend changes also run backend tests and strict TypeScript checking.
- Inspect generated metadata, routes, robots, sitemaps, internal links, and
  tracked changes for secrets when those surfaces are affected.
- For any protected visual change, save before/after evidence at desktop,
  768px, and 390px; verify keyboard focus, reduced motion, overflow, and
  unrelated Home/About/Articles/Contact pages.
- Do not merge with an unexplained P0 or P1 from `docs/LAUNCH_AUDIT.md`. Friday,
  September 4, 2026 is QA/freeze, not redesign.
- Commit only reviewed, relevant files and report the branch, commit, checks,
  known limitations, and rollback path.
