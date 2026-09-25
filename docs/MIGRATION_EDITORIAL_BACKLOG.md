# Migration and modernization editorial backlog

Created September 25, 2026. Preserve the published SQL Server field notes and
their current URLs. These are proposed articles, not completed engagements or
published articles. Draft and publish through the existing private articles desk
and SQL-owned publication pipeline; do not add content directly to the snapshot.

Editorial rule: explain a recognizable business problem, show the technical work
that resolves it and offer a practical next step. Use clearly labeled hypothetical
examples. No invented clients, platform expertise, results, product partnerships,
universal retention periods or guaranteed migrations. Recheck current vendor
documentation for product-specific details. Retention requirements come from
the business and its appropriate advisers.

## First publication sequence

Publish the vendor-handoff article first, then the purchased-software and CSV
articles. Follow with Access continuity and migration validation. Each should
link to one primary service and the readiness tool where useful.

### P1 · The Software Vendor Handles the New Platform. Who Handles the Old One?

- Intent: business software migration; clarify the missing owner of legacy work.
- Proposed slug: `who-handles-the-old-system`.
- Outline: what an implementation vendor typically defines; questions about source
  extraction and cleanup; a customer/vendor/migration-engineer responsibility
  table; test imports and acceptance; archives and cutover ownership.
- Useful artifact: a vendor-call checklist with “included / excluded / unknown.”
- Evidence: real vendor import documentation; distinguish examples from universal
  platform promises.
- CTA: [Already chose your new software?](/services/business-software-migration/)
  → [Talk about your migration](/migration-intake/).

### P1 · You Bought the New Software. Now How Do You Move 15 Years of Data Into It?

- Intent: SaaS data migration after purchase; historical-record migration.
- Proposed slug: `new-software-old-business-data`.
- Outline: inventory sources; decide scope; understand destination objects; map and
  clean; rehearse; validate; set cutover and fallback; keep accessible history.
- Useful artifact: a one-page migration preparation checklist.
- Evidence: vendor requirements plus a labeled fictional customer/job/invoice
  example, without promising every record can be imported.
- CTA: [Data migration](/services/data-migration/) → [Migration intake](/migration-intake/).

### P1 · The New SaaS Vendor Gave You a CSV Template. Now What?

- Intent: import template help, CSV cleanup and field mapping.
- Proposed slug: `vendor-csv-template-now-what`.
- Outline: identify each field's meaning; preserve identifiers and leading zeros;
  normalize dates and values; resolve duplicates; retain parent/child links;
  test a small supported import; handle rejected rows and reconcile totals.
- Useful artifact: sample source-to-target field map using synthetic records.
- Evidence: official Clio/HubSpot import documentation linked from the research
  note; verify requirements at drafting time without implying partnerships.
- CTA: [Business software migration](/services/business-software-migration/).

### P1 · What Happens When the Person Who Built Your Access Database Retires?

- Intent: inherited Access application, loss of system knowledge.
- Proposed slug: `access-database-author-retired`.
- Outline: preserve access and backups through approved channels; inventory files,
  linked tables, forms, macros and reports; interview staff; document dependencies;
  evaluate stabilization vs a supported replacement; plan handover.
- Useful artifact: questions for capturing the current maintainer's knowledge.
- Evidence: Microsoft Access migration documentation and clearly scoped general
  guidance; no blanket claim that Access is obsolete.
- CTA: [Legacy systems assessment](/services/legacy-systems-assessment/).

### P1 · Seven Things to Validate After a Data Migration

- Intent: data migration validation checklist.
- Proposed slug: `seven-migration-validation-checks`.
- Outline: (1) scoped record counts, (2) key business totals, (3) relationships,
  (4) field values and transformations, (5) documents and access, (6) exceptions
  and duplicates, (7) representative staff workflows and acceptance.
- Useful artifact: a checklist with source value, destination value, explanation
  and owner signoff columns.
- Evidence: synthetic examples and destination-specific constraints; financial
  reconciliations are checks agreed with the business, not audit certification.
- CTA: [Data migration](/services/data-migration/).

### P1 · Why Record Counts Aren't Enough to Prove a Migration Worked

- Intent: migration reconciliation; database migration quality.
- Proposed slug: `migration-record-counts-not-enough`.
- Outline: same count but wrong customers; duplicated and omitted rows cancelling
  out; broken relationships; lost date/decimal precision; totals and samples;
  explicit exceptions and business acceptance.
- Useful artifact: a small synthetic before/after dataset showing equal counts
  with incorrect relationships. Explain it for owners before adding SQL detail.
- CTA: [Database engineering](/services/database-engineering/) and
  [Data migration](/services/data-migration/).

### P2 · Why Data Migration Is Usually Harder Than the Software Demo Makes It Look

- Intent: understand migration complexity before selecting software.
- Proposed slug: `data-migration-beyond-the-software-demo`.
- Outline: demonstrations show destination workflows; historical data has
  exceptions; old meanings do not always match new fields; documents and
  integrations matter; ask migration questions before committing.
