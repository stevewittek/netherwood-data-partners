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
6. Later add authenticated rich content/image authoring and export published articles into the static workflow.

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

## AI providers

Voyager keeps one browser contract while selecting the server-side provider
with `AI_PROVIDER`:

- `openai` uses `OPENAI_API_KEY` and `OPENAI_MODEL` with the Responses API.
- `github` uses `GITHUB_MODELS_TOKEN` and `GITHUB_MODELS_MODEL` with
  `https://models.github.ai/inference/chat/completions`.
- `ollama` uses `OLLAMA_BASE_URL` and `OLLAMA_MODEL` with the local
  OpenAI-compatible Chat Completions API. Ollama is optional and is never
  contacted unless explicitly selected.

Provider credentials stay in ignored `backend/.env.local`. Authentication,
rate-limit, timeout, malformed-response, and availability failures are reduced
to safe internal error categories; raw provider bodies and credentials are
never returned to the browser or written to logs.

GitHub's historical inference contract required a fine-grained personal access
token with the account permission **Models: Read-only** (`user_models=read`,
described by the inference endpoint as `models: read`). GitHub's current
documentation states that GitHub Models and its inference API were retired on
2026-07-30, so the provider remains implemented and mock-tested for the
requested contract but cannot be represented as a currently available service.

After placing an eligible token and model in `.env.local`, the isolated live
provider check is:

```bash
cd backend
docker compose up -d --build
docker compose exec -T api npm run verify:github
```
