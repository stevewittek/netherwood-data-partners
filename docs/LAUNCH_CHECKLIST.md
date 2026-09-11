# Current launch and publication checklist

Verified locally on 2026-09-11 UTC for `codex/publication-release-candidate`.
Evidence and limits: [PUBLICATION_VERIFICATION.md](PUBLICATION_VERIFICATION.md).
Operating steps: [PUBLICATION_OPERATIONS.md](PUBLICATION_OPERATIONS.md).
A local pass does not complete production integration.

## Candidate implementation and verification

- [x] Inspect all three worktrees, fetch remote state, preserve existing work,
  choose the launch integration baseline, and use an isolated branch/worktree.
- [x] Determine actual deployed commit, run and build configuration.
- [x] Reuse Formspark and the existing visual system and chat/backend.
- [x] Validate the captured public-only Voyager 2 contract and ten article rows.
- [x] Generate article content, routes, metadata, related links and sitemaps from
  one validated export; accept a legitimate zero-article set.
- [x] Prepare disabled automation with full-set change detection, schedule/removal
  handling, serialization, bounded retries, failed-update reporting and rollback.
- [x] Test corrupt-export last-good preservation and authoritative removal in a
  returning browser with cached former content. Restore the exact source input.
- [x] Render Home/About/index and every article at 1440/768/390; inspect contact
  controls and 320px overflow; capture before/after protected visual fixes.
- [x] Verify keyboard focus/order, cross-page contact activation, search/filter,
  reduced motion, article markers and table/code containment where present.
- [x] Verify titles, descriptions, canonicals, article JSON-LD, sitemap membership,
  robots/admin/404, assets and internal links.
- [x] Verify backend-down and storage-denied behavior, no-JavaScript email fallback,
  and browser-local form success/error/reset without submitting a real inquiry.
- [x] Reread existing delivered Formspark notification and sender/reply-to evidence.
- [x] Run lint, publication tests, backend tests/typecheck, Vinext build, static
  build/artifact checks and workflow/shell validation. Final run logs accompany
  the release verification report.
- [x] Keep public chat and telemetry disabled; document the measured readiness
  gap and ingestion/retrieval limits.
- [x] Resolve automated decorative-background uncertainty with computed grid
  intersection/gradient colors. Text, article controls and dark keyboard focus
  pass after narrow corrections; contact focus is checked after its transition.
  This scoped review does not claim complete WCAG certification.

## Required before production acceptance

- [ ] Reconcile missing Voyager 1 business/runbook handoff and captured Voyager 2
  commits `9f9a4ca`/`417f2e8`; approve the private authoring activation and service
  configuration. The current authoring desk is disabled, not ready for login.
- [ ] Approve the captured singular Azure article title, or correct it in SQL and
  supply a new validated export. Do not silently edit the static copy.
- [ ] Confirm receipt of the existing direct business-email test in its actual
  destination mailbox. Authorize any additional send separately if needed.
- [ ] Review/apply/test the prepared SQL procedure and narrow grant on Voyager 2,
  including isolated schedule/removal/concurrent-update fixtures.
- [ ] Approve the release, repository publication credential and activation plan;
  merge/deploy only after the gates above are satisfied. No activation occurred.
- [ ] Verify the deployed commit and manifest; run a controlled approved draft,
  publish/edit, scheduled publication and withdrawal through SQL to the website,
  including fresh/returning browsers and matching AI publication state.
- [ ] Save the successful release artifact and practice the approved rollback
  procedure. Confirm old content is acceptable before restoring any artifact.
- [ ] Enable the 15-minute production timer only after the controlled cycle passes.
- [ ] For a later chat release, require approved HTTPS endpoint, retrieval-time
  SQL visibility/version enforcement, measured latency/load/citations, unsupported
  questions, injection and backend-down tests. Chat is not needed for site launch.

## Historical September 2–4 checklist

These checkmarks record the earlier run; they are not renewed production approval.

<details>
<summary>Show retained historical checklist</summary>

# Friday launch checklist

Target: Netherwood Data Partners is a credible, professional, lead-generating
database consulting site by Friday, September 4, 2026. Friday is QA, deployment,
and freeze—not redesign.

