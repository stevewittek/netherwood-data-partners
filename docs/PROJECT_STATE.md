# Project state

Last verified: 2026-08-23 UTC on `voyager2`. This records observed state, not plans.

## Repository and publishing

- Canonical remote: `https://github.com/stevewittek/netherwood-data-partners.git`; clean `main` at `fadd5b6` was synchronized before edits.
- `pages-site/` reuses `app/page.tsx` and `app/globals.css`. GitHub Actions uses Node 22/pnpm to build `pages-dist` and publish GitHub Pages on every `main` push; `public/CNAME` defines the domain.
- No public source/workflow/domain was changed. Root requires Node >=22.13; host Node 18.19.1 was not upgraded.

## Host, storage, SQL, Docker

- Lenovo ThinkPad T460s; Ubuntu 24.04.4 LTS; x86-64; kernel 6.8.0-138-generic. Root is 100 GB ext4 with ~81 GB available.
- `/dev/sdb1`: 232.9 GB ext4 `MSSQL_DATA`, UUID `6f340668-122e-4f0a-906d-b43a1832a19a`, at `/var/opt/mssql/data`.
- `/dev/sdc1`: 186.3 GB ext4 `MSSQL_LOG`, UUID `11e23526-656d-45cd-884d-ddafddfbd251`, at `/var/opt/mssql/logdata`.
- Both are rw and persist in `/etc/fstab` by UUID with `nofail`/30-second timeout. Protected free space/ownership remain unverified. Nothing destructive was changed.
- SQL service is enabled/active. Packages: `mssql-server` 17.0.4075.5-1, `mssql-tools18` and `msodbcsql18` 18.6.2.1-1. Credential-free `sqlcmd` failed for lack of Kerberos credentials, so `@@VERSION`, edition, databases, defaults, and `sys.master_files` remain unverified. No DB/login/config was changed.
- SQL listens on all IPv4/IPv6 interfaces at TCP 1433/1434 plus loopback 1431. UFW/nftables and protected `mssql.conf` were inaccessible without privilege, so public reachability is **not verified** and conflicts with the desired posture unless reliably filtered.
- Docker 29.7.2 is enabled/active, overlayfs at `/var/lib/docker`; initial inspection found zero containers and one image. No volume was altered.

## Phase 1 application

- Permanent constraints and architecture are documented.
- `backend/` now contains a dependency-free TypeScript health API, pinned Node 22.13.1 Dockerfile, loopback-only Compose mapping, tests, and placeholder config. Verification result must be updated after running it.
- No SQL, AI, telemetry, widget, tunnel, or DNS integration exists.

## Conflicts/blockers and next actions

1. Host Node is old: use the container, preserve host packages.
2. SQL listens broadly: perform authorized firewall/reachability review; remediation requires approval.
3. SQL admin access/config and protected mount free space/permissions are unavailable. Never guess credentials or create `NDP_Web` yet.
4. Verify containerized `/health`; then obtain approved read-only privilege/admin SQL access and review migrations/login design. Do not expose publicly until local chat protections work.

## Phase 1 verification result

- Built successfully from `backend/Dockerfile` using the pinned `node:22.13.1-bookworm-slim` image.
- Two Node test-runner tests passed inside Node 22: `GET /health` returned 200/`{"status":"ok"}` with no-store caching, and an unknown route returned JSON 404.
- Compose started the API as a non-root, read-only container and reported it healthy.
- Host publication was verified as `127.0.0.1:3000->3000/tcp`; `ss` showed only `127.0.0.1:3000`, not wildcard port 3000.
- A live local request returned `{"status":"ok"}`. The temporary container/network were then cleanly removed. Local image cache remains; no volume was created.
