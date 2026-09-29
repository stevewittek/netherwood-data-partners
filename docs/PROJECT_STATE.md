## Motion Relay website identity — September 29, 2026

Motion Relay is the approved customer-facing name for Netherwood Data Partners' Garmin-connected running companion. The existing `/products/garmin-ai-connector/` route, technical product ID and all unrelated services remain stable. The central catalog now supplies the name to cards, detail, metadata, schema and privacy copy. The Apple-first private preview and planned Android parity are described without claiming public installation, subscriptions or finished integrations. The private connector's legacy hostname and OAuth identifiers are compatibility paths, not website links. See [Motion Relay website audit](MOTION_RELAY_WEBSITE_AUDIT.md) for Cloudflare boundaries and owner follow-ups.

## Voyager 1 reconciliation follow-up — September 28, 2026

The final safety fetch detected Voyager 2 main 7d370c3 and the merged PR #17.
Parallel local work was preserved in three commits, then reconciled in a normal
merge f74107b. This branch keeps the published routes and product design. The
follow-up supplies verified PageMover naming/scope, the current QueryVault root
README, shared catalog-driven route acceptance and before/after evidence.
Both machines' histories are retained; the primary and publishing-desk checkouts
are untouched. See PRODUCTS_AUDIT.md and PRODUCTS_VERIFICATION.md.

## Consulting + software products integration — September 28, 2026

The site now presents Netherwood Data Partners as one company with two connected
areas: professional software/data/database services and practical software
products. This work started only after a complete local/remote audit. Voyager 2's
pre-existing `PROJECT_STATE.md` edit and untracked
`VOYAGER2_LAUNCH_STATUS.md` were preserved in commit `7f69a27`. The checkout was
fast-forwarded from `417f2e8` to released `origin/main` at `840cf9a`, and the
newest appropriate unfinished branch, `feat/community-technology-website` at
`b9b5734`, was merged without rewriting its history.

- `/products/` is a first-class landing page backed by
  `app/content/products.ts`. Reusable cards and detail pages conditionally show
  source, documentation and download destinations only when configured.
- Product routes are `/products/queryvault/`,
  `/products/sql-server-index-maintenance-visualizer/` and
  `/products/garmin-ai-connector/`. The neutral Garmin connector slug keeps the
  working RunBridge AI name easy to replace.
- QueryVault is an active public-source project linked to the real
  `stevewittek/Databases` repository and its detailed README. The repository has
  no selected open-source license, so the website does not label it open source
  or advertise a packaged release. The visualizer and RunBridge expose no
  repository, store or download links.
- RunBridge is explicitly in development. Its page contains only a high-level
  development direction, working-name note, general business support route and
  preliminary privacy direction. `/privacy/` explains that a detailed,
  implementation-accurate product disclosure is required before release.
- Home retains consulting first while adding a three-product section. Shared
  desktop/mobile navigation and the footer expose Products; About now explains
  that real-world engineering work informs Netherwood's tools.
- The recent industry/community work is fully integrated. The warehouse hero,
  manufacturing and medical-office generated scenes are served from
  `public/images/community/`; the credited Netherwood station photograph remains
  the community/About anchor. They are illustrative concepts, not product
  screenshots or client work.
- Static generation now emits 29 canonical public routes with unique metadata,
  Open Graph/Twitter tags, product/collection schema, breadcrumbs, sitemap
  entries, robots, 404 behavior and unchanged full bodies for all ten articles.

Verified in the pinned Node 22.13.1 workflow: ESLint, strict frontend,
marketing and backend typechecks; 40 marketing, 23 publication/admin, 3
publication-pipeline, 11 migration/attribution and 70 backend tests; the
business-operations check; the static Pages and Vinext production builds; and
the 29-route metadata/link/schema/sitemap/article-parity audit. Browser
regression rendered all 29 routes at 1440/768/390 with no browser errors,
overflow or broken assets. The final 45-scan automated axe matrix reported zero
violations; this is not a complete assistive-technology certification.

Remaining product work is intentionally honest: choose any public repository or
release path for the visualizer, finalize RunBridge's product name, implementation,
supported-device scope and product-specific privacy notice, then add real
store/download/documentation links. No fake availability, release date, customer,
download, testimonial or pricing claim was added.

## Latest owner direction: industry systems

Use equipment and recognizable work in established manufacturing, distribution
and medical offices, with legacy-to-modern examples and practical AI assistance.
The owner explicitly replaced the staged-people direction. Generated scenes
are illustrative concepts, not actual clients or delivered product screenshots.
Local station imagery and broader software/data/support offerings remain.
See INDUSTRY-IMAGE-PROMPTS.json and COMMUNITY-REDESIGN.md.

# Community website candidate — September 25, 2026 follow-up

