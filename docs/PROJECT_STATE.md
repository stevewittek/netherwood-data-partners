# Project state

Last verified: 2026-08-23 UTC on `voyager2`. This records observed state, not plans.

## Repository and publishing

- Canonical remote: `https://github.com/stevewittek/netherwood-data-partners.git`. GitHub CLI authentication is active for `stevewittek`; reviewed backend/SQL commits through `078ac58` were pushed to `origin/main`. Local `main` additionally contains verified implementation commit `ee28753`, which is intentionally not pushed.
- GitHub Pages run `32638242752` completed successfully for `1d442d3`. The deployed domain returned HTTP 200 with a `2026-08-23 12:02:37 UTC` modification time after the release.
- `pages-site/` reuses `app/page.tsx` and `app/globals.css`. GitHub Actions uses Node 22/pnpm to build `pages-dist` and publish GitHub Pages on every `main` push; `public/CNAME` defines the domain.
- Local commit `ee28753` contains the guarded chat widget and API changes. It has not been pushed or deployed. The widget is omitted unless the static build receives an explicitly configured `VOYAGER_API_URL` repository variable. Root requires Node >=22.13; host Node 18.19.1 was not upgraded.
- A live HTTPS check found the expected title, brand, and contact email in the deployed bundle. The pending `Ask Netherwood` widget text is not present, confirming that unverified dynamic work was excluded from this deployment.

## Host, storage, SQL, Docker

- Lenovo ThinkPad T460s; Ubuntu 24.04.4 LTS; x86-64; kernel 6.8.0-138-generic. Root is 100 GB ext4 with ~81 GB available.
- `/dev/sdb1`: 232.9 GB ext4 `MSSQL_DATA`, UUID `6f340668-122e-4f0a-906d-b43a1832a19a`, at `/var/opt/mssql/data`.
- `/dev/sdc1`: 186.3 GB ext4 `MSSQL_LOG`, UUID `11e23526-656d-45cd-884d-ddafddfbd251`, at `/var/opt/mssql/logdata`.
- Both are rw and persist in `/etc/fstab` by UUID with `nofail`/30-second timeout. Protected free space/ownership remain unverified. Nothing destructive was changed.
- SQL service is enabled/active. Packages: `mssql-server` 17.0.4075.5-1, `mssql-tools18` and `msodbcsql18` 18.6.2.1-1. Authenticated preflight verified SQL Server `17.0.4075.5`, Enterprise Developer Edition, DATA default `/var/opt/mssql/data/`, LOG default `/var/opt/mssql/logdata/`, and the required setup permissions.
- SQL listens on all IPv4/IPv6 interfaces at TCP 1433/1434 plus loopback 1431. UFW/nftables and protected `mssql.conf` were inaccessible without privilege, so public reachability is **not verified** and conflicts with the desired posture unless reliably filtered.
- Docker 29.7.2 is enabled/active, overlayfs at `/var/lib/docker`. The Voyager API is running from the pinned Node 22.13.1 image with no volumes. It uses host networking so it can reach the local SQL listener, but the Node process itself binds only to `127.0.0.1:3000`; it runs as `node` with a read-only root filesystem, all Linux capabilities dropped, and `no-new-privileges`. The prior disposable SQL validation container is removed. The pinned SQL validation and Node/backend images remain cached.

## Phase 1 application

- Permanent constraints and architecture are documented.
- `backend/` contains a pinned Node 22.13.1 TypeScript API. Local commit `ee28753` adds guarded chat, page-view telemetry, and voluntary lead contracts; parameterized SQL persistence; a server-side Responses API client; strict configuration; and container build-time tests/type checks.
- The committed local static-site widget uses first-party random visitor/session/chat identifiers, a bounded browser timeout, and a quiet email fallback. It is build-time gated and remains absent when no approved API URL exists. No tunnel or DNS integration exists.

## SQL database preparation

- Committed and pushed SQL artifacts define a read-only server preflight, explicit/idempotent `NDP_Web` creation, ordered migration ledger, 13-table initial `web` schema, five enforced retention policies, dedicated `ndp_web_app` login, and explicit `web_runtime` grants/denials.
- `backend/scripts/setup-sql-server.sh` refuses `sa`, validates the local endpoint, requires an exact apply confirmation, keeps both credentials out of command arguments, and performs separate administrator and runtime-login verification.
- A new `ndp_web_app` runtime password was generated without display and stored with the SQL connection settings in ignored, untracked `backend/.env.local` at mode `0600`. A dedicated OpenAI project key replaced the prior local key through the encrypted Platform workflow, and a generated 256-bit `IP_ABUSE_HASH_SECRET` was added without display. The dedicated setup credential is temporarily stored as base64 fields in ignored, untracked `backend/.env.sql-setup` at mode `0600`; this is encoding, not encryption.
- The migration covers Visitors, VisitorSessions, PageViews, ChatSessions, ChatMessages, Contacts, Leads, BlogPosts, BlogImages, ApplicationConfiguration, DataRetentionPolicies, AuditLog, and SchemaMigrations with UTC timestamps, keys, constraints, and indexes.
- Live preflight passed, then the explicit apply created `NDP_Web` with `/var/opt/mssql/data/NDP_Web.mdf` and `/var/opt/mssql/logdata/NDP_Web_log.ldf`, applied migrations `001` and `002`, and created the dedicated `ndp_web_app` login/user in `web_runtime`. A second apply verified the existing-file and idempotent paths.

## Conflicts/blockers and next actions

