# Publication release candidate verification

Verified 2026-09-11 UTC. **The website release and controlled publication
lifecycle are production-accepted.** The stable application baseline is
`16a133f7d82bb807f3c230514f325604bac84190`; later evidence-only merges do
not change its behavior. The current content is
`b6cbdcb0f5b8eb460096db84d5084f4ae4165770`, digest
`ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8`,
ten articles and chat disabled. Production run `34605108714` succeeded and
retains exact `website-release` artifact `10265914128` for 30 days. No new
contact submission or email was sent.

## Production lifecycle evidence

The release owner approved the SQL export, authoring setup, singular Azure SQL
title and controlled fixtures. SQL validation and integration scripts passed
inside rollback-only transactions. `web.ExportPublishedArticles` and only its
EXECUTE grant to the existing runtime principal were applied. A separate author
login/user and procedure-only role were provisioned from a protected local
credential file; secrets were not printed or committed. The reviewed API image
`sha256:fa981eabf100883ef675a8424222ac4d882c3525b335f6b48aa51af021654e9e`
replaced only the Netherwood API and is loopback-only and healthy.

| Stage | Public result | Release evidence |
| --- | --- | --- |
| Baseline | 10 articles | run `34601708348`, digest `ac062026...` |
| Initial fixture publish | 11 articles | run `34603017803`, content `341b368c...` |
| Edited publish | 11 articles, v2 body | run `34603535109`, content `cbcada8e...`, digest `9a1460e...` |
| Before scheduled due | API/route 404; absent from snapshot/sitemap/AI | cycle 13:27:34Z, unchanged digest `9a1460e...` |
| After scheduled due | 12 articles; API/route/snapshot/sitemap present | run `34604675813`, content `cced734a...`, digest `0318ac3...` |
| Withdrawal/archive | both API/routes 404 and absent from index/snapshot/sitemap | run `34605108714`, content `b6cbdcb0...`, restored digest `ac062026...` |
| Final AI reconciliation | scanned 10, unchanged 10, hidden 2, failed 0 | deployed and SQL digest `ac062026...` |

The first fixture deployment exposed a real test defect: the backend suite
assumed the dynamic export must contain exactly the ten starter rows. Run
`34602565678` failed before deployment and preserved the last good site. PR #4
changed the snapshot test to validate matching starter rows without rejecting
legitimate additions or withdrawals; CI `34602900762` passed all Site, Backend
and Backend Windows jobs, and merge commit `16a133f7...` released the fix.

Fresh and returning isolated Chrome profiles rendered the scheduled article.
After withdrawal, the fresh profile rendered 404. The returning profile first
showed its previously cached document, then rendered 404 with the old body
absent after a forced network refresh. This is the expected cache boundary,
not a server-side resurrection path; there is no service worker or application
article cache in the release.

Rollback run `34607709999` successfully redeployed the exact selected release
artifact from run `34605108714`. The rollback gate was then closed and
publication re-enabled. Normal restoration run `34607819131` completed with a
no-change result because the selected artifact already was the intended latest
release. The persistent 15-minute timer is enabled and active; its timer-owned
14:04:27Z cycle completed successfully at 14:04:34Z with ten unchanged articles,
matching SQL/deployed digest, current AI knowledge and zero failures.

## Pre-release baseline and actual production cause

| Checkout | Inspected branch / baseline | Preservation |
| --- | --- | --- |
| `website` | `codex/formspark-contact` / `f982599` | Existing clean worktree retained |
| `website-governance` | `codex/launch-governance-docs` / `5acea14` | Existing clean worktree retained |
| `website-launch-integration` | `codex/friday-launch-integration` / `f96bc08` | Seven launch commits retained; unrelated Database Mail edit untouched |
| New isolated candidate | `codex/publication-release-candidate` from `f96bc08` | All new work isolated; no reset/clean/pull |

