# Marketing verification — September 25, 2026

Environment: Voyager 1, Windows; Node 24.19.0; local pnpm 11.25.0.
The repository CI continues to use Node 22 and pnpm 11.19.0. A dedicated Windows
marketing test job and the existing Site job's marketing tests/typecheck are
configured; no remote CI run or deployment is claimed.

## Results

- Marketing: **39 passed, 0 failed, 0 skipped**.
- Strict marketing TypeScript: passed.
- Marketing/server/browser JavaScript lint and syntax: passed.
- Existing backend strict TypeScript: passed.
- Existing backend suite: **69 passed, 0 failed, 1 skipped**. The existing
  symlink-creation test skips when the Windows account lacks that privilege;
  traversal/filtering tests still run.
- Publication/admin: **23 passed**; publication pipeline: **3 passed**.
- Vinext production build (`pnpm test`): passed after correcting the baseline
  Unix-only environment assignment with a cross-platform Node runner.
- Static Pages build: passed; route check passed for all **13 public routes**
  and **10 articles** after correcting its baseline hardcoded slash comparison
  for Windows paths. Article digest remains
  `ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8`.
- Final repository-wide lint and frontend typing: passed. Git whitespace and
  staged private-file exclusion checks: passed.
- Full Edge browser workflow: passed, zero page errors. Create list → CSV mapping
  → preview → import → draft → frozen preview → local test → ready → typed approval
  → local simulation → results → lock.
- Synthetic outcome: four input rows, three companies, one duplicate, three
  simulated messages, zero real delivered messages.
- Responsive evidence: 1440, 768 and 390 pixel widths; no horizontal document
  overflow. Wide data tables use their own horizontal scrolling.

## Review-driven fixes

Tests cover suppression after re-import/restart/list deletion, suppression audit
atomicity, inherited do-not-contact when email is added later, Unicode company
names, conflicting address substitution, duplicate-preview consistency, bounded
malformed CSV, exact approval counts, immutable snapshots, production rejection,
provider uncertainty/no blind retry, token hashing/recipient binding, signed
webhook contracts, idempotent attribution, source-only outcomes, auth/Host/CSRF,
body/rate limits, output escaping and local no-network mail.

The browser run found and verified a fix for late asynchronous responses
redrawing the wrong tab. Lock remains available while a request is running,
and old-session responses are discarded.

## Evidence and limits

Screenshots and browser-results.json in this directory contain only synthetic
businesses. No real prospect list, email, form submission, advertisement, call,
provider credentials, SQL deployment or public website change was used.
Public routes, real-provider integration, actual email deliverability and a
public unsubscribe service have not been deployed or tested. The protected
original main and publishing-desk worktrees retain their original changes.
