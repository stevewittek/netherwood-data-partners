# Netherwood marketing desk

A private, lightweight tool for company lists, safe campaign preparation and
understanding which outreach produces inquiries. No CRM, scoring or scraping.
The shipped email provider writes local files only.

## Start on Voyager 1

From this repository's root, with Node.js 22.13 or newer:

```powershell
node marketing/setup.mjs
cd marketing
node --experimental-strip-types src/server.ts
```

Or use `pnpm marketing:setup` followed by `pnpm marketing` at repository root.

Open **http://127.0.0.1:4310**. Read the generated `MARKETING_ADMIN_TOKEN` in
`marketing/.env`, paste it into the desk and unlock. The token stays in browser
memory; Lock/reload clears it. Setup preserves any existing .env. Do not share or
commit that file. Stop with Ctrl+C. The process binds only to the local machine.

First run automatically creates the SQLite database at
`marketing/data/marketing.sqlite`; local emails appear in
`marketing/data/outbox`. Nothing is sent to a mail server. Existing SQL Server
databases and the public website are not involved.

## Import your first list

1. Open **Company lists**, create a list and upload
   `marketing/examples/synthetic-companies.csv` for the first trial.
2. Map columns to company fields. The example mappings are suggested automatically.
   Add a source and reference, including the permitted-use/license basis.
3. **Preview import**. Review invalid records, duplicates and suppression.
   Invalid records must be explicitly excluded or corrected before import.
4. **Import previewed rows**. The synthetic file becomes three companies, with
   one duplicate. No campaign is created or sent by importing.
5. Open the list to remove records, archive it or deliberately delete it.
   Suppression and campaign history survive working-list deletion.

A general public business email is optional for a company record, but required
for email eligibility. The app supports manual entry and configurable industry,
town, county, state, ZIP and source filters. NJ geography is not hardcoded.

CSV limits: 1.5 MB in the browser, 2 MB for the API request/parser, 5,000 rows,
60 columns. JSON encoding adds overhead to the request limit. Malformed quoting,
duplicate headers and inconsistent columns reject the entire import. Conflicting
company identifiers are flagged for review. Matching duplicates safely fill
missing fields, never replace a different nonempty email or domain.

## Prepare and approve a campaign

1. Open **Campaigns → Create a campaign**. Select the list, channel and a reusable
   template. Use a working public landing target, for example
   `/#business-systems` or `/#database-services`.
2. **Preview recipients & message** freezes the audience/content. Review the
   excluded addresses and sender footer. To change a frozen campaign, create
   a new draft.
3. **Create local test email** writes a test for the configured owner test address.
   Inspect the .eml or .json file in the private outbox. The .eml opens in an
   email application; its subject is clearly labeled LOCAL ONLY.
4. **Mark ready for approval**. Type **APPROVE** against the displayed count.
5. Type **SEND** to **Simulate campaign send**. This creates local files for the
   eligible snapshot. Current suppression/do-not-contact is checked again.
6. Results show simulated files separately; delivered remains zero. Export the
   campaign CSV for delivery/outcome totals and recipient status.

There is no production provider, SMTP loop or autonomous schedule. A production
send request is rejected. See [provider setup](../docs/EMAIL-PROVIDER-SETUP.md)
for the conditions and adapter work needed before real outreach.

## Suppression and results

Use **Suppression** to add unsubscribe, complaint, hard-bounce, manual or legal
requests. An address remains suppressed across list deletion, restart and
re-import. Imported do-not-contact also persists once its email is known.
Individual reinstatement requires documented permission and typed confirmation;
history remains, and company-specific do-not-contact stays conservative.

Messages contain secure unsubscribe URLs. GET asks for confirmation; POST
suppresses without login. Mail-provider one-click POST is supported. These links
work locally during testing. Reliable public HTTPS hosting is required before
production mail.

Campaign URLs carry UTM fields and an opaque campaign code, never raw recipient
addresses. The private dashboard reports delivered, clicks, inquiries, booked
conversations and customers. Source-only events remain visible separately.
Record verified outcomes with stable references to avoid duplicates; enter daily
traffic totals from approved analytics. No open pixels or browsing dossiers.

The existing public form does not yet forward attribution. Voyager 2 has the
exact [website integration contract](../docs/VOYAGER2-INTEGRATION.md). Preserve the
current Formspark delivery and visible email fallback while adding metadata.

## Validate

At repository root after installing its locked development dependencies:

```powershell
pnpm test:marketing
pnpm typecheck:marketing
pnpm lint
pnpm test
pnpm build:pages
node scripts/check-pages.mjs
```

Marketing unit/integration tests themselves need only Node; no network credentials,
mail accounts or SQL Server. See [architecture](../docs/MARKETING-ARCHITECTURE.md)
for schema, migrations, backups, security, retention and rollback.

See [implementation handoff](../docs/MARKETING-HANDOFF.md) for delivered business
documents, validation results, remaining production prerequisites and next steps.