No item may bypass `AGENTS.md`, `docs/DESIGN_SYSTEM.md`, or the protected visual
change policy. Record the commit, reviewer, evidence, and result for every
completed release check.

## Wednesday, September 2 — establish truth and resolve decisions

- [x] Integrate the governance commit into the candidate so every agent can
  read the source-of-truth files.
- [x] Confirm `main` is clean and current with `origin/main`; list active
  branches before starting integration.
- [x] Preserve the existing Formspark work at `codex/formspark-contact`
  (`f982599`). Do not recreate or overwrite it.
- [x] Decide how to integrate `f982599` into the release candidate (rebase,
  cherry-pick, or merge after confirming no newer Formspark commit exists).
- [x] In Formspark, verify the form name, automatic spam protection, free-plan
  limit, and exact notification recipient. Do not expose account credentials.
- [x] Owner-approve or revise the public claims identified in
  `docs/LAUNCH_AUDIT.md`, especially "more than 15 years" and plural
  professional/team language.
- [x] Owner-approve the current temporary founder image or supply the exact real
  portrait to use. Treat replacement as a scoped visual task.
- [x] Choose the production typography outcome: intended Manrope/DM Sans or the
  current system stack. Create a narrow implementation task with screenshots;
  do not combine it with layout cleanup.
- [x] Choose one Home/About metadata set and approve canonical URLs.
- [ ] Confirm the Friday navigation scope. Tools/Query Vault is explicitly not
  a blocker; do not add a dead Tools link.
- [ ] Confirm the business email works by sending and receiving a normal direct
  email outside Formspark. A labeled message was sent from the connected Gmail
  account to `contact@netherwooddatapartners.com` at 22:41 EDT on 2026-09-02;
  Gmail confirmed the Sent copy, but no delivered copy had appeared in that
  Gmail inbox after the initial check. Confirm receipt in the actual business
  mailbox or forwarding destination before checking this item.

## Thursday, September 3 — integrate P1 work and verify the candidate

### Contact and conversion

- [x] Integrate the existing Formspark commit without duplicating its component
  or action endpoint.
- [x] Build and serve the exact release candidate locally.
- [x] Submit one clearly labeled test inquiry through the candidate form.
- [x] Confirm Formspark records the inquiry and the intended business inbox
  receives the notification, including sender/reply-to behavior.
- [x] Confirm required-field, invalid-email, short-message, double-submit,
  success, timeout/error, and reset behavior.
- [x] Confirm the visible email fallback still works when JavaScript is
  unavailable and when Formspark is unavailable.
- [x] Confirm the contact path works without Voyager, SQL Server, Docker,
  Ollama, a tunnel, or home-hosted services.
- [x] Review the form privacy sentence and any required disclosure with the
  owner; do not invent legal claims.
- [x] Verify all Home, About, Articles, header, and footer CTAs lead to the
  intended contact path.

### Content and credibility

- [x] Confirm the hero states the concrete database-engineering offer and the
  primary service areas remain accurate.
- [x] Confirm every biography, location, experience, service, technology, and
  availability statement is factual and owner-approved.
- [x] Confirm there are no invented employees, testimonials, logos, clients,
  counts, certifications, awards, years-in-business claims, SLAs, guarantees,
  packages, prices, or response times.
- [x] Confirm the selected founder image is genuine/approved, correctly cropped,
  optimized, and has accurate alt text.
- [x] Proofread visible copy as a human reader. Remove generic consulting/AI
  language listed in `docs/BRAND_VOICE.md`.
- [ ] Open all ten published article routes; verify title, author/date,
  formatting, related links, and contact CTA.

### Responsive and accessibility

- [x] Capture desktop before/after screenshots for every protected visual
  change and compare Home, About, Articles index, one article, and Contact.
- [x] Repeat at 390px and 768px. Also spot-check 320px if the full navigation
  remains visible there.
- [x] Confirm no horizontal document overflow, clipped text, overlap, broken
  image crop, or off-screen control.
- [ ] Navigate the whole public flow with keyboard only; verify visible focus,
  logical focus order, and usable form errors/status messages.
- [x] Verify one `h1` per page, logical heading order, real labels, meaningful
  alt text, and no color-only instructions.
