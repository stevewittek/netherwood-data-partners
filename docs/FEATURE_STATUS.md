# What works and what remains unfinished

Reviewed September 19, 2026 against deployed source `751a65a`, Voyager 2's
healthy publication reconciliation, the source tree, production acceptance
evidence and the owner's small-business direction.
Publication completion never meant that every planned capability was delivered.
This is the current feature register; older launch checkboxes are historical.
The request history available here does not establish every request made in
other conversations. Items found only in the roadmap are labeled accordingly.

## Working

| Capability | Evidence and practical limit |
| --- | --- |
| Public Home, About, article index, search/filter and ten article routes | Released Pages site, independent of Voyager availability |
| Inquiry form | Existing Formspark integration and delivery evidence; visible contact@netherwooddatapartners.com fallback |
| SQL article authoring and lifecycle | Authenticated private API active; draft/edit/publish/schedule/unpublish/archive exercised in production acceptance |
| Owner private article publishing desk | Released and tested on actual Mac and Windows browsers; controlled public publish/withdraw/archive and matching SQL/website/AI verified September 12 (desk-final evidence). Private access: OWNER_DESK_ACCESS.md. Browser-based editor in `app/admin/ArticlesAdmin.tsx`; authenticated in-memory credential & private endpoint workflow, server-sanitized preview, UTC scheduling, draft staging/hasUnpublishedChanges indicators, destructive action confirmations, inline re-auth on token expiry, and error recovery preserving unsaved edits |
| Automatic article publication | Complete SQL export, shared routes/metadata/sitemaps, 15-minute cycle; healthy target about 15–30 minutes |
| Release recovery | Last-good artifact retention and controlled rollback verified |
| Article AI knowledge reconciliation | Private job active with matching deployed/SQL versions; this does not make visitor chat available |
| Business runbook and client templates | Voyager 1 documents merged; these are documents, not an automated client-management product |
| Small-business positioning | Deployed Home/About copy now leads with software changes, inherited systems, data migration, practical fixes and staff support; SQL Server remains evidence of technical depth |
| Business-operations starter kit | `docs/BUSINESS_READINESS.md` and `ops/business/` provide a decision checklist, an unpopulated inquiry register and an engagement checklist without creating a CRM or storing client data in Git |

## Unfinished or unavailable to the intended user

| Item | Actual state / evidence | Why it remains open | Concrete completion test and next work |
| --- | --- | --- | --- |
| Visitor-facing AI assistant | Widget/backend implemented, public flag off; `app/ChatWidget.tsx`, `docs/PUBLICATION_OPERATIONS.md` | Public HTTPS route not established; retrieval-time article revocation incomplete; recorded answers took 143.8–176.1 seconds | Implement current-visibility/version checks at retrieval and a bounded response budget, measure helpful/unsupported/withdrawn-source behavior, then provision an explicitly approved public route and test fresh browsers. This is unfinished functionality, not a finished feature that happens to be hidden. |
| Visitor analytics and conversion visibility | Page-view route exists but collection is coupled to the disabled chat widget; no general analytics dashboard | Chat activation currently controls unrelated page-view collection | Separate consent/disclosure and collection from chat; agree useful aggregate measures, connect an approved endpoint, and prove page-view/inquiry events plus retention. Do not promise historical traffic data that was never collected. |
| SQL lead/customer workflow | `/api/leads` and SQL support exist; the live form intentionally uses independent Formspark | No verified live form-to-SQL/CRM workflow or operator dashboard | Define whether a CRM is actually wanted; if so, add a deduplicated, consent-compatible import/workflow while retaining Formspark availability. Backend scaffolding is not a delivered CRM. This is documented backend roadmap work. |
| Public Tools / Query Vault area | No `/tools` or downloadable Query Vault release on the website | Explicitly deferred in `SITE_ARCHITECTURE.md` and `LAUNCH_AUDIT.md` | Review the actual tool/release, support scope and safe access path; publish a useful page and verified artifact. Do not add a fake download. This is a documented earlier roadmap item, not a publication blocker. |
| Final real founder portrait | Current stylized portrait remains the approved temporary image | No selected real replacement in this checkout | Obtain a real chosen portrait, replace it and verify crops/accessibility. Do not synthesize a real client visit. |
| Direct business-email receipt | Correct address/link exists; previous outgoing test found, destination receipt not confirmed | The destination mailbox evidence is missing | Inspect that mailbox or obtain owner confirmation. Formspark notification receipt is separate. This is a verification gap, not proof the mailbox is broken. |
| Optional private Sites mirror | Packaged previously, not refreshed | Separate source destination/export not authorized | Only refresh if the owner wants that extra mirror. It is not a missing capability on the public website. |

## Current business work

- Small-business positioning is deployed. Do not reopen it as a redesign unless
  real inquiry or search evidence identifies a specific problem.
- Chiropractic pilot: a prepared engagement and evidence plan, not an audit
  already performed. Clinic-owner consent, a chosen workflow and real measurements
  are needed before a case study can exist. See CHIROPRACTIC_PILOT.md.
- Local discovery and customer acquisition: a research-backed message and
  measurement plan. Search Console/Business Profile ownership, search volumes,
  paid campaigns and lead performance have not been verified. Do not call them
  configured, proven or earlier user requests without evidence.

## Order of work

1. Confirm direct receipt in the business mailbox; the working Formspark path
   does not prove that separate route.
2. Resolve the owner decisions in `docs/BUSINESS_READINESS.md`, then initialize
   a private business-record location outside Git if one does not already exist.
3. Run the small, consented pilot and produce evidence of one useful result.
4. Verify Search Console/Business Profile state and begin basic lead-source
   measurement only after the owner authorizes the relevant account access.
5. Complete chat engineering and access in an explicitly scoped follow-up, with
   the tests above. Keep it visible in this register until actually delivered.
6. Revisit the Tools/Query Vault release, portrait and optional mirror as
   separate work.

Scheduling these items is a priority proposal, not permission to silently drop
them. No ticket portal, payments, appointment booking or formal partner program
is claimed to have been requested or built on the evidence reviewed here.
