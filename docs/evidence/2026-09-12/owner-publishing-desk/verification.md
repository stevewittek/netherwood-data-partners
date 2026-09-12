# Owner Publishing Desk: Verification & Access Evidence

**Date:** September 12, 2026  
**Scope:** Browser-accessible private article publishing desk for Netherwood Data Partners.  
**Branch:** `feat/owner-publishing-desk`  
**PR:** [#8](https://github.com/stevewittek/netherwood-data-partners/pull/8)

---

## 1. Implemented Capabilities and Behavior

1. **Private Browser Access Workflow & Credential Hygiene**:
   - `app/admin/ArticlesAdmin.tsx` provides in-browser private endpoint configuration (`apiUrl`) and memory-only token storage.
   - When loading the desk, credentials (`ARTICLE_ADMIN_TOKEN`) are held strictly in React component state.
   - Zero tokens, passwords, or secrets are written to `localStorage`, `sessionStorage`, cookies, URL parameters, logs, or static distribution bundles.
   - "Lock desk" button securely wipes the token and draft state from component memory.

2. **Full Article Authoring & Lifecycle in SQL**:
   - Create new drafts, edit drafts, update metadata (title, category, tags, author, SEO title/description, hero image).
   - Staging isolation: Editing an already-published article writes changes to `web.ArticleDrafts` in SQL without changing the live row (`hasUnpublishedChanges: true` banner displayed).
   - Server-sanitized preview (`POST /api/admin/articles/preview`) tests the exact sanitization applied by Voyager backend.
   - Timezone & Scheduling: UTC datetime input parsing/formatting with real-time interpretation preview. Future-dated articles are marked as `Scheduled` and kept out of public reads until due.
   - Publish, Unpublish, Archive, and guarded Delete (articles must be unpublished before deletion). Destructive action confirmation dialogs prevent accidental data loss.

3. **Publication-Status Accuracy & Honest Reporting**:
   - Clearly distinguishes SQL state, the current SQL-published version, staged draft changes, and the validated deployed website snapshot.
   - A successful website status requires the same article ID and equality across every public field, including full HTML and plain text, between a fresh SQL public-detail response and the deployed snapshot. Slug presence and modified timestamps are never treated as version proof.
   - The browser recomputes the snapshot SHA-256 content digest and requires matching manifest/snapshot format, digest, count, and generation time. It also reads the manifest before and after the snapshot so a deployment transition produces uncertainty rather than success.
   - A draft, archive, or newly scheduled version remains `Withdrawal pending on website` while that article ID is still in the validated deployed snapshot. Missing, malformed, internally inconsistent, or unavailable evidence reports that the current version is not verified.

4. **Error Recovery & Unsaved Work Protection**:
   - In-progress edits are preserved during 502/503/504 backend downtime, network disruptions, or validation errors.
   - Inline re-authentication prompt appears if a 401 Unauthorized occurs, allowing token re-entry without discarding edits.
   - `beforeunload` listener warns the user if attempting to close the browser tab with unsaved edits.

---

## 2. Real vs. Mocked Connection & Browser Testing Status

- **Automated Mocked Test Status**: **Verified (Passing)**. All 14 unit and lifecycle tests in `test/admin-publishing-desk.test.ts` pass. The combined publication command passes 22 TypeScript tests plus 3 pipeline tests, and the backend suite passes 60 tests with zero skips. Coverage includes:
  - Unauthenticated access rejection (401).
  - Draft isolation (drafts remain absent from public endpoints).
  - Preview HTML sanitization (stripping scripts, iframes, inline event handlers).
  - Explicit UTC scheduling logic.
  - Publish, unpublish, archive, and guarded delete flows.
  - Full content/version matching, including a same-slug and same-timestamp content edit that must remain pending.
  - Separate staged-draft handling, withdrawal pending, manifest/snapshot/digest mismatch, and unverified states.
  - Credential leak prevention across generated distribution artifacts.
- **Static Build Status**: **Verified (Passing)**. The Vinext production build and static Pages build complete, and the static release checker validates 13 public routes and the ten-article digest. This proves build and generated-artifact behavior only.
- **Rendered Browser UI Testing**: **Pending**. No rendered-browser interaction, layout, or hydration acceptance was performed for these exact changes. A passing static build is not browser-test evidence.
- **Real Private Connection Status**: **Pending Live Integration Verification**. Direct connection from Steve's browser to the running Voyager 2 instance requires the approved SSH tunnel (`nasa@192.168.1.206`) or an approved private network endpoint. Live acceptance testing against production SQL on Voyager 2 is scheduled as the final integration gate prior to merge.

---

## 3. Workstation Access Instructions

### Windows Access Setup (via SSH Local Port Forwarding)
1. Open PowerShell on Windows and forward local port `3000` to Voyager 2's loopback authoring API:
   ```powershell
   ssh -N -L 3000:127.0.0.1:3000 nasa@192.168.1.206
   ```
2. Open your browser to the article desk:
   - Local preview server: `http://127.0.0.1:4175/admin/articles`
   - Production static shell: `https://netherwooddatapartners.com/admin/articles`
3. On the login screen:
   - **Voyager API Endpoint**: Enter `http://127.0.0.1:3000` (forwarded via the SSH tunnel to Voyager 2). Note: When accessing from `https://netherwooddatapartners.com`, modern browsers may block requests from HTTPS to an HTTP loopback endpoint due to mixed content restrictions; using the local preview URL or an HTTPS private tunnel avoids mixed content warnings.
   - **Publishing Credential**: Enter the `ARTICLE_ADMIN_TOKEN` value from Voyager 2's `backend/.env.local` (never copy this secret to disk on Windows or commit to source control).
4. Click **Open article desk**.
5. When finished, click **Lock desk** and close the SSH session (`Ctrl+C`).

### macOS Access Setup
1. In Terminal on macOS:
   ```bash
   ssh -N -L 3000:127.0.0.1:3000 nasa@192.168.1.206
   ```
2. Open Safari/Chrome to `/admin/articles`.
3. Enter `http://127.0.0.1:3000` as the API URL and provide the `ARTICLE_ADMIN_TOKEN`.

---

## 4. Controlled Owner Publication & Acceptance Test

To execute the controlled end-to-end publishing test:

1. **Create Draft**: Click **New Article**, enter title `“Production Desk Validation”`, category `“Operations”`, summary `“Controlled owner desk test”`, content `<p>Testing SQL staging and publish flow.</p>`, and click **Save Draft in SQL**.
2. **Verify Staging**: Confirm that the article appears with status **Draft** in the admin table and is **not** present on `/articles` or in `articles-snapshot.json`.
3. **Preview**: Click **Preview** to verify the server-sanitized rendering.
4. **Publish**: Click **Publish to Website**. Verify status becomes **Published in SQL; website update pending**.
5. **Verify Website Release**: On the next 15-minute export cycle, verify status transitions to **Current version verified on website** only after full SQL-published content/version equality with the validated deployed snapshot.
6. **Withdraw & Cleanup**: Click **Unpublish** (reverting to Draft in SQL). Confirm the desk reports **Withdrawal pending on website** while the deployed snapshot still contains the article. After a later cycle verifies absence from the deployed snapshot, click **Archive** or **Delete** for cleanup.