The website/marketing release below was subsequently merged as PR #16 at
`840cf9a`; its CI and Pages deployment passed and public routes were verified.
The owner's next request is a warm, photographic local technology business,
representative of Plainfield's mixed community, with broader software/data/support
positioning and a Netherwood station / Raritan Valley motif.

`feat/community-technology-website` starts at that release. It adds a scoped
photographic Home redesign, refreshed About/Services, a software-and-systems
support service, and general contact routing. Migration capabilities remain.
This is a review candidate, not an additional production deployment. See
`COMMUNITY-REDESIGN.md` for its changes, source credits, checks and rollback.

# Website and marketing integration candidate — September 25, 2026

The owner authorized integration and release of the migration/modernization
website and the lightweight Voyager 1 marketing foundation. The isolated release
branch combines `codex/migration-modernization` at `3cc9831` and
`feat/voyager1-marketing` at `ce06ba9` from `origin/main` at `b54819b`. The original
Voyager checkouts and their unrelated local work remain untouched. This candidate
is **not deployed or merged** until the final checks and release workflow pass.

- Home and About now explain vendor-neutral migration into the customer's chosen
  platform, grounded in the founder's database-engineering experience. Existing
  brand, homepage anchors, SQL Server services and all ten articles are retained.
- Ten new pages: service index and seven service details, guided migration intake,
  and a 14-question ungated readiness check with explained results and an optional
  reviewed handoff into the inquiry. Formspark destination and email fallback
  remain; no real inquiry was sent.
- The existing static Pages build now prerenders readable HTML before hydration.
  Unique metadata/schema and 23 sitemap URLs cover the expanded site. Article
  renderer/export digest and full-body parity checks protect publication content.
  Deployment/release controls are preserved; CI covers migration, attribution
  and marketing safeguards.
- The redundant score-based private prospecting workspace was removed. Voyager 1's
  simpler company-list, provenance, durable suppression, frozen-recipient approval,
  local simulation and attribution architecture is the single marketing foundation.
- The public site reads only five bounded campaign tags, preserves one first touch
  for the current browser tab, and includes those fields plus a path-only landing
  page in Formspark inquiries. There are no cookies, pageview logs or browser calls
  to the private marketing service. Storage denial and missing tags fail quietly.
- Production email remains unavailable. Only the local disk provider is installed;
  no sender credentials, public unsubscribe service or real outreach is enabled.
- The integrated candidate passed lint, frontend/backend/marketing typechecks,
  40 marketing tests, 11 readiness/attribution tests, 26 publication/pipeline
  checks, 70 backend tests, the business-operations check, both production builds,
  static metadata/link/schema/sitemap checks and `git diff --check`.
- Browser checks passed: 69 renders at 1440/768/390, additional 320px/keyboard/
  reduced-motion checks, 23 no-JavaScript pages, missing and `index.html` routes,
  year rollover and 22 public-tool scenarios, including the campaign-to-inquiry
  contract. No unexpected external requests, console or hydration errors. All 14
  synthetic form POSTs were intercepted locally. 35 axe scans reported zero violations;
  this is not a full assistive-technology certification.
- Local migration screenshots/results are in ignored `outputs/migration-qa/`.
  See `MIGRATION_IMPLEMENTATION.md` for the page/file
  inventory, checks, limitations, release/rollback path and next phase;
  `MIGRATION_SEO_RESEARCH.md` and `MIGRATION_EDITORIAL_BACKLOG.md` hold the strategy.

Remaining: final integration validation and release, an authorized real inquiry
receipt test, publication of new articles through the existing CMS, provider and
sender selection, reliable public unsubscribe/click hosting, and an owner-reviewed
Central New Jersey source list. No real form, email or ad was sent. No DNS, secret,
production backend, SQL schema or external exposure was changed.

## Previous candidate — September 19, 2026

Owner explicitly authorized a creative professional redesign serving local
business owners and fractional DBA/database customers. The reviewed candidate
starts at `9baee00` on `codex/local-business-design`, built in an isolated
Voyager 2 checkout. Home, About, shared navigation/footer, and public metadata
are refreshed. The contact integration and all ten articles are preserved.

The supplied private technical summary grounds anonymized founder experience;
it is not published. An intentional monogram replaces the novelty portrait;
`app/content/founder.ts` is ready for an owner-approved real photograph.
No home address, walk-in invitation, rates, coverage promises, or client
claims were invented. See `REDESIGN_ACCEPTANCE.md` for checks and boundaries.

Candidate lint, both builds, 26 publication checks, static route checks, and
frontend typecheck passed. Browser acceptance covered desktop/tablet/phones,
all articles at desktop/phone widths, contact validation, keyboard and FAQs.
Release/deployment outcome must be confirmed from the merge and Pages run;
the candidate status alone is not a production-deployment claim.

## Earlier verified operational milestone — September 12, 2026

