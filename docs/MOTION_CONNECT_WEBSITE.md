# Motion Connect website publication — October 1, 2026 (America/New_York)

The customer page is `/products/garmin-ai-connector/`; the permanent setup route is
`/motionrelay/setup/`. These routes are built into GitHub Pages and the Next/Vinext
application. PR #20 was merged and published through the gated GitHub Pages
workflow on October 1, 2026.
Tracking: [issue #19](https://github.com/stevewittek/netherwood-data-partners/issues/19)
and [merged PR #20](https://github.com/stevewittek/netherwood-data-partners/pull/20).
The existing GitHub Project's item, current October 1 iteration and In Review
status could not be set: the available GitHub token lacks `read:project` and
`project` scopes. This remains a tracking task after a Project-scoped credential
is available; issue #19 stays open.

## Verified naming and availability

The requested watch identity is **Motion Connect**, the screen shown by the
published Garmin Connect IQ data field. Garmin currently lists the field as
**MotionRelay** (version 1.1.0, approved). The separate iPhone and Android
companion sources and store drafts call the phone app **Motion Relay**. The
website explains the naming instead of changing app IDs, packages, or source
repositories. The Garmin listing is a real watch install; it does not install
the phone companion or complete the authorized AI connection.

The only live download is
<https://apps.garmin.com/apps/48fdea2a-2703-4873-a483-13cae2a9f1ec>.
Apple App Store and Google Play listings were unavailable at publication.
Their controls are native disabled buttons, including on those phones. No
unverified store URL is shipped.

The website privacy overview is updated to distinguish the published watch
field from the forthcoming companions and to summarize the live Garmin
disclosure. A complete phone release notice remains a publication gate.

## Asset provenance

All artwork is copied into `public/images/motion-relay/` and resized or
compressed to WebP without changing aspect ratio. The source originals are
retained in their repositories, not duplicated in the website.

| Website asset | Source repository / branch / commit / path | Purpose |
| --- | --- | --- |
| `motion-connect-watch.webp` | `stevewittek/fitness-challenge`, `codex/motion-connect-store-prep`, `4664685fcfa261d5119e6723687c2b6a11751c02`, `branding/garmin-watch/source/app-logo-original.png` | Approved foot and three-stream watch artwork |
| `motion-relay-icon.webp` | `stevewittek/runbridge-ai-ios`, `main`, `1200599`, `branding/assets/winged-stride-signal-1024.png` (identical SHA-256 to `ios-app/RunBridgeAI/Assets.xcassets/AppIcon.appiconset/AppIcon-WingedStride-1024.png`) | Active phone icon master |
| `motion-connect-connecting.webp` | `stevewittek/fitness-challenge`, `codex/motion-connect-store-prep`, `4664685fcfa261d5119e6723687c2b6a11751c02`, `docs/images/garmin-simulator/motion-connect-connecting.png` | Synthetic Garmin simulator state preview |
| `motion-connect-phone-received.webp` | same repository, branch and commit, `docs/images/garmin-simulator/motion-connect-phone-received.png` | Synthetic Garmin simulator state preview; acknowledgement does not establish AI delivery |

The source branch's `branding/garmin-watch/source/watch-master.png` was inspected;
the original app logo is the authentic selected source. All nine
`motion-connect-*.png` simulator files and
`docs/garmin-motion-connect-ui-validation.md` were inspected. The phone
branding README names the Winged Stride Signal as active and its iOS AppIcon
copy has the same SHA-256. No real person's fitness readings are included.

## Copy sources and limits

- The live Garmin listing and `fitness-challenge` branch files
  `docs/motion-connect-store-listing.md`,
  `docs/motion-connect-garmin-publishing.md`, and
  `docs/garmin-motion-connect-ui-validation.md` describe the Connect IQ Data
  Field, activity setup, watch metrics, and simulator evidence. The listing
  itself is authoritative where its title differs from drafts.
- `runbridge-ai-ios` `main` at `1200599` supplied `store/apple-app-store.md`,
  `docs/google-play/listing-draft.md`, `android-app/brand.properties`,
  `branding/README.md`, `docs/privacy.md`, `docs/privacy-model.md`,
  `docs/ios-setup.md`, `docs/android-setup.md`, `docs/android-release.md`,
  and `docs/release-readiness.md`.
- Customer copy makes no universal device, continuous background delivery,
  release date, price, medical, or other provider claim. The website's
  existing `/privacy/` is a provisional overview, not a finished companion
  privacy disclosure; review it against the app before phone publication.

## Enable phone downloads later

1. Obtain the public, customer-facing listing URL for the correct Motion Relay
   iPhone or Android app, and verify it opens the actual app listing on that
   platform. Confirm the release and product privacy/support pages are ready.
2. In `app/content/motion-relay.ts`, set that platform's `url` to the verified
   HTTPS URL and `available` to `true`. Leave the other platform disabled until
   its own listing is public. The renderer uses this configuration without
   device detection, so an unavailable platform never looks downloadable.
3. Run lint, tests, `build:pages`, `scripts/check-pages.mjs`, and browser checks
   at desktop and phone widths. Inspect the built HTML for exactly the new
   store URL and a still-disabled other platform. Submit a new focused PR.

## Validation and production release

Review screenshots: [desktop product](evidence/2026-10-01/motion-connect-1440.webp),
[mobile product](evidence/2026-10-01/motion-connect-390.webp),
[mobile setup](evidence/2026-10-01/setup-390.webp), and
[mobile Home regression](evidence/2026-10-01/home-390.webp).
The browser check rendered Home, Products, Motion Connect, Setup, About and
Articles at 1440, 768 and 390 px with no horizontal overflow, broken images,
or page errors. It also checked the Garmin URL, both disabled phone controls,
keyboard skip link and no-JavaScript content on the two product routes.
Root ESLint, strict frontend TypeScript, the Vinext production build,
`build:pages`, the 30-route static metadata/link/schema/sitemap check, and
`git diff --check` passed with Node 24.19.0 and pnpm 11.19.0. The article
digest remains `ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8`.
PR #20 merged as `119c1dfa0b45340bd78e229d72a6e5ed53022df6`.
[Publish website run 36942172150](https://github.com/stevewittek/netherwood-data-partners/actions/runs/36942172150)
and [main CI run 36942172178](https://github.com/stevewittek/netherwood-data-partners/actions/runs/36942172178)
passed. The live `/publication.json` reported that exact source commit and the
unchanged article digest above. Product, setup, privacy, sitemap and new assets
returned HTTP 200. The live product HTML carried the correct title, Garmin
URL and two disabled phone controls. A second browser pass on the production
domain passed the same 18 renders and keyboard/no-JavaScript checks. No real
inquiry, app release, or connector operation was performed.

The website has no Next Role Command Center,
connector, Voyager, SQL, or AI runtime dependency.
If a regression is found, revert the focused merge and use the existing Pages
rollback workflow if necessary. The product issue remains open for Project
tracking and owner review of its completion criteria.
