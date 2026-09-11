# Website and article operations

This is the combined Mac release guide, reconciled with Voyager 2 local commits
`9f9a4ca063ea2bce42b75eac25dfe636206d37ba` and
`417f2e86b3dcf018ba3e09789c8fb454ec2a1979` and its current September 11 status. Voyager 1's completion summary has
arrived, but its actual runbook/templates
and acceptance documents have not been transferred; those details still need
review. See [WORKSTREAM_RECONCILIATION.md](WORKSTREAM_RECONCILIATION.md).
Do not mistake this guide
for an approved commercial policy or a completed production integration.

## Current boundary

SQL on Voyager 2 owns article content and publication state. GitHub Pages owns
public availability. GitHub builds only a validated, complete public export;
visitors never need SQL, Voyager, Docker, Ollama, a tunnel, or home Internet.
Formspark remains the existing independent contact service, with visible
`contact@netherwooddatapartners.com` fallback. No new contact test is authorized.

The owner/editor approves facts and publication; the Voyager 2 operator owns
private authoring/export and backend health; the release operator owns GitHub
runs and website acceptance. These are responsibilities, not claims of staff.
The private authoring desk is currently disabled: admin returned 404 on
September 11, and Voyager 2 reports no author login/user or authoring settings.
The steps below describe the existing supported desk after its separately
approved activation; there is no usable editor sign-in yet. Do not
create a competing database or copy production credentials to Voyager 1/Mac.

## Update and publish an article

1. In the approved private SQL-backed authoring path, open the existing article
   by ID. Change its draft, title, slug, summary, sanitized HTML, category,
   tags, author, image and SEO fields. Keep the current slug unless a changed
   URL is intentional. Review factual claims and the rendered draft.
2. **Save Draft** stages edits without changing the currently published row.
   Confirm the public export is unchanged. Save Draft is not Publish.
3. After editorial approval, use **Publish**. An empty publication date uses
   the existing CMS rule; explicitly check it when republishing. A future UTC
   date keeps the article out of public lists, routes and AI until due.
   Confirm the ID, slug, state and UTC publication time in SQL. Do not edit
   private authoring credentials as part of routine publication.
4. The prepared publisher evaluates the *whole* currently due public set every
   **15 minutes**, with up to 30 seconds timer coalescing. It detects content
   edits even when `ModifiedAtUtc` is unchanged, new rows, slug changes,
   scheduled articles becoming due, and unpublish/archive/removal. Zero
   published articles is a valid authoritative empty publication.
5. Expect the next 15-minute check plus export/build/deploy time. GitHub Pages
   was measured returning `Cache-Control: max-age=600`, so allow up to another
   ten minutes for normal CDN/browser refresh. **Operational target: about
   15–30 minutes in healthy conditions, not a guaranteed SLA.** Actions queues,
   outages or failures extend this. A manual approved cycle avoids waiting for
   the next timer, but not build/CDN time.
6. Confirm the GitHub `Publish website` run succeeds, then compare:
   - `https://netherwooddatapartners.com/publication.json`: website source
     commit, content commit, digest, article count and run URL;
   - `articles-snapshot.json`: same digest/count and expected article fields;
   - the article index, the direct article URL, title/metadata, related links,
     and both sitemaps in a fresh browser and a returning browser.
   A successful SQL save, transfer or workflow dispatch alone is not success.
7. For unpublish/archive, check absence from the snapshot, index, related links,
   route output and sitemaps. The former direct route should return the Pages
   404 response and show the unavailable article state. A renamed slug has no
   automatic redirect in this candidate; plan that separately if needed.

## The prepared publication path

`SQL public set -> validated candidate -> content-only Git branch -> hosted
validation/build -> Pages release -> matching deployed article knowledge`

- Contract: `netherwood.public-articles/v1`, `generatedAt`, `articleCount`,
  `contentDigest`, and `articles`. The digest is SHA-256 of the canonical public
  article array, excluding capture time. This matches the captured Voyager 2
  contract. The backend validator is reused by the static build; unknown/private
  fields, unsafe HTML/URLs, drafts, not-yet-due rows, duplicate IDs/slugs, malformed
  metadata and corrupt/truncated artifacts fail closed.