1. Host Node is old: use the container, preserve host packages.
2. SQL listens broadly: perform authorized firewall/reachability review; remediation requires approval.
3. Keep the setup login enabled only while database-backed API development still needs migrations. After that work, disable it and remove `backend/.env.sql-setup`; retain the runtime credential only.
4. The dedicated OpenAI key is installed, but two minimal live Responses API checks returned HTTP 429 with `insufficient_quota`. Add API billing/credits or raise the relevant Platform spend limit, then repeat the live chat check. Chat is not ready for exposure until this passes.
5. Do not expose Voyager publicly until the OpenAI quota issue, live database write behavior, backend-down browser behavior, and network controls are verified. The GitHub `VOYAGER_API_URL` variable remains unset.

## Phase 1 verification result

- Built successfully from `backend/Dockerfile` using the pinned `node:22.13.1-bookworm-slim` image.
- Two Node test-runner tests passed inside Node 22: `GET /health` returned 200/`{"status":"ok"}` with no-store caching, and an unknown route returned JSON 404.
- Compose started the API as a non-root, read-only container and reported it healthy.
- Host publication was verified as `127.0.0.1:3000->3000/tcp`; `ss` showed only `127.0.0.1:3000`, not wildcard port 3000.
- A live local request returned `{"status":"ok"}`. The temporary container/network were then cleanly removed. Local image cache remains; no volume was created.

## SQL setup tooling verification result

- `shellcheck`, `bash -n`, and `git diff --check` pass for the setup increment.
- Inert-command gate tests verified successful preflight/apply control flow and verified refusal of `sa`, an invalid port, a short runtime password, and an incorrect apply confirmation. These tests do not claim live T-SQL execution.
- The migration inventory contains all 13 expected tables; placeholder/secret review found no key or password value in the SQL scripts or documentation.
- `backend/.env.local` remains ignored, untracked, and owner-only. It now contains the preserved OpenAI key plus the generated `ndp_web_app` connection settings; secret values were not printed.
- The complete workflow was then tested against an isolated Microsoft SQL Server 2025 CU8 container reporting the same `17.0.4075.5` engine build as the installed host package. The container published only `127.0.0.1:11433`, stored all SQL files on a 2 GB tmpfs, and used no bind mount or Docker volume.
- The live test proved new-database creation at `/var/opt/mssql/data/NDP_Web.mdf` and `/var/opt/mssql/logdata/NDP_Web_log.ldf`, all 13 tables, five retention policies, the migration ledger, dedicated login/role, a second idempotent apply, and standalone verification.
- Runtime inserts across visitor, session, page-view, chat, contact, lead, and audit tables succeeded inside a transaction and were rolled back. Actual reads of blog/configuration data and a visitor delete were denied as required.
- A deliberately added database file outside the approved directories caused preflight to fail. The test container and its tmpfs database were then removed; zero Docker volumes remain. This validates the scripts, not the untouched host SQL instance.
- A second ordered migration adds the bounded `web.PurgeExpiredData` procedure and a login-free `web_maintenance` role. Live testing removed one complete expired visitor/session/page-view/chat/contact/lead/audit graph, reported one affected row in every category, and confirmed that `ndp_web_app` cannot execute maintenance. No maintenance credential or schedule was created.

## Host SQL deployment verification result

- Read-only preflight reported `new_database_ready`, exact approved DATA/LOG defaults, and both required setup permissions before creation.
- Apply created and verified `NDP_Web`, 13 required tables, five retention policies, two migration records, `web_runtime`, `web_maintenance`, and the `ndp_web_app` server/database identity.
- A second complete apply reported the approved existing MDF/LDF paths and succeeded without changing migration timestamps.
- A real `ndp_web_app` connection inserted visitor, session, page-view, chat, contact, lead, and audit rows inside a transaction; the transaction was rolled back and its visitor marker was confirmed absent.
- Direct runtime attempts to read blog/configuration data, delete visitor data, and execute retention maintenance were all denied. No test data was retained.

## Local chat/API verification result

- A dedicated OpenAI API key and a separate keyed-IP HMAC secret are present only in ignored `backend/.env.local`; the file remains mode `0600`, and neither value was printed.
- The backend now uses `mssql` 12.7.0 with parameterized requests and bounded transactions. It persists anonymous visitors/sessions/page views, chat sessions/messages, contacts, and voluntary leads through the existing least-privileged `ndp_web_app` grants. Session ownership mismatches are rejected in SQL before writes.
- The API enforces exact JSON content types, a 16 KiB body default, UUID and field bounds, approved origins, preflight restrictions, a 30-request/minute in-memory source limit, safe error bodies/logs, a 35-second server request timeout, and 25-second OpenAI timeout. Raw IP addresses are not stored; only a seven-day keyed SHA-256 abuse hash is prepared when the local secret exists.
- The Responses API request uses `gpt-5.4-mini`, controlled instructions, a 500-token ceiling, an opaque safety identifier, and `store: false`. Official OpenAI documentation was checked for the current request contract and model endpoint support.
- The pinned container build passed 12 Node tests and strict TypeScript checking; npm reported zero known package vulnerabilities. Root ESLint, the GitHub Pages Vite build, the Vinext build, and a separate widget-enabled Vite build all passed under Node 22.13.1/pnpm 11.19.0.
- Compose is healthy and the host returns `GET /health` from `127.0.0.1:3000`. A read-only SQL ping from the running container succeeded against `NDP_Web` with the runtime identity. No API integration test inserted live database rows.
- A deliberately unapproved browser origin returned HTTP 403. With no API URL configured, the static Pages build completes independently; with a temporary loopback URL, the widget-enabled build also completes.
- Live OpenAI verification reached the service but returned `insufficient_quota`. No public API URL, tunnel, router, DNS, or GitHub environment-variable change was made, and local commit `ee28753` has not been pushed or deployed.