- Useful artifact: a set of questions to bring to a vendor demo.
- Tone: respect vendors; avoid implying bad faith or universally poor migrations.
- CTA: [Free readiness self-check](/migration-readiness/).

### P2 · Your Spreadsheet May Have Quietly Become a Business Application

- Intent: consolidate spreadsheets, replace critical Excel workflows.
- Proposed slug: `spreadsheet-became-business-application`.
- Outline: identify business rules in formulas and manual steps; find owners,
  dependencies and versions; determine the source of truth; compare cleanup,
  workflow automation and replacement; preserve what staff rely on.
- Useful artifact: spreadsheet dependency and workflow inventory.
- CTA: [Legacy application modernization](/services/legacy-application-modernization/).

### P2 · How to Retire an Old Business Application Without Losing Its History

- Intent: retire legacy software while retaining historical access.
- Proposed slug: `retire-old-application-keep-history`.
- Outline: define required history with the business; prove exports readable;
  document relationships; choose archive access; check dependencies and recovery;
  set acceptance before decommissioning.
- Useful artifact: retirement acceptance checklist, not a destructive how-to.
- CTA: [Legacy systems assessment](/services/legacy-systems-assessment/).

### P2 · What Is Actually Running on That Old Server?

- Intent: replace an old business server; discover dependencies.
- Proposed slug: `what-is-running-on-old-server`.
- Outline: interview staff and providers; inventory authorized applications,
  databases, shared folders, tasks and reports; record backups and owners;
  identify what breaks if the server stops; plan migration and validation.
- Useful artifact: a dependency map with “confirmed / unknown” labels.
- Boundary: authorized customer environment only; no probing public prospects.
- CTA: [Request an assessment](/migration-intake/?intent=assessment).

### P2 · Before You Migrate, Find Out Where Your Business Data Actually Lives

- Intent: data discovery; legacy systems assessment.
- Proposed slug: `where-business-data-lives`.
- Outline: primary application data vs spreadsheets and side processes;
  documents/attachments; exports vs live sources; ownership and identifiers;
  data-location map; avoid missing operational history.
- Useful artifact: source inventory template with owner, purpose, history,
  export method, dependencies and sensitivity.
- CTA: [Legacy systems assessment](/services/legacy-systems-assessment/).

### P2 · Microsoft Access Isn't Bad. Depending on an Undocumented Access Application Is.

- Intent: Access migration vs continued support; informed replacement choice.
- Proposed slug: `access-application-documentation`.
- Outline: what Access can legitimately do; the difference between data and
  application logic; recovery, ownership and maintainability; repair vs migrate
  tables vs replace workflows; decide based on evidence.
- Useful artifact: decision questions for a healthy, maintainable Access system.
- CTA: [Legacy application modernization](/services/legacy-application-modernization/).

### P2 · How Small Businesses Can Move to Better Software Without Starting Over

- Intent: small-business modernization; practical migration planning.
- Proposed slug: `better-software-without-starting-over`.
- Outline: keep useful business knowledge; select fit over feature lists;
  scope historical records; prepare and rehearse; stage the change where
  appropriate; document what remains; automate the next bottleneck.
- Useful artifact: a phase-by-phase owner decision checklist.
- CTA: [Migration readiness tool](/migration-readiness/).

### P2 · Should You Move Everything From the Old System?

- Intent: migration scope; historical-data cleanup.
- Proposed slug: `should-you-migrate-everything`.
- Outline: operational need vs historic reference; destination limitations;
  duplicate and invalid data; business retention instructions; costs and access
  tradeoffs; document exclusions and obtain approval.
- Useful artifact: move / archive / review decision table for synthetic examples.
- CTA: [Data migration](/services/data-migration/).

### P2 · Archive vs Migrate: What Historical Data Should Follow You?

- Intent: archive design vs import of historical records.
- Proposed slug: `archive-versus-migrate-business-history`.
- Outline: distinguish read-only reference from live operational history; make
  archives searchable and understandable; preserve relationships and provenance;
  access and recovery requirements; test retrieval after retirement.
- Useful artifact: archive acceptance checklist including who can retrieve what.
- Distinction from the previous topic: focus on how the retained archive works,
  rather than the initial scope decision. No universal retention-period advice.
- CTA: [Business software migration](/services/business-software-migration/).

## Publication acceptance

- Owner/editor review confirms claims, examples and practical scope.
- Product instructions cite current primary sources and state material limits.
- Each draft has a unique title, summary, description, canonical slug and one
  primary conversion path; do not force a keyword into every heading.
- Existing SQL notes remain linked and useful; cross-link only when the article
  actually helps the reader.
- Publish through the existing workflow; verify static detail HTML, metadata,
  sitemap membership, mobile layout and preserved article formatting afterward.
