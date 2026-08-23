# Netherwood Data Partners operating instructions

Applies repository-wide. Read this and `docs/PROJECT_STATE.md` before changes.

## Architecture and safety

- Preserve the GitHub Pages static build/publishing workflow. Voyager 2 is optional: the site, service pages, and published articles must work when Voyager, home Internet, Docker, SQL Server, tunnels, or AI are down.
- Dynamic UI must fail quietly and never block static rendering. Published blog content must export to static artifacts; SQL Server cannot be required to serve it.
- Inspect first and work incrementally. Never format/repartition disks, delete filesystems, change mounts, move/delete databases, overwrite data, or destroy Docker volumes without explicit approval.
- Stop before public exposure, router/DNS changes, destructive database work, credential decisions, or risks to the website/email. Never use router port forwarding. Do not expose TCP 1433 publicly.
- Keep SQL Server on-host absent a compelling reason. Do not casually change host packages; prefer pinned Node 22 containers.

## Secrets, privacy, and data

- Never commit `.env`, credentials, API/tunnel tokens, private keys, or private backups. Commit placeholder `.env.example` only. Browser code never receives AI/SQL secrets.
- Use a dedicated least-privileged SQL login, never `sa`, and parameterized SQL for all input.
- Collect only explainable first-party telemetry. No cross-site tracking, invasive fingerprinting, spyware, credential collection, or privacy bypass. Prefer short retention or a keyed hash over indefinite raw-IP retention.
- Before creating `NDP_Web`, verify DATA/LOG paths inside SQL Server. Use UTC, primary/foreign keys, constraints, indexes, migrations, and retention rules. Initial areas: Visitors, PageViews, ChatSessions, ChatMessages, Leads/Contacts, BlogPosts, BlogImages/media, and configuration/audit.

## Backend and workflow

- Keep the API under `backend/`. First add and locally verify Dockerized Node 22 `GET /health` on loopback.
- Before exposure add restricted CORS, rate/request-size limits, validation, abuse controls, safe logs, health, and timeouts. Then add SQL, server-side chat, telemetry, and a progressively enhanced widget; test with Voyager unavailable.
- Blog authoring comes later and must support title, slug, summary, Markdown/sanitized HTML, images/alt/captions, SEO, state, UTC timestamps, and static export.
- Before editing run `git status` and `git pull origin main`; preserve unrelated work. Make logical tested changes, review diffs/secrets, use logical commits, and update `docs/PROJECT_STATE.md` with actual verified state after meaningful work.