The owner publishing desk milestone is released and verified. PR #8 merged as
`c235c73b0fea25fd0a46152edf93ba7a40b0f831`; reviewed application head is
`9ff835214cf898918beff06f389e1587313aef33`. Main CI 34712311898 passed.
The source release deployed in run 34712311869. Controlled publication run
34712416208 exposed the synthetic article; withdrawal run 34712596957 removed it.
Fresh and returning online browsers confirmed removal. The synthetic record is
archived. Final SQL, deployed website, and article AI digests match at ten articles.

- Voyager 2: reviewed private API image is healthy, the owner desk service and
  15-minute publication timer are enabled and active. No schema migration or
  public network exposure was introduced. Existing dirty checkouts are preserved.
- Voyager 1: actual Windows Chrome authenticated desk checks passed at 1440,
  768 and 390 pixels using its existing SSH access. VS Code work was preserved.
- Mac: the same rendered checks passed; real draft/preview/publish/unpublish/
  archive acceptance passed. Browser-local 503 and 401 simulations preserved
  unsaved edits; real reauthentication and lock cleared credentials correctly.
- Final validation: lint, 23 publication/admin tests, 3 pipeline tests, 70 backend
  tests, frontend/backend typechecks, Vinext test/build, Pages build, static route
  checks and diff checks passed. Public browser regression covered all 13 routes
  at three sizes (39 renders), keyboard flow, contact fallback, cache and backend
  failure. No real contact form submission or email was sent.
- Current practical access and rollback: OWNER_DESK_ACCESS.md and
  PUBLICATION_OPERATIONS.md. Machine-readable results and responsive images:
  `docs/evidence/2026-09-12/desk-final/`.
- Public chat remains disabled. Direct business-mail receipt remains unconfirmed.
  An already-open/offline page may retain old content until an online refresh.
  Other business capabilities are separately tracked in FEATURE_STATUS.md.

## Historical state below

These dated notes are retained for provenance, not current acceptance gates.

# Project state

## Voyager 1 business operations and acceptance update

- docs/BUSINESS_OPERATING_RUNBOOK.md records article and inquiry-to-closeout
  processes, role gates, inputs, outputs, completion conditions, existing
  systems of record, cache limitations, and open owner decisions.
  docs/CLIENT_WORK_TEMPLATES.md supplies inquiry-response, discovery, scope,
  delivery, and closeout templates without inventing pricing, response promises,
  or legal terms.
- docs/VOYAGER1_ACCEPTANCE_REPORT.md separates passed, failed, and not-tested
  checks and includes a paste-ready Voyager 2/Mac staging handoff. No production
  article, form, email, credential, tracker, SQL data, or external service was
  changed.
- Read-only live checks returned HTTP 200 for Home, About, Articles, one native
  article URL, private authoring, both sitemaps, and robots.txt. All 13 URLs
  in the live main sitemap returned 200. Fresh Edge
  sessions rendered desktop and approximately 400-CSS-pixel layouts. Public
  authoring correctly reported it was disconnected. Responses observed
  Cache-Control: max-age=600.
- Root lint, direct Vite Pages build/static generation, and backend strict
  TypeScript checking passed. The snapshot contains ten articles; the build
  emitted ten slug pages, 13 main-sitemap URLs, 11 article-sitemap URLs, admin
  noindex, and /admin/ robots exclusion.
- Backend tests passed 48 of 49. The remaining test did not reach an application
  assertion because Windows denied creation of its symlink fixture with EPERM;
  rerun it in the pinned Linux/Node 22 container.
- Gaps remain: no owner-approved publication interval/static-sync owner is
  documented, and knowledge:ingest does not consume the existing
  web.ListPublishedArticleKnowledge export. Schedule, complete withdrawal/cache,
  and article-citation checks require isolated Voyager 2/Mac staging integration.


Voyager 2 host/backend state below was last verified 2026-08-28 UTC on
`voyager2-articles-platform`. The Voyager 1 update above was verified
2026-09-11 UTC on `main`. This records observed state, not plans.

The following is retained as dated history. Statements about live API fallback,
old captures, host versions, deployments, credentials and prior checkmarks must
not override the current evidence above.

Last verified: 2026-09-02 UTC on `codex/friday-launch-integration`. This
records observed state, not plans.
## Voyager 2 launch-hardening and article/AI audit — September 11, 2026

Last verified: 2026-09-11 UTC on `main`. This records observed state, not plans.

The Friday launch-hardening audit is recorded in
[`VOYAGER2_LAUNCH_STATUS.md`](VOYAGER2_LAUNCH_STATUS.md). Current `main`, local
production builds, all 49 backend tests, SQL schema/integrity, the rollback-only
publishing workflow, the static outage snapshot, and the current full-plus-
differential backup chain passed. The approved launch remains static and has no
Voyager dependency. Authoring activation, isolated restore testing, off-device
backup, and any approved public API ingress remain post-launch work.

## 2026-09-11 article export and AI verification

