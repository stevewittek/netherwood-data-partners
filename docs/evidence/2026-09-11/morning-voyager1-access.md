# Voyager 1 handoff reconciliation

Checked from the Mac on 2026-09-11 at approximately 11:03 UTC (07:03 EDT).

## Verified now

- `/Volumes` contains no mounted Windows/network share.
- No `~/.ssh/config` exists. The Mac has two explicitly Voyager 2 named key pairs; no existing Voyager 1 client identity was identified. Private key contents were not read or copied.
- `voyager1` did not resolve. `DESKTOP-CLVE7DV` resolved to the previously recorded LAN address `192.168.1.167`.
- One bounded SSH attempt to `switt@192.168.1.167`, with batch mode, passwords disabled, existing host-key verification required, and a five-second connection timeout, timed out on port 22 before authentication. This does not establish whether the PC is running or whether its documents are complete.
- The four requested Voyager 1 documents are not present in this project or in the existing OneDrive `VS Code Projects` directory searched by exact filenames. Only the unrelated existing Database Mail runner was found.
- No Windows files, Git state, services, credentials, networking, or exposure were changed. No network scan was performed.

## Still unverified

The actual Windows contents and working-tree provenance of:

1. `D:\Dev\Netherwood-data-partners\netherwood-data-partners\docs\BUSINESS_OPERATING_RUNBOOK.md`
2. `D:\Dev\Netherwood-data-partners\netherwood-data-partners\docs\CLIENT_WORK_TEMPLATES.md`
3. `D:\Dev\Netherwood-data-partners\netherwood-data-partners\docs\VOYAGER1_ACCEPTANCE_REPORT.md`
4. `D:\Dev\Netherwood-data-partners\netherwood-data-partners\docs\PROJECT_STATE.md`

The previously pasted summary is a reported handoff, not independently reviewed document evidence. It reports an acceptance package with outstanding lifecycle/AI checks; candidate-local Mac results do not establish Voyager 1 acceptance.

## Smallest transfer that unblocks reconciliation

Paste the following into the existing Voyager 1 Codex task, then attach its resulting ZIP to the Mac task. This needs no new network access, credential, commit, or deployment:

> Prepare a read-only handoff of the existing Netherwood work in `D:\Dev\Netherwood-data-partners\netherwood-data-partners`. Inspect applicable AGENTS.md first. Do not pull, reset, clean, stash, commit, push, edit source documents, deploy, modify services or SQL, create credentials, or change networking. Create a new uniquely named handoff folder outside the repository and copy exactly `docs\BUSINESS_OPERATING_RUNBOOK.md`, `docs\CLIENT_WORK_TEMPLATES.md`, `docs\VOYAGER1_ACCEPTANCE_REPORT.md`, and `docs\PROJECT_STATE.md`, retaining their relative paths. Add a manifest containing the UTC capture time, source repository path, current branch and full HEAD, `git status --short`, and each original file's SHA-256 and last-write time. Check that each copied file has the same hash as its original and that the originals did not change during capture. If a file is missing or changes during capture, report that explicitly and do not invent its contents. Zip the handoff folder and return the exact ZIP path so I can attach it to the Mac task. Do not include credentials, `.env` files, database backups, or other repository files.

Until that transfer is reviewed, the Mac candidate may be evaluated and merged within its verified scope, but the Voyager 1 package must not be described as integrated or accepted.
