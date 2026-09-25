# Migration and modernization revision

September 25, 2026. Branch: `codex/migration-modernization`, based on current
`origin/main` at `b54819b`. Worktree: `/home/nasa/netherwood-migration-modernization`.
The original `/home/nasa/netherwood-data-partners` checkout has unrelated local
documentation; its pull was correctly refused and its changes were preserved.
This is a linked checkout of the existing repository, not a replacement project.
Implementation commits: `072f4f4` (private prospecting foundation) and `eec9b3c`
(public positioning, services, lead tools, static SEO and regression checks).

## Implemented

- Home now centers on business data migration, the customer's chosen platform,
  legacy-system problems and professional project work. SQL Server/DBA depth is
  prominent as the reason Netherwood can handle difficult migrations.
- A source/preparation/destination diagram, a ten-step process, industry
  examples, geographic fit, assessment entry point, founder credibility and
  plain-language FAQs support the offer.
- About explains why small businesses need enterprise database capability on a
  project basis, retaining verified experience, the monogram and direct founder
  involvement. No employers became clients, no partnerships were invented, and
  no prices, guarantees or staffing claims were added.
- Shared navigation/footer and existing contact topics match the new offer.
  Seven reusable service pages provide specific scope, deliverables, limitations,
  vendor coordination and related services.
- Guided migration intake includes the requested business, goal, destination,
  existing environment, history, concerns, staff friction and deadline fields.
  Only name/business/email are required. The assessment CTA preselects its goal.
- The 14-question readiness check reveals a useful result without contact
  information, explains its rules and drivers, and provides next steps and
  print/save. Unknowns are not treated as proven risks. A user can explicitly
  carry the enumerated answers into an inquiry, inspect/remove the attachment,
  and submit it through the existing Formspark integration. Expired/malformed
  handoffs and denied browser storage fail without blocking contact.
- The local prospecting desk implements company CRUD, search/filters, source
  evidence, research notes, all requested fields/statuses, explainable scoring,
  editable introductions, explicit review approval, private export and sticky
  do-not-contact suppression. Stored approvals bind the exact recipient and
  draft; changes invalidate approval. It sends no messages and collects no sites.
- A researched SEO intent map and prioritized 15-topic editorial backlog extend
  the strategy while retaining the SQL-owned published articles.

## Pages

Ten added pages:

1. `/services/`
2. `/services/data-migration/`
3. `/services/legacy-application-modernization/`
4. `/services/business-software-migration/`
5. `/services/legacy-systems-assessment/`
6. `/services/database-engineering/`
7. `/services/workflow-automation/`
8. `/services/practical-ai/`
9. `/migration-intake/`
10. `/migration-readiness/`

Substantially revised: `/` and `/about/`. Existing article bodies, index,
slugs and publishing controls remain. The previous homepage anchors `services`,
`business-systems`, `database-services`, `engagements`, `when-to-call-us`,
`approach`, `about`, `insights` and `contact` still resolve.

## Architecture and SEO

The existing Vite/GitHub Pages pipeline still publishes ordinary static files.
A temporary build-time React renderer adds readable HTML before hydration on
every public route, including all published articles. No new runtime service is
needed. Matching renderer/export digests prevent stale article prerendering;
the route checker also verifies full article content against the export.

Unique titles/descriptions, canonical URLs, social metadata, Organization,
AboutPage, Service, BreadcrumbList and existing Article structured data are
generated for the relevant pages. The main sitemap contains 23 canonical public
URLs; the article sitemap retains its 11 URLs. Robots retains its admin exclusion.
Unknown and withdrawn routes remain noindex. Explicit `index.html` paths render
the canonical page, and custom 404 hydration handles unknown service/article URLs.

The CNAME, Search Console verification, self-hosted fonts, visual identity,
social image, release/rollback configuration and published article digest are
preserved. CI and release checks add the new unit tests; their release gates,
permissions and deployment mechanism are unchanged. There was no active general
analytics package to migrate; disabled chat/telemetry remains disabled.

Public forms retain direct Formspark delivery and independent email fallback.
No API keys, database secrets or new application dependencies are introduced.
Prospecting code and private records are absent from `pages-dist`. Its private
store cannot be configured inside the repository and never uses production SQL.

## Verification and local evidence

Run with Node 22.13.1 and pnpm 11.19.0 in an isolated existing-image container.
No host package installation or production service change is needed. The
repository has no formatter configuration; touched public components were
formatted with temporary Prettier 3.6.2 without adding a dependency.

Passed verification:

- ESLint and frontend TypeScript checks.
- 26 existing publication/pipeline tests, eight readiness tests, 14 private
  prospecting tests, and 70 existing backend tests; backend strict typecheck.
- Both production builds: Vinext (`pnpm test`) and static GitHub Pages.
- Static validation of all 23 canonical routes, full article-body parity,
  internal links/anchors/assets, metadata, schema, sitemaps, robots and CNAME.
- 69 browser renders (23 routes at 1440/768/390 pixels), with no horizontal
  overflow, broken images, console errors or hydration exceptions; additional
  320-pixel, keyboard focus, reduced-motion, article-search, missing-route,
  explicit `index.html` and footer-year-rollover regressions.
- All 23 public pages remain readable with JavaScript disabled and retain a
  static contact path. Native intake POST works without JavaScript or fetch;
  the interactive readiness calculation explicitly requires JavaScript.
