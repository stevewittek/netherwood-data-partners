# Motion Relay website identity and connection audit — September 29, 2026

## Scope and source of truth

The approved customer-facing name is **Motion Relay**. Netherwood Data Partners remains the publisher and business contact. The website's central product record supplies the name to Home cards, the Products index, the detail page, metadata and structured data. The privacy overview imports that same name. The existing `/products/garmin-ai-connector/` URL and `garmin-ai-connector` technical ID remain unchanged, so no redirect or inbound-link migration is needed.

I compared the website with the owner's private Motion Relay `main` source at `12005995b3248ed11054ea7182b72c863c429cb0`, especially its rebrand, branding, release-readiness, Garmin, Android, connector and hosting guidance. The iPhone companion and private connector exist; Android code builds but physical Garmin parity remains unverified. The website therefore describes an Apple-first private preview, planned Android parity, Garmin setup help, a simple everyday run view and optional assistant connection. Developer simulation stays in team builds. Consumer accounts, subscriptions, additional integrations and all public distribution remain future work. There is no store, download or private repository link.

## Website and Cloudflare boundary

| Surface | Audited state | Action in this PR |
| --- | --- | --- |
| Public site and product URLs | GitHub Pages serves the website and its static product routes. The reviewed website has no Motion Relay API base URL, Cloudflare Worker route or Cloudflare Pages deployment. | Keep static hosting and the existing product path. |
| Cloudflare DNS | The private app's September 28–29 release notes say Cloudflare is authoritative for the Netherwood zone while the apex and `www` still reach GitHub Pages and mail remains with its existing provider. This is documentation evidence, not an account-console check. | No DNS or account change. |
| Motion Relay ingress | A locally managed named tunnel serves the private connector on the legacy `runbridge.netherwooddatapartners.com` origin. The proposed `motionrelay.netherwooddatapartners.com` alias was absent in the latest app release notes. | Do not publish the connector origin as a website link or change its issuer. |
| OAuth and callbacks | The private connector uses its existing origin as issuer and validates exact registered callbacks, including the documented ChatGPT callback. It rejects unrecognized hosts and nonmatching request origins. Installed clients, grants and setup links depend on that origin. | Do not rename the issuer, callback, CORS/origin checks or legacy app schemes from website code. |
| Website API/CORS | `VITE_VOYAGER_API_URL` is empty in the public Pages workflow. The separate Voyager backend's `ALLOWED_ORIGINS` example lists the website and a local development origin; the website's `/callback` helper is unrelated ChatGPT application auth. No website browser route calls the Motion Relay connector. | Leave all of these contracts unchanged. |
| Setup/support/terms | This site has a published company email and a website privacy overview. The private app's draft `/motionrelay/` and `/motionrelay/setup/` links are plans, not live website routes. No product-specific Terms page or public app privacy notice has been verified here. | Explain private-test Garmin setup on the existing detail page; link only the existing business contact and privacy overview. |

The private app uses legacy bundle, Bluetooth restoration, Garmin callback and setup schemes, `RUNBRIDGE_` configuration fallbacks and a legacy response header for installed-client compatibility. The website does not own those identifiers and does not change them. Its active product name is independent of them.

## Owner and account follow-ups

1. If a new Motion Relay hostname is wanted, the owner must approve the Cloudflare DNS/tunnel route and TLS setup, preserve the legacy hostname, and verify the apex, `www` and mail records remain intact. A website copy change does not create this alias.
2. The connector and account owners must plan a compatible issuer migration: host validation, exact origin/CORS rules, OAuth discovery, callback registrations, persisted grants, redirect refusal, phone pairing, setup links and rollback must be tested together. The current legacy hostname remains valid until that migration is accepted.
3. The private app's latest release notes report that the reachable connector health response still used an older PaceRelay service label. Publishing the reviewed Motion Relay connector build and validating physical-device behavior are separate deployment tasks. This website PR does neither.
4. Before public distribution, finish product-specific privacy and Terms decisions, name clearance, supported-device/setup guidance and actual store records. The private app's planned website links must be reconciled with the existing product URL or backed by a separately tested redirect. Do not publish a setup or store link until it works.

## Old-name classification and verification

The customer-facing website source and generated HTML/JavaScript are checked for `RunBridge AI`, `RunBridge`, `One Bridge` and `PaceRelay`. The current public page, Home card, privacy copy, title, Open Graph, Twitter and SoftwareApplication data must show Motion Relay. `One Bridge` was not found in the tracked website source or the pre-change generated artifact; a sighting in another app or cached page needs its own source check.

Dated September 28 audit and acceptance records retain the former working name as historical evidence; they are not published website pages. The old `runbridge` hostname and app identifiers in the private repository remain compatibility names. The website's `garmin-ai-connector` slug/CSS identifier is technical and deliberately stable. No secret values or production credentials were read into this repository, and no Cloudflare account, DNS, Worker, container or deployment state was changed.

## Verification

- Repository lint, frontend and marketing type checks, and the migration, publication, and marketing test suites passed. The Vinext production build and GitHub Pages build passed.
- The static acceptance check passed for all 29 routes, including the unchanged product URL. It verifies the approved name in the product title, social metadata and SoftwareApplication schema and rejects obsolete customer names in generated HTML and JavaScript. A separate scan found no obsolete names in generated HTML, JavaScript, JSON or XML.
- Browser acceptance passed 30 desktop, tablet and phone renders, every no-JavaScript route, keyboard skip navigation, 200% text enlargement, reduced motion, links, assets and the 320px Products navigation. Before and after screenshots of Products, Motion Relay and Privacy at 1440px, 768px and 390px were reviewed; the new MR visual and setup section fit the existing layouts.
- Accessibility passed 45 mobile, desktop and expanded-state scans with zero violations. Representative before/after screenshots are saved under `docs/evidence/2026-09-29/motion-relay/`. Post-push CI status is recorded on the PR. No public connector, store, account or Cloudflare deployment was exercised by this website validation.
