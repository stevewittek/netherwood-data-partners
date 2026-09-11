# Launch audit

## Current finding — 2026-09-11 UTC

No new public-availability P0 was found. The live Pages source is still
`b431beb`; the candidate is on `codex/publication-release-candidate` and has
not been released. The following findings supersede older present-tense
statements below. See [verification](PUBLICATION_VERIFICATION.md).

| Priority | Finding | Current disposition |
| --- | --- | --- |
| P1 | Deployed articles use the old tracked export, not current SQL publication state | Cause verified from deployed commit/workflow/bundles. Candidate provides complete validated export and disabled automation; live procedure/release/e2e remain pending. |
| P1 | Launch candidate including Formspark is not deployed | Existing delivery reread successfully. Keep independent email fallback; direct business-mail receipt still unconfirmed. |
| P1 | Cross-page contact anchor could open above the form after React mounts | Fixed; keyboard activation and responsive contact evidence pass locally. |
| P1 | Contact/article filter boundaries and dark focus rings had insufficient contrast; article lists lost markers | Narrow CSS fixes with before/after captures and responsive review; solid-palette and separate grid/control/focus checks pass after corrections. |
| P1 for chat only | Endpoint/readiness and current-source retrieval are not approved/proven | Chat/telemetry explicitly disabled; website release does not depend on AI. |
| Release gate | Final handoff/SQL tests/editorial approval/controlled publication absent | Do not merge, deploy, activate, or call integration complete yet. |

No broad visual redesign, new business claim, new contact send, SQL mutation,
credential creation, network exposure change or production job activation was
performed. Preserve the prior approved founder image, fonts, factual copy,
Formspark component and navigation.

## Historical September 2 audit

- Audit date: 2026-09-02
- Launch deadline: Friday, 2026-09-04
- Repository baseline: clean `origin/main` at `b431beb` after
  `git pull --ff-only origin main`
- Production: `https://netherwooddatapartners.com`

## Scope and evidence

This audit reviewed the production home, About, Articles, and missing Tools
routes at desktop and 390px mobile; the integration candidate at desktop,
768px, and 390px; current React pages and shared components;
`app/globals.css` and `app/about/about.css`; Vite/GitHub Pages generation;
metadata, sitemap, robots, package scripts, recent Git history, backend
boundaries, and the preserved Formspark branch.

Production currently renders the homepage, About page, Articles index, and ten
native article routes. The homepage and mobile layout had no horizontal page
overflow in the inspected view. Primary navigation and current CTAs resolve to
real pages, home anchors, or the business email. `robots.txt`, `sitemap.xml`,
and `articles-sitemap.xml` are deployed. The public site renders without
Voyager.

Priority definitions:

- **P0:** blocks production availability or leaves no working contact path.
- **P1:** required for a credible Friday launch.
- **P2:** worthwhile launch polish after P1 is stable.
- **P3:** post-launch capability or maintenance work.

## Formspark status

Formspark is integrated into the focused candidate, but has not landed on
`main` and is not in production.

- Preserved source branch and commit: `codex/formspark-contact` at `f982599`
  (`Add Formspark contact form`)
- Candidate branch and cherry-pick: `codex/friday-launch-integration` at
  `9aaf05c`; the commit occurs exactly once in the candidate history.
- No newer Formspark commit or alternate component/endpoint was found.
- Files: `app/components/ContactForm.tsx`, `app/page.tsx`,
  `app/globals.css`, and `docs/PROJECT_STATE.md`
- Behavior: direct static POST to Formspark, JSON enhancement with a 15-second
  timeout, required name/email/message fields, native validation, honeypot,
  sending/success/error states, privacy sentence, and visible email fallback.
- Recorded checks on that branch: root lint, static Pages build and route
  generation, Vinext build, local HTTP render, `git diff --check`, and a tracked
  secret-pattern scan passed under pinned Node 22.13.1/pnpm 11.19.0.
- Candidate visual QA: before/after contact and full-page evidence was captured
  at desktop, 768px, and 390px. The final candidate showed no horizontal
  overflow on Home, About, Articles, or one article route at any width. The CSS
  diff adds contact-specific selectors; `.button-light` was moved without
  changing its declarations. About, Articles, shared navigation, and layout
  source files are unchanged by the Formspark commit.
- Candidate behavior QA: empty required fields and invalid email use native
  browser validation; `message` retains `minLength=20`; the error state and
  email fallback rendered; the source contains an in-flight guard, timeout,
  success state, and reset-on-success. A native POST remains available when
  `fetch` is absent, and the static shell now exposes a `noscript` email path.
