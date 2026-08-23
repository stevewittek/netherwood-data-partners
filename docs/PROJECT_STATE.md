# Project state

Last verified: 2026-08-23 UTC on `voyager2`. This records observed state, not plans.

## Repository and publishing

- Canonical remote: `https://github.com/stevewittek/netherwood-data-partners.git`.
  Local `main` was rebased onto `origin/main` commit `620d444` before this work
  and the complete reviewed Voyager/RAG increment through `2f8b09b` was pushed
  to `origin/main` on 2026-08-23. GitHub Pages workflow run `32645940189`
  completed successfully for that commit.
- GitHub Pages remains a static build. `pages-site/` reuses the public app and
  `.github/workflows/deploy-pages.yml` publishes `pages-dist`. The optional chat
  widget is omitted unless `VOYAGER_API_URL` is explicitly supplied at build
  time, so Pages does not depend on Voyager, SQL Server, Docker, Ollama, or home
  Internet.
- The live domain returned HTTP 200 after the deployment with a
  `2026-08-23 14:36:55 UTC` modification time and the expected site title. The
  public HTML does not contain the chat widget because the GitHub
  `VOYAGER_API_URL` variable remains unset. Voyager and Ollama were not exposed.
- Host Node remains 18.19.1 and was not changed. Development and verification
  use pinned Node 22.13.1 containers.

## Host and private services

- Host: Lenovo ThinkPad T460s, Ubuntu 24.04.4 LTS, 7.5 GiB RAM plus 4 GiB swap,
  Intel i5-6300U CPU, no usable discrete GPU.
- SQL Server 2025 is enabled and active at build `17.0.4075.5`, Enterprise
  Developer Edition. `NDP_Web` data remains at
  `/var/opt/mssql/data/NDP_Web.mdf` and log data at
  `/var/opt/mssql/logdata/NDP_Web_log.ldf`.
- SQL still listens more broadly than loopback at TCP 1433/1434. Firewall state
  is not verified without privilege. No firewall, router, DNS, tunnel, or SQL
  listener setting was changed in this work; public Voyager exposure remains
  prohibited until that posture is separately reviewed.
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
- Live verification reports 16 required tables, five knowledge procedures,
  five retention policies, and exact approved MDF/LDF paths. Existing visitor,
  chat, telemetry, leads, IP hashing, retention, parameterized SQL, and safe-log
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
  behavior. The pinned backend image passed 30 Node tests, strict TypeScript
  checking, and npm audit with zero known vulnerabilities.
- Compose is healthy; `/health` and the Ollama version endpoint succeed locally.
  Re-ingestion is idempotent and the real local cited RAG check passed.
- Root ESLint, the static Pages build, and the Vinext build passed under Node
  22.13.1 with pinned pnpm 11.19.0. `git diff --check` passed. A tracked-content
  secret scan found no API token or password; the ignored local environment
  files remain owner-only at mode `0600`. Container inspection reconfirmed
  loopback host networking, read-only roots, all capabilities dropped,
  `no-new-privileges`, and automatic restart policies. All checks passed before
  deployment. No secret, credential, public tunnel, router, firewall, or DNS
  setting was added by the deployment.

## Before connecting the public website

1. Resolve and verify SQL Server network exposure and an approved tunnel policy;
   do not use router port forwarding or expose Ollama/SQL directly.
2. Load-test the new single-flight behavior and `qwen3:4b` on this CPU-only host
   under realistic traffic. Decide whether its roughly two-minute response time
   is acceptable, then add operational monitoring and a scheduling policy for
   knowledge ingestion.
3. Review and approve the production knowledge corpus and every structured SQL
   record. Keep internal documents outside the approved root and visibility
   flag.
4. Establish/test database and Ollama-volume backup/restore plus retention
   operations. Disable the temporary SQL setup login and remove the ignored
   setup credential when schema work is complete.
5. Only after local security review, set the static build's `VOYAGER_API_URL`
   to an approved HTTPS endpoint and test backend-down behavior. It remains
   unset now.
