# Project state

## Mac article import verification, 2026-09-11 UTC

The two Voyager article commits were imported into the isolated Mac branch
`codex/voyager2-article-ai-review`, based on freshly verified `origin/main`
`b431beb58dccefb8e092c179a1a8517caa78c484`. The imported code tip
`d8f807702f010bea999f41a1625373711683219c` has exactly the same Git tree as
Voyager's `417f2e86b3dcf018ba3e09789c8fb454ec2a1979`. Other Mac worktrees,
including the dirty publication release candidate, were preserved.

On this Mac, 56 backend tests, strict TypeScript, ESLint, Vinext build, Pages
build, snapshot validation, and checks of all ten native article routes passed.
These checks used available Node 24.19.0 and local dependencies with matching
lockfiles; they do not repeat the handoff's Node 22 Docker or live SQL tests.
The legacy snapshot remains byte-for-byte unchanged with the plural Azure
title and generatedAt `2026-08-24T02:11:34.373Z`.

The publication wrapper is not ready for activation on this Mac: `flock` is
absent, Docker is not running, and its Linux build container would receive
Darwin native dependencies. Review also found that the publisher builds a
mutable working tree and does not recheck the approved digest against the
staged snapshot. See [the import review](MAC_ARTICLE_IMPORT_REVIEW.md) for
evidence, remaining integration decisions, and validation limits.

No push, deployment, candidate promotion, credential change, database change,
timer activation, or service restart was performed. Host and SQL observations
below are historical; this Mac import rechecked only Voyager Git/bundle state.

## Earlier project verification

Last verified: 2026-08-28 UTC on `voyager2-articles-platform`. This records
observed state, not plans.

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
