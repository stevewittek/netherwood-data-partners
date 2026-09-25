# Private marketing desk

Implementation date: September 25, 2026. Scope: list management, campaign
approval, local email simulation, suppression and attribution. No CRM, lead
scores, scraping, sales forecasting or autonomous outreach.

## Boundary and runtime

The module under marketing/ follows the repository's Node/TypeScript runtime,
built-in HTTP server and node:test conventions. Node 22.13+ is required;
Node's SQLite API is experimental on some supported versions. Pin a reviewed
Node patch release in deployment. The module introduces no runtime npm
dependencies. It runs as one private loopback process on port 4310.

This is separate from the public Pages bundle and existing Voyager SQL backend.
It does not alter the production SQL schema, website styles, Formspark endpoint,
DNS, firewall or credentials. The SQL backend is unnecessary for local marketing.
This separation avoids a dependency on Voyager 2 availability or website edits.

## Persistence and migrations

MarketingStore opens a single SQLite file, enables foreign keys, WAL and a
5-second busy timeout, and runs idempotent schema creation in a transaction.
schema_migrations records installed module schema versions. CampaignService
adds its campaign/event schema. Do not manually edit a live database.

- companies: general business details, normalized deduplication keys, source,
  timestamps, active and do-not-contact flags.
- lists/list_members: disposable campaign research groups.
- company_sources: every accepted source/import provenance, including duplicates.
- import_history: aggregate audit, no copy of the uploaded CSV.
- suppression: normalized case-insensitive email, reason, source, dates, active
  state and reinstatement evidence. Independent of lists/companies.
- suppression_audit: durable suppression and individual reinstatement trail.
- Campaign, recipient, send, token and attribution tables retain the minimum
  history needed to prove what was approved/simulated and apply opt-outs.

Unique partial indexes cover nonempty domain, email and company/location keys;
list membership is unique and segment fields are indexed. Matching identifiers
that point to different existing companies are rejected for human review.
The importer does not overwrite an existing company's data with another list's
conflicting details. It records provenance and links that company to the list.

## Import behavior

CSV has a 2 MB limit, 5,000 records, 60 columns and 8,000 characters per raw
field. UTF-8 BOM, quoted commas/newlines and doubled quotes are supported.
Unclosed quotes, duplicate/blank headers and inconsistent column counts reject
the entire file. Map destination field to a source header. Company name and
source provenance are required; no individual contact name is collected.

The preview normalizes addresses, URL/domain, US state, ZIP and obvious duplicates.
Invalid records require explicit exclusion before import. The import recomputes
the preview inside a transaction, so a stale browser preview cannot bypass current
suppression or leave partial rows. CSV exports neutralize spreadsheet formulas.

Deleting a working list removes unused companies and their list provenance;
other lists remain intact. Suppression, audit and campaign snapshots survive.
Archive keeps the list visible but blocks new imports and campaign selection.

## Approval and compliance

Each campaign is deliberately previewed, test-written to the local outbox,
marked ready and approved against an exact recipient count before simulation.
Campaign recipient/message configuration becomes a frozen snapshot. Current
suppression is checked again before each delivery attempt. A list upload cannot
trigger a send.

The shipped provider cannot deliver mail across the network. Local outbox files
and simulated counts are explicitly distinguished from real delivered mail.
Production sending is blocked. Read EMAIL-PROVIDER-SETUP.md before developing a
provider adapter; available SMTP credentials are not authority for bulk outreach.

Unsubscribe tokens are opaque, high entropy and stored as hashes. GET displays
a confirmation to avoid email scanners silently suppressing recipients; a
simple POST completes suppression, without login/reason. RFC 8058 POST is
supported. There is no bulk suppression reset. An individual reinstatement
requires documented evidence and retains history. Existing company do-not-contact
remains conservative after reinstatement.

## Security and operations

All private data/actions require server-side bearer authentication. The browser
keeps the operator token in memory only. The process binds to 127.0.0.1, validates
Host and browser Origin, limits request size/rate and rejects unintended
cross-origin requests. JSON/custom-header mutations avoid cookie-based CSRF.
A separate secret authenticates server-to-server conversion events. No browser
receives an integration credential. Public unsubscribe/click endpoints carry
only opaque capability tokens, with no-referrer/no-store protections.

The SQLite database and local outbox contain prospect addresses and capability
URLs. They belong on a private local disk with restricted OS permissions, outside
OneDrive/shared storage and public web roots. The application is not a multi-user
identity system; authenticated operator actions share one owner identity.
Windows filesystem protections inherit the directory ACL: review access before
using real data. Never place tokens in screenshots, logs or committed files.

Stop the application before copying the database for a simple consistent backup,
or use SQLite's online backup tooling. A cold backup must include the database
after clean shutdown; do not copy only the main file while WAL writes are active.
Restore into a separate private location and verify suppression before outreach.
Keep recovery backups encrypted and access-controlled.

Retention is an owner decision. Delete unused working lists. Retain suppression
and evidence while outreach remains possible; deleting them defeats opt-outs.
Review campaign/outbox retention periodically and remove unnecessary artifacts
using an approved retention procedure. No automatic suppression purge is shipped.

## Rollback and remaining deployment work

Stop the local process to disable the desk. Revert the feature commits to remove
code; preserve marketing/data and backups so suppression/audit survive rollback.
No production service or public website deployment is part of this implementation.

For real outreach, choose a provider whose policy permits the actual list sources,
verify sender and business address, deploy reliable HTTPS unsubscribe handling,
test signed provider events and durable delivery retry/reconciliation, and complete
the Voyager 2 website integration contract. Keep the public contact path independent.