Fetched `origin/main` was `b431beb58dccefb8e092c179a1a8517caa78c484`.
GitHub's successful Pages deployment used that same commit:
[run 33636722032](https://github.com/stevewittek/netherwood-data-partners/actions/runs/33636722032),
deployment 6223598061, completed 2026-09-02T13:36:51Z. Repository/environment
variables were empty, and the downloaded deployed bundles showed empty article
API/chat configuration and the August 24 tracked export. That commit's workflow
builds without exporting SQL. This establishes the cause from deployed evidence,
not merely the working copy or an assumed Voyager outage.

The ten live article routes returned 200, unique titles/canonicals, descriptions,
Article JSON-LD with authors/dates, OG/Twitter metadata and available assets.
Home/About canonical fixes were already part of the preserved launch candidate.
Measured public cache lifetime was `max-age=600`.
[Production route evidence](evidence/2026-09-11/production-routes.json).

## Pre-release Voyager reconciliation

The reused public contract is `netherwood.public-articles/v1`. The actual Voyager
2 candidate was captured at **2026-09-11T03:04:30.209Z**, with ten articles and
canonical digest
`ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8`.
Captured raw-file SHA-256 was
`5c08cc45f89beef5d2f46095672a163952dffb0d27ef941736725c26e6e4361b`.
The strict Mac importer accepted it; derived routes use that same public set.

Voyager 2 subsequently committed its staged publisher and SQL article knowledge
work locally as `9f9a4ca063ea2bce42b75eac25dfe636206d37ba` and
`417f2e86b3dcf018ba3e09789c8fb454ec2a1979`, without pushing. Its updated status
was captured at 03:26:27Z. The current API still runs the August 27 image;
its newly built September 11 image is different and not running. Mac read-only
checks saw health 200, authoring 404, and timer absent/inactive. Its current
status reports no author credentials, ten indexed article sources, successful
idempotent ingestion, 56 tests and typecheck, and cited answer/injection runs
lasting 143.8/176.1 seconds. These last test/AI results are the **backend
operator's evidence**, not tests rerun by the Mac candidate.

The candidate reuses the export contract, sanitizer/plain-text helper and public
capture. It adds a coherent whole-set SQL procedure, data-only Git branch,
validated hosted release and deployed/current-SQL knowledge reconciliation.
Do not copy the competing snapshot-to-main publisher, refresh-only timer or
SQL-first AI refresh over it. The newer retrieval threshold/backend image still
needs an approved backend release and chat readiness checks.

[Initial source capture](evidence/2026-09-11/voyager2-capture.json),
[current handoff and measurements](evidence/2026-09-11/voyager2-current-status.md),
[handoff hashes](evidence/2026-09-11/voyager2-status-capture.json).
Voyager 1 could not be reached and its business/QA handoff has not arrived. The
older API integration reference in Voyager 2 is not that business runbook.
The combined guide identifies this gap instead of inventing operational policy.

**Editorial decision:** SQL currently says "Azure SQL Migration Lesson";
production says "Azure SQL Migration Lessons". The unchanged modification date
would have hidden that change from timestamp-only detection. The candidate
preserves the SQL value; releasing it needs approval. If it is unintended,
correct SQL and export again, rather than changing only the static copy.

## Changed behavior and protections

- One validated complete export drives index/details, SEO, related links,
  public manifest/snapshot and sitemaps. Drafts/private fields/unsafe content,
  duplicate IDs/slugs, corrupt/truncated input and not-yet-due rows are rejected.
- Missing articles and valid empty exports are authoritative. The public UI no
  longer consults the live article API or legacy localStorage caches.
- Every 15-minute prepared cycle evaluates the full due set. Digest comparison
  catches content changes without timestamp changes, schedules and removals.
  Normal operational expectation is about 15–30 minutes including build and
  measured cache time, with no guaranteed SLA.
- Export is atomic with bounded three-attempt retry; host lock and GitHub
  concurrency prevent overlapping cycles/deploys. Non-force data-branch writes
  reject older captures; pre-deploy source/content checks reject superseded
  builds. A failed manifest check fails the workflow instead of reporting a
  skipped successful publication. Failed releases retry next cycle even when
  SQL is unchanged. Last good Pages release and 30-day artifacts are retained.
- Article AI sources are limited to matching deployed/SQL versions, with removed
  or replaced sources hidden before embeddings. Non-article knowledge is kept.
  Chat/telemetry stay off. Ingestion is not a retrieval-time revocation guarantee.
- Narrow visual/flow fixes: apply initial contact fragment after React mounts,
  restore article bullet/number markers, raise contact-field and article-filter
  boundary contrast, and improve dark-section link/button keyboard focus.
  The Formspark component, brand, layout and navigation are preserved.

## Executed checks

Supported runtime: Node **24.19.0**, pnpm **11.19.0**, frozen root lockfile and
backend `npm ci` using npm 10.9.2. No lockfile or dependency version change.

Hosted [CI run 34558806847](https://github.com/stevewittek/netherwood-data-partners/actions/runs/34558806847)
also passed both Site and Backend jobs for implementation commit
`21fc005acfbfb2c2d266c2c5f7ee3ea44ccd12bd` on Node 22. The draft PR shows checks
for any later evidence-only or workflow-reporting refinement.

| Check | Result |
| --- | --- |
| `pnpm lint` | Pass |
| `pnpm test:publication` | 11 pass (8 backend contract/publication + 3 pipeline tests) |
| Backend tests | 57 pass, zero failures |
| Backend strict TypeScript | Pass |
| `pnpm test` (Vinext production build) | Pass; existing static-route classification notice only |
| `pnpm build:pages` + `node scripts/check-pages.mjs` | Pass; 13 public routes, 10 article routes, matching manifest/digest, metadata/links/assets/robots/sitemaps |
| Workflow actionlint 1.7.12; shell syntax | Pass; optional shellcheck/pyflakes not installed and not run |
| Release-step error propagation | Harmless failing subprocess exits 1 before output is written |
| `git diff --check` and reviewed changed-file secret scan | Pass; no credential added |
| Responsive browsers | 39 route/width renders at 1440/768/390; 320px Home/About/index/detail spot checks pass |
| Accessibility | 14 pages: zero automated WCAG A/AA violations; solid-palette checks pass; separate grid/control/focus measurements pass after scoped corrections |
| Contact/keyboard/failure | Visible logical focus, About-to-contact keyboard CTA, search/filter, form local success/error/reset, no-JS mail fallback, backend down and storage denied pass |
| Removal/last-good rehearsal | Corrupt input preserves local build; valid empty export removes routes/sitemaps; returning browser sees empty index/HTTP404 over legacy cached article, including reload |

Backend HTTP tests initially encountered sandbox loopback binding restrictions;
the same suite passed when allowed to create only its temporary local test
servers. No production listener was changed. Browser form results used local
mock responses, with external requests blocked; no email or submission was sent.

[Browser assertions](evidence/2026-09-11/browser-results.json),
[removal rehearsal](evidence/2026-09-11/removal-results.json),
[accessibility results](evidence/2026-09-11/accessibility-results.json).
The removal rehearsal restored the exact source snapshot and rebuilt all ten
routes; its restored digest is recorded. Published article tables/code are
checked where present; current snapshots are not a synthetic stress corpus.

## Responsive evidence

Full local captures are in `outputs/publication-qa/` (39 full pages and 6 contact
views), with previous captures in `outputs/publication-before-format-fixes/`.
All ten articles plus Home/About/index were inspected. Selected protected-change
before/after evidence is retained in Git for reviewers:

| Width | Contact before / final controls | Article formatting before / after |
| --- | --- | --- |
| 1440 | [before](evidence/2026-09-11/before-1440-contact.png) / [after](evidence/2026-09-11/after-1440-contact-submit.png) | [before](evidence/2026-09-11/before-1440-query-store.png) / [after](evidence/2026-09-11/after-1440-query-store.png) |
| 768 | [before](evidence/2026-09-11/before-768-contact.png) / [after](evidence/2026-09-11/after-768-contact-submit.png) | [before](evidence/2026-09-11/before-768-query-store.png) / [after](evidence/2026-09-11/after-768-query-store.png) |
| 390 | [before](evidence/2026-09-11/before-390-contact.png) / [after](evidence/2026-09-11/after-390-contact-submit.png) | [before](evidence/2026-09-11/before-390-query-store.png) / [after](evidence/2026-09-11/after-390-query-store.png) |

All revised contact submit/privacy/email controls are visible. Restored lists
show bullets and numbered steps. No horizontal overflow or visible unrelated
Home/About/Articles regression was found. Contact boundary contrast increased
from roughly 2.13:1 against the field to 3.59:1 (4.56:1 against its section).
Automated axe could not fully resolve decorative backgrounds, so a separate
computed-color check covered grid intersections and the featured gradient:
371 text nodes, zero failures, minimum 5.13:1. It found and fixed dark-section
focus rings (2.37:1 -> 10.54:1) and article-filter borders (2.07:1 -> 5.19:1
against the darkest grid; 6.07:1 against the white field). The existing settled
contact focus border is 7.28:1 against its interior. This is bounded QA, not a
complete WCAG certification. See [contrast measurements](evidence/2026-09-11/contrast-summary.json),
[computed final styles](evidence/2026-09-11/after-grid-contrast.json) and
[settled field colors](evidence/2026-09-11/settled-control-colors.json).

Focus-state before/after screenshots for Contact, About and an article are
retained at all three widths as `before/after-{width}-{page}-focus.png`; filter
controls use `before/after-{width}-article-filters.png` in the evidence directory.
[Mobile focus before](evidence/2026-09-11/before-390-contact-focus.png) /
[after](evidence/2026-09-11/after-390-contact-focus.png),
[mobile filters before](evidence/2026-09-11/before-390-article-filters.png) /
[after](evidence/2026-09-11/after-390-article-filters.png).
The full 39-render browser suite passed again after these final changes.

## Existing contact delivery evidence

Reread full messages in the connected mailbox on September 11 before considering
any new test. The prior Formspark notification is in **Inbox**, dated
2026-09-03T00:24:57Z (September 2, 20:24:57 EDT), with submitted business address
as Reply-To and passing SPF/DKIM/DMARC. This verifies the prior notification's
actual delivery; it does not prove an unperformed new production submission.

The separate direct-email test is dated 2026-09-03T02:41:43Z and has only a
**Sent** copy in the inspected account. Receipt at the business mailbox or its
forwarding destination is unconfirmed, not proven failed. Ask the owner to
confirm that existing delivery before authorizing another send. Raw message
bodies, headers, private recipient details and account credentials are not
committed to this repository.

## Remaining limits and deferred gates

1. Confirm existing direct-mail receipt in the actual destination mailbox.
   No new message or form submission was authorized or sent in this release.
2. Public chat needs an approved reachable HTTPS endpoint, retrieval-time
   current-source enforcement and acceptable measured citations, unsupported
   questions, injection, latency and load. It remains disabled and is not
   required for the website release.
3. Static Pages stays available when the private host is down, but authoring,
   export and AI reconciliation pause until SQL, Docker and the local API are
   healthy. The cycle failed closed during the observed host maintenance window.
4. Fully offline browsers, already-open tabs, HTTP/CDN/search caches and
   downloaded copies can retain prior public data. A returning Chrome profile
   cleared its withdrawn page after a forced network refresh.

Offline browsers, old open tabs, HTTP/CDN/search caches and downloaded copies
can retain prior public data. New-release code ignores the old article storage
and has no service worker, but cannot remotely erase old copies. Full page
content still requires JavaScript; the email fallback works without it. A slug
rename removes the old route; automatic redirects are not implemented.

Release and rollback steps are in
[PUBLICATION_OPERATIONS.md](PUBLICATION_OPERATIONS.md): first release rollback
reverts the complete integration merge; later rollback redeploys an explicitly
approved retained artifact after pausing publication. Artifact rollback does not
roll back SQL and may restore withdrawn content, so review the exact snapshot.
