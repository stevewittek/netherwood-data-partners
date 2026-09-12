# Business operating runbook

Last reviewed: 2026-09-11 UTC on Voyager 1.

## Purpose and boundaries

This runbook covers article operations and the path from a website inquiry to
client closeout. It records what exists today and flags owner decisions.

- Voyager 2 owns the private API, SQL Server, article data, and AI knowledge
  store. Voyager 1 is for development, review, and acceptance.
- GitHub main, the Pages workflow, and generated static artifacts are the
  outage-safe public source. Never create a competing production database or
  copy production credentials to Voyager 1.
- Use local or expressly designated staging fixtures for mutations. Never
  publish a test article, submit the public contact path, send email, contact a
  prospect, or update an external tracker during acceptance.
- Use existing tools first. This runbook approves no paid service or CRM.

## Current systems of record

| Area | Existing record | Boundary or gap |
| --- | --- | --- |
| Public website/outage copy | GitHub main, pages-site/articles-snapshot.json, pages-dist, and Pages history | A push to main deploys automatically; there is no release gate. |
| Drafts/publication state | Voyager 2 NDP_Web through the private desk and fixed procedures | Authoring credentials and a public Voyager URL were not configured in the last verified state. |
| Public article API | Voyager 2 published/due procedures | Optional; the deployed site currently uses its static snapshot. |
| AI knowledge | Voyager 2 knowledge tables populated from company-knowledge/public and approved structured records | Published-article export exists, but knowledge:ingest does not consume it. |
| Inquiry transport | mailto:contact@netherwooddatapartners.com | Observed intake channel, not a declared lifecycle system of record. |
| Sales, agreements, delivery, acceptance, invoicing, access | No repository-backed system found | **OWNER DECISION REQUIRED:** designate existing tools and retention/access rules before live client use. |

Roles identify accountability gates, not staffing policy. One person may hold
several roles, but approval, execution, and verification remain separate acts.

## Article operating process

| Stage | Owner role | Input | Output | Completion condition | Existing system of record |
| --- | --- | --- | --- | --- | --- |
| Idea | Content owner | Reader question, service theme, correction, or technical issue | Idea with audience, purpose, evidence, sensitivity | Accepted for drafting or declined | **Missing:** backlog and owner |
| Drafting | Article author | Accepted idea and sources | Title, slug, summary, sanitized HTML, category, tags, author, image details, SEO, optional UTC time | Fields complete; claims sourced; no secrets/client identifiers; private preview renders | Voyager 2 web.ArticleDrafts via /admin/articles |
| Factual review | Factual reviewer | Draft, sources, dates, examples, claims | Review notes and corrected draft | Every material claim is supported, qualified, or removed | **Missing:** review record, identity, timestamp |
| Approval | Business/content approver | Reviewed final draft and preview | Explicit approval for an identified revision | Approver, revision/hash, UTC time, and schedule restriction recorded | **Missing:** approval record and approver list; status is not approval |
| Publishing | Authorized Voyager 2 publisher | Approved revision/time | Published or future-dated row | API returns it only when Published and due; draft save leaves current live content unchanged | Voyager 2 web.BlogPosts and publish procedure |
| Static export/deployment | Publisher/release owner | Approved published/due set | Snapshot, native pages, sitemaps, Pages release | Export/diff/build/CI pass; approved commit reaches main; deploy succeeds | Git and GitHub Actions/Pages |
| Website verification | Independent verifier | URL, approved content, expected metadata, timestamps | Evidence or defect | Fresh desktop/mobile listing/direct URL correct; sitemap contains URL; backend-independent read succeeds | Public URLs/Actions; **missing:** durable verification log |
| AI refresh | Voyager 2 AI curator | Approved public set | Re-indexed chunks and citations | Current article is retrievable/cited; withdrawn version hidden | Voyager 2 knowledge store; **blocked:** article export is not ingested |
| Correction | Author, reviewer, approver | Defect and current article | Corrected approved revision and refreshed copies | Correct content is on canonical URL/sitemaps/AI; obsolete claim absent after cache windows | Same records as drafting through AI; **missing:** correction-note policy |
| Withdrawal | Approver and publisher | Slug, reason, effective time, archive decision | Unpublished/archived row, regenerated static artifacts, hidden AI chunks, evidence | Absent from API, listings, generated page, both sitemaps, and AI after cache checks | Voyager 2 state, Git/Pages, knowledge store |

### Publishing checklist

1. Record factual review and approval for the exact revision.
2. Preview through the Voyager 2 sanitizer. Save Draft first and verify a live
   article did not change.
3. Publish now or at the approved UTC time; record operation and first-visible
   API timestamps.
