# Motion Relay public privacy and deletion review — 2026-10-03

This is an unpublished website candidate based on `4e3bfbb` from the authoritative
`stevewittek/netherwood-data-partners` remote. The original primary checkout was not changed.
The product route `/products/garmin-ai-connector/` remains stable. Existing product art remains
under `public/images/motion-relay/`; its source repository, branch, commit and original paths are
documented in `MOTION_CONNECT_WEBSITE.md`. No replacement image or personal workout data was added.

Routes prepared for review:

- `/privacy/` — immediately links Android 0.2.0 users to the product notice and deletion page.
- `/privacy/motion-relay/` — product-specific notice.
- `/privacy/motion-relay/delete/` — external support-mediated request entry point.

The public Garmin Connect IQ URL returned HTTP 200 on 2026-10-03 and remains the data-field
listing `48fdea2a-2703-4873-a483-13cae2a9f1ec`. Installation still requires the user to open
the listing and tap Install. The separate Garmin application UUID was not substituted. The exact
Google Play URL uses the permanent Android package
`com.netherwooddatapartners.motionrelay`; it is an intentional pending-publication exception in
`scripts/check-pages.mjs`, not an enabled download. Apple stays disabled without a verified URL.

## Measured privacy evidence

- The running connector reports release `7aa4591ce2fb`; its container source has 90-second live,
  1200-second rolling sample and 1800-second completed-summary defaults. The samples are capped
  at 512 per source. The state is in memory and clears on restart.
- The running connector and tunnel have Docker `json-file` logs limited to three files of 10 MB
  each. This is **size-based rotation, not a number of days**. The app does not log ordinary
  fitness payloads, but account/provider/host network metadata needs a complete operator audit.
- Cloudflare account-level access-log retention has not been verified. This is a **publication
  blocker** for the owner-required exact network-log retention disclosure; no number is guessed.
- The SQL schema has persistent app users, hashed API credentials, membership and feature state,
  invitation redemption, promotion attribution, AI usage, membership audit and optional compact
  completed fitness summaries. Account deletion is not implemented. The proposed email resource
  can receive requests but cannot yet safely complete them for a former user lacking app access.
- The Android manifest source asks for `INTERNET`; the merged release manifest and Garmin SDK
  behavior still require a build/artifact audit. No permission conclusion should be submitted to
  Google Play on source manifest inspection alone.

## Approval gates

Before merge/publication: verify Cloudflare retention and app/proxy logging, complete the
authenticated deletion procedure and former-user recovery proof, rehearse synthetic deletion,
verify all membership/fitness dependencies and exceptions, verify multi-user isolation, inspect the
merged Android release manifest, repeat builds/browser QA on the final approved copy, and obtain
owner/legal-content review.
Publishing a route is not evidence that account deletion is operational. Do not submit Play Console
declarations or upload an Android bundle from this candidate.

## Candidate checks and previews

The Node 22.13.1/pnpm 11.19.0 isolated build passed `pnpm lint`, `pnpm test`
(Vinext build), `pnpm build:pages`, the 32-route `scripts/check-pages.mjs` crawl,
TypeScript `tsc --noEmit`, marketing tests, publication/admin tests, and migration/attribution
tests. The static server returned HTTP 200 for the privacy index, notice, deletion resource,
product and setup routes. Desktop 1440 px and phone 390 px Chromium screenshots show one H1,
no horizontal overflow and no broken images on before/after privacy and product pages plus the
new notice and deletion page. A 768 px after-pass was also captured. These are visual evidence,
not an assistive-technology certification or production deployment.

Screenshots: ignored `outputs/motion-relay-privacy-qa/` in this isolated worktree, including
`before-privacy-1440.png`, `after-privacy-1440.png`, `before-product-390.png`,
`after-product-390.png`, `after-notice-390.png`, and `after-deletion-390.png`.
