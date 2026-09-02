# Netherwood Data Partners repository instructions

Read `AGENTS.md`, `docs/PROJECT_STATE.md`, `docs/DESIGN_SYSTEM.md`,
`docs/BRAND_VOICE.md`, `docs/SITE_ARCHITECTURE.md`,
`docs/LAUNCH_AUDIT.md`, and `docs/LAUNCH_CHECKLIST.md` before editing.

## Operating rules

- Work from a clean, current, focused branch. Inspect existing code, current
  production, related branches, and recent history before proposing changes.
- Keep diffs narrowly tied to the request. Do not combine a feature with CSS
  cleanup, navigation changes, copy rewrites, dependency upgrades, or backend
  refactors.
- GitHub Pages is the public production path. Preserve static operation and the
  tracked article fallback. Voyager is optional and may not gate pages,
  published articles, or contact.
- Formspark work already exists on `codex/formspark-contact` at `f982599`.
  Integrate that work instead of generating a second form or endpoint.
- Preserve the visible `contact@netherwooddatapartners.com` fallback. Never put
  private credentials or AI/SQL secrets in browser code.
- Follow the factual-claims rules in `docs/BRAND_VOICE.md`. Do not invent
  people, customers, testimonials, statistics, certifications, awards,
  experience, SLAs, guarantees, prices, or results.
- Protected areas include global/page CSS, font loading, color tokens, public
  widths and grids, `SiteChrome`, shared buttons/forms, and public imagery.
- Never change DNS, router/firewall rules, public exposure, database storage or
  permissions, credentials, or Docker volumes as an incidental website task.

## Visual change policy

No AI agent may perform a general redesign or aesthetic cleanup unless explicitly instructed to do so.

Global CSS, typography, color tokens, page-width rules, navigation, shared buttons and major layout primitives are considered protected design-system components.

Changes to protected components require:
1. an explicit task describing the desired visual result,
2. screenshots before and after,
3. responsive verification,
4. confirmation that unrelated pages did not visually regress.

"Improve", "modernize", "polish", "clean up" or "make professional" are not sufficient requirements for global visual changes.

## Required validation

Before merge, run `pnpm lint`, `pnpm test`, `pnpm build:pages`, and
`git diff --check` in supported tool versions. Run backend tests and strict
TypeScript checking when backend files change. Review the complete diff,
generated routes/metadata when relevant, and tracked files for secrets.

Protected visual changes additionally require saved before/after screenshots at
desktop, 768px, and 390px plus confirmation that Home, About, Articles, one
article, and Contact did not regress. Do not merge with an unexplained P0/P1 in
`docs/LAUNCH_AUDIT.md`.