4. On Voyager 2, run the documented one-shot snapshot export. Transfer only the
   sanitized snapshot through the approved Git workflow.
5. Review the diff; run lint and Pages build. Commit/push only after approval.
   A main push is the production release action.
6. Verify listing, direct URL with/without trailing slash, metadata, sitemap,
   desktop/mobile, and a fresh profile.
7. After article AI ingestion is implemented, refresh and verify a question
   whose supported answer must cite the changed article.

**OWNER DECISION REQUIRED:** define maximum intervals for approval to API
visibility and snapshot export to Pages visibility. None is documented today.

### Correction, withdrawal, and caches

- Corrections repeat draft, review, approval, publish, export/deploy, and AI
  refresh. Record what changed; the reader-facing correction policy is pending.
- Unpublish preserves a draft; archive removes public reads. Permanent deletion
  is not normal withdrawal and is guarded to unpublished content.
- With the current static-only deployment, Voyager 2 state does not remove the
  deployed copy. Regenerate snapshot/pages, confirm the slug and both sitemap
  entries are gone, and deploy.
- Observed Pages responses use max-age=600. The optional API documents
  max-age=60 and stale-if-error=86400. Browser local storage can retain a newer
  last-good list/detail during outage until a configured API returns 404, the
  static snapshot supersedes it, or site data is cleared. Search engines and AI
  systems may cache independently.
- Check immediately, after 60 seconds when API-backed, after at least 10 minutes
  for Pages, and in fresh and previously used profiles. Withdrawal is incomplete
  until AI retrieval also stops returning it.

## Inquiry-to-closeout process

| Stage | Owner role | Input | Output | Completion condition | Existing system of record |
| --- | --- | --- | --- | --- | --- |
| Website inquiry | Inquiry coordinator | Voluntary email from site link | Preserved inquiry with time, sender, request, consented details | Receipt recorded/routed without a response promise | Mailbox transport; **missing:** lifecycle record/retention |
| Qualification | Client lead | Inquiry and permitted public context | Proceed/decline/more-information decision | Fit, authority, urgency, conflicts, sensitivity, next action recorded | **Missing:** criteria, owner, location |
| Discovery | Client and technical leads | Qualified inquiry/agenda | Current state, objectives, constraints, stakeholders, risks, access/data needs, open questions | Client confirms problem statement; no credentials in notes | **Missing:** approved notes location/retention |
| Proposal/scope | Engagement lead | Confirmed discovery | Draft scope template | Outcomes, scope, assumptions, dependencies, deliverables, acceptance, changes, owner-review placeholders complete | docs/CLIENT_WORK_TEMPLATES.md; executed location **missing** |
| Agreement | Business owner/client signer | Approved scope plus owner-reviewed commercial/legal terms | Executed agreement/start authority | Authorized parties accept; start/data/access conditions met | **Missing:** signature/legal method and record |
| Onboarding/access | Access owner/delivery lead | Agreement and minimum-access plan | Contacts, access inventory, boundaries, schedule | Least privilege works; owner/expiry for each grant; approved secret channel | **Missing:** inventory/secret tools and review cadence |
| Delivery | Delivery lead | Scope, access, evidence, change authority | Work products, tests, decisions/changes, status | Deliverables complete, quality checked, variances approved | **Missing:** engagement work/change record |
| Client acceptance | Client approver/delivery lead | Deliverables and criteria | Written accept/reject and punch list | Accepted or every rejection has owner/disposition | **Missing:** record and deemed-acceptance policy |
| Invoicing | Billing owner | Agreement, milestone/time evidence, acceptance | Owner-reviewed invoice/instruction | Amount, recipient, tax/payment details, authorization verified | **Missing:** accounting system, terms, owner |
| Follow-up | Client lead | Acceptance/closeout and agreed actions | Requested follow-up or closure | Only agreed follow-up occurs; no cadence assumed | Mail correspondence possible; **missing:** policy/record |
| Closeout/access removal | Access owner/delivery lead | Completion, acceptance, invoice status, inventory | Final record, materials, removed grants, authorized data disposition | Every grant removed/transferred; retention obligations recorded | Closeout template; central record **missing** |

## Owner decisions required

1. Assign people/backups for approval, publishing, client lead, billing, AI
   curation, and access removal.
2. Designate existing records for content review and client lifecycle. Adopt a
   CRM only after a concrete volume/reporting need and owner approval.
3. Approve qualification criteria, response targets, pricing, legal language,
   payment terms, retention, and correction disclosure.
4. Define publication intervals and the snapshot/deploy owner. GitHub-writing
   automation needs separately approved least-privilege credentials.
5. Implement article AI ingestion/withdrawal hiding and define its interval and
   evidence log.
