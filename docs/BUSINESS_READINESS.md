# Business readiness

Last reconciled: September 19, 2026 UTC against production source `29357a1`
and Voyager 2's live publication, mail and owner-operations services.

## Ready now

- The professional consulting site, About page, inquiry form, email fallback,
  article index and ten article routes are deployed and independent of Voyager
  2 availability.
- The offer serves local businesses that need software selection, migration,
  slow-system diagnosis, order/workflow cleanup and dependable support, while
  retaining fractional DBA and SQL Server depth for larger environments.
- Direct business-email delivery is proven. The Voyager 2 relay, Database Mail
  and SQL Agent notification path have passed acceptance.
- Search Console ownership and sitemap processing are verified.
- The private owner desk, authenticated API and 15-minute publication cycle
  support controlled draft, preview, publish, schedule, withdraw and archive.
- Protected operating templates are initialized outside Git; the public
  repository contains no client records or credentials.
- Consolidated operations and recovery evidence is maintained in
  `OPERATIONS_READINESS_2026-09-19.md`.

## Owner decisions before ordinary client work

Record these in the protected business location, not this repository. The
private `owner-decisions.md` worksheet on Voyager 2 is intentionally unfilled.

1. Confirm service area, working availability and who monitors inquiries.
2. Set a realistic response target without publishing an unsupported SLA.
3. Approve qualification criteria, initial offer and pricing approach.
4. Choose agreement/signature, invoicing and payment systems; obtain legal,
   tax and insurance advice where appropriate.
5. Choose the client system of record, retention period, secret-transfer
   method and access-removal cadence.
6. Assign content approval, publication escalation, billing and access
   closeout. One founder may hold several roles, but each choice should be
   explicit.

This repository does not establish incorporation, insurance, banking, tax,
accounting, licensing or client/revenue status. Verify those from authoritative
records.

## External gates for the first engagement

- Obtain the client's consent and define one measurable workflow problem.
- Agree data, account, backup and rollback boundaries before access begins.
- Use synthetic or redacted data whenever it can answer the question.
- Obtain separate written permission before naming a client, publishing a
  quote, using an image or presenting results as a case study.

No outreach, client contact, account change, form submission or public claim is
authorized merely by this document.

## Private operations kit

`ops/business/templates/` contains unpopulated templates for inquiry tracking,
owner decisions and engagement controls. Never place populated records,
credentials, client data or regulated information in Git.

To prepare another approved private destination:

```sh
pnpm business:prepare -- --destination /approved/private/path
```

The initializer refuses repository destinations and existing files, creates
owner-only paths and transmits nothing. `pnpm business:check` validates the
tracked starter kit without writing.

## Recommended next business sequence

1. Resolve the six owner decisions.
2. Run one small, consented, measured engagement.
3. Record acceptance and request case-study permission separately.
4. Establish an off-host backup destination and complete the documented
   `NDP_Web` restore exercise with an authorized SQL administrator.
5. Add analytics, public AI, CRM or downloadable tools only when real operating
   evidence justifies the complexity.
