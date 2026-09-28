# Consolidated products acceptance — September 28, 2026

## Outcome and Git safety

Branch: `feat/community-technology-website`. The initial community/industry candidate was `b9b5734`; it was clean. PR #17 merged and Voyager 2 pushed main `7d370c3` during this run, with successful CI and Pages deployment. The local implementation was preserved in `25fb3a5`, `bf8e6ef` and `e6379fe`, then merged normally in `f74107b`. The final source keeps the published architecture/design/routes and adds verified product details and acceptance checks. No shared history was rewritten and no force push was used.

The primary checkout's untracked `.vs/` and the publishing-desk checkout's three modified files remain untouched. The current shared publication implementation already has newer digest-based verification; the desk's older timestamp-based edits were not reapplied over it. Coordinate that separate work before any future desk integration.

## Final consolidated validation

- Repository-wide lint, frontend TypeScript, targeted final-source lint and the marketing strict type check passed.
- All 77 existing tests passed: migration/readiness/attribution 11; publication/admin/pipeline 26; marketing 40. No failures or skips.
- Vinext production build and the complete Pages browser/SSR/generation build passed.
- Static audit passed all 29 public sitemap routes, titles/descriptions/canonicals, JSON-LD, internal links/assets, robots, admin/404 noindex, CNAME and private-output exclusions.
- All ten full article bodies retain content digest `ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8`.
- 30 final desktop/tablet/phone renders at 1440/768/390px passed with no overflow, broken images, duplicate/missing h1, animations under reduced motion or browser errors. Coverage: Home, About, Services, Articles, one complete article, Products, all three details and Privacy.
- All 29 routes have readable content without JavaScript. Keyboard skip navigation, 320px Products navigation, missing routes, explicit index.html, 200% text enlargement, native contact action and visible business email passed.
- 16 final automated axe scans at desktop/phone widths reported zero violations across Home, About, Articles, Products, all three details and Privacy. This is automated evidence rather than full assistive-technology certification.
- Catalog-driven checks confirm rendered names/statuses, company creator, configured HTTPS destinations and the absence of unavailable download controls.
- Whitespace checks passed. Dependencies/lockfiles are unchanged; no database mutation, backend exposure change, real inquiry, email or marketing send occurred.

The first consolidated axe scan identified a nested complementary landmark on the three product availability notices. Those notices now use an accessible note within the main content. The pre-fix findings are preserved in `accessibility-before-fix.json`; the final scan verifies the corrected semantics.

## Evidence and repeatability

The parent evidence directory contains the consolidated after results and screenshots; `before.*` captures the corrected industry baseline. The `parallel-local/` directory preserves the earlier local product design and its separate acceptance report. Full captures remain in ignored `outputs/products-qa/`.

Run `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm typecheck:marketing`, the three named regression suites, `pnpm test`, `pnpm build:pages` and `node --experimental-strip-types scripts/check-pages.mjs`. Against the Pages preview, run `node --experimental-strip-types scripts/qa-products.mjs` with `NDP_PLAYWRIGHT_MODULE` pointing to an existing Playwright module. The browser runner accepts `NDP_QA_URL` and blocks non-GET/external requests. Existing local axe tools were reused without adding dependencies.

## Architecture, routes and files

The delivered main expansion uses `app/content/products.ts`, `app/components/ProductPages.tsx`, `app/products.css`, `app/products/`, `app/components/PrivacyPage.tsx`, `app/privacy/page.tsx`, `app/SiteRouter.tsx`, Home/About, `SiteChrome`, shared site metadata, and the static generator. It presents one company for consulting plus software/data products. Optional links, screenshots, privacy, support, releases and related articles are supported without empty public controls. Decorative card art is not presented as a product screenshot.

Current routes:

- `/products/`
- `/products/queryvault/`
- `/products/sql-server-index-maintenance-visualizer/` — PageMover
- `/products/garmin-ai-connector/` — RunBridge AI working name
- `/privacy/`

The follow-up diff to main changes the catalog, public product copy, `scripts/check-pages.mjs`, both CI/Pages checker invocations (Node 22.13 type-stripping compatibility), `scripts/qa-products.mjs`, README, feature/project status, preservation/verification reports and evidence. The published route spellings are retained; RunBridge's route does not depend on its working name.

QueryVault links only its real public source `https://github.com/stevewittek/Databases` and current root README. It has no confirmed license or packaged release, so it gets a public-source badge rather than an open-source/download claim. PageMover and RunBridge repositories are private and omitted. PageMover's Windows preview, SQL review and index/heap scope are verified against its README. RunBridge's Garmin adapter/external AI connection remain incomplete; descriptions retain development language.

## Assets and remaining decisions

The warehouse/manufacturing/medical-office WebP scenes remain in Home/Services, and the licensed Netherwood station photo stays in Home/About. Prompt records, originals and credits are preserved. A stale ignored preview was rebuilt; no new images, invented screenshots, testimonials, release dates or availability claims were added.

The detailed app privacy notice, final RunBridge name, QueryVault license and future distribution/store URLs require later product decisions. Existing consulting content remains prominent. Product notes describe development privacy principles and the need for implementation-specific disclosures before release. General business email remains the support route.

Push through the existing feature/main review workflow. A revert of this follow-up leaves Voyager 2's published expansion intact and requires no database rollback. The other worktrees and their owner-managed edits remain available for coordination.