- Live host `voyager2` and repository `/home/nasa/netherwood-data-partners`
  started from synchronized `main` at `b431beb`. The implementation is in local
  commits `9f9a4ca` and `417f2e8`, not pushed. Pre-existing local documentation
  edits were preserved. SQL Server `17.0.4075.5`, `NDP_Web`, the loopback API,
  and loopback Ollama were live; the repository SQL preflight/schema check and
  rollback-only article workflow passed. Shared QueryVault/CapLab and monitoring
  services were not restarted or changed.
- SQL and the API each return 10 published, due articles. The tracked static
  snapshot also has 10, but its export time remains
  `2026-08-24T02:11:34.373Z`. A full SQL/API/snapshot trace of
  `why-sql-server-databases-slow-down-over-time` matched its ID, slug, dates,
  6,061-byte HTML, and HTML/plain-text SHA-256 hashes exactly.
- The new candidate export detected one existing divergence: article
  `ac33f77f-3520-57a6-8456-9e1b4cbe7b7e` is titled `Azure SQL Migration Lesson`
  in SQL/API and `Azure SQL Migration Lessons` in the tracked/live Pages
  snapshot. Content, slug, tags, and dates match. The candidate was validated
  and built but was not promoted because the title choice is a publication
  approval, not a technical assumption.
- Database writes never reached Pages automatically because the site has no
  configured Voyager URL, the old exporter was manual, a Voyager worktree edit
  neither commits nor pushes GitHub, and the Pages workflow runs from GitHub on
  `main` pushes/manual dispatch. New native slug routes likewise require a
  snapshot build/deploy.
- A staged `netherwood.public-articles/v1` export now validates canonical public
  content, count, ordering, due dates, sanitized HTML, IDs/slugs, and a SHA-256
  content digest. It writes only an ignored candidate, reports additions/edits/
  removals/scheduled-due content, requires exact-digest approval, and runs an
  isolated full/Pages build before atomic promotion. Inactive user-systemd
  templates check every 15 minutes; no timer, GitHub credential, commit, push,
  or deployment was activated.
- Authoring remains disabled: neither the `ndp_article_author` server login/
  database user nor the three authoring environment settings exists; the
  procedure-only `web_article_author` role does exist and admin routes return
  `404`. Save Draft,
  Publish, future scheduling, Unpublish, Archive, delete boundaries, and public
  exclusion passed isolated API tests plus the live rollback-only SQL test.
- Article knowledge ingestion did not previously exist: the bounded SQL export
  returned 10 articles while zero article sources were indexed. The implemented
  reconciliation indexed all 10 through existing `ndp_web_app` procedures;
  a second pass reported all 10 unchanged. Tests prove edited hashes refresh and
  sources/chunks are hidden after unpublish/archive/future exclusion without
  affecting the five structured or two public-file sources.
- Real local RAG ranked the NOLOCK and Azure articles first. A cited NOLOCK
  answer took 143.8 seconds; Ollama used about 201% CPU and 3.07 GiB while the
  request container used about 43 MiB, and a simultaneous SQL-backed article
  read completed in 0.28 seconds. A source-text injection challenge took 176.1
  seconds and ignored the injected marker. With the former 0.65 distance an
  unsupported question took 119.2 seconds and cited irrelevant articles; the
  evidence-based 0.35 default returned the same question deterministically in
  1.54 seconds with no citations. The updated image passed 56 tests and strict
  type checking, but the running API was not restarted.
- Public chat is not ready: supported CPU answers still take 2.4-2.9 minutes,
  only one generation can run, the host has 7.5 GiB RAM and unstable attached
  storage history, and the refreshed image/threshold plus monitoring/load tests
  are not deployed. GitHub Pages and static articles remain independent.
## Repository and publishing

- The public application includes `/about`, `/articles`, native
  `/articles/{slug}` pages, and `/admin/articles`, all using the existing shared
  navigation, footer, typography, responsive rules, and branding.
- Canonical remote: `https://github.com/stevewittek/netherwood-data-partners.git`.
  Before the 2026-08-28 Articles release, `origin/main` was commit `e6fdd55`.
  Work began from the clean
  `feature/penny-pincher` checkout at `1033a5a`; the newest appropriate Articles
  baseline was `3521f8b`. The new `voyager2-articles-platform` branch merged
  current `origin/main` at `2747620`, preserving both the completed Articles
  work and the newer Database Mail operations files. The release fast-forwards
  `main` to this lineage and publishes through the existing Pages workflow.
- GitHub Pages remains a static build. `pages-site/` reuses the public app and
  `.github/workflows/deploy-pages.yml` publishes `pages-dist`. The optional chat
  widget is omitted unless `VOYAGER_API_URL` is explicitly supplied at build
  time, so Pages does not depend on Voyager, SQL Server, Docker, Ollama, or home
  Internet.
