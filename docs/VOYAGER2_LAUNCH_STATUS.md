# Voyager 2 launch status

Last verified: 2026-09-02 UTC
Repository baseline: `b431beb` (`main`, synchronized with `origin/main`)
Decision: **ready for the Friday static website launch; Voyager must remain an optional private backend.**

This report is intentionally scoped to the existing architecture. No new
architecture was added. The public site, published articles, and primary
contact path remain usable without Voyager 2, SQL Server, Docker, Ollama, a
tunnel, or the home Internet connection.

## BLOCKING

No launch-blocking defect was reproduced for the approved static GitHub Pages
launch.

The launch must stop if its scope changes in any of these ways:

- `VOYAGER_API_URL` is added to the GitHub Pages build. The repository currently
  has no Actions variables, and the deployed bundle has an empty API URL.
- The tracked article snapshot or generated native article routes are omitted
  from the Pages artifact.
- A credential, private endpoint, or private network address appears in the
  Pages artifact.
- The primary contact path is changed from the existing email link to a Voyager
  write endpoint.
- Voyager, Ollama, or SQL Server is made Internet-reachable as part of the
  website launch. No tunnel or router exposure is required for Friday.

If Voyager is made a serving dependency later, the backup isolation, restore
drill, edge-firewall verification, approved HTTPS ingress, and load-testing
items under **POST-LAUNCH** become prerequisites rather than follow-up work.

## READY

### Launch boundary and public behavior

- GitHub Pages remains the serving platform. The current CI and Pages workflows
  both completed successfully for `b431beb` on 2026-09-02.
- The live home, article index, and private-desk shell each returned HTTP 200
  from GitHub Pages during this audit.
- The Pages production build emitted the home page, about page, article index,
  private-desk shell, 10 native article routes, `404.html`, both sitemaps, and
  `robots.txt`.
- The built and deployed bundles contain all 10 tracked articles and no
  configured Voyager API URL. Existing content therefore renders from the
  static snapshot during a Voyager or SQL outage.
- The live SQL export contains the same 10 article payloads as the tracked
  snapshot. The only export differences are the derived `metaTitle` and
  `metaDescription` aliases; the source content and metadata match.
- If a live API is configured in the future, article reads use a five-second
  browser timeout and fall back to a last-good browser cache, then the tracked
  snapshot. The API also supplies `stale-if-error=86400` caching.
- The primary public contact action is still
  `mailto:contact@netherwooddatapartners.com`. The existing `/api/leads`
  capability is not used by the public site.
- The chat widget is absent when the API URL is unset. If enabled later, an API
  failure leaves static rendering intact and displays an email fallback.

### Publishing desk and article workflow

- The publishing-desk UI supports list, create, edit, preview, save draft,
  publish, unpublish, archive, and guarded delete operations.
- All publishing routes are server-side protected. They require both a separate
  article SQL identity and a bearer token; if either layer is absent the routes
  return `404`, not a partially enabled administration surface.
- Authoring is intentionally disabled on Voyager 2 today. The article SQL
  credential and bearer token are unset, a live admin request returned `404`,
  and the static desk reports that publishing is not connected.
- The automated API workflow tests passed for create/edit/publish, unchanged
  live content while edits remain drafts, unpublish/archive visibility,
  scheduled publication, duplicate slugs, authentication, sanitization, and
  guarded deletion.
- The rollback-only SQL integration test passed against `NDP_Web`, including
  draft exclusion, publish, public detail, future-date exclusion, unpublish,
  archive, delete, duplicate-slug handling, metadata, and injection-like text.
  The test left no integration records behind.
- Article HTML is allowlist-sanitized on input and again on database reads.
  Scripts, inline handlers/styles, embeds, forms, unsafe schemes,
  protocol-relative URLs, and unknown attributes are removed.
- Publishing a new SQL row does not by itself update the static website. The
  existing supported release procedure is: publish privately, run the
  one-shot `articles-export` Compose profile, review the snapshot diff, run the
  Pages build, and deploy the tracked snapshot. Until that happens, the prior
  static content remains available.

### SQL Server storage and permissions

- SQL Server is active and `NDP_Web` is `ONLINE` in `SIMPLE` recovery.
- The database data and log files are on their intended separate attached
  filesystems. SQL reported approximately 162 GiB free on the data volume and
  144 GiB free on the log volume during this audit.
- `DBCC CHECKDB (NDP_Web) WITH NO_INFOMSGS` completed cleanly.
- The database verification passed with all 8 recorded migrations, 17 required
  tables, 15 required stored procedures, 5 retention policies, required
  article indexes, and the 768-dimension knowledge vector column.
- The `ndp_web_app` runtime login verification passed. It has the required
  operational writes and fixed public article/knowledge procedures, but no
  direct article-table reads, article-authoring procedures, maintenance
  procedure, schema alteration, or configuration/migration reads.
- Article authoring uses a different procedure-only database role. No live
  author login exists yet, so runtime compromise cannot become article
  publication through the current SQL identity.
- Database adapters bind all values with typed SQL parameters. The article
  integration test also passed injection-like text as data.