- Four test-like requests were found in Formspark's Spam queue: two
  placeholder-only QA attempts and two owner tests whose body contained a
  second, mismatched email address. With owner approval, only the two owner
  tests were marked as non-spam; the QA placeholders remain quarantined. The
  automatic filter remained enabled and no form setting was changed.
- An owner-approved candidate test at 20:24 EDT succeeded with a normal message
  and the automatic filter still enabled. The form displayed success and reset,
  Formspark recorded the submission in Inbox, and its notification reached the
  configured recipient at 20:24:57 EDT with the submitted business address as
  `Reply-To`. The allowance changed from 250 to 247: two recovered submissions
  plus the new accepted test.
- A 2026-09-02 browser QA pass found that the automation surface could bypass
  native `minLength` enforcement. One short placeholder request reached
  Formspark and was rejected into the existing error state. The candidate now
  also enforces the trimmed 20-character minimum inside the enhanced submit
  handler; the same browser path was repeated and stopped locally with a clear
  validation message and no submission. Native HTML validation remains in
  place for the non-JavaScript fallback.
- Still unverified: the final production-domain smoke test after deployment.

Do not recreate the component, action endpoint, or original commit. Continue
from the focused integration branch and preserve the owner confirmation gate
for the final production-domain smoke test.

## P0 — production or contact blockers

No active P0 was found. Production is available and the homepage, About page,
and article CTA retain a working `mailto:contact@netherwooddatapartners.com`
path. Formspark failure therefore does not eliminate contact.

Escalate immediately to P0 if a candidate deployment breaks the homepage,
removes the email fallback, returns an error for `/#contact`, exposes secrets,
or makes static rendering depend on Voyager.

The separate business-email fallback test was sent successfully from
`steven.wittek@gmail.com` to `contact@netherwooddatapartners.com` at 22:41 EDT
on 2026-09-02. The connected Gmail account showed the Sent message but no
inbound copy during the initial delivery check. Receipt in the actual business
mailbox or forwarding destination remains a P1 verification item; Formspark's
successful notification delivery does not prove this route.

## P1 — required for Friday

### P1.1 Land and verify the Formspark contact flow

The integration candidate passed an owner-approved end-to-end test: success and
reset rendered, Formspark Inbox receipt and email delivery were confirmed, the
submitted email became `Reply-To`, the automatic filter remained enabled, and
the allowance impact was recorded. Production still has zero forms; repeat one
owner-approved smoke test only after the exact candidate is deployed.

Files: `app/components/ContactForm.tsx`, `app/page.tsx`, `app/globals.css`.

### P1.2 Resolve the production typography mismatch through a scoped task

Resolved in the launch candidate with the owner's approval. Manrope and DM
Sans are self-hosted under `public/fonts/`, and `app/globals.css` defines the
shared font faces and `--font-display`/`--font-body` variables for both static
Pages and Next/Vinext output. The site makes no font-CDN request.

Files: `app/layout.tsx`, `pages-site/main.tsx`,
`pages-site/about/main.tsx`, `app/globals.css`, `public/fonts/`.

Before/after Home, About, Articles, and article-detail screenshots were saved
at desktop, 768px, and 390px. The built pages reported DM Sans on body text,
Manrope on headings, loaded font faces, no broken images, and no horizontal
overflow. No spacing, type-size, color, navigation, or layout change was mixed
into the task.

### P1.3 Verify every public identity and experience claim

Resolved in the launch candidate. The owner confirmed that Steven began
working in the field in 2009, supporting the "more than 15 years" personal
experience claim. The owner also confirmed that Netherwood is currently a
founder-led, one-person consultancy. The homepage now uses first-person and
founder-led language instead of implying multiple database professionals, and
states that any additional specialty is discussed before it is brought into
an engagement.

Files: `app/about/page.tsx`, `pages-site/about/index.html`, `app/page.tsx`.

### P1.4 Make an explicit founder-image decision

`public/images/steven-wittek.jpg` was introduced by commit `907d3b5` as a
temporary portrait. The owner approved retaining it for the Friday launch and
will prepare a real professional photograph. The launch task does not alter the
image, crop, component, or alt text. Treat the eventual replacement as a
post-launch protected visual task with desktop/mobile verification.

Files: `public/images/steven-wittek.jpg`, `app/components/Portrait.tsx`,
`app/about/about.css`.

### P1.5 Align static metadata for Home and About

Resolved in the launch candidate. Home and About now use factual,
company-focused title and description sets across static Pages and Next
metadata. The static templates include matching Open Graph, Twitter, and
canonical values for `https://netherwooddatapartners.com/` and
`https://netherwooddatapartners.com/about`.

Files: `pages-site/index.html`, `pages-site/about/index.html`,
`app/layout.tsx`, `app/about/page.tsx`,
`scripts/generate-static-pages.mjs`.

