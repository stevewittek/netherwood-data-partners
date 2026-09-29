# Consulting and software acceptance — September 28, 2026

Candidate branch: `feat/community-technology-website`, extending `b9b5734`.
Existing review: [PR #17](https://github.com/stevewittek/netherwood-data-partners/pull/17).
The production Pages site is unchanged until the existing review/main workflow merges and deploys this candidate.

## Results

Runtime: Node 24.19.0 and pnpm 11.25.0; installed source dependency versions and lockfiles are unchanged. CI retains its Node 22/pnpm 11.19 workflow. The static checker explicitly uses type stripping to support the minimum Node 22.13 runtime.

- Repository-wide ESLint passed; strict frontend TypeScript passed. Direct installed-tool checks of changed source also passed.
- Existing suites: 11 migration/readiness/attribution tests, 26 publication/admin/pipeline tests and 40 marketing tests passed (77 total, no skips).
- Vinext production build and the static Pages production build passed. After scoped spacing changes, the Pages browser and SSR builds, generation and route audit passed again.
- Static audit passed all 29 public sitemap routes, metadata/canonicals, valid JSON-LD, internal links, assets, robots, admin/404 noindex, CNAME and private-output exclusions.
- All ten complete article bodies match the original export. Content digest remains `ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8`.
- 15 corrected baseline and 30 final renders at 1440, 768 and 390 pixels passed: no horizontal overflow, broken images, duplicate/missing h1 or browser errors. Final visual coverage: Home, About, Services, Articles, an existing article, Products, all three product details and website Privacy.
- All 29 public routes retain readable HTML without JavaScript. Native Formspark action and visible business email remain. 320px Products navigation, keyboard skip link, reduced motion, missing routes, index.html paths and 200% text enlargement passed.
- 16 automated axe scans at desktop/phone widths reported zero violations across Home, About, Articles, Products, three details and Privacy. This is an automated scan, not complete assistive-technology certification.
- Product-specific checks verify the rendered name/status/company publisher/schema, actual configured HTTPS links and absence of a download control when no destination exists.
- Git diff whitespace checks passed. No source dependency or lockfile change, SQL mutation, public exposure change, real inquiry, email or marketing send occurred.

## Evidence and repeatability

Machine-readable summaries and representative screenshots: [products evidence](evidence/2026-09-28/products/).
Full before/after captures remain locally in ignored `outputs/products-qa/`.
Run `pnpm build:pages`, `node --experimental-strip-types scripts/check-pages.mjs`,
then the existing `pnpm preview:pages` and `node scripts/qa-products.mjs`.
The browser runner accepts `NDP_PLAYWRIGHT_MODULE` as a module URL and `NDP_QA_URL`.
The existing local axe installation was reused; no dependency was added.

## Files changed

- Catalog/pattern: `app/content/products.ts`, `app/components/ProductPages.tsx`, `app/products.css`, `app/products/page.tsx`, `app/products/[slug]/page.tsx`.
- Routes/privacy: `app/SiteRouter.tsx`, `app/privacy/page.tsx`.
- Company presentation: `app/page.tsx`, `app/about/page.tsx`, `app/components/SiteChrome.tsx`, `app/content/site.ts`.
- Release compatibility: `.github/workflows/ci.yml`, `.github/workflows/deploy-pages.yml` (typed-catalog loading flag only; release gates and permissions unchanged).
- Build/validation: `scripts/generate-static-pages.mjs`, `scripts/check-pages.mjs`, `scripts/qa-products.mjs`, `tsconfig.json` (allow typed .ts imports in the shared catalog used by build-time Node).
- Handoff: `README.md`, `docs/PRODUCTS_AUDIT.md`, this document, `docs/SITE_ARCHITECTURE.md`, `docs/PROJECT_STATE.md`, `docs/FEATURE_STATUS.md` and the evidence directory.

## Remaining decisions and release

QueryVault's public source and README links are verified. No release/download or license badge is invented. PageMover and RunBridge source destinations are private and omitted.
RunBridge's working name, final privacy implementation and future distribution/store URLs need later decisions. Its neutral route is `/products/activity-data-connector/`; names and slugs are centrally configured.
The existing generated industry images and licensed station photo are retained in their original page roles. No fake product screenshots were added.

The main checkout's untracked `.vs/` and the publishing-desk checkout's three modified files are untouched; coordinate that separate work with Voyager 2. Remote histories were fetched and checked before commits; no remote work was overwritten.
Push the focused commits to the existing review branch. Rollback is to revert the expansion commits in reverse order, retaining the preceding community/industry candidate. No database rollback is required.
