# Motion Relay preview policy candidate — October 8, 2026

Status: validated website candidate; not merged, deployed or proof of public-preview readiness.
Operator: Netherwood Data Partners, LLC. Audience: United States adults 18+. Owner approved
policy preparation/publication without waiting for counsel; no professional-review claim is made.
The owner will monitor contact@NetherwoodDataPartners.com and wants compact completed-activity
backup included with separate consent. Mailbox receipt is still unverified.

## Source and preserved work

Authoritative remote: https://github.com/stevewittek/netherwood-data-partners.git.
Isolated branch: `codex/motion-relay-preview-policies-2026-10-08`, based on main
`889c8928b491a4cb64307fba029b7f86a9b0b9b2`.
Existing open [PR #22](https://github.com/stevewittek/netherwood-data-partners/pull/22) at
`d8e55c0e6b33b7f3c89ae211253659c446c84798` is preserved in this branch's history. The new PR
supersedes its publication candidate; do not merge both independently. Conflicts were resolved in
favor of current main Home/product/download/setup messaging. No global CSS, shared header/footer,
contact transport, art, signing, database, DNS or production configuration is changed.

The source payload `app/content/motion-relay-policies.json` is byte-identical to Motion Relay's
`website-handoff/motion-relay/policy-content.json`, version 2026-10-08. One small reusable component
renders four pages with the existing site's typography/layout. The privacy index and product's
privacy/support destinations link to actual new routes; both Vinext and static Pages emit them.

Older candidate text's unapproved $100/12-month liability cap, New Jersey venue/law, indemnity,
assured recovery step, unconditional deletion/financial-retention claims and October 3 effective
date were removed. No replacement bespoke legal provisions or mailing address was invented.
Current memory-only readings, planned complete phone-local storage and optional compact backup
have separate descriptions. No current/last workout persistence is claimed to ship.

## New validation

Runtime: Node 22.23.3, locked dependencies and pnpm 11.19.0 (including nested build commands).
No dependencies or lockfile versions changed. Initial static build stopped because backend helper
dependencies had not been installed in the isolated checkout; locked backend installation and the
complete rerun passed. An initial browser probe classified unloaded lazy images as broken; after
waiting for actual image decoding, the complete matrix passed with no broken images.

- `pnpm lint`: pass.
- `pnpm test` (Vinext build): pass; existing Unknown route-classification notice remains.
- `pnpm build:pages`: pass; existing ten-article snapshot/digest unchanged.
- TypeScript `tsc --noEmit`: pass.
- `node --experimental-strip-types scripts/check-pages.mjs`: pass, 34 public routes, metadata,
  canonicals, links/assets, robots, sitemaps and unchanged ten-article content.
- Browser: 24 route/width renders (four policies plus Home/About/Articles/product at 1440/768/390)
  and four policy checks at 320px with 200% text. No overflow, broken images or runtime errors.
- Accessibility: 12 axe WCAG A/AA scans across four policies at three widths; zero violations and
  zero incomplete checks. Keyboard Skip to content focuses each new page's H1. This is bounded
  automated/keyboard evidence, not screen-reader or WCAG certification.
- New policy links return local HTTP 200; external browser requests blocked. No form or account
  request was submitted and no private fitness/account screenshot was captured.
- Policy screenshots were visually reviewed at phone width. Existing shared styling is retained.
- `git diff --check`, payload parity and reviewed added-text credential/path scan: pass.

Evidence: [browser results](evidence/2026-10-08-preview-policies/browser-results.json), with twelve
full-page policy screenshots in the same directory. These are local website evidence only.
Motion Relay mobile/watch/connector builds were not rerun for this documentation/page task.

## Live state and exact remaining publication step

October 8 production HTTPS checks returned **404** for privacy, Terms and deletion. The support
route is also a candidate, not a claimed live page. A branch push and a successful local build do not
publish these routes.

1. Resolve factual retention/provider/backup/support and deletion-recovery gaps against exact deployed
   behavior. Verify mailbox receipt and actual platform compact-backup controls/consent/cleanup.
2. Review the reconciled candidate. The owner's October 8 policy-publication authorization does not
   certify an unverified control or authorize a Motion Relay application merge or store submission.
3. Merge the website candidate through existing review controls. The `Publish website` workflow runs
   on main with the existing `NDP_PUBLICATION_ENABLED == true` gate, imports the immutable approved
   content snapshot and runs its full validation. Do not alter that variable, bypass source/content
   checks or deploy the Motion Relay repository as this site.
4. Confirm successful Pages deployment and `publication.json` website/content commits. Recheck actual
   public HTML, cross-links, mobile layout and app/store policy version at:
   `/privacy/motion-relay/`, `/terms/motion-relay/`, `/privacy/motion-relay/delete/`,
   `/support/motion-relay/`. Report actual status, not an assumed deployment.

Publishing information does not close Android background reliability, account isolation/deletion,
retention validation, artifact provenance or physical Garmin/phone/assistant acceptance gates.
Rollback is the existing reviewed website source/artifact procedure in PUBLICATION_OPERATIONS.md;
no production rollback or publication setting was changed here.

## Prepared mailbox test

To: contact@NetherwoodDataPartners.com
Subject: Motion Relay support receipt test — October 8, 2026

This is a delivery test for Motion Relay support and privacy requests. Please confirm this message
arrived in the monitored business mailbox. No customer or workout data is included.

A specific send-authorization question was presented. Do not send without the answer. Sending only
proves transmission; the owner must confirm receipt in the monitored destination. Keep private
message identifiers, full headers and mailbox credentials out of GitHub evidence.