- The home-page contact section posts directly to the public Formspark endpoint
  for the `Netherwood Data Partners Contact` form. It remains a static-site
  integration and requires no private key, local backend, or runtime secret.
  JavaScript submissions expose clear sending, success, timeout, and error
  states, and the rendered form retains a native POST action. The existing
  contact email remains visible as a fallback.
- Formspark's automatic spam filter was observed as active for the form. The
  site also sends Formspark's supported `_honeypot` field. The dashboard reports
  one active notification recipient. On 2026-09-02, four test-like submissions
  were found in the Spam queue: two placeholder-only QA attempts and two owner
  tests whose message contained a second, mismatched email address. With owner
  approval, only the two owner tests were marked as non-spam; the QA placeholders
  remain quarantined. No spam-protection setting was changed.
- One owner-approved candidate submission at 20:24 EDT was accepted with the
  automatic filter still enabled. The site displayed its success state and
  reset the form, the submission appeared in the Formspark Inbox, and the
  notification reached the configured recipient at 20:24:57 EDT with the
  submitted business address as `Reply-To`. The workspace allowance changed
  from 250 to 247 because the two recovered submissions and the new accepted
  test each count once.
- A direct fallback-email test was sent from `steven.wittek@gmail.com` to
  `contact@netherwooddatapartners.com` at 22:41 EDT on 2026-09-02, outside
  Formspark. Gmail recorded the Sent message. No delivered copy appeared in the
  connected Gmail inbox during the initial check, so receipt in the business
  mailbox or its forwarding destination is not yet confirmed.
- Before the 2026-08-28 release, the live domain returned HTTP 200 with a
  `2026-08-23 14:36:55 UTC` modification time and the expected site title. The
  Articles release keeps the public site static and adds the Articles index,
  native article detail routes, and disconnected private-desk shell. The public
  HTML does not contain the chat widget because the GitHub
  `VOYAGER_API_URL` variable and static `VITE_VOYAGER_API_URL` remain unset, so
  the deployed site is not connected to Voyager and contains no API secret.
  Voyager, Ollama, and SQL Server were not exposed.
- Database Mail setup runners were prepared on 2026-08-25 under
  `ops/database-mail/` for both Voyagers. They configure
  `database@netherwooddatapartners.com` as the visible
  sender through Namecheap SMTP and create the `Netherwood DBA` operator. The
  configuration has not yet been applied to either server; no service restart or
  external test email was performed from this workstation.
- Host Node remains 18.19.1 and was not changed. Development and verification
  use pinned Node 22.13.1 containers.

## Articles content system

- Ordered migrations `005_articles_cms`, `006_articles_content_workflow`,
  `007_starter_articles`, and `008_article_metadata_and_scheduling` are applied
  to `NDP_Web` and were reconfirmed after the storage recovery described below.
  The physical
  `web.BlogPosts`/`web.ArticleDrafts` model supplies the requested article ID,
  title, slug, summary, sanitized HTML, category, JSON tags, author, featured
  image, SEO description, UTC publication/modification/creation dates, and
  publication state. Published content stays unchanged while edits are staged.
- Drafts now carry optional SEO titles and UTC publication dates. Publish uses
  the current UTC time when no date is supplied; future-dated published rows
  remain absent from public detail, list, search, and knowledge-export results
  until due.
- Public search and category/date indexes support the listing path. A unique
  filtered index enforces at most one published featured article. Slugs remain
  unique, and state/date, JSON, length, and relational constraints remain in
  SQL rather than relying only on the browser.
- Ten idempotently seeded articles are published, newest first, with exactly
  one featured article. The current SQL export contains all ten full articles;
  its `generatedAt` value is `2026-08-24T02:11:34.373Z`.
- Fixed procedures provide public list/detail/search, private list/detail/save/
  publish/unpublish/archive/delete, and bounded article-knowledge export. Delete
  refuses published content and removes only an unpublished article plus its
  associated draft/image rows in one transaction.
- `ndp_web_app` can execute only the fixed public article read/export procedures
  and has no direct article-table access. The separate procedure-only
  `web_article_author` role exists, but no `ndp_article_author` login, SQL author
  password, or publishing API token was created. Admin API routes intentionally
  return `404` until the owner makes that credential decision.
- The loopback-only API image was rebuilt and its process health remains
  healthy. Live checks return ten published
  rows, three-row pagination, the expected newest slug, complete detail HTML,
  short stale-if-error caching, and restricted CORS. The disabled admin API
  returned `404`; an unapproved origin returned `403`, and the allowlisted
  local preflight returned `204`. During the SQL outage, article reads failed
  safely as `502 upstream_unavailable` while `/health` remained `200`; after
  recovery the database-backed article endpoint returned HTTP 200 again.
- The public index provides a featured insight, newest-first cards, category
  filtering, and search. Detail pages include author/date metadata, related
  article ranking, controlled technical typography, and a contact CTA. The
  frontend tries the live API when configured, then a browser last-good cache,
  then the tracked SQL snapshot, so static rendering never depends on Voyager.