### API and container security

- Current `main` defaults the API listener to loopback. Compose also sets the
  loopback host explicitly, and the live process is listening only on loopback.
  This closes the unsafe wildcard default that was fixed by `b431beb`.
- The API and Ollama Compose services are healthy. They use host networking only
  for private on-host dependencies and publish no Docker ports.
- The API image runs as the unprivileged Node user with a read-only root,
  dropped capabilities, `no-new-privileges`, bounded temporary storage, a
  health check, and an automatic restart policy.
- Admin authentication compares token hashes with a timing-safe comparison.
  Tokens are kept only in desk page memory and are not persisted by the UI.
- Safe errors expose an error code and request ID, not provider, SQL, stack, or
  credential details. Admin responses are marked `noindex, nofollow`.
- The live environment files are ignored by Git and owner-only (`0600`). A scan
  of tracked files found only credential generators, environment-variable
  references, placeholders, and explicit test values--not deployable secrets.
- A scan of the built Pages artifact and the current deployed HTML/JavaScript
  found no credential material, localhost/private hostname, loopback address,
  or private network address. The repository's GitHub Actions variable list is
  empty.

### CORS, validation, and request limits

- CORS uses an exact origin allowlist. No wildcard or reflected arbitrary
  origin is present. The live default allows the local development origin and
  rejected the production website origin with `403`, which is correct while
  public integration is disabled.
- Preflight permits only known routes and bounded methods/headers. Admin
  preflight is the only path that permits `Authorization`, `PUT`, and `DELETE`.
- Browser POST bodies default to 16 KiB. A live oversized request returned
  `413 payload_too_large`. Admin article bodies have a separate 600 KiB cap.
- Public article pages are limited to 50 rows per request; a live request for 51
  returned `400 invalid_query`. Slugs, UUIDs, search, tags, dates, email, paths,
  and field lengths are validated before use.
- Default per-source limits are 30 browser writes, 120 public article reads,
  and 10 admin requests per minute. Separate-rate-limit tests returned `429`
  with `Retry-After` as expected.
- Model generation is single-flight by default. Excess chat work returns
  `503 chat_busy` with a retry hint before it is queued or stored.
- SQL connection and request timeouts, API header/keep-alive limits, browser
  fetch timeouts, and a 100-request socket cap are configured.

### Test and build evidence

The following passed from a clean dependency installation under Node 22.13.1
after synchronizing current `main`:

- `pnpm install --frozen-lockfile`
- `pnpm run lint`
- `pnpm run test` (the Vinext production build)
- `pnpm run build:pages`
- `backend: npm ci`
- `backend: npm test` -- 49 passed, 0 failed
- `backend: npm run typecheck`
- `backend: npm audit --audit-level=high` -- 0 known vulnerabilities
- the multi-stage production `backend/Dockerfile` build, which reran all 49
  tests and strict type checking inside the image build
- SQL preflight/schema verification, runtime-login verification,
  rollback-only migration validation, rollback-only publishing integration,
  and `DBCC CHECKDB`

The site validation container's bundled Corepack could not validate the current
pnpm signing key. The audit used the repository's exact pinned `pnpm@11.19.0`
through npm instead. This is a validation-tool bootstrap issue, not a project
build failure; the repository CI's pnpm setup also passed on current `main`.

### Uptime dependency map

| Capability | Required at request time | Failure behavior | Friday impact |
| --- | --- | --- | --- |
| Home, service, about, and existing article pages | DNS and GitHub Pages/CDN | Static deployment remains available independently of Voyager | Launch-serving path |
| Primary contact action | Static page, visitor email client, and mail provider | Visitor can still use the published address manually | No Voyager dependency |
| Existing published article content | Tracked snapshot in the Pages artifact | Continues serving the last deployed snapshot | No Voyager dependency |
| New article freshness on Pages | Publishing workflow, SQL, snapshot export, GitHub build/deploy | Existing snapshot remains; new content waits | Operational workflow, not uptime dependency |
| Publishing desk writes | Approved HTTPS ingress, Voyager API, SQL Server, author SQL login, bearer token | Desk is unavailable; public content is unchanged | Disabled; not a launch blocker |
| Live article API | Approved HTTPS ingress, Voyager API, SQL Server | Browser uses cache/snapshot; API returns a safe upstream error | Disabled; not a launch blocker |
| Chat | Approved HTTPS ingress, API, SQL Server, Ollama/model | Widget is absent or reports temporary unavailability | Disabled; not a launch blocker |
| Telemetry and lead API | Approved HTTPS ingress, API, SQL Server | Static page remains usable; public contact remains email | Unused by primary site |
| Database backups | SQL Server Agent, SQL Server, and attached backup filesystem | Recovery point stops advancing; public Pages content is unaffected | Backend durability only |

### Current backup and recovery procedure

Observed policy on 2026-09-02:

- user databases: full backup Sunday at 01:30 UTC;
- user databases: differential backup Monday through Saturday at 01:30 UTC;
- system databases: full backup daily at 00:30 UTC;
- compression, checksum, post-backup verification, table logging, and 336-hour
  cleanup are enabled for user database backups;
