# Website and article operations

This is the combined Mac release guide, reconciled with Voyager 2 local commits
`9f9a4ca063ea2bce42b75eac25dfe636206d37ba` and
`417f2e86b3dcf018ba3e09789c8fb454ec2a1979`. PR #1 merged the application as
`60110be306340bd8d654a3da071f57a8687b1827` at 2026-09-11T11:11:38Z. Later
documentation-only updates are separate from this application baseline.
Voyager 1's actual runbook, client templates and acceptance report were
transferred and reconciled on September 11. Their dated verification remains
historical; this document is the authoritative practical guide for editing,
publication, website/AI currency, failures and rollback. See
[WORKSTREAM_RECONCILIATION.md](WORKSTREAM_RECONCILIATION.md). Commercial and
client-lifecycle decisions remain subject to the explicit owner gates in
[BUSINESS_OPERATING_RUNBOOK.md](BUSINESS_OPERATING_RUNBOOK.md).

## Current boundary

The production website's stable application baseline is
`16a133f7d82bb807f3c230514f325604bac84190`; later evidence-only main merges
do not change its behavior. Current content is
`b6cbdcb0f5b8eb460096db84d5084f4ae4165770`. Publication run
`34605108714` restored the intended ten-article digest
`ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8`.
Chat is disabled. The reviewed API image is running healthy and loopback-only;
private authoring, SQL export and AI reconciliation are active. Rollback run
`34607709999` passed, the deployment gates were restored, and the persistent
15-minute timer is enabled and active. Its first timer-owned cycle passed at
14:04:34Z. See
[production evidence](evidence/2026-09-11/production-release.json).

SQL on Voyager 2 owns article content and publication state. GitHub Pages owns
public availability. After activation, the prepared workflow builds only a
validated, complete public export. Visitors never need SQL, Voyager, Docker,
Ollama, a tunnel, or home Internet.
Formspark remains the existing independent contact service, with visible
`contact@netherwooddatapartners.com` fallback. No new contact test is authorized.

The owner/editor approves facts and publication; the Voyager 2 operator owns
private authoring/export and backend health; the release operator owns GitHub
runs and website acceptance. These are responsibilities, not claims of staff.
The private authoring desk is configured with separate protected credentials,
procedure-only SQL access and a loopback-only API. Admin requests without the
bearer token return 401. Credentials remain in a mode-600 local environment
file and are never copied to Git, Voyager 1, browser code or logs.

## Business and client operations

Use [CLIENT_WORK_TEMPLATES.md](CLIENT_WORK_TEMPLATES.md) for inquiry response,
discovery, scope, delivery and closeout drafts. Bracketed fields require human
completion. Pricing, response promises, legal terms, client claims and
retention decisions require owner review and must not be inferred from a
website inquiry.

The practical client path is inquiry, qualification, discovery, approved
scope/agreement, least-privilege onboarding, delivery, written acceptance,
owner-reviewed invoicing and access/data closeout. Record an owner and
completion evidence at each gate. Never place credentials or client data in
ordinary email, source control, release logs or public article fixtures. The
website and Formspark are transport paths, not the approved client system of
record; the business owner must still designate lifecycle, billing, retention
and access-removal records.

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
  public-set read with one UTC eligibility cutoff. It was rollback-tested and
  applied on Voyager 2 with the exact EXECUTE grant to existing `ndp_web_app`.
  It replaces the race-prone paged export without granting direct table reads.
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
  Repository notification settings were not changed and no alert, form or email
  was sent during the release.

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

**Before chat activation:** approve a reachable HTTPS endpoint and the reviewed
backend runtime; enforce current SQL visibility/version at retrieval time;
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

**First release:** application merge `60110be` includes the previous launch
candidate as well as this integration. Reverting that complete merge restores the previous
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

## Current activation status

- Voyager 1 business documents are reconciled. Voyager 2's original dirty
  checkout remains preserved; production runs from the clean
  `/home/nasa/netherwood-publication-release` checkout.
- The singular SQL title is approved. The export procedure and narrow runtime
  grant are applied and tested. Private authoring uses separate protected
  credentials; the reviewed API image is healthy and loopback-only.
- The content branch and repository publication gate are active. The full
  draft, publish, edit, schedule, due, unpublish and archive lifecycle passed.
  Both temporary records are archived, absent publicly and hidden from AI.
- The rollback artifact is retained and inspected. Rehearsal `34607709999`
  redeployed the approved artifact, after which the rollback gate was closed and
  publication restored. Repeat the same gated sequence for any future rollback.
- The user timer is enabled and active. Its first timer-triggered no-change cycle
  reported matching deployed/SQL digests and `publication_knowledge_current`.
- Confirm direct business-mail receipt from the prior test separately. Any new
  production form or email test requires separate authorization.
- Keep public chat disabled until HTTPS endpoint, retrieval-time revocation,
  citation, unsupported-question, injection, load and CPU-latency gates pass.

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


## September 12 owner desk operation and recovery

Start with [Private owner publishing desk](OWNER_DESK_ACCESS.md). Its Windows and
Mac launchers connect through existing SSH; no workstation Node installation is
needed for the Voyager-hosted desk. Open a draft or New Article, edit, Preview,
and Save Draft in SQL. Review the preview, then Publish (or set a future UTC date).
Staged edits do not replace the public version until Publish is selected.

Expect the next 15-minute cycle plus build/CDN time, usually 15–30 minutes.
Refresh publication status: require both the website and article AI to report
current, then open the public route and check sitemap membership. For removal,
Unpublish or Archive and wait for the same checks; verify the former route in
both a refreshed existing browser and a fresh browser. Do not treat SQL save as
proof that the public update is complete.

On a failed save, keep the editor open: unsaved text is retained. Reauthenticate
if prompted. On a failed export/build, the last-good website stays available;
inspect the desk status and the latest Publish website workflow and Voyager 2
`ndp-publication.service` journal. Correct the cause and allow the existing timer
to retry. Avoid parallel publisher jobs. Lock only after saving or accepting the
loss of unsaved work. Offline or already-open copies cannot be recalled remotely.

The September 12 controlled lifecycle passed: source c235c73, publish run
34712416208, withdrawal run 34712596957, synthetic record
f7ff5568-0d08-4439-9b32-2e456e9995e8 archived. Final count ten, SQL/deployed/AI
matching. See evidence/2026-09-12/desk-final/production-lifecycle.json.

For website rollback use the gated artifact procedure above. Private API
rollback is separate: the previous image is retained on Voyager 2 as
`ndp-api-rollback:before-desk` (sha256:fa981eabf100883ef675a8424222ac4d882c3525b335f6b48aa51af021654e9e).
Under the existing publication cycle lock, retag it as `backend-api`, then from
`/home/nasa/netherwood-publication-release` run
`docker compose -f backend/compose.yaml up -d --no-deps --no-build api`.
Verify loopback health and publication status afterward. Old API versions may
lack the new status route; the desk must report unavailable rather than current.
No database migration was introduced. The released API image ID is
`sha256:3b3667b90899f17b1e7e8b4e1cd58fffd84efa80b733460ed3f6265737e286fa`.
To roll back only the private desk preview, point its user service at the retained
previous reviewed artifact directory and restart only `ndp-owner-desk.service`.
Do not reset shared dirty checkouts or alter unrelated containers.
