# Article publication export operations

The export is a two-boundary workflow. Voyager writes a validated public-only
candidate; an operator approves its exact SHA-256 content digest before the
tracked outage snapshot can change. A Git push is a separate, explicit action.
No SQL credential or private content enters the artifact, browser bundle, or
GitHub.

## Export contract and safe location

The contract identifier is `netherwood.public-articles/v1`. The JSON object has
`format`, `generatedAt`, `articleCount`, `contentDigest`, and `articles`.
`contentDigest` is SHA-256 over the compact JSON encoding of `articles` in the
declared order. Every article is published, due at `generatedAt`, sanitized,
public, and contains canonical IDs, slugs, dates, metadata, HTML, and plain
text. Draft-state markers are prohibited.

The current unversioned snapshot remains readable only as a last-good legacy
fallback during rollout. Every new export candidate is v1, and promotion
replaces the legacy artifact only after exact-digest review and an isolated
Pages build.

Voyager writes the ignored candidate to:

```text
pages-site/.publication-candidates/articles-snapshot.candidate.json
```

The tracked last-good artifact remains:

```text
pages-site/articles-snapshot.json
```

Export uses only the existing `ndp_web_app` fixed public procedures. It first
writes and validates a candidate with an atomic rename; it never writes the
last-good snapshot. Review reports additions, edits, removals, and additions
whose publication time became due since the previous export. A repeated scan
therefore detects a scheduled article when its UTC time passes even without a
database edit.

## Manual and scheduled workflow

Build the updated tool image without restarting the shared API, Ollama,
QueryVault, or monitoring containers:

```bash
docker compose -f backend/compose.yaml build articles-export articles-review api
```

Refresh and review a candidate, and reconcile public article knowledge:

```bash
ops/articles/publication-sync.sh refresh
```

The refresh lock prevents overlapping Ollama/SQL work. Failed exports leave the
last-good tracked snapshot untouched. Copy the public-only candidate to the Mac
over an already approved private transfer path, place it at the same ignored
candidate path in the Mac repository, and run `review`. The network-disabled
`articles-review` tool does not load SQL settings, so no environment or database
credential is transferred.

After reviewing the listed IDs/slugs and exact digest, validate the candidate
in an isolated copy of the site and promote it locally:

```bash
ops/articles/publication-sync.sh approve <64-character-content-digest>
```

No public deployment occurs. The `publish` mode is prepared but must not be run
until repository-write authentication is approved. It accepts only a validated
tracked snapshot, requires synchronized `main`, refuses existing staged work,
commits only the snapshot, performs a non-force push, and thereby triggers the
existing Pages workflow:

```bash
export NDP_PUBLICATION_PUSH_CONFIRM=origin/main
ops/articles/publication-sync.sh publish <64-character-content-digest>
unset NDP_PUBLICATION_PUSH_CONFIRM
```

For unattended GitHub transfer, approve exactly one of these credential
changes before activation:

- change `origin` to SSH and install one repository deploy key with write
  access, restricted to this repository; keep the private key outside the
  repository at owner-only permissions; or
- retain HTTPS and use a fine-grained personal access token restricted to the
  single `stevewittek/netherwood-data-partners` repository with only
  **Contents: read and write**. Store it in the OS credential manager, never an
  environment file, unit file, command argument, Git URL, or GitHub/browser
  artifact.

No Actions, Pages, administration, secrets, or organization permission is
required. The timer files are review-only templates and are not installed or
enabled. If approved, copy them to the user systemd directory, verify the
`%h/netherwood-data-partners` path, run `systemctl --user daemon-reload`, enable
only `ndp-articles-refresh.timer`, and inspect its first candidate before any
publication push. The timer refreshes candidates and knowledge; it never
promotes, commits, pushes, or deploys.

## Rollback

Before a push, restore the tracked snapshot from Git and discard the ignored
candidate. After a bad publication push, revert the snapshot-only publication
commit and push that normal revert; Pages rebuilds the prior static artifact.
Do not rewrite Git history. Hiding an article from AI retrieval is handled by a
subsequent successful knowledge refresh after unpublish/archive; if refresh is
unavailable, keep public chat disconnected until reconciliation succeeds.
