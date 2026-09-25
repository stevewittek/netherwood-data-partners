# Google Ads readiness plan

Status: proposal only; no ads launched, account created, billing changed, tracking tags deployed, or budget spent. Prepared September 25, 2026. Founder approval of audience, offer, spend, measurement, and final ads is required before a real launch.

## Start with one offer and local intent

Initial test: migration assessment/data migration help in actual service areas in Union, Somerset, and Middlesex counties. Keep Central New Jersey as an editable campaign region, not a hardcoded application category. Start with Search campaigns and narrow, relevant search intent; expand only when real inquiries justify it. The choices below are a proposed operating plan, not performance forecasts.

| Campaign / utm_campaign | Ad group / utm_content | Example search concepts | Proposed landing page |
| --- | --- | --- | --- |
| `nj_data_migration` | `business_software_migration` | data migration consultant NJ; small business data migration; business software migration; SaaS migration help | `/data-migration` |
| `nj_legacy_modernization` | `legacy_assessment` | legacy software migration; legacy application modernization | `/legacy-systems` |
| `nj_access_migration` | `access_migration` | Microsoft Access migration; Access database consultant NJ | `/access-migration` or a useful relevant section of `/data-migration` |
| `nj_sql_migration` | `sql_server_migration` | SQL Server migration; database migration consultant | `/sql-server-migration` or a useful relevant section of `/data-migration` |
| `nj_database_consulting` | `fractional_dba` | New Jersey database consultant; SQL Server consultant | `/database-services` |

Start with one or two groups the landing pages can support. Do not split tiny budgets across every possible keyword. Initial negative-keyword candidates include jobs, salary, certification, exam, course, tutorial, free download, and unrelated consumer phone/file transfer; review actual search terms before blanket exclusions.

The founder sets the target geography, available call hours, launch date, daily budget, total experiment ceiling, review dates, and pause authority. Confirm Google Ads' current budget behavior before spending; a daily setting is not necessarily a strict daily invoice cap. No CPC, inquiry volume, close rate, or revenue is forecast here.

## UTM and campaign code contract

Use lowercase stable campaign names; create a new `nwd_campaign` record for a materially different campaign or test. Keep recipient/customer identifiers out of URLs.

Example (illustrative campaign code; create a real record before use):

`https://netherwooddatapartners.com/data-migration?utm_source=google&utm_medium=cpc&utm_campaign=nj_data_migration&utm_content=business_software_migration&nwd_campaign=ADS_NJ_MIGRATION_01`

- `utm_source=google`
- `utm_medium=cpc`
- `utm_campaign`: stable campaign taxonomy above
- `utm_content`: ad group/message variation
- `nwd_campaign`: Netherwood campaign code that matches the internal record
- Optional `utm_term`: non-sensitive keyword label only if supported by the shared integration contract; omit when unnecessary.

Google's [auto-tagging](https://support.google.com/google-ads/answer/1752125?hl=en) adds a GCLID for Google attribution. Auto-tagging and Netherwood's UTM/code attribution serve different reporting needs. If auto-tagging is enabled, ensure redirects preserve legitimate click parameters; only persist/send identifiers according to the agreed consent/privacy design. Do not replace a click identifier with an email address or place form contents in analytics URLs.

## Voyager 2 implementation handoff

The existing public website is static Pages with Formspark intake and an optional private backend. Do not expose the internal marketing tool or its secret to browser JavaScript. [VOYAGER2-INTEGRATION.md](VOYAGER2-INTEGRATION.md) is the canonical technical contract.

Before ads can launch:

1. Confirm each final destination URL exists, works on mobile, and presents the relevant service, clear scope, truthful founder experience, real contact method, and privacy information.
2. Read/validate allowlisted attribution parameters. Persist approved first-party attribution only where legally and technically appropriate; apply the contract's retention/overwrite rules. Always allow the contact form to work when storage/tracking is unavailable.
3. Attach attribution source fields to the genuine Formspark/contact intake without adding secrets to public code. Server-to-server delivery to the marketing app uses authenticated `/api/attribution/events` only through an approved backend. A private manual recording workflow remains the fallback; a static browser must not contain the bearer secret.
4. Emit `inquiry_submitted` only after successful inquiry acceptance, not when the submit button is clicked. Deduplicate by a stable inquiry/event identifier. Record `conversation_booked` only when a conversation is actually booked and `customer_created` only when the founder confirms a real customer.
5. Treat `inquiry_submitted` as the initial Google Ads conversion candidate. Confirm the current [conversion setup](https://support.google.com/google-ads/answer/12718882?hl=en), account/linking/consent choices, and event mapping; test in a non-production environment before deployment. Page views and email link clicks are not customers.
6. Keep booked-conversation and customer evidence in the internal record; future offline conversion import is a separate scoped decision. Do not enable enhanced conversions or upload contact details merely because this document mentions Ads.

## Draft ad copy concepts

Use only after founder review and verification against the landing page. These are message concepts, not a live ad asset set or a claim of platform-approved lengths.

- **Migration:** Data Migration Help in NJ / Move Business Data Safely. Description concept: Get help extracting, mapping, testing, and validating data for the business platform you choose.
- **Legacy:** Plan Your System Migration / Understand Your Existing Data. Description concept: Review older applications and databases, identify dependencies, and build a practical migration plan.
- **Database:** Project-Based SQL Server Help / Fractional DBA Services. Description concept: Database health reviews, backup and recovery guidance, performance troubleshooting, and migration readiness.

Do not claim Microsoft partner status, guaranteed zero downtime, unsupported savings, that a specific prospect has an old server, or an unapproved Revival result.

## Launch checklist and useful measurement

- [ ] Final ads, geography, keyword/negative lists, landing pages, budget, and owner approved.
- [ ] Real inquiry delivery and human follow-up ownership confirmed through an approved test plan; do not send unapproved test submissions to the live public form.
- [ ] UTM/code survive navigation and are stored with the accepted inquiry, subject to policy.
- [ ] Conversion fires once on success, not on validation error, refresh, repeated click, or provider failure.
- [ ] Consent denied/storage blocked cases remain functional and do not invent attribution.
- [ ] Internal event receiver authentication, duplicate handling, and manual fallback verified.
- [ ] Claim checks from [CREDIBILITY.md](CREDIBILITY.md) complete.

Review weekly: spend, relevant visits/clicks, inquiries, booked conversations, customers, cost per inquiry, and cost per customer when enough evidence exists. Show zero or unavailable data honestly; do not infer organic/direct attribution from missing UTM values alone. Pause when the landing page/form breaks, conversion counts are unreliable, irrelevant traffic consumes the approved test ceiling, or follow-up capacity is unavailable. Compare messages using observed customers and useful conversations, not engagement scores.
