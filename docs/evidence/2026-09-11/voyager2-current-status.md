# Captured Voyager 2 status

Source: Voyager 2 PROJECT_STATE.md captured 2026-09-11T03:26:27Z.
This is the backend operator's reported evidence; direct Mac live checks are
separately identified in PUBLICATION_VERIFICATION.md. Source hashes accompany it.

## 2026-09-11 article export and AI verification

- Live host `voyager2` and repository `/home/nasa/netherwood-data-partners`
  started from synchronized `main` at `b431beb`. The implementation is in local
  commits `9f9a4ca` and `417f2e8`, not pushed. Pre-existing local documentation
  edits were preserved. SQL Server `17.0.4075.5`, `NDP_Web`, the loopback API,
  and loopback Ollama were live; the repository SQL preflight/schema check and
  rollback-only article workflow passed. Shared QueryVault/CapLab and monitoring
  services were not restarted or changed.
- SQL and the API each return 10 published, due articles. The tracked static
  snapshot also has 10, but its export time remains
  `2026-08-24T02:11:34.373Z`. A full SQL/API/snapshot trace of
  `why-sql-server-databases-slow-down-over-time` matched its ID, slug, dates,
  6,061-byte HTML, and HTML/plain-text SHA-256 hashes exactly.
- The new candidate export detected one existing divergence: article
  `ac33f77f-3520-57a6-8456-9e1b4cbe7b7e` is titled `Azure SQL Migration Lesson`
  in SQL/API and `Azure SQL Migration Lessons` in the tracked/live Pages
  snapshot. Content, slug, tags, and dates match. The candidate was validated
  and built but was not promoted because the title choice is a publication
  approval, not a technical assumption.
- Database writes never reached Pages automatically because the site has no
  configured Voyager URL, the old exporter was manual, a Voyager worktree edit
  neither commits nor pushes GitHub, and the Pages workflow runs from GitHub on
  `main` pushes/manual dispatch. New native slug routes likewise require a
  snapshot build/deploy.
- A staged `netherwood.public-articles/v1` export now validates canonical public
  content, count, ordering, due dates, sanitized HTML, IDs/slugs, and a SHA-256
  content digest. It writes only an ignored candidate, reports additions/edits/
  removals/scheduled-due content, requires exact-digest approval, and runs an
  isolated full/Pages build before atomic promotion. Inactive user-systemd
  templates check every 15 minutes; no timer, GitHub credential, commit, push,
  or deployment was activated.
- Authoring remains disabled: neither the `ndp_article_author` server login/
  database user nor the three authoring environment settings exists; the
  procedure-only `web_article_author` role does exist and admin routes return
  `404`. Save Draft,
  Publish, future scheduling, Unpublish, Archive, delete boundaries, and public
  exclusion passed isolated API tests plus the live rollback-only SQL test.
- Article knowledge ingestion did not previously exist: the bounded SQL export
  returned 10 articles while zero article sources were indexed. The implemented
  reconciliation indexed all 10 through existing `ndp_web_app` procedures;
  a second pass reported all 10 unchanged. Tests prove edited hashes refresh and
  sources/chunks are hidden after unpublish/archive/future exclusion without
  affecting the five structured or two public-file sources.
- Real local RAG ranked the NOLOCK and Azure articles first. A cited NOLOCK
  answer took 143.8 seconds; Ollama used about 201% CPU and 3.07 GiB while the
  request container used about 43 MiB, and a simultaneous SQL-backed article
  read completed in 0.28 seconds. A source-text injection challenge took 176.1
  seconds and ignored the injected marker. With the former 0.65 distance an
  unsupported question took 119.2 seconds and cited irrelevant articles; the
  evidence-based 0.35 default returned the same question deterministically in
  1.54 seconds with no citations. The updated image passed 56 tests and strict
  type checking, but the running API was not restarted.
- Public chat is not ready: supported CPU answers still take 2.4-2.9 minutes,
  only one generation can run, the host has 7.5 GiB RAM and unstable attached
  storage history, and the refreshed image/threshold plus monitoring/load tests
  are not deployed. GitHub Pages and static articles remain independent.