- The private desk lists content and supports create, edit, sanitized preview,
  save draft, publish, unpublish, archive, guarded delete, SEO description,
  featured selection, tags, category, author, image URL, and pasted HTML.
- Headless Chromium renders of the Articles index and detail page were reviewed
  at desktop and mobile sizes; the disconnected admin state was also reviewed
  on mobile. Navigation, content hierarchy, tables/code, related cards, CTA,
  footer, and horizontal containment fit the existing design system.
- The Pages build emits the Articles index, admin page, ten native slug routes,
  no-index `404.html`, per-article title/description/OpenGraph/Twitter/Article
  JSON-LD, `sitemap.xml`, `articles-sitemap.xml`, and `robots.txt`.
  `VITE_VOYAGER_API_URL` remains unset and no tunnel, DNS, router, firewall, or
  public-exposure change was made.
- Stored HTML is allowlist-sanitized before preview/save and sanitized again on
  database reads. Scripts, embeds, inline events/styles, unsafe schemes,
  protocol-relative URLs, forms, and unknown attributes are removed while the
  required technical-writing elements remain. Searchable plain text is derived
  only from sanitized HTML.
- Public article reads and private admin requests use separate bounded rate
  limits; the stronger admin default is ten requests per source per minute.
  Slugs are normalized before uniqueness checks, and SEO title/description are
  exposed under both the existing SEO names and detail-response meta aliases.

## Host and private services

- Host: Lenovo ThinkPad T460s, Ubuntu 24.04.4 LTS, 7.5 GiB RAM plus 4 GiB swap,
  Intel i5-6300U CPU, no usable discrete GPU.
- SQL Server 2025 build `17.0.4075.5`, Enterprise Developer Edition, is active
  and listening on TCP 1433. `master`, `model`, `msdb`, and `tempdb` now use
  explicit local paths under `/var/opt/mssql/data`. `NDP_Web` uses
  `/var/opt/mssql/userdata/NDP_Web.mdf` and
  `/var/opt/mssql/userlog/NDP_Web_log.ldf`; new user databases default to those
  USB-backed data and log paths.
- The USB enclosure disconnected both filesystems together at 19:22 UTC and
  again at 21:12 UTC. The devices later re-enumerated under new `/dev/sdX`
  names while stale mounts retained the dead devices. Both ext4 journals were
  recovered with `e2fsck`, the filesystems were remounted by UUID, and the SQL
  metadata was moved to role-specific paths. A cold restart, disposable default
  database, full `DBCC CHECKDB (N'NDP_Web')`, runtime-login check, schema check,
  and database-backed API read all passed. Local and on-volume pre-cutover file
  copies were retained for recovery rather than deleted.
- UFW still denies incoming and routed traffic by default. The existing LAN-only
  SQL rule remains; one additional rule permits only the `caplab-net` Docker
  subnet on its bridge to reach the host's Docker-gateway address on TCP 1433.
  SQL Server, Prometheus, Grafana, the API, and Ollama were not exposed publicly;
  no router, DNS, or tunnel change was made.
- Docker 29.7.2 is enabled. Compose runs Voyager and the official Ollama image
  as restartable services. Both bind only to loopback: API at
  `127.0.0.1:3000`, Ollama at `127.0.0.1:11434`. The API remains non-root,
  read-only, capability-free, and `no-new-privileges`; Ollama is similarly
  hardened and has cloud access disabled. No Docker port is published.

## Local Ollama and cited RAG

- Ollama `0.32.15` runs from the immutable official image digest
  `sha256:57d60e686821ea81a7748a3ec8141308c8b8f95b27105713954abf7a6529e700`.
  The official Docker deployment was used because a host-package install would
  require unavailable sudo access. `restart: unless-stopped` supplies automatic
  startup after Docker is running; model data persists in the dedicated
  `backend_ollama_data` volume.
- Installed models are `qwen3:4b` (model ID prefix `359d7dd4bcda`, 2.5 GB on
  disk) and `nomic-embed-text:latest` (`0a109f422b47`, 274 MB). A live embedding
  request returned exactly 768 finite dimensions.
- `AI_PROVIDER=ollama` is the default. The optional OpenAI Responses provider
  and `OPENAI_API_KEY`/`OPENAI_MODEL` settings are preserved, but OpenAI is not
  required and no paid request was made. GitHub Models code and configuration
  were removed because that service was retired and is not part of production.
- `qwen3:4b` receives a constrained prompt and only top-ranked approved chunks.
  It is instructed to treat source text as data, refuse unsupported claims, and
  never disclose prompts, credentials, private host data, or internal-only
  material. The browser contract retains `message`; responses additionally
  include `answer` and structured `sources`.
