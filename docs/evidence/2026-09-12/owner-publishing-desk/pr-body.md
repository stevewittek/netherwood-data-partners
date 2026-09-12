### Summary of Implementation & Iteration

This PR implements the **private owner article publishing desk** for Netherwood Data Partners, enabling Steve to manage SQL-backed articles from Mac and Windows workstations over an approved private Voyager 2 connection without hardcoding credentials, bundling secrets in public builds, or exposing public admin endpoints.

#### 1. Private Browser-Access & Session Management
- **In-Memory Credential Workflow**: When loading the desk, if `VITE_VOYAGER_API_URL` is omitted from static builds, the login screen allows entering the private Voyager endpoint (e.g. `http://127.0.0.1:3000` forwarded via SSH tunnel or private LAN interface). Credentials (`ARTICLE_ADMIN_TOKEN`) and API URLs are held exclusively in React state during active browser sessions and are never stored in `localStorage`, `sessionStorage`, cookies, public bundles, URLs, or logs.
- **Lock Desk & Logout**: Clears tokens, draft buffers, and sensitive memory state upon exit, prompting if unsaved edits are present.

#### 2. Full Article Lifecycle & Draft Staging
- **Draft Creation & Editing**: Create new drafts or edit existing SQL rows. Saving an edit to a published article stages changes to `web.ArticleDrafts` in SQL without modifying the live website until published (`hasUnpublishedChanges` badge displayed).
- **Authoritative Status & Pipeline Clarity**: Clear status badges distinguish:
  - `Draft in SQL`: Saved in SQL; not published to website (or `Removal pending` if present in old snapshot).
  - `Scheduled in SQL`: Future-dated UTC release; remains out of public API/snapshots until due.
  - `Published in SQL; update pending on website`: Published in SQL database; queued for the next 15-minute export cycle.
  - `Current version confirmed on website`: Authoritatively verified matching both release manifest and public snapshot modified timestamp.
  - `Published in SQL (Not verified on website)` / `(Website release mismatch)`: Honestly reported when deployment manifest evidence cannot be confirmed.
- **Server-Sanitized Previews**: Calls `POST /api/admin/articles/preview` to render server-sanitized HTML preview stripped of scripts, styles, iframes, inline event handlers, and unsafe protocols.
- **Timezone & Scheduling Support**: Datetime inputs explicitly display and format UTC timestamps with real-time UTC interpretation preview to eliminate scheduling confusion.
- **Publish / Unpublish / Archive / Delete**: Implements explicit confirmation gates for destructive operations (unpublish, archive, delete, discard). Guarded deletion enforces that articles must be unpublished before deletion.

#### 3. Error Recovery & Unsaved Work Protection
- **Preserved Drafts During Outages**: If backend outages (502/503/504), network errors, or validation issues occur, editor contents are preserved rather than reset, allowing retry once the service recovers.
- **Inline Re-Authentication**: If a 401 Unauthorized occurs mid-edit, an inline re-auth banner allows entering credentials to resume without discarding in-progress writing.
- **Tab/Window Close Warnings**: Prevents accidental loss of unsaved changes via `beforeunload` tracking.

#### 4. Verification & Testing
- Added unit and regression tests in `test/admin-publishing-desk.test.ts` (slug normalization, UTC formatting, HTML sanitization safety, public bundle secret scans, same-slug edit pending, withdrawal pending, manifest mismatch, unverified states, and complete authenticated API lifecycle).
- Verified with full test suite:
  - Check 1: ESLint (0 errors, 0 warnings)
  - Check 2: Root TypeScript (`tsc -p tsconfig.json --noEmit`, 0 errors)
  - Check 3: Backend TypeScript (`tsc -p backend/tsconfig.json --noEmit`, 0 errors)
  - Check 4: Publication snapshot validation (`scripts/prepare-publication.ts`, 10 articles valid)
  - Check 5: Publication & Admin tests (18/18 tests passing)
  - Check 6: Publication pipeline tests (3/3 tests passing)
  - Check 7: Backend tests (59 passed, 1 skipped Windows symlink test)
  - Check 8: Static pages build (Vite + static generator clean)
  - Check 9: Git diff check (`git diff --check`, clean)

#### 5. Verification Status & Remaining Steps
- **Unit & Mocked Verification**: Complete and passing.
- **Real Private Connection Verification**: Pending integration test against running Voyager 2 instance over `nasa@192.168.1.206` SSH port-forwarding / private network interface before production merge.
- **Controlled Owner Publication Test**: Ready to perform using the documented synthetic test article flow.