The built HTML metadata check passed for both pages; article metadata remains
unchanged.

### P1.6 Complete launch validation on the exact release candidate

Run the root lint, Vinext production build, static Pages build, generated-route
checks, keyboard/form review, 390px/768px/desktop responsive checks, internal
link crawl, and a tracked-file secret scan after all P1 commits are integrated.
Verify the deployed commit after GitHub Pages finishes. Friday is QA and freeze,
not a design session.

## P2 — launch polish

### P2.1 Navigation differs from the preferred information architecture

Current order is About, Services, Articles, Approach, and Start a conversation.
Services, Approach, and Contact are home anchors. There is no visible Home link
and no Tools page. The preferred target is Home, Services, Tools, Articles,
About, Contact, but changing shared navigation is protected. Do not add Tools
until `/tools` contains something useful; production currently renders the
no-index 404 there.

File: `app/components/SiteChrome.tsx`.

### P2.2 Mobile navigation is dense

At 390px the header fits without horizontal overflow, but it presents the N
mark, About, Articles, and the full Start a conversation CTA in one row. Verify
touch targets and 320-390px behavior before deciding whether a focused
navigation task is needed.

Files: `app/components/SiteChrome.tsx`, `app/globals.css`.

### P2.3 Stylesheet ownership has drifted

`app/globals.css` is more than 1,100 lines and contains base, homepage, chat,
articles, and private admin styles. It defines `.chat-widget` twice: the earlier
block applies container width/margin/padding while the later block changes it
to fixed positioning. Broad element selectors (`nav`, `footer`, `h1`-`h3`,
`a`) increase accidental cross-page changes. About styles are separately owned
by `app/about/about.css`, while article/admin styles remain global.

Do not reorganize this before Friday unless a P1 fix cannot be made safely.
Later, separate page/feature ownership and add a visual regression harness.

Files: `app/globals.css`, `app/about/about.css`.

### P2.4 Current gradients conflict with the approved direction

The live body grid, diagnostic grid, portrait fallback grid, and featured
article wash use CSS gradients. They are current production behavior, not an
invitation for broad cleanup. Retire them only through explicit, individually
reviewable visual changes after P1 is complete.

Files: `app/globals.css`, `app/about/about.css`.

### P2.5 Contact treatment is inconsistent across pages

The Formspark branch upgrades only the homepage. About and article detail keep
mailto CTAs. That is functional and preserves resilience, but the wording and
route back to the main form should be reviewed for a consistent conversion
path after the form lands.

Files: `app/about/page.tsx`, `app/articles/Articles.tsx`,
`app/components/SiteChrome.tsx`.

### P2.6 Finish accessibility and privacy review

Visible focus styling, reduced-motion handling, labels, alt text, and mobile
table/code containment exist. The repository has no recorded end-to-end
keyboard/assistive-technology audit and no public privacy page. Before inviting
traffic, review focus order, heading structure, contrast, form errors, touch
targets, and whether the short Formspark privacy statement and any disclosure
are sufficient for the actual business. This is an owner/legal-content decision,
not permission for an agent to invent a policy.

## P3 — post-launch

### P3.1 Create the Tools area and publish Query Vault when ready

There is no `/tools` route or tooling download today. Build a useful index and
real Query Vault release later; include platform requirements, version,
security/support limits, documentation, checksum or signed release mechanism,
and a contact path. This must not block Friday.

### P3.2 Add deeper service pages and owner-approved packages

The homepage covers the core services and four engagement shapes. Dedicated
service pages, deliverables, qualification criteria, and a-la-carte packages
can follow after the owner confirms real scope and commercial terms.

### P3.3 Establish analytics only with an approved privacy boundary

No general production analytics package is present. Voyager telemetry is
optional and currently unset in the Pages build. If analytics is added, use
first-party, minimal collection with a documented purpose and retention period;
never make it a rendering dependency.

### P3.4 Harden optional Voyager operations before public connection

The static site is correctly independent of Voyager. Keep it that way. The
existing project-state warnings about storage reliability, backups/restores,
load testing, monitoring, knowledge review, and approved HTTPS exposure must be
resolved before setting `VOYAGER_API_URL`. Do not use router port forwarding or
expose SQL Server/Ollama directly.

## Confirmed non-findings

- No broad visual change is required to restore basic production usability.
- No broken primary navigation or CTA target was observed on Home, About, or
  Articles.
- No production dependency on Voyager was observed; the chat widget is absent
  when the URL is unset.
- Articles have a tracked static fallback and ten current native routes.
- No fake customer statistics, testimonials, client logos, certifications,
  awards, SLAs, or guarantees were found in the public pages reviewed.
