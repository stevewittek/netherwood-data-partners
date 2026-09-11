# Mac article import review

Verified 2026-09-11 UTC. Local import and code review are complete. Publication
activation remains pending the issues and decisions below.

## Imported code

- Worktree: `website-voyager2-article-ai`.
- Branch: `codex/voyager2-article-ai-review`.
- Fresh GitHub baseline: `b431beb58dccefb8e092c179a1a8517caa78c484`.
- Voyager `9f9a4ca063ea2bce42b75eac25dfe636206d37ba` became local
  `5836cc63591548171236092e9079e093d47137ac`.
- Voyager `417f2e86b3dcf018ba3e09789c8fb454ec2a1979` became local
  `d8f807702f010bea999f41a1625373711683219c`.
- The local imported code tree exactly matches Voyager's final tree. This
  review and the project-state update are a separate documentation change.
- Bundle SHA-256:
  `5fcbdc89f80f485917dbd1a2ae707d1a3cfd0fc7e6d1b56b66f3a597963f991e`.
- Bundle copy is in the parent workspace at
  `outputs/voyager2-article-ai-import/voyager2-article-ai-417f2e8.bundle`.

Read-only SSH confirmed Voyager at the supplied final commit, two commits
ahead of its origin/main, with modified `docs/PROJECT_STATE.md` and untracked
`docs/VOYAGER2_LAUNCH_STATUS.md`. Only the code bundle was transferred.

## Mac validation

Passed: 56 backend tests; strict backend TypeScript; root ESLint; Vinext
production build; static Pages build; legacy snapshot validation; ten native
article routes with canonical metadata, JSON-LD, and sitemap membership;
shell syntax; Compose configuration parsing; and `git diff --check`.

Node was 24.19.0, satisfying the repository's declared minimum. The offline
pnpm installation lacked a cached tarball. Dependencies were copied locally
from the existing publication worktree after confirming identical root and
backend lockfile hashes. No dependency versions or lockfiles were changed.
Because copied pnpm install metadata triggered its reinstall check, lint and
build scripts were executed through their corresponding local Node CLI files.
Backend tests required permission for temporary loopback test listeners.
No live database, provider, or deployment test was run from the Mac.

Logs are in ignored `outputs/import-review/` in this worktree. Docker was
not running, so the actual container-based approval wrapper was not validated.
The handoff's live SQL, AI timings, and Node 22 checks remain reported evidence.

The tracked snapshot remains unchanged:

- Generated: `2026-08-24T02:11:34.373Z`.
- Articles: 10.
- Azure title: `Azure SQL Migration Lessons`.
- File SHA-256:
  `3c08eb94d9a302fe2130a7f297167766e489b377085f4baf087402d5c710d47c`.

## Issues before activation

1. **Mac wrapper dependency.** `ops/articles/publication-sync.sh:25` requires
   `flock`, absent here, and reports a contention error for that missing tool.
   Add a portable lock or a verified dependency/preflight.
2. **Build platform mismatch.** `ops/articles/verify-candidate-build.sh:31`
   mounts host `node_modules` into Linux Node. The Mac dependency tree contains
   Darwin ARM64 esbuild, rolldown, and lightningcss binaries. Use isolated
   Linux-installed dependencies or a supported native verification path.
   Its cleanup at line 16 also rejects the Mac temporary-directory location.
3. **Approval is not tied to staged bytes.** `publication-sync.sh:64` checks
   the supplied digest before a potentially long build; lines 75-80 stage and
   commit the mutable file without checking it again. Freeze the validated
   input and verify the staged snapshot's computed digest before commit.
4. **Validated code can differ from deployed code.** The verifier copies
   unstaged and untracked source files, while publication commits only the
   snapshot. Build from the exact committed baseline plus the approved input.
5. **Export lacks one coherent SQL read.** `backend/src/export-articles.ts:18`
   reads the list, individual bodies, and final count separately. An unpublish
   and compensating publish can preserve the count while changing membership.
   Use a coherent SQL snapshot or a publication revision guard.

These findings were established by code review and environment inspection;
no race was exercised against production. Article ingestion similarly reads
visibility before embedding and can retain withdrawn content until another
refresh. Keep public chat disconnected during incomplete reconciliation.

## Existing Mac work and decisions

The dirty `website-publication-integration` worktree was preserved. It is based
on `f96bc08`, includes seven separate launch commits, and implements another
publication design: a content branch, workflow dispatch, a new unapplied SQL
export procedure, and knowledge limited to matching deployed/current versions.
Its tracked snapshot already contains the singular Azure title. Its workflow
gate, legacy-snapshot handling, credentials, timer, and rollback model must be
reconciled with the imported design before the implementations are combined.
Both ingestion paths own `sql:article:<ID>`, so they must not run concurrently
with different visibility rules.

This import deliberately starts from GitHub main; it does not incorporate the
seven launch commits or any dirty release-candidate work. Choose the intended
release baseline and publication authority before preparing a release.

Owner decisions remain: singular versus plural Azure title; repository-write
authentication; API recreation; optional refresh timer; and authoring access.
Immediately before any eventual snapshot approval, obtain a fresh public-only
candidate. No stale candidate was promoted during this import.

No push, deployment, credentials, SQL rows/permissions, timer, or running
service changed. The review branch can remain local while the existing
worktrees and public site continue independently.