- 21 intake/readiness/contact browser scenarios, including validation, result
  categories, optional fields, conditional platform, attachment review/removal,
  expired/invalid/denied storage, timeout, retry and duplicate-submit prevention.
  All 13 simulated form POSTs were intercepted; none reached Formspark.
- 35 automated accessibility scans reported zero violations. The remaining
  automated review prompts concerned decorative arrow glyphs and the preserved
  article gradient. Visual and keyboard checks were also performed; this is not
  a full assistive-technology or WCAG certification.
- Private prospecting browser workflow at 1440/768/390 pixels: editing, evidence,
  scoring, drafts, approval invalidation, suppression and persistence. Node tests
  also cover loopback/Host/Origin/CSRF boundaries, concurrent edits, writer locks,
  corrupt-store preservation and path/symlink containment.
- No private prospecting modules or record markers in public artifacts. Published
  snapshot, lockfiles, CNAME and social image remain unchanged. No new secrets or
  runtime dependencies; `git diff --check` passes.

Repeatable commands:

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm test:publication
pnpm test:migration
npm test --prefix backend
npm run typecheck --prefix backend
pnpm test
pnpm build:pages
node scripts/check-pages.mjs
git diff --check
```

Browser runners are `scripts/qa-migration.mjs`,
`scripts/qa-migration-tools.mjs`, `scripts/qa-migration-accessibility.mjs` and
`internal/prospecting/test/browser.mjs`. They accept a temporary Playwright module
through `NDP_PLAYWRIGHT_MODULE`; accessibility additionally uses `NDP_AXE_MODULE`.
These QA dependencies are not part of the site. Public QA blocks external
requests and intercepts all simulated form submissions.

Ignored local evidence: `outputs/migration-qa/before/` (39 baseline renders),
`outputs/migration-qa/after/` (69 candidate renders, tools, keyboard/route/static
checks), `outputs/migration-qa/accessibility/` and `outputs/prospecting/`.
Screenshots cover Home/About/Articles/Contact before and after at 1440/768/390,
all added pages, migration diagrams, readiness results and the private workspace.

## File inventory

- Public positioning: `app/page.tsx`, `app/about/page.tsx`, `app/layout.tsx`,
  `app/components/SiteChrome.tsx`, `app/components/Portrait.tsx`,
  `app/components/MigrationDiagram.tsx`, `app/content/site.ts`, `app/migration.css`.
- Services: `app/content/services.ts`, `app/components/ServicePages.tsx`,
  `app/services/page.tsx`, `app/services/[slug]/page.tsx`, `app/services.css`.
- Lead tools: `app/components/ContactForm.tsx`, `app/components/MigrationIntake.tsx`,
  `app/components/MigrationReadiness.tsx`, `app/lib/migration-readiness.ts`,
  `app/migration-intake/page.tsx`, `app/migration-readiness/page.tsx`,
  `app/migration-tools.css`, `test/migration-readiness.test.ts`.
- Static integration: `app/SiteRouter.tsx`, both `pages-site` HTML/TSX entries,
  `scripts/render-static.tsx`, `vite.prerender.config.ts`,
  `scripts/generate-static-pages.mjs`, `scripts/check-pages.mjs`.
- Private workspace: `internal/prospecting/{model,store,server}.mjs`,
  `internal/prospecting/ui/{index.html,app.js,style.css}`,
  `internal/prospecting/test/{model.test,server.test,browser}.mjs`, and its README.
- QA/config: three `scripts/qa-migration*.mjs` runners, `package.json`,
  `eslint.config.mjs`, `.gitignore`, CI and Pages workflow test additions.
- Knowledge/docs: both public company-knowledge files, README, brand/design/
  architecture/project-state documentation, this report, SEO research and the
  migration editorial backlog.

## Not completed in this phase

- No public deployment, merge to main, real form/email send or production change.
  Existing recipient/inbox behavior is preserved but not newly delivery-tested.
- No real prospect collection or automated website analysis. The private app
  supports manual public evidence and a research checklist; it does not crawl,
  scan, authenticate to third-party sites or infer internal systems from website age.
- No email sending integration; approval is a stored review decision only.
- No new articles inserted into the live SQL CMS. The 15-topic backlog is ready
  for the existing authoring workflow. Existing ten articles remain unchanged.
- Prospecting is a single-user local foundation, not a multi-user CRM. Automated
  backup/restore/import, duplicate-company/suppression reconciliation, richer
  history, passive collection and CRM integration remain next-phase work.

## Recommended next phase

Review and release this branch through the existing Pages process; then validate
one authorized production inquiry through actual receipt. Use real first
engagements to refine qualification and assessment scope. Publish the first
backlog pieces through the existing CMS, beginning with the vendor/legacy-system
responsibility gap and moving years of history into newly selected software.

Populate a small manually reviewed Union/Somerset/Middlesex prospect set. Prove
evidence quality before adding passive collection. Add tested private-store
backup/restore and duplicate/suppression handling before any future CRM or
human-approved delivery integration. No future sender should treat a generic
status alone as authority to send.

Rollback: revert the focused revision commits before release or use the existing
retained Pages artifact rollback workflow after a separately approved deployment.
No live schema, storage layout, credential or infrastructure rollback is needed.
