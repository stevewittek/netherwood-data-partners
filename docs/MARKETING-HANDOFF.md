# Voyager 1 marketing handoff

September 25, 2026. Feature branch: `feat/voyager1-marketing`, based on
`origin/main` at `b54819b`. Work is isolated in the registered
`netherwood-marketing` worktree. No real campaign, ad or call was sent;
no public website deployment, DNS or existing SQL mutation occurred.

## Delivered implementation

1. **Application:** a private Node/TypeScript marketing desk with company lists,
   CSV mapping, manual companies, configurable segments, campaign preparation,
   reusable templates, exact-count approvals, local email simulation and results.
2. **Local start:** follow [marketing/README.md](../marketing/README.md).
   Run setup, start the server and unlock http://127.0.0.1:4310 using the private
   generated .env token.
3. **Database:** new SQLite file with idempotent transactional migrations for
   companies, provenance, lists, suppression/audit, campaigns, recipient snapshots,
   sends, hashed tokens, attribution/provider events, traffic and campaign audit.
   Existing SQL Server schema is unchanged.
4. **Import:** upload CSV, map columns, give provenance, preview, resolve or
   explicitly exclude invalid rows, then import. Domain/email/name-location
   duplicates reconcile conservatively. Conflicting nonempty email/domain values
   cannot silently substitute another recipient.
5. **Email configuration:** environment-only configuration and a provider interface.
   Only the local disk provider is installed. Production sends fail closed.
   [EMAIL-PROVIDER-SETUP.md](EMAIL-PROVIDER-SETUP.md) defines adapter requirements.
6. **Test mode:** .eml/.json local outbox, synthetic .example company fixture,
   simulated counts separate from delivered mail, no network email client.
7. **Approval:** Draft → Preview → Test send → Ready → typed APPROVE → typed SEND.
   Content and recipient snapshots are frozen; suppression is rechecked at send.
8. **Suppression:** normalized case-insensitive email with reasons and audit,
   independent from working lists; survives delete/reimport/restart, inherited
   company do-not-contact and newly enriched emails. Reinstatement is individual
   and requires documented evidence. There is no bulk-clear action.
9. **Attribution:** bounded UTM/campaign links, opaque click tokens, no raw email
   URLs, authenticated idempotent conversion ingestion, manual verified outcomes,
   aggregate traffic and visible source-only totals.
10. **Voyager 2 handoff:** [VOYAGER2-INTEGRATION.md](VOYAGER2-INTEGRATION.md) specifies
    fields, persistence proposal, existing-form handoff, exact endpoints, CORS/
    authentication, environment variables, event names and Ads readiness. Public
    website/form integration and reliable public token hosting remain future work.

## Business documents

11. **Launch/legitimacy:** [BUSINESS-LAUNCH.md](BUSINESS-LAUNCH.md),
    [GOOGLE-BUSINESS-PROFILE.md](GOOGLE-BUSINESS-PROFILE.md) and
    [GOOGLE-ADS-PLAN.md](GOOGLE-ADS-PLAN.md). Official sources are linked and
    verification dates recorded. Account registrations, ads and reviews were not
    submitted. The existing operations/readiness kit is preserved.
12. **Revival:** [CASE-STUDY-REVIVAL.md](CASE-STUDY-REVIVAL.md) is an internal draft,
    clearly CLIENT APPROVAL REQUIRED BEFORE PUBLICATION. It distinguishes the
    older proposed pilot from founder-reported assistance, flags Jane/JNAP
    terminology and the material relationship, and invents no result or quotation.
13. **Services and credibility:** [SERVICES.md](SERVICES.md) defines assessment,
    migration project and fractional DBA/health entry points.
    [CREDIBILITY.md](CREDIBILITY.md) distinguishes founder experience from
    Netherwood work. [MICROSOFT-PARTNER-ROADMAP.md](MICROSOFT-PARTNER-ROADMAP.md)
    records current official program information and verification decisions;
    no partner status/badge is claimed.
    [FUTURE-AI-VOICE.md](FUTURE-AI-VOICE.md) is a disabled future design with
    disclosure, consent and suppression controls; no voice service is built.

## Validation

14. **Validation passed:** 39 marketing tests; strict marketing/backend/frontend
    TypeScript; repository-wide lint; Vinext production build; static Pages build;
    all 13 public route checks; 23 publication/admin and 3 pipeline tests.
    Backend: 69 passed, one existing Windows symlink-privilege skip, zero failures.
    Edge browser flow passed at 1440/768/390 pixels with no page errors or document
    overflow: 3 synthetic companies, 1 duplicate, 3 simulations, 0 delivered mail.
    Windows-only build/route-check portability defects were corrected without
    changing public pages. [Detailed evidence](evidence/2026-09-25/marketing/verification.md).
    Local runtime: Node 24.19.0 / pnpm 11.25.0; CI remains Node 22 / pnpm 11.19.0
    and now includes marketing tests. Remote CI/deployment has not been run.

## Remaining prerequisites and next action

15. **Production outreach prerequisites:** choose a reputable provider whose
    acceptable-use policy permits the actual list sources, configure/verify its
    credentials and sender authentication, verify business postal/contact
    information, implement its tested adapter and signed webhook, and deploy
    reliable HTTPS unsubscribe/click handlers behind narrowly allowed routes.
    Complete owner review of list permissions and the first campaign. Production
    activation is deliberately unavailable in this release. Automated scheduling
    and crash-uncertain delivery retries are not enabled; reconcile before retry.
    Client approval is still required for Revival publication. Business formation,
    Google eligibility and Microsoft enrollment decisions remain owner actions.
16. **Exact recommended next step:** run the included synthetic CSV through one
    complete local campaign, inspect the outbox and suppression behavior, then
    choose a provider based on its written permission for Netherwood's intended
    source lists. Give Voyager 2 the integration contract while the sender and
    reliable unsubscribe-hosting decisions are resolved.

## Review and rollback

The feature is committed locally in cohesive changes. Review before publishing;
this repository contains an internal client-approval draft. Do not merge/deploy
as a side effect of the local trial. Roll back by stopping the marketing process
and reverting feature commits; preserve the SQLite database/backups so suppression
history is not lost. Original main/publishing worktree changes remain untouched.