- [ ] Check text, control, link, and focus contrast on light and dark surfaces.
- [ ] Enable reduced motion and confirm no required information depends on
  animation.
- [ ] Verify article tables and code blocks remain usable on mobile.

### SEO, links, and build

- [x] Align Home/About title, description, Open Graph, Twitter, robots, and
  canonical metadata in the static output.
- [x] Confirm every article has a unique title, description, canonical URL,
  Article JSON-LD, publication date, modification date, and author.
- [x] Verify `public/CNAME`, favicon, `og.png`, and social-image dimensions.
- [x] Verify generated `robots.txt` allows public pages, disallows `/admin/`,
  and references both sitemaps.
- [x] Verify `sitemap.xml` and `articles-sitemap.xml` contain only canonical,
  successful public routes and all ten articles.
- [x] Crawl internal links in the built `pages-dist`; fix broken navigation,
  anchors, article links, images, and downloads.
- [x] Confirm the Tools nav item remains absent until `/tools` is a useful page.
- [x] Run `pnpm install --frozen-lockfile` with Node 22.13 or newer and pnpm
  11.19.0.
- [x] Run `pnpm lint`.
- [x] Run `pnpm test` (the configured Vinext production build).
- [x] Run `pnpm build:pages` and inspect generated Home, About, Articles,
  article detail, admin, 404, robots, and sitemap artifacts.
- [x] Run `git diff --check` and review the entire release diff.
- [x] Scan tracked changes for secrets, tokens, private email credentials,
  tunnel keys, and `.env` data. A public Formspark action URL is expected; no
  private credential belongs in browser code.
- [x] If analytics is present in the candidate, verify consent/privacy behavior,
  purpose, retention, production delivery, and outage safety. If absent, record
  "not present"; analytics is not a Friday blocker. Result: not present.

## Friday, September 4 — freeze, deploy, and smoke test

### Release gate

- [ ] Freeze content and protected visual files except for an approved P0 fix.
- [ ] Confirm all P0 items are closed and every P1 item has an owner-approved
  result or an explicit no-launch decision.
- [ ] Confirm the release branch is based on current `origin/main` and contains
  no unrelated backend, infrastructure, database, or design changes.
- [ ] Re-run `pnpm lint`, `pnpm test`, `pnpm build:pages`, and
  `git diff --check` on the final commit.
- [ ] Save final desktop and mobile screenshots for Home, About, Articles, one
  article, and the contact form.
- [ ] Review the generated artifacts and commit hash; then merge through the
  normal `main` workflow.

### Deployment

- [ ] Watch both GitHub Actions workflows: CI and Publish website.
- [ ] Confirm the Pages deployment reports the expected final commit.
- [ ] Do not change DNS, router/firewall rules, tunnels, Voyager exposure,
  database credentials, or SQL Server networking as part of the website launch.
- [ ] If deployment fails, stop and roll back/revert the focused release commit;
  do not perform a live redesign.

### Production smoke test

- [ ] Open the canonical HTTPS domain in a fresh/private session.
- [ ] Verify Home, About, Articles, all ten article details, 404, robots, and
  both sitemaps return the expected content.
- [ ] Verify header/footer links and Home anchors: Services, Approach, and
  Contact.
- [ ] Verify production title, descriptions, canonicals, social metadata, and
  no-index behavior for admin/404.
- [ ] Verify the founder image, favicon, social image, and article assets load
  without console or network errors.
- [ ] Repeat the key path at desktop, 768px, and 390px; confirm no horizontal
  overflow or hidden contact control.
- [ ] Submit one final labeled Formspark smoke-test inquiry.
- [ ] Confirm it appears in Formspark and arrives in the intended inbox; then
  record the time and remove/label the test lead as appropriate.
- [ ] Verify the email fallback opens the correct address.
- [ ] Verify the site and contact email remain usable with Voyager unavailable.
- [ ] If analytics was intentionally included, verify one production page view
  without collecting unexpected personal data. Otherwise record "not present."
- [ ] Record launch commit, deployment run, production URL, test results, and
  rollback commit in the release notes.

### Freeze rule

After successful smoke testing, make no design, typography, navigation, or copy
changes on Friday unless a P0 is confirmed. Move P2/P3 work to post-launch
branches.

</details>