- `backend/sql/publication-export.sql` prepares one bounded, serializable
  public-set read with one UTC eligibility cutoff. It requires a reviewed
  procedure and the exact EXECUTE grant to existing `ndp_web_app`. It has **not
  been applied or SQL-tested on Voyager 2**. It replaces the race-prone paged
  export, without granting direct table reads or creating a login.
- `backend/src/export-articles.ts` retries a complete export three times with
  1/4-second backoff. It writes the candidate atomically only after validation.
  Candidates live under ignored `pages-site/.publication-candidates/`; no
  partial or failed export replaces the prior candidate or website.
- `ops/articles/publication-cycle.sh` uses a host lock so two cycles cannot
  overlap. It never restarts shared services. The Node/GitHub CLI transfer
  requires an already reviewed immutable checkout, Node 22.13+ and `gh`.
- `scripts/publish-article-export.ts` sends **only** the public JSON file to
  `ndp-publication-content`. The branch has no application/workflow code.
  It rejects stale captures and older-than-current captures. A non-forced ref
  update protects concurrent writers. Nothing commits or pushes to `main`.
- A hosted GitHub runner checks out trusted `main`, downloads the content by
  immutable commit, validates it, and generates all public surfaces from it.
  No SQL/AI credential enters GitHub or browser code. No self-hosted runner
  executes untrusted PR code on Voyager.
- Builds skip publication only when both deployed content digest and website
  source commit match. Dispatch/build/deploy failures leave a digest mismatch,
  so subsequent cycles retry even when the SQL rows have not changed.
- Export retries are bounded; GitHub/transfer/build failures retry on the next
  cycle or an operator rerun. GitHub concurrency serializes deployment and
  rollback without cancelling a running deployment. The latest pending run
  may replace an older pending run; source/content are checked again before
  deployment. A superseded run fails safely and the next cycle catches up.
- `website-release` stores the complete built site for **30 days**. Record and
  download releases needed longer. The Pages artifact is uploaded and deployed
  only after checks pass. Export/validation/build failure preserves the last
  successful Pages release. A knowledge failure after dispatch does not tell
  you whether the asynchronous website deployment succeeded: inspect its run.
- Failure evidence: systemd journal stage + safe structured exporter/knowledge
  logs, GitHub failed step and run summary, and deployed `publication.json`.
  Configure the operator's existing GitHub notification preference after owner
  approval; this task has not changed notification settings or sent alerts.

## AI currency and limits

The existing widget and Ollama backend are reused. Public chat and its telemetry
remain disabled in the release workflow regardless of the old Voyager URL
variable. The widget requires a separate enabled flag and an HTTPS endpoint;
that is only a technical guard, not proof the endpoint is approved or usable.

`ingest-publication.ts` reads matching deployed manifest/snapshot files, exports
current SQL, and indexes only exact article versions common to both. It derives
readable content from sanitized HTML. It reconciles only `sql:article:<ID>`
sources, preserving approved company files and other structured SQL knowledge.
Removed or changed sources are hidden **before** embedding work. Embedding
failure does not leave that replaced article version active. Digest mismatch
reports `publication_knowledge_waiting_for_website`; only matching digests with
zero failed articles report `publication_knowledge_current`.

Check the journal for SQL digest, deployed digest, eligible/withheld counts,
indexed/unchanged/hidden/failed counts. Then verify actual answers and citations
against the deployed article. Do not use only an ingestion success message as
an answer-quality check.

