# Voyager 2 backend architecture

Voyager 2 is the optional private dynamic backend. The first production feature is chat; telemetry, leads, authoring, and customer systems follow.

```text
visitor -> GitHub Pages -> static site and published content
   +-- optional call --> secure tunnel -> Voyager API -> SQL Server / AI
          failure: widget degrades; static site remains usable
```

The browser uses timeouts and non-blocking fallback. No render/build depends on Voyager, SQL, Docker, tunnel, or AI. Preserve `app/`, `pages-site/`, and `.github/workflows/deploy-pages.yml`; isolate dynamic code in `backend/` and record reality in `docs/PROJECT_STATE.md`.

Use pinned Node 22 rather than changing host Node. Local Docker ports bind to `127.0.0.1`; router forwarding is prohibited. A reviewed outbound tunnel requires separate approval after local security/function verification.

`GET /health` returns minimal process readiness without leaking dependencies. Future writes require bounded validated schemas, parameterized SQL, restricted origins, rate controls, safe errors/logs, timeouts, and documented retention.

## Phases

1. Inventory/document; add non-root Dockerized Node 22 TypeScript API, `/health`, tests, graceful shutdown, and loopback binding.
2. With authorized SQL access verify version, databases, permissions, existing files, and exact paths. Only then create `NDP_Web` DATA in `/var/opt/mssql/data` and LOG in `/var/opt/mssql/logdata`, with migrations and a least-privileged login (never `sa`).
3. Add server-side AI, controlled prompts, persistence, voluntary lead capture, and privacy-compatible first-party telemetry using random IDs and short-lived/keyed-hash IP abuse signals.
4. Add static-site widget and verify backend-down behavior.
5. Review protections; separately authorize tunnel/DNS/network changes.
6. Later add authenticated rich content/image authoring and export published articles into the static workflow.

The dedicated ext4 mounts are intended for DATA and LOG, but capacity, access, SQL configuration, and existing files must be authorized and verified before database creation. Routine work must not alter disks, filesystems, mounts, or existing database files.
