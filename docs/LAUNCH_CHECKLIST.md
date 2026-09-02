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
- [ ] In Formspark, verify the form name, automatic spam protection, free-plan
  limit, and exact notification recipient. Do not expose account credentials.
- [ ] Owner-approve or revise the public claims identified in
  `docs/LAUNCH_AUDIT.md`, especially "more than 15 years" and plural
  professional/team language.
- [ ] Owner-approve the current temporary founder image or supply the exact real
  portrait to use. Treat replacement as a scoped visual task.
- [ ] Choose the production typography outcome: intended Manrope/DM Sans or the
  current system stack. Create a narrow implementation task with screenshots;
  do not combine it with layout cleanup.
- [ ] Choose one Home/About metadata set and approve canonical URLs.
- [ ] Confirm the Friday navigation scope. Tools/Query Vault is explicitly not
  a blocker; do not add a dead Tools link.
- [ ] Confirm the business email works by sending and receiving a normal direct
  email outside Formspark.

## Thursday, September 3 — integrate P1 work and verify the candidate

### Contact and conversion

- [x] Integrate the existing Formspark commit without duplicating its component
  or action endpoint.
- [x] Build and serve the exact release candidate locally.
- [ ] Submit one clearly labeled test inquiry through the candidate form.
- [ ] Confirm Formspark records the inquiry and the intended business inbox
  receives the notification, including sender/reply-to behavior.
- [ ] Confirm required-field, invalid-email, short-message, double-submit,
  success, timeout/error, and reset behavior.
- [ ] Confirm the visible email fallback still works when JavaScript is
  unavailable and when Formspark is unavailable.
- [x] Confirm the contact path works without Voyager, SQL Server, Docker,
  Ollama, a tunnel, or home-hosted services.
- [ ] Review the form privacy sentence and any required disclosure with the
  owner; do not invent legal claims.
- [x] Verify all Home, About, Articles, header, and footer CTAs lead to the
  intended contact path.

### Content and credibility

- [ ] Confirm the hero states the concrete database-engineering offer and the
  primary service areas remain accurate.
- [ ] Confirm every biography, location, experience, service, technology, and
  availability statement is factual and owner-approved.
- [ ] Confirm there are no invented employees, testimonials, logos, clients,
  counts, certifications, awards, years-in-business claims, SLAs, guarantees,
  packages, prices, or response times.
- [ ] Confirm the selected founder image is genuine/approved, correctly cropped,
  optimized, and has accurate alt text.
- [ ] Proofread visible copy as a human reader. Remove generic consulting/AI
  language listed in `docs/BRAND_VOICE.md`.
- [ ] Open all ten published article routes; verify title, author/date,
  formatting, related links, and contact CTA.

### Responsive and accessibility

- [ ] Capture desktop before/after screenshots for every protected visual
  change and compare Home, About, Articles index, one article, and Contact.
- [ ] Repeat at 390px and 768px. Also spot-check 320px if the full navigation
  remains visible there.
- [x] Confirm no horizontal document overflow, clipped text, overlap, broken
  image crop, or off-screen control.
- [ ] Navigate the whole public flow with keyboard only; verify visible focus,
  logical focus order, and usable form errors/status messages.
- [ ] Verify one `h1` per page, logical heading order, real labels, meaningful
  alt text, and no color-only instructions.
- [ ] Check text, control, link, and focus contrast on light and dark surfaces.
- [ ] Enable reduced motion and confirm no required information depends on
  animation.
- [ ] Verify article tables and code blocks remain usable on mobile.

### SEO, links, and build

- [ ] Align Home/About title, description, Open Graph, Twitter, robots, and
  canonical metadata in the static output.
- [x] Confirm every article has a unique title, description, canonical URL,
  Article JSON-LD, publication date, modification date, and author.
- [ ] Verify `public/CNAME`, favicon, `og.png`, and social-image dimensions.
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
