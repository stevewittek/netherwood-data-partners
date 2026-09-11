# Project state

## Application merge and review synchronization — September 11

[PR #1](https://github.com/stevewittek/netherwood-data-partners/pull/1) merged at
2026-09-11T11:11:38Z. Its application merge commit is
`60110be306340bd8d654a3da071f57a8687b1827`; later documentation-only commits do
not change that application baseline. The merged implementation reconciles
Voyager 2's histories, 0.35 retrieval default and failure tests while preserving
one article ingester and one publisher.

[Merge CI run 34592830620](https://github.com/stevewittek/netherwood-data-partners/actions/runs/34592830620)
passed Site, Backend and Backend Windows. Windows passed all 60 tests with zero
skips, as it also did in PR run `34592561393`.
See [WORKSTREAM_RECONCILIATION.md](WORKSTREAM_RECONCILIATION.md) for exact source
commits, selected/superseded changes and the three-machine status.

The Mac publication review checkout was fast-forwarded to the application merge
before opening this documentation-only follow-up. Voyager 2's new clean,
detached review checkout under `/home/nasa/netherwood-release-review-60110be`
was tested at the same application commit. Review checkouts may advance through
documentation-only updates; the tested application revision remains `60110be`.
Its original checkout remains at
`417f2e8`, with its dirty document hashes unchanged. The reviewed Docker image
`ndp-publication-review:60110be` built successfully with 60 tests, zero skips and
strict type checking. Its image ID is
`sha256:fa981eabf100883ef675a8424222ac4d882c3525b335f6b48aa51af021654e9e`.
It is **built, not running**. An earlier offline attempt stopped at an npm cache
miss; the normal build then installed locked dependencies and passed.

[Publication run 34592830561](https://github.com/stevewittek/netherwood-data-partners/actions/runs/34592830561)
was skipped. Public Pages remains at `b431beb58dccefb8e092c179a1a8517caa78c484`,
deployment `6223598061`. Authoring, public chat and both timers remain off;
existing services were not restarted. Voyager 1's summary is available, but its
four actual uncommitted documents still await transfer. No SQL permissions,
credentials or public exposure changed. See
[post-merge provenance](evidence/2026-09-11/post-merge-sync.json).

## Merged application — production release still pending

**Merged code; not deployed and not integration-complete.** The application
merge preserves `f96bc08` and its seven launch commits. Existing worktrees and
the unrelated Database Mail modification were preserved. See
[pre-release verification evidence](PUBLICATION_VERIFICATION.md) and the
[combined operations guide](PUBLICATION_OPERATIONS.md).

- Actual production cause: the deployed workflow builds its tracked August 24
  snapshot without exporting SQL. Both inspected public API/chat build values
  are empty. Ten live article routes remain independently available.
- Prepared behavior: a validated, complete public SQL export controls every article
  surface, route, related link, metadata record and sitemap. Captured Voyager 2
  export: 2026-09-11T03:04:30.209Z, ten articles, digest
  `ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8`.
  The SQL title "Azure SQL Migration Lesson" is singular while production is
  plural; approve that captured editorial change before releasing it.
- Publication automation is prepared and disabled. A private 15-minute full-set
  export, content-only Git branch and hosted validation/build/deploy detect
  edits, due schedules and removals. Healthy operational expectation is roughly
  15–30 minutes including measured ten-minute Pages cache lifetime; no SLA.
- Legacy live-article/localStorage fallback is removed. The new release treats
  an empty export or absent slug as authoritative. Failed export/build retains
  the last good release. Offline copies and old open tabs cannot be revoked.
- Existing Formspark is reused. Its prior inbox receipt was reread on September
  11; no new message or form was sent. Direct business-mail receipt remains
  unconfirmed in the connected Gmail evidence.
- Current responsive/browser checks cover all ten articles plus Home/About/index
  at 1440/768/390 and 320px spot checks. Focused fixes restore cross-page contact
  scrolling, article list markers, contact/article-control boundary contrast and
  dark-section keyboard focus, with
  before/after evidence. Branding, layout and navigation are retained.
- AI reconciliation follows the deployed/current-SQL intersection and hides
  removed or changed article sources before embeddings. Chat and its telemetry
  remain disabled. Retrieval-time visibility protection and acceptable measured
  endpoint behavior are still required before any chat activation.
- Voyager 2's original checkout preserves `9f9a4ca` and `417f2e8`; the clean
  application review checkout and new image are recorded above.
  Health is 200, authoring is 404, its newly built API image is not running and
  its timer is absent/inactive. Ten article knowledge sources are indexed, but
  website-digest agreement is pending; cited answers took 143.8–176.1 seconds.
- The new SQL export procedure/grant and scheduled units have not been applied
  or activated. The actual Voyager 1 files, live SQL fixtures, approved release and
  controlled post-release publication/withdrawal are outstanding gates.
- Supported Mac verification runtime: bundled Node 24.19.0 and pnpm 11.19.0.
  The Docker build ran on Voyager 2, not the Mac. No live SQL mutation or runtime
  activation is claimed. The merge CI and image-build results above supplement
  the earlier candidate verification; they do not prove a live publication.

## Historical state — not current release sign-off

The following is retained as dated history. Statements about live API fallback,
old captures, host versions, deployments, credentials and prior checkmarks must
not override the current evidence above.

Last verified: 2026-09-02 UTC on `codex/friday-launch-integration`. This
records observed state, not plans.

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
