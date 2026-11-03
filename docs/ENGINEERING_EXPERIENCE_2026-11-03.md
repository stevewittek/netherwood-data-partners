# Engineering experience release

The owner approved the revised content and authorized publication on November 3,
2026. The candidate is based on public main `6e4f784` on
`codex/engineering-experience-release`; the separate unpublished employment
portfolio is preserved.

## Resulting behavior

Home introduces selected experience and links three featured stories. Shared
navigation and the footer expose `/case-studies/`. About links the collection;
Services connects relevant historical work and current independent development.
The existing consulting/product positioning, forms, articles and product/policy
routes stay in place.

The collection has seven full career narratives, contribution summaries,
engineering outcomes, technologies, related services and related stories:

- `institutional-investment-platform`
- `healthcare-production-performance`
- `fundraising-reporting-crm`
- `retail-register-cutover`
- `research-intellectual-property-migration`
- `business-processing-after-recovery`
- `neonatal-reporting-azure-sql`

The collection's current-development section covers AI-assisted requirements,
implementation, review, testing, source control and delivery, with QueryVault,
PageMover and Motion Relay links and accurate project-evidence boundaries.

## Accuracy and publication boundary

All narratives match the owner-approved content source. Historical organization
names, employer research links, private mappings, raw client data and production
configuration values are excluded. No AI use is attributed to historical work.
The reporting timing, CPU observation, index sizes and rollout scope are career
accounts rather than newly reproduced benchmarks. The rollout's program scale
is distinct from the founder's database cutover contribution. No formal TLS
mandate, exact retail-project date or unsupported payment feature is asserted.

Private review material remains outside the website repository. No source
snapshot, backend, database, credential, workflow, analytics or contact transport
change is part of this release. No real inquiry was sent during QA.

## Validation

Node 22.23.3 and project-pinned pnpm 11.19.0:

- Lint, strict frontend and marketing type checks passed.
- Vinext production build (`pnpm test`) passed.
- Static Pages build and the 45-route metadata/schema/link/sitemap check passed.
- Publication, migration/attribution and marketing test suites passed.
- All seven public narratives match the approved source exactly.
- Existing ten-article digest remains
  `ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8`.
- Eighteen baseline and 54 candidate responsive renders at 1440/768/390 were
  saved in local ignored `outputs/experience-qa/`. No document overflow or
  missing h1 was observed. Additional 320px checks and keyboard navigation
  passed; Tab exposes the skip link and Enter focuses the main h1.
- Contrast spot checks on new-page typography and links met 4.5:1, with a
  minimum measured ratio of 5.46:1 for the selected text/background pairs.
- Six unchanged upper-content screenshot regions across Home/About/Articles
  and an article had zero mean pixel difference against the baseline. This
  compares those regions, not every pixel of all pages.

The existing backend dependency audit still reports two high-severity findings;
backend dependencies and exposure are outside this static-content change.
Browser checks are scoped UI verification, not a complete assistive-technology
or WCAG certification. GitHub CI and Pages deployment are separate acceptance
steps; their final run and commit are recorded in the delivery evidence.

## Publication and rollback

Publish through the existing main-branch GitHub Pages workflow after CI passes.
Verify the actual deployed `publication.json` source commit and live routes.
The release does not require DNS, hosting or backend changes. Revert the focused
release commit, run the unchanged publishing workflow and verify the restored
source manifest for rollback. Preserve the previous main `6e4f784` as the source
baseline; do not overwrite the separate employment portfolio branch.
