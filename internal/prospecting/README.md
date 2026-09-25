# Private prospecting desk

A separate, dependency-free Node 22 application for manual Central New Jersey business research. It is not imported by the public website, does not use Voyager or production SQL, and must never be added to a Pages entry, deployed under `public/`, reverse-proxied, or bound to the network. No real company records are seeded.

## Run locally

Use the repository's supported Node version (22.13 or newer):

```sh
node internal/prospecting/server.mjs
```

Open **http://127.0.0.1:4319** on the same computer. The app deliberately rejects `localhost`, other hosts and other origins. Stop with Ctrl+C. Do not publish a container port or change the bind address. For an existing private SSH workflow, forwarding must preserve this exact local origin; adding remote access or multi-user authentication is a separately reviewed task.

`PROSPECTING_PORT` may choose a different loopback port. `PROSPECTING_DATA_DIR` may choose a dedicated private directory **outside this checkout**. The default is `~/.local/share/netherwood/prospecting/`, containing `leads.json` and a process lock. No credentials or services are needed. The operating-system account is the trust boundary; this is a single-user local application, not a multi-user CRM.

New directories use owner-only permissions and data files use mode 0600. Writes use a temporary file, flush and atomic rename. One writer is allowed; concurrent tabs use revision checks. If the process crashes, confirm it is stopped before manually removing its `writer.lock`. Invalid JSON is never silently reset. Back up the private directory while stopped; it is not encrypted and this phase does not provide automated backup, import or restore UI.

## Workflow

1. Add a business and its publicly listed contact details. Unknown fields stay blank. Union, Somerset and Middlesex county filters are provided, without restricting other locations.
2. Record public observations as **FACT**, interpretations as **INFERENCE**, and potential service fits as **OPPORTUNITY**. Each fact requires public source URLs and a research date. A scoring fact also requires a rationale.
3. Review the evidence and update status to Qualified or High Priority before drafting. Search, county, industry and status filters help review the list.
4. Prepare an editable introduction. It uses the recorded company name and industry, conditional language, and no claim about the company's actual systems. Read and edit it. Free-form drafts remain a human responsibility.
5. Save the exact draft, record the intended public business email, enter the human reviewer's name and explicitly confirm review. Approval records a timestamp and SHA-256 of the company, recipient, subject and text. Editing the draft, recipient, company or research clears approval.
6. Sending is **not implemented**: there are no mail credentials, SMTP/API transport, sending route, crawler or scheduling jobs. Approval records review only. Future sending must recheck suppression and the exact approved digest, require explicit send authority, and record a separate auditable delivery result.

The supported statuses are Unresearched, Researching, Qualified, High Priority, Outreach Drafted, Approved for Outreach, Contacted, Responded, Discovery Scheduled, Opportunity, Customer, Not a Fit, and Do Not Contact. Contacted and later statuses can record historical work performed outside this app; changing them does not send anything.

**Suppression is sticky.** Do Not Contact clears drafts, prevents new drafts and approval, and cannot be undone through routine updates or deletion. Removing suppression requires a future separately reviewed workflow. Records with contact history or current approval cannot be deleted. Uncontacted records can be deleted after a browser confirmation. Export includes suppression records so they are not silently lost; it is a private research archive, not an approved mailing list.

## Evidence and scoring

All requested business/contact, research, clue, project-fit, score, source, date, status, follow-up and suppression fields are present in `model.mjs`. A UUID identifies each company and evidence record. `score_reasons` stores the exact contributing evidence IDs and weights; `score_version` allows future rule changes.

Only a manually selected, sourced **FACT** signal contributes. Duplicate signal types count once and scores cap at 100. Inferences, opportunities, company age, website age and styling contribute nothing. The scores are research-priority indicators, **not probabilities, verified technology inventories or dollar estimates**. “Not established” means no scoring evidence, not evidence that no legacy system exists. Confidence labels indicate how many distinct sourced signals were recorded; they do not certify source accuracy. Human reviewers must check the source's context and recency.

| Directly documented signal | Legacy | Migration | Project value/complexity |
| --- | ---: | ---: | ---: |
| Legacy application reference | 35 | 10 | 0 |
| Product support ending | 65 | 35 | 0 |
| Planned replacement | 0 | 65 | 15 |
| Import/conversion requirement | 0 | 30 | 10 |
| Duplicate entry/manual workflow | 0 | 20 | 10 |
| Data in multiple systems | 0 | 20 | 20 |
| Substantial document migration | 0 | 15 | 25 |
| Multiple operating locations | 0 | 0 | 20 |

A public job posting that mentions SQL Server is evidence of a public technology reference, not proof of an unsupported platform. A fax number or PDF form does not prove manual internal processing. Record such observations as context unless the source explicitly supports a stronger signal.

## Research boundary

The UI includes a checklist for ordinary public company pages, public PDFs/forms, job listings, software references, expansion/acquisition notices and history. References are stored, never fetched. There is no security scanning, authentication bypass, infrastructure enumeration, credential testing, private-record access or automated discovery. URLs must use ordinary HTTP(S) public hostnames without credentials or custom ports; local names and IP literals are rejected. URL validation does not prove a hostname resolves publicly, so it must not be reused as an SSRF defense in a future fetcher. A future collector needs separate destination/DNS/redirect limits and website access-policy review.

## Verification

```sh
node --test internal/prospecting/test/*.test.mjs
```

Tests cover the field model, bounded validation, evidence separation, scoring, qualification, approval invalidation, suppression, deletion, export, atomic persistence, writer locking, stale revisions, loopback binding, Host/Origin/CSRF checks, and unavailable private/sending/research routes. No real company is contacted and no public website is collected.

Optional browser acceptance uses an existing Playwright installation without adding a runtime dependency:

```sh
NDP_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node internal/prospecting/test/browser.mjs
```

It starts a temporary loopback server with synthetic data, checks the editing/scoring/draft/approval/suppression workflow and 1440/768/390-pixel layouts, and cleans up afterward. `PROSPECTING_QA_OUTPUT` can name an ignored directory for screenshots. The September 25 implementation passed 14 Node 22 tests, scoped ESLint, and this Chromium browser check with no console errors or horizontal overflow.

Host/Origin and CSRF checks protect the local browser workflow against cross-site requests and DNS rebinding. Assets have a restrictive content-security policy; text is rendered with DOM text APIs. Only three explicit static assets are served; arbitrary filesystem paths are never served. Data and the internal UI remain outside `pages-site/`, `public/` and public entry imports.

## Next phase

Add a reviewed restore/import path with duplicate-company and suppression reconciliation, stronger event history, backup/retention controls, and a reviewed passive public-source collection adapter. Multi-user access, CRM/email integration, delivery and unsubscribe processing need their own design and explicit authorization. Keep the public site independent of all of them.