**Before chat activation:** obtain the finished Voyager 2 handoff and approved
reachable endpoint; enforce current SQL visibility/version at retrieval time;
measure citations, unsupported questions, source-text injection, timeout and
backend-down behavior plus realistic latency/resource use. Current removal
checks occur during ingestion. A prerequisite outage or SQL change during
embedding can leave stale retrieval until the next successful reconciliation.
That remains a concrete chat activation blocker. Voyager 2 reports ten article
sources indexed with an idempotent second pass, but this is SQL-first ingestion,
not proof of agreement with the deployed website. Its cited answer took 143.8
seconds and source-text injection check took 176.1 seconds. A stricter 0.35
distance threshold returned an unsupported question without citations in 1.54
seconds, after the old threshold produced irrelevant citations. Those are
Voyager 2 handoff measurements, not Mac measurements. Its updated image and
threshold are not running; public response-time expectations remain unapproved.

## Failure response

1. Confirm which stage failed and read `publication.json` before retrying.
   Keep the last successful public website. Do not repoint it to Voyager.
2. Export failure: check SQL health, the reviewed procedure/grant, timeouts,
   complete recordsets and validation error. Never substitute seeds, a draft
   export or an empty file. Fix the cause and rerun a complete export.
3. Transfer failure: check the approved credential scope, branch shape and
   concurrent publisher. Do not force-push or mix other files into the content
   branch. Regenerate a fresh candidate if it is older than five minutes.
4. Build failure: inspect the failed check. Correct content in SQL or code in a
   focused reviewed PR. Do not mark the failed digest as published. The next
   cycle retries from the latest content and source.
5. Deployment failure: inspect the Pages run. The prior deployment normally
   remains active; verify the actual public manifest. Do not assume it changed.
6. Knowledge failure: the website may already be current. Keep chat disabled;
   repair local embeddings/retrieval and rerun reconciliation. Do not roll back
   a good website solely because AI failed.
7. Withdrawal/correction urgency: ordinary publishing cannot revoke previously
   downloaded public content. Pause further automatic cycles if needed,
   correct/unpublish in SQL, run an approved cycle and verify a fresh release.
   Escalate any additional cache/exposure measures separately.

## Rollback

**First release:** its PR includes the previous launch candidate as well as this
integration. Reverting that complete release merge restores the previous
`b431beb` source, tracked article snapshot and original static workflow. Review
that revert and explicitly authorize its production merge/deploy. Reverting
only the export JSON is insufficient if the new importer remains enabled.

**Later retained release:**

1. Stop `ndp-publication.timer` and disable repository variable
   `NDP_PUBLICATION_ENABLED`. Check for a running release and let it finish or
   resolve it before continuing. This prevents a later cycle undoing rollback.
2. Select a *successful* `Publish website` run with a retained `website-release`
   artifact. Review its manifest and contents; rolling back can restore articles
   intentionally withdrawn since that release, so approve the exact content.
3. After approval, set repository `NDP_ROLLBACK_APPROVED=true`, dispatch
   `Roll back website` on `main` with that run ID, and watch completion. It
   downloads the exact prior artifact, with no SQL export or rebuild.
4. Verify public manifest, every affected route, sitemaps, metadata and caches.
   Record the restored digest and run. Disable the rollback gate afterward.
5. Leave automatic publication stopped until SQL and the desired public state
   are reconciled. SQL content rollback is a separate approved editorial/data
   operation; artifact rollback does not change SQL. Reconcile AI against both
   states and keep chat disabled if they differ.

Fully offline browsers, already-open tabs, HTTP caches, downloaded files and
search-engine copies can retain old public content. This candidate no longer
reads legacy article localStorage or a live article API, so loading its new
release cannot resurrect a removed article from those caches. There is no
service worker. Full page content still needs JavaScript; the no-JavaScript
contact email remains available.

## One-time activation checklist (not executed)

- Reconcile the missing Voyager 1 business/runbook handoff and the captured
  Voyager 2 commits. Keep this candidate's deployment-aware cycle; do not
  wholesale apply Voyager 2's old snapshot-to-main publisher or refresh timer.
- Approve whether the exported title "Azure SQL Migration Lesson" is intended.
  If plural is intended, correct SQL through an approved authoring operation and
  supply a fresh validated export. Do not edit only the snapshot.