- user-database integrity check: Saturday at 03:15 UTC;
- maintenance health check: daily at 08:00 UTC;
- transaction-log backup job: disabled because `NDP_Web` uses `SIMPLE`
  recovery.

The 2026-08-30 full and 2026-09-02 differential for `NDP_Web` both passed
`RESTORE VERIFYONLY WITH CHECKSUM`. SQL backup metadata confirms that the
differential base matches the latest full. With the current schedule and
`SIMPLE` recovery, the provisional recovery-point exposure is up to roughly 24
hours. Recovery time has not been measured.

Daily operator check:

1. Confirm the latest SQL Agent backup and maintenance-health jobs succeeded.
2. Confirm a non-copy-only full exists within eight days and the latest
   scheduled differential job succeeded.
3. Confirm `NDP_Web` is online, no suspect pages are recorded, the last good
   integrity check is recent, and both database filesystems have at least the
   approved free-space floor.
4. Run `RESTORE VERIFYONLY WITH CHECKSUM` against the latest full and its latest
   matching differential when investigating any warning. Verification proves
   readability and checksums; it does not replace a restore drill.
5. If any check fails, do not publish new content. Preserve the last deployed
   static snapshot while the private backend is repaired.

Recovery sequence for loss of `NDP_Web`:

1. Keep the public website serving its last deployed static artifact. Do not
   repoint it to Voyager as a workaround.
2. Stop article writes and collect SQL/OS evidence before changing mounts,
   services, files, or volumes. Do not rerun database creation or migrations as
   a substitute for recovery.
3. Select the latest valid full backup and the latest valid differential whose
   base LSN matches that full. Copy both to an approved isolated restore target.
4. Restore the full with `NORECOVERY`, explicit `MOVE` destinations, and
   checksum validation; restore the matching differential with `RECOVERY` and
   checksum validation. Never overwrite the production database during a
   drill.
5. Run `DBCC CHECKDB`, confirm required article counts and publication states,
   and run the repository's database and least-privilege verification scripts
   against the recovered environment.
6. Reconnect the API only on loopback, verify `/health`, a public article list,
   public detail, CORS denial/allow rules, and admin-route state. Keep public
   integration disabled unless separately approved.
7. Export and deploy a new static snapshot only after the recovered database is
   accepted as authoritative. Record the achieved recovery point and elapsed
   recovery time.

## POST-LAUNCH

These capabilities and hardening items should remain after launch without
delaying Friday's static website:

1. **Run an isolated restore drill and define RPO/RTO.** The current backups are
   verified but have not been restored during this audit. Record restore time,
   validate content and permissions, and obtain an owner-approved recovery
   objective.
2. **Create an off-device backup copy.** Current `NDP_Web` backups are stored on
   the same physical volume role as the database log. Loss of that device can
   remove both the live log and the local backup chain. Use an approved
   encrypted destination and test restoration from that copy.
3. **Stabilize attached storage.** The earlier shared-enclosure disconnects make
   Voyager unsuitable as a public availability dependency even though current
   integrity and free-space checks pass.
4. **Re-verify the privileged network edge before any public ingress.** The API
   is loopback-only, but SQL Server has host-level wildcard listeners for its
   private network use. This audit account could not read the active firewall
   rules without sudo. An authorized operator must re-prove default-deny rules,
   the exact scoped exceptions, and absence of router forwarding before a
   tunnel or dynamic website connection is approved. SQL Server and Ollama must
   never be exposed directly.
5. **Enable the publishing desk only when operationally required.** Create the
   separate article SQL login and bearer token, approve exact CORS origins and
   HTTPS ingress, test the real authenticated desk end to end, and retain the
   server-side `404`-when-disabled behavior.
6. **Keep static export as the publication completion step.** Automating export
   and deployment may be useful later, but manual export/review/build is safer
   for launch and preserves the outage snapshot. Never make SQL availability a
   Pages build or render prerequisite.
7. **Retain but do not launch-block on chat, telemetry, leads, RAG, and knowledge
   ingestion.** These are optional backend capabilities. Load-test chat on the
   CPU-only host, review the public knowledge corpus, schedule ingestion, and
   approve retention/monitoring before public connection.
8. **Add actionable maintenance alerting.** SQL Agent backup, integrity, and
   health jobs are scheduled and succeeding, but failed-job notification and
   the previously prepared Database Mail configuration still need explicit
   operator approval and end-to-end testing.
9. **Export operational configuration.** Check the SQL Agent job definitions
   and restore procedure into reviewed operations documentation or scripts so
   rebuilding the server does not depend only on `msdb` history.
10. **Review rate limiting at the ingress boundary.** The in-process limiter is
    appropriate for the current single instance, but any future proxy/tunnel
    must preserve a trustworthy client identity or deliberately apply limits to
    the shared ingress address. Do not accept arbitrary forwarded-IP headers.

No application or architecture change was made by this audit because current
`main` reproduced no P0 problem after the loopback-default fix already present
in `b431beb`.
