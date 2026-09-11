# Voyager 1 website and publishing acceptance report

Executed: 2026-09-11 UTC from main at b431beb on Voyager 1.

This is retained historical acceptance evidence, not current production
verification. Later fixes and live-release results belong in
[PUBLICATION_VERIFICATION.md](PUBLICATION_VERIFICATION.md) and
[PROJECT_STATE.md](PROJECT_STATE.md).

## Scope, safety, and evidence

All production checks were read-only. Each browser capture used a new temporary
Edge profile. No article changed, no contact link was activated, no email was
sent, no credential was entered, and no external tracker was modified.
Mutation evidence came only from existing local fixtures and source inspection.

Evidence:

- Live HTTP checks returned 200 for Home, About, Articles, a direct article,
  private authoring, sitemap.xml, articles-sitemap.xml, and robots.txt.
- Live captures used 1440px desktop and approximately 400 CSS px narrow layouts.
  Evidence is under C:\Users\switt\.codex\visualizations\2026\09\11\01a08e66-cd2a-7c20-aa63-973f74ac1e19.
- Public responses observed Cache-Control: max-age=600.
- Root lint passed.
- Direct Vite Pages build and static artifact generation passed.
- Backend strict TypeScript checking passed.
- Backend tests: 48 passed; one Windows fixture setup failed because the OS
  denied symlink creation with EPERM.

## Passed

| Area | Result and evidence |
| --- | --- |
| Home - desktop/narrow | Branded header, hero, service/value content, and article link rendered in fresh sessions without clipping in the corrected narrow emulation. |
| About - desktop/narrow | Founder, experience, expertise, and contact CTA rendered; narrow layout stacked cleanly. |
| Articles - desktop/narrow | Listing rendered 10 published articles, featured item, search field, category select, dates, summaries, and links. |
| Direct article - desktop/narrow/fresh | /articles/why-sql-server-databases-slow-down-over-time/ returned 200 and rendered static content, metadata, tags, related notes, and CTA. |
| Contact presentation | Home has #contact and mailto:contact@netherwooddatapartners.com; About/article CTAs use the same address. There is no production contact form to submit. |
| Private authoring safe state | /admin/articles/ returned 200, has noindex/robots exclusion, and rendered Article publishing is not connected with no write endpoint exposed. |
| Backend-independent reading | Production has no configured Voyager API URL, yet Home, Articles, and the direct article rendered. This verifies current static-only outage behavior. |
| Published internal routes | All 13 URLs in the live main sitemap returned 200, including all 10 article details. |
| Static build completeness | Snapshot has 10 articles; build emitted 10 slug directories, 13 main-sitemap URLs, 11 article-sitemap URLs, robots.txt, and admin noindex. |
| Semantics/static accessibility | Source has labeled controls, semantic navigation/search/forms, aria-current, status/alert roles, reduced-motion, visible focus, and overflow handling; JSX accessibility lint passed. |
| Local API fixture mutations | Tests passed create/edit/save/publish/unpublish/archive/guarded-delete, public visibility, SQL-outage safe error, sanitization, slug normalization, rate limits, and disabled authoring. |
| Draft isolation at service layer | Implementation saves drafts separately and reports a live article unchanged; local article fixtures passed. |

## Failed / defects

| Priority | Defect | Evidence and impact |
| --- | --- | --- |
| P0 | Published articles are not ingested into AI knowledge | web.ListPublishedArticleKnowledge exists, but backend/src/ingest-knowledge.ts calls only file and approved-structured ingestion. AI cannot be accepted as current for new, corrected, or withdrawn articles. |
| P1 | No publication interval or active static-sync owner | Voyager publication and outage-snapshot deployment are separate manual paths; production has no API URL. No maximum interval is documented. |
| P1 | Withdrawal is incomplete at Voyager state change | Static-only production retains the snapshot, native page, and sitemap entry until reviewed export/build/push. Browser and CDN caches add delay; no evidence log exists. |
| P3 | One backend test is not portable to current Windows privileges | documents.test.ts failed creating its symlink fixture with EPERM before the rejection assertion. Voyager 1 result is 48/49. |

## Not tested

