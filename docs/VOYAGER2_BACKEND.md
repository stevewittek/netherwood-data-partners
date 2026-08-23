# Voyager 2 backend architecture

Voyager 2 is the optional private dynamic backend. The first production feature is chat; telemetry, leads, authoring, and customer systems follow.

```text
visitor -> GitHub Pages -> static site and published content
   +-- optional call --> secure tunnel -> Voyager API -> SQL Server / AI
          failure: widget degrades; static site remains usable
```

The browser uses timeouts and non-blocking fallback. No render/build depends on Voyager, SQL, Docker, tunnel, or AI. Preserve `app/`, `pages-site/`, and `.github/workflows/deploy-pages.yml`; isolate dynamic code in `backend/` and record reality in `docs/PROJECT_STATE.md`.

Use pinned Node 22 rather than changing host Node. Local Docker ports bind to `127.0.0.1`; router forwarding is prohibited. A reviewed outbound tunnel requires separate approval after local security/function verification.

`GET /health` returns minimal process readiness without leaking dependencies. The current pending API increment applies bounded validated schemas, parameterized SQL, restricted origins, rate controls, safe errors/logs, timeouts, and documented retention to chat, page-view, and voluntary lead writes.

On Voyager 2, Compose uses host networking only to reach the on-host SQL Server. The API process binds to `127.0.0.1`, publishes no Docker port, runs as the unprivileged Node user with all Linux capabilities dropped, and uses a read-only root filesystem. Do not change `HOST` to a wildcard address. Public access still requires a separately reviewed outbound tunnel; router port forwarding remains prohibited.

## Phases

1. Inventory/document; add non-root Dockerized Node 22 TypeScript API, `/health`, tests, graceful shutdown, and loopback binding.
2. With authorized SQL access verify version, databases, permissions, existing files, and exact paths. Only then create `NDP_Web` DATA in `/var/opt/mssql/data` and LOG in `/var/opt/mssql/logdata`, with migrations and a least-privileged login (never `sa`).
3. Add server-side AI, controlled prompts, persistence, voluntary lead capture, and privacy-compatible first-party telemetry using random IDs and short-lived/keyed-hash IP abuse signals.
4. Add static-site widget and verify backend-down behavior.
5. Review protections; separately authorize tunnel/DNS/network changes.
6. Articles CMS v1 adds authenticated HTML authoring, published reads, and a
   static snapshot export. Public Voyager exposure and automated export/deploy
   remain separately gated.

The dedicated ext4 mounts are intended for DATA and LOG, but capacity, access, SQL configuration, and existing files must be authorized and verified before database creation. Routine work must not alter disks, filesystems, mounts, or existing database files.

## SQL Server operator workflow

The checked-in SQL workflow is documented in
[`backend/sql/README.md`](../backend/sql/README.md). Run its read-only
`preflight` mode first with an authorized, one-time setup principal. It checks
the instance defaults and any existing `NDP_Web` file locations from inside SQL
Server. Only the separate `apply` mode can create the database or login, and it
requires both a new runtime password and the explicit confirmation value
`NDP_Web`.

The initial migration covers visitors/sessions/page views, chat, contacts and
leads, blog posts and image metadata, configuration, audit, and explicit data
retention policies. The `ndp_web_app` runtime identity has no authoring,
configuration, migration, or delete permissions. SQL setup credentials are
temporary shell inputs and must never be copied into the API environment.

## Local cited RAG

Voyager uses Ollama on the same host by default and keeps OpenAI as an optional
provider for future use. GitHub Models is not used. The browser contract remains
compatible: chat replies still include `message` and now also include the same
text as `answer` plus structured `sources` citations.

```dotenv
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:4b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
AI_TIMEOUT_MS=600000
CHAT_MAX_CONCURRENT=1
CHAT_BUSY_RETRY_AFTER_SECONDS=120
RAG_RESULT_LIMIT=2
RAG_MAX_DISTANCE=0.65
KNOWLEDGE_ROOT=/knowledge
```

`OPENAI_API_KEY` and `OPENAI_MODEL` remain supported only when
`AI_PROVIDER=openai`; no OpenAI key or billing is required for the default
configuration. Secrets stay in ignored `backend/.env.local` and are never sent
to the browser or logged.

Compose runs the official Ollama image with cloud access disabled, persistent
model storage, automatic container restart, and a loopback-only listener. It
does not publish an Internet-facing port. Install and verify the exact models:

```bash
cd backend
docker compose pull ollama
docker compose up -d ollama
docker compose exec -T ollama ollama pull qwen3:4b
docker compose exec -T ollama ollama pull nomic-embed-text
docker compose exec -T ollama ollama list
```

The application mounts only `company-knowledge/public` at `/knowledge` and
never scans outside `KNOWLEDGE_ROOT`. Supported files are `.txt`, `.md`,
`.html`, `.csv`, `.json`, `.pdf`, and `.docx`. Hidden entries, symlinks,
unsupported files, oversized files, and path traversal are rejected. Files can
provide a friendly title and optional public URL in Markdown-style frontmatter;
otherwise a document title or filename is used.

Run the idempotent scanner manually after approved content changes:

```bash
cd backend
docker compose exec -T api npm run knowledge:ingest
```

It hashes source files, skips unchanged content, re-embeds modifications, and
hides deleted sources. Structured database material is restricted to the
allowlisted `web.GetApprovedStructuredContent` procedure and records explicitly
marked `ChatbotVisible=1`. The runtime login cannot read or modify the knowledge
tables directly. Retrieval uses the fixed `web.SearchChatbotKnowledge`
procedure with exact cosine `VECTOR_DISTANCE` over `vector(768)` values; no
preview vector index is enabled and the model can never generate arbitrary SQL.

Perform one end-to-end local check with:

```bash
cd backend
docker compose exec -T api npm run verify:rag
```

The verifier asks “What database performance services do you offer?” and prints
only the final answer and approved citations. On the current CPU-only Voyager
host, `qwen3:4b` can take roughly two minutes for this bounded answer, so the
browser and API timeouts are deliberately longer than a cloud-provider timeout.

The public widget validates the structured citation payload and renders a
numbered list of approved source titles and links beneath the answer. It accepts
only relative site paths and HTTP(S) URLs. Because Ollama is configured for one
CPU generation at a time, Voyager also defaults to one active chat. Additional
chat requests receive a bounded `503 chat_busy` response with `Retry-After: 120`
before a chat record or model job is created; the widget preserves the question
and asks the visitor to retry in about two minutes. Tune these limits only after
measuring the production host rather than allowing Ollama's internal queue to
grow.
