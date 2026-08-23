# Project state

Last verified: 2026-08-23 UTC on `voyager2`. This records observed state, not plans.

## Repository and publishing

- Canonical remote: `https://github.com/stevewittek/netherwood-data-partners.git`. Local `main` contains three reviewed backend/SQL commits after `origin/main` at `fadd5b6`; `git pull --ff-only origin main` reported already up to date before the current edits.
- The SQL setup and documentation are committed locally. A push was attempted and failed before upload because neither Git HTTPS credentials nor a GitHub CLI login is available on `voyager2`; the remote and live Pages deployment therefore remain unchanged.
- `pages-site/` reuses `app/page.tsx` and `app/globals.css`. GitHub Actions uses Node 22/pnpm to build `pages-dist` and publish GitHub Pages on every `main` push; `public/CNAME` defines the domain.
- The public source contains a pending, uncommitted chat-widget change. It has not been pushed or deployed. The workflow and domain were not changed. Root requires Node >=22.13; host Node 18.19.1 was not upgraded.
- A live HTTPS check returned HTTP 200 from GitHub Pages with the expected title, brand, and contact email in the deployed bundle. The pending `Ask Netherwood` widget text is not in the live bundle, confirming that the current production site is still the prior static release.

## Host, storage, SQL, Docker

- Lenovo ThinkPad T460s; Ubuntu 24.04.4 LTS; x86-64; kernel 6.8.0-138-generic. Root is 100 GB ext4 with ~81 GB available.
- `/dev/sdb1`: 232.9 GB ext4 `MSSQL_DATA`, UUID `6f340668-122e-4f0a-906d-b43a1832a19a`, at `/var/opt/mssql/data`.
- `/dev/sdc1`: 186.3 GB ext4 `MSSQL_LOG`, UUID `11e23526-656d-45cd-884d-ddafddfbd251`, at `/var/opt/mssql/logdata`.
- Both are rw and persist in `/etc/fstab` by UUID with `nofail`/30-second timeout. Protected free space/ownership remain unverified. Nothing destructive was changed.
- SQL service is enabled/active. Packages: `mssql-server` 17.0.4075.5-1, `mssql-tools18` and `msodbcsql18` 18.6.2.1-1. Credential-free `sqlcmd` failed for lack of Kerberos credentials, so `@@VERSION`, edition, databases, defaults, and `sys.master_files` remain unverified. No DB/login/config was changed.
- SQL listens on all IPv4/IPv6 interfaces at TCP 1433/1434 plus loopback 1431. UFW/nftables and protected `mssql.conf` were inaccessible without privilege, so public reachability is **not verified** and conflicts with the desired posture unless reliably filtered.
- Docker 29.7.2 is enabled/active, overlayfs at `/var/lib/docker`. A disposable SQL validation container was run on tmpfs and removed; Docker now has zero containers and zero volumes. The pinned `mcr.microsoft.com/mssql/server:2025-CU8-ubuntu-24.04` validation image remains cached (2.41 GB) alongside the existing Node/backend images.

## Phase 1 application

- Permanent constraints and architecture are documented.
- `backend/` contains a dependency-free TypeScript health API, pinned Node 22.13.1 Dockerfile, loopback-only Compose mapping, tests, and placeholder config. Its committed Phase 1 verification is recorded below.
- Pending, uncommitted source adds guarded chat/telemetry/lead HTTP contracts and a progressively enhanced static-site widget. That increment has not been fully tested or deployed; no tunnel or DNS integration exists.

## SQL database preparation

- Pending SQL artifacts define a read-only server preflight, explicit/idempotent `NDP_Web` creation, migration ledger, 13-table initial `web` schema, five documented retention policies, dedicated `ndp_web_app` login, and explicit `web_runtime` grants/denials.
- `backend/scripts/setup-sql-server.sh` refuses `sa`, validates the local endpoint, requires an exact apply confirmation, keeps both credentials out of command arguments, and performs separate administrator and runtime-login verification.
- The migration covers Visitors, VisitorSessions, PageViews, ChatSessions, ChatMessages, Contacts, Leads, BlogPosts, BlogImages, ApplicationConfiguration, DataRetentionPolicies, AuditLog, and SchemaMigrations with UTC timestamps, keys, constraints, and indexes.
- The live read-only SQL preflight has **not** run because no authorized non-`sa` setup credential is available in the process environment. Consequently the instance-reported DATA/LOG defaults and whether `NDP_Web` already exists remain unverified, and no database, login, user, or server configuration was created or changed.

## Conflicts/blockers and next actions

1. Host Node is old: use the container, preserve host packages.
2. SQL listens broadly: perform authorized firewall/reachability review; remediation requires approval.
3. SQL setup access and protected mount free space/permissions are unavailable. Supply an authorized non-`sa` setup principal, run the documented read-only preflight, and review its output before setting the explicit apply confirmation. Never guess credentials or create `NDP_Web` before the preflight passes.
4. The OpenAI-backed chat increment is paused until the operator chooses whether to reuse the detected ignored `OPENAI_API_KEY` or create a new key. Do not make a paid request or deploy the widget before that decision and local verification.
5. GitHub deployment requires an authenticated user session on this host. Do not place a GitHub token in the repository or command history.
6. Do not expose Voyager publicly until local chat protections, database behavior, backend-down behavior, and network controls are verified.

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
- `backend/.env.local` remains ignored and untracked. Its secret values were not printed or used.
- The complete workflow was then tested against an isolated Microsoft SQL Server 2025 CU8 container reporting the same `17.0.4075.5` engine build as the installed host package. The container published only `127.0.0.1:11433`, stored all SQL files on a 2 GB tmpfs, and used no bind mount or Docker volume.
- The live test proved new-database creation at `/var/opt/mssql/data/NDP_Web.mdf` and `/var/opt/mssql/logdata/NDP_Web_log.ldf`, all 13 tables, five retention policies, the migration ledger, dedicated login/role, a second idempotent apply, and standalone verification.
- Runtime inserts across visitor, session, page-view, chat, contact, lead, and audit tables succeeded inside a transaction and were rolled back. Actual reads of blog/configuration data and a visitor delete were denied as required.
- A deliberately added database file outside the approved directories caused preflight to fail. The test container and its tmpfs database were then removed; zero Docker volumes remain. This validates the scripts, not the untouched host SQL instance.