- Approve private authoring activation if the desk is the chosen editor path.
  Existing `backend/scripts/create-article-author-credentials.sh` and the
  reviewed setup preflight/apply path are described in `ARTICLES_CMS.md`; they
  create credentials/grants and require an API restart. None were run here.
  Preserve the old runtime image and validate its approved replacement before
  restart; no public networking change is needed for private authoring.
- The September 11 owner request authorizes merging the reconciled repository
  through PR #1 while publication remains disabled. Review evidence and resolve
  remaining production gates before deployment/activation.
- On Voyager 2, preserve its dirty main checkout. Prepare a separate reviewed
  release checkout at the approved candidate commit; verify Node/pnpm/gh,
  existing Docker images/config and private runtime identity before changes.
- Approve/apply/test `web.ExportPublishedArticles` and its narrow existing-user
  grant. Do a read-only comparison with SQL and run rollback-only fixtures on an
  isolated database. Build the reviewed backend tools without restarting shared
  services. Keep SQL/API/Ollama networking unchanged.
- Approve an existing or new repository-scoped publication credential with
  Contents read/write and Actions write for dispatch, preserving main branch
  protection. A deploy key alone cannot perform this API dispatch. Use the
  approved OS credential store with `gh` and verify unattended access as the
  service user. Keep the local environment file for non-secret flags and paths;
  never put credentials in Git, unit files, browser code or command output.
  No credential or notification configuration has been created or changed.
- Set local `NDP_PUBLICATION_ENABLED=true` only for the approved initialization.
  Export a fresh candidate with the reviewed tool, then run
  `node --experimental-strip-types scripts/publish-article-export.ts <candidate> --initialize`.
  This creates only the content branch; it requests no deployment and never
  writes main. After initialization use the same command without `--initialize`.
- After the repository merge and remaining release approvals, set **repository**
  `NDP_PUBLICATION_ENABLED=true` only as part of the approved release. The
  workflow otherwise stays disabled,
  including main pushes. Dispatch the reviewed content commit and verify it.
- Place the prepared service/timer under the user's systemd units only after
  approving the actual immutable checkout path and local protected environment
  file. Test one manual cycle before enabling the timer. Do not use the older
  V2 refresh-only timer simultaneously.
- Verify a controlled approved publication end to end: draft unchanged,
  publish/edit (including unchanged timestamp), due schedule, withdrawal,
  fresh/returning browsers, website outage independence and AI state/citations.
  Use a separately approved publication; no test article has been published.
- Confirm direct business-mail receipt from the prior test. Any new production
  form/email smoke test needs explicit authorization. Existing evidence is
  documented in the release verification report.

Repository tooling: Node 22.13+ (local checks used bundled 24.19.0), pnpm
11.19.0, frozen pnpm install and `npm ci --prefix backend`. Run `pnpm lint`,
`pnpm test:publication`, backend tests/typecheck, `pnpm test`, `pnpm build:pages`,
`node scripts/check-pages.mjs`, and `git diff --check`. Browser evidence uses the
bundled Playwright runtime against `scripts/preview-pages.mjs`, which emulates
Pages directory redirects/404 on loopback. External requests are blocked.


## Reviewer reconciliation and evidence

The Voyager 2 source contract and public capture are reused. This candidate
adds a coherent SQL export procedure, a data-only branch (no writes to main),
validated hosted builds and deployed-version knowledge coupling. It intentionally
does not activate or copy the competing `publication-sync.sh`/refresh-only
workflow. The September 11 reconciliation incorporates the improved retrieval threshold
and failure tests while retaining this publication contract. Runtime activation
is still separate from the repository merge.
Voyager 1's existing API-integration reference from the Voyager 2 repository is
available, but it is not the missing Voyager 1 business/QA runbook.

See [PUBLICATION_VERIFICATION.md](PUBLICATION_VERIFICATION.md) for measured
results, exact lineage, contact-delivery evidence and known limits. GitHub's
[artifact documentation](https://docs.github.com/en/actions/tutorials/store-and-share-data)
and [workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
explain the hosted artifact and concurrency mechanisms used here.