| Item | Reason / required evidence |
| --- | --- |
| Full keyboard traversal/focus order and keyboard-only filters | Windows computer-use failed before opening a window with apply deny-read ACLs/kernel exit. Source/lint do not replace real keyboard testing. |
| Search/category interactions | Controls rendered and code was reviewed, but interaction automation was unavailable. Query, combined filter, zero state, and clear action need a browser pass. |
| Draft isolation end to end | Local fixture passed; Voyager 2 staging authoring/public API was unavailable. |
| Publish new/edit within interval | Requires owner-defined interval, staging mutation, snapshot handoff, staging deploy, timestamps. |
| Scheduled visibility | Future-date SQL/rollback code exists but no staging clock-bound run occurred. |
| Complete withdrawal | Local API visibility passed only part. Static regeneration, cache aging, and AI removal require staging. |
| AI cites current approved article | Blocked by missing article ingestion and unavailable Voyager 2 runtime. |
| Configured-API outage after a successful fetch | Production is static-only. Test last-good cache and five-second timeout on staging. |
| Mail client launch | Intentionally not activated. The mailto target was source-verified only. |

## Paste-ready Voyager 2 and Mac handoff

    Netherwood article acceptance handoff - staging/local fixtures only

    Safety:
    - Do not use production content/database/token/Pages, contact forms, email,
      prospects, or external trackers.
    - Voyager 2 keeps SQL/API credentials. Send Mac/Voyager 1 only a sanitized
      snapshot and staging URLs/evidence.
    - Use an isolated staging database/API and disposable article slugs.

    Known blockers/defects:
    P0  Article AI ingestion is missing. ListPublishedArticleKnowledge exists,
        but knowledge:ingest processes only approved files and structured SQL.
    P1  No owner-approved publication interval or static export/deploy owner.
    P1  Unpublish/archive on Voyager 2 alone cannot remove static Pages copies.
    P3  Voyager 1 tests: 48/49; Windows denied the symlink fixture with EPERM.
        Rerun the full suite in the pinned Linux/Node 22 container.

    Voyager 1 baseline, 2026-09-11 UTC, main b431beb:
    - Live 200: /, /about/, /articles/, one direct article,
      /admin/articles/, /sitemap.xml, /articles-sitemap.xml, /robots.txt.
    - Static-only production rendered 10 articles in fresh desktop/narrow sessions.
    - Static build emitted 10 native slugs; main sitemap 13 URLs; article
      sitemap 11 URLs; admin noindex and robots exclusion present.
    - Root lint passed; backend typecheck passed; tests 48 pass / 1 fixture error.

    Before testing:
    1. Owner names publisher, verifier, AI curator, and maximum intervals:
       publish -> staging API; snapshot -> staging site; publish -> AI refresh.
    2. Voyager 2 provides staging API/admin configuration and rollback/reset.
    3. Mac provides a non-production Pages-equivalent URL using staging API.
    4. Record UTC times, commit/snapshot hashes, HTTP status/headers, screenshots,
       API payloads, sitemap excerpts, and AI source objects.

    A. Draft isolation
    - Create a staging-only published fixture; export/deploy baseline; save an
      edited draft without publishing.
    - PASS only if API, fresh browser, static page, sitemaps, and AI keep the
      prior approved text; desk shows unpublished changes.

    B. Publish new and edited content
    - Publish approved staging fixture and record T0.
    - Verify due API; export snapshot; build/deploy staging; record first-visible
      times in fresh and previously used sessions.
    - PASS only within owner-defined intervals with matching metadata/body.

    C. Scheduled publication
    - Publish staging fixture several minutes in the future using UTC.
    - Confirm absent before due from API/export/site/sitemaps/AI.
    - Confirm visible after due and documented export/deploy/AI steps.

    D. Unpublish/archive
    - Unpublish, then archive the staging fixture. Do not permanently delete evidence.
    - Confirm API absence; regenerate; confirm slug directory and both sitemap
      entries absent; deploy staging.
    - Check immediately, after 60 seconds, after at least 10 minutes, in fresh
      and used profiles. Record CDN headers/localStorage. Confirm AI absence.

    E. Backend outage
    - After successful staging API fetch, stop only staging API/SQL.
    - Confirm Home/About/Articles/static direct URLs remain readable; newest
      API-only data may use last-good/static fallback; rendering is not blocked.
    - Restart staging and verify recovery. Do not change firewall/DNS/router/tunnel.

    F. AI currency and citations
    - After implementing article ingestion, ask a question answerable only from
      the fixture. PASS only with supported answer and structured citation to
      current staging title/URL.
    - Correct and repeat; obsolete claim must disappear.
    - Withdraw and repeat; article must not be retrieved.

    G. Mac browser acceptance
    - Safari and Chrome; desktop and about 390px; fresh private/normal sessions.
    - Keyboard-only traverse header, search, category, article links, CTAs, and
      private desk. Record focus visibility/order and traps.
    - Test search, category, combined filters, zero state, clear filters, links,
      and direct article URLs with/without trailing slash.

    Return PASSED / FAILED / NOT TESTED with timestamps and P0-P3 defects.
    Reset only staging fixtures under the pre-approved rollback plan.