- The exact live question “What database performance services do you offer?”
  completed successfully on CPU in about 136 seconds. It answered: “Netherwood
  Data Partners offers database performance services including slow queries,
  poor execution plans, blocking, waits, deadlocks, index tuning, and capacity
  pressure [S1][S2].” Sources were the public `Database Services Overview`
  document and the database record `SQL Server Performance and
  Troubleshooting`, both linked to `/#services`.
- While `qwen3:4b` was loaded, Ollama reported 3,184,001,022 bytes (2.97 GiB),
  context length 4096, and zero VRAM. Docker reported about 3.04 GiB used by the
  Ollama container. CPU latency is acceptable for local verification but should
  be reviewed before any public connection.

## SQL knowledge store and least privilege

- Ordered, idempotent migrations `003` and `004` add
  `web.KnowledgeSources`, `web.KnowledgeChunks`, and
  `web.ChatbotStructuredContent`. Embeddings use stable SQL Server 2025
  `vector(768)` values. Relational constraints, source/chunk indexes, UTC
  timestamps, SHA-256 hashes, public metadata, and visibility flags are present.
- Exact cosine `VECTOR_DISTANCE` retrieval is used for the initial small
  corpus. No preview feature or vector index is enabled.
- Five fixed stored procedures form the only knowledge allowlist. The runtime
  login can list/search/replace/hide through bounded procedures and retrieve
  visible structured records; it is denied direct reads and writes to all three
  knowledge tables. The model cannot submit SQL or file paths.
- Post-recovery live verification reported 17 required tables, five knowledge procedures plus
  ten article procedures, five retention policies, the separate bounded purge
  procedure, and exact approved MDF/LDF paths. The most recent recorded
  migration time is `2026-08-27 19:10:40.806 UTC`. Existing visitor, chat,
  telemetry, leads, IP hashing, retention, parameterized SQL, and safe-log
  boundaries remain in place.
- Five explicitly visible database examples are indexed: SQL Server performance
  and troubleshooting, reliability, migrations, reporting, and the public
  business contact record. Database material not marked `ChatbotVisible=1` is
  excluded.

## Approved file ingestion

- The host-approved directory is `company-knowledge/public`; Compose mounts
  only that directory read-only at `KNOWLEDGE_ROOT=/knowledge`.
- Supported extensions are `.txt`, `.md`, `.html`, `.csv`, `.json`, `.pdf`, and
  `.docx`. Hidden files/directories, symlinks, unsupported/binary files,
  oversized input, and traversal outside the configured real path are rejected.
  This prevents indexing `backend/.env.local` or arbitrary host content.
- Extraction preserves friendly titles and optional safe public URLs. Each file
  has a raw SHA-256 hash, normalized overlapping chunks, locally generated
  embeddings, and database metadata. Modified files are reindexed; deleted
  files are hidden. The manual command is designed for later scheduling without
  changing the ingestion architecture.
- Two initial public-site-derived examples are indexed:
  `Database Services Overview` and `Working with Netherwood Data Partners`.
  A repeat scan reported two unchanged files and five unchanged database
  sources with zero failures, proving idempotence.

## Security and verification status

- A read-only `CI` workflow now runs independently of the existing Pages
  deployment on pushes to `main`, pull requests targeting `main`, and manual
  dispatches. Its initial push run (`33178872123`) completed successfully on
  2026-08-28: the Node 22/pnpm 11.19.0 Site job passed frozen installation,
  lint, test, and static Pages build steps, while the Node 22 Backend job passed
  `npm ci`, all tests, and strict TypeScript checking.
- Existing origin allowlisting, preflight restrictions, request/body/input
  limits, source rate limiting, keyed IP hashing, safe errors/logging,
  parameterized SQL, and bounded provider/server/browser timeouts remain.
- The widget now renders numbered, clickable citations after validating titles,
  types, and relative/HTTP(S) URLs. A single-flight backend guard defaults to
  one active model generation and returns `503 chat_busy` with a 120-second
  retry hint before recording or queueing excess work; the widget preserves the
  visitor's question and shows a specific retry message.
- Automated coverage includes Ollama chat and embeddings, mocked model errors,
  vector retrieval, content hashing, supported extraction, file modifications
  and deletion, citations, visibility filtering, stored-procedure allowlisting,
  traversal/symlink rejection, prompt-injection treatment, and no-source
  behavior. Article coverage includes validation/XSS stripping, search and
  public metadata/detail contracts, authentication and disabled-authoring
  behavior, create/edit/publish/unpublish/delete flows, seed/snapshot/sanitizer
  alignment, and migration permission/index boundaries. Additional Articles
  coverage verifies normalized slugs, strict UTC dates, conflicts, metadata,
  public/detail contracts, pagination, injection-like values, SQL outage
  handling, visibility transitions, and separate rate limits. The pinned
  backend image passed all 49 Node tests, strict TypeScript checking, and npm
  audit with zero known vulnerabilities.
