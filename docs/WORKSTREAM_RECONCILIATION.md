# Voyager 1, Voyager 2 and Mac reconciliation

Verified September 11, 2026, starting at 11:01 UTC / 07:01 EDT. The owner has
now requested completion and merge. This authorizes the repository merge;
production publication, credentials, SQL grants, service activation and public
exposure remain separate operations. A merged codebase is not a verified live
publication integration.

## Current work and chosen implementation

| Location | Verified source state | Disposition |
| --- | --- | --- |
| Mac publication candidate | `codex/publication-release-candidate`, starting `de828b68f9d8a00d41cdb0b1c61905524abe6f19` | Keep this publication, website and governance baseline; PR #1 carries the reconciled result |
| Mac Voyager import review | `codex/voyager2-article-ai-review`, `af5cf3376d5918e5846623f8480da485e2a7309f` | Preserve the worktree and review history; independently useful backend changes incorporated |
| Voyager 2 original work | `main`, `417f2e86b3dcf018ba3e09789c8fb454ec2a1979`, with parent `9f9a4ca063ea2bce42b75eac25dfe636206d37ba` | Reconcile the original commit lineage; preserve its dirty documents and running services |
| Voyager 1 business/QA | Four documents reported uncommitted under `D:\Dev\Netherwood-data-partners\netherwood-data-partners\docs` | Completion summary received; actual documents unavailable from this Mac and not yet integrated |
| GitHub / public Pages before merge | `b431beb58dccefb8e092c179a1a8517caa78c484` | Deployment remains unchanged; publication and rollback activation variables are unset |

Voyager 2 was checked read-only this morning: health 200, authoring 404, ten
public articles, singular Azure title unchanged, API/Ollama bound to loopback.
Both publication timers are absent/inactive. Its August 27 API image is still
running; the September 11 image is built but not running. Its local commits and
dirty documents are unchanged since last night.
[Current host provenance](evidence/2026-09-11/morning-voyager2-sync.json).

Voyager 1's recorded hostname resolves to the existing private address, but a
bounded SSH attempt timed out before authentication. No share is mounted and
no transferred document copy was found. No credential, connection setup, share
or firewall was changed. [Access evidence and transfer instructions](evidence/2026-09-11/morning-voyager1-access.md).

## Explicit merge decisions

The two implementations are alternatives, not two jobs to enable together.
Both article ingesters use `sql:article:<ID>` with different eligibility rules
and hashes. An automatic merge could silently add the SQL-only ingester even
if visible merge conflicts were resolved.

| Voyager work | Reconciled result |
| --- | --- |
| Public export contract and sanitizer/plain-text helper | Already incorporated; retain the stricter shared Mac validator |
| Paged SQL export and count comparison | Superseded by the prepared coherent `web.ExportPublishedArticles` read |
| Snapshot approval wrapper, snapshot push to main, refresh-only timer | Superseded by the public-data branch, hosted checks/deployment and one publication cycle |
| SQL-only article knowledge ingestion and database adapters | Superseded by the deployed/current-SQL intersection; do not add a competing writer to normal knowledge ingestion |
| RAG maximum distance 0.35 and config test | Incorporated; an explicit runtime override still wins |
| Ollama timeout/connection-failure coverage and API unavailable response | Incorporated; no model request or API restart required to test or merge |
| Mac import review / bundle provenance | Retained as historical evidence, with this table superseding its unresolved duplicate-design choices |
| Article API/browser cache fallback | Retain the Mac static authority and removal-safe behavior |

The final reconciliation records the Voyager histories after applying these
selected changes and retaining the reviewed Mac tree for superseded paths.
This is an intentional resolution of every changed area, not permission to
run both designs. No imported branch or existing worktree is reset or deleted.
[Original import review](evidence/2026-09-11/voyager2-mac-import-review.md).

## Voyager 1 acceptance summary reconciled

These are reported Voyager 1 findings, not newly inspected Windows evidence:

| Reported finding | Current result / remaining proof |
| --- | --- |
| 13 live sitemap URLs, responsive pages and static availability passed | Mac candidate already verified all ten articles and 39 responsive renders; retain separate evidence ownership |
| Article AI ingestion missing | Implemented and tested in the selected candidate; deployed-version AI currency still requires the approved runtime cycle |
| No interval or sync owner | Prepared 15-minute cycle and release/operator responsibilities are in PUBLICATION_OPERATIONS; production activation remains pending |
| Withdrawal manual and cached content possible | Candidate detects full-set removal and rejects legacy browser caches; controlled live withdrawal remains pending |
| Windows 48/49 tests, EPERM creating a symlink | Fixture split so file filtering/traversal always run; only a Windows account lacking symlink privilege may skip the dedicated symlink test, with an explicit reason |
| Keyboard/search not genuinely tested | Completed on the Mac candidate; not relabeled as a Voyager 1 pass |
| Live schedule, latency, withdrawal and AI citation checks outstanding | Remain production acceptance gates |

The Windows fixture no longer fails before reaching unrelated security
assertions or leaks its temporary directory. Linux/macOS still must create and
reject a real outside-root symlink. A dedicated Windows backend CI job now
checks the supported source there as well; inspect its actual pass/skip count.

The actual `BUSINESS_OPERATING_RUNBOOK.md`, `CLIENT_WORK_TEMPLATES.md`,
`VOYAGER1_ACCEPTANCE_REPORT.md` and `docs/PROJECT_STATE.md` must still be copied
from Voyager 1 with hashes and reviewed. The existing summary cannot replace
their contents, and this task has not invented their commercial policies.

## Validation and production boundary

Local reconciliation checks passed: 60 backend tests with zero skips, strict
TypeScript, lint and 11 publication tests. The PR also runs Linux/Windows
backend checks and the existing Vinext/static build checks. No frontend layout,
content snapshot, route generator or publication workflow activation changed
in this reconciliation.

The public site remains independent. Public chat stays disabled: the 0.35
default improves rejection of weak matches but does not fix the measured
143.8–176.1 second answer latency, current-source retrieval enforcement or
unapproved endpoint. It takes effect only in a later approved backend release.

Next after code merge: reconcile the actual Voyager 1 files, approve/test the
new SQL export and authoring setup, configure the approved publication
credential, run a controlled publication/schedule/withdrawal, and only then
activate the timer. Do not alter SQL, restart APIs or enable jobs just to align
Git revisions. Follow [PUBLICATION_OPERATIONS.md](PUBLICATION_OPERATIONS.md).
