# Business readiness

Last reconciled: 2026-09-19 UTC against deployed website source `751a65a` and
Voyager 2's active publication services.

## Ready now

- The public website, About page, inquiry form, email fallback, article index
  and ten article routes are deployed and independent of Voyager availability.
- The site accurately presents a founder-led New Jersey consultancy focused on
  small-business software changes, inherited systems, data migration, practical
  fixes and staff support. SQL Server experience supports that offer.
- The private owner desk and 15-minute publication cycle support draft, preview,
  publish, schedule, withdraw and archive. Website and private article knowledge
  are reconciled by content digest.
- `CLIENT_WORK_TEMPLATES.md` and `CHIROPRACTIC_PILOT.md` provide a scoped path
  from inquiry through a first measured engagement.

## Owner decisions required before ordinary client work

Record decisions in a protected business location, not in the public repository.
The unfilled worksheet in `ops/business/templates/owner-decisions.md` is a safe
starting point.

1. Confirm the service area, working availability and who monitors inquiries.
2. Set a realistic inquiry-response target without publishing an unsupported SLA.
3. Approve qualification criteria and the initial offer/pricing approach.
4. Choose the agreement/signature, invoicing and payment systems and obtain any
   needed legal, tax or insurance advice outside this repository.
5. Choose the private system of record, retention period, secret-transfer method
   and access-removal cadence for client work.
6. Assign content approval, publication escalation, billing and access-closeout
   responsibility. One founder may hold several roles, but each decision must be
   explicit and attributable.

This repository does not establish incorporation, insurance, banking, tax,
accounting, licensing or current client/revenue status. Verify those from their
authoritative records instead of treating an unchecked box here as proof.

## External verification gates

- Confirm that a normal message reaches the destination behind
  `contact@netherwooddatapartners.com`. Formspark receipt is separate evidence.
- Verify Search Console ownership and sitemap indexing.
- Verify whether the business is eligible for and already has a Google Business
  Profile before creating or modifying one.
- Obtain the clinic owner's consent, define one real workflow problem and agree
  access/data boundaries before beginning the proposed pilot.
- Obtain separate written permission before naming a client, publishing a quote,
  using an image or presenting the pilot as a case study.

No email, form submission, account change, outreach, client contact or public
claim is authorized merely by this checklist.

## Private operations kit

`ops/business/templates/` contains unpopulated templates for an inquiry register,
owner decisions and engagement controls. Never place populated records, contact
details, credentials, client data or regulated information in Git.

To prepare a private location outside the repository after selecting an approved
destination:

```sh
pnpm business:prepare -- --destination /approved/private/path
```

The initializer refuses repository destinations and existing files. It creates
directories with owner-only permissions and does not transmit information.
Run `pnpm business:check` to validate the tracked starter kit without writing.

## Recommended execution order

1. Resolve the six owner decisions and verify the direct mailbox.
2. Initialize or designate the protected inquiry/engagement record.
3. Obtain consent and execute one small measured pilot using synthetic data
   wherever possible.
4. Record acceptance and separately request case-study permission.
5. Verify search ownership/profile state and begin measuring qualified inquiries.
6. Revisit analytics, public chat, Query Vault/Tools and broader marketing only
   when real operating evidence supports the additional complexity.