- The API and Ollama containers are healthy; API `/health` and a SQL-backed
  article read succeed locally. SQL schema, migration, runtime-login, and
  consistency checks pass after recovery. Earlier re-ingestion was idempotent
  and the real local cited RAG check passed.
- On 2026-09-02, the contact-form change passed root ESLint, the static Pages
  build and generated-route export, the Vinext production build, a local HTTP
  render, `git diff --check`, and a tracked-content secret-pattern scan under
  pinned Node 22.13.1/pnpm 11.19.0. Interactive browser QA was later completed
  on the integrated launch candidate at desktop, 768px, 390px, and a 320px
  home-page spot check.
- Root ESLint, the static Pages build with ten generated native article routes,
  and the Vinext build passed under Node 22.13.1. SQL migrations 006-008
  passed rollback validation before the gated live apply. A separate
  rollback-only database integration test passed create, draft visibility,
  metadata, publish, future-date exclusion, unpublish, archive, delete,
  duplicate slug, and rollback checks. Live database verification passed
  afterward and before the later OS-level storage failure. `git diff --check`
  and the final tracked-file
  secret scan passed. Ignored local environment files remain owner-only at mode
  `0600`. Container inspection reconfirmed loopback
  host networking, read-only roots, all capabilities dropped,
  `no-new-privileges`, and automatic restart policies. The refreshed API image
  was deployed only to the existing `127.0.0.1:3000` service. No secret,
  credential, public tunnel, router, firewall, DNS setting, or public website
  integration was added.

## Before connecting the public website

1. Replace or stabilize the shared USB enclosure/cable/power path and establish
   tested database backups and restores. The system-database split keeps the SQL
   engine bootable without USB, but `NDP_Web` is correctly unavailable when
   either user-data drive is absent; UUID mounts do not make unstable hardware
   durable.
2. Resolve and verify SQL Server network exposure and an approved tunnel policy;
   do not use router port forwarding or expose Ollama/SQL directly.
3. Load-test the new single-flight behavior and `qwen3:4b` on this CPU-only host
   under realistic traffic. Decide whether its roughly two-minute response time
   is acceptable, then add operational monitoring and a scheduling policy for
   knowledge ingestion.
4. Review and approve the production knowledge corpus and every structured SQL
   record. Keep internal documents outside the approved root and visibility
   flag.
5. Establish/test database and Ollama-volume backup/restore plus retention
   operations. Disable the temporary SQL setup login and remove the ignored
   setup credential when schema work is complete.
6. Only after local security review, set the static build's `VOYAGER_API_URL`
   to an approved HTTPS endpoint and test backend-down behavior. It remains
   unset now.

## Launch governance audit (2026-09-02)

- `origin/main` was pulled and confirmed at `b431beb` before the audit.
- Production Home, About, Articles, ten article routes, mobile containment,
  robots, and sitemaps were inspected. The public site remained independent of
  Voyager; production contact was still email-only.
- The original Formspark commit `f982599` remains preserved on
  `codex/formspark-contact`. No newer Formspark work was found. It was
  cherry-picked exactly once into `codex/friday-launch-integration` as
  `9aaf05c`, after governance commit `5acea14` was integrated as `7a82024`.
  Neither integration commit is on `origin/main` or production.
- Candidate screenshots were captured before and after at desktop, 768px, and
  390px. Home, About, Articles, and one article route were checked at all three
  widths with no document overflow. The public form has one rendered instance,
  a native POST action, required name/email/message fields, honeypot, visible
  email fallback, and no Voyager widget or runtime dependency.
- A narrow fallback follow-up leaves native POST behavior available when
  `fetch` is unavailable and adds a static `noscript` email path. Empty and
  invalid-email browser validation passed. The owner-approved live candidate
  test confirmed success, reset, Formspark Inbox receipt, notification delivery,
  and correct `Reply-To`. A later browser QA attempt exposed that automation
  could bypass native `minLength`; one short placeholder request reached
  Formspark and was rejected. The enhanced handler now applies the trimmed
  20-character minimum independently, and the repeated path stopped locally
  with the expected validation message and no request.
- The owner confirmed that Steven began working in the field in 2009 and that
  Netherwood is currently a founder-led, one-person consultancy. Plural
  professional wording was narrowed accordingly. The temporary founder image
  is approved for the Friday launch while a real portrait is prepared.
- The launch candidate self-hosts Manrope and DM Sans for both static Pages and
  Next/Vinext paths, with tracked OFL licensing and no font-CDN request. Home
  and About use aligned company-focused title, description, Open Graph,
  Twitter, and canonical metadata. Responsive browser checks at desktop,
  768px, and 390px reported the intended computed fonts, one `h1`, no broken
  images, and no horizontal overflow on Home, About, Articles, and one article.
- Launch source-of-truth documents were added under `docs/`, with concise agent
  rules in `AGENTS.md` and `.github/copilot-instructions.md`. No product code,
  CSS, content, backend, infrastructure, or production configuration was
  changed by the governance task.
