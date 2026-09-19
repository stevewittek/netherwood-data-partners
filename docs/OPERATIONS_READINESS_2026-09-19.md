# Operations readiness — September 19, 2026

This is the current evidence register for the Netherwood website and its
supporting Voyager 2 services. It supersedes the earlier pre-authentication
mail block recorded during setup.

## Verified current state

| Area | Evidence | Status |
| --- | --- | --- |
| Public release | Pages deployment for source `29357a1` succeeded; Home, About, contact, article index and ten article routes passed acceptance. | Ready |
| Publication integrity | Thirteen sitemap routes and ten manifest articles are live; digest `ac06202690a528460f2a8a9a4c2d56fccdfc8657a3b22995547a435b1b650e8`. | Ready |
| Publication automation | `ndp-publication.timer` runs every fifteen minutes and its observed September 19 run completed successfully. | Ready |
| Owner operations | `ndp-owner-desk.service` is active. Private templates exist with owner-only controls outside Git. | Ready |
| Runtime services | The private backend and `netherwood-smtp-relay` containers are running and healthy. | Ready |
| Mail queue | Relay queue was empty at inspection. | Ready |
| Mail acceptance | The Namecheap relay accepted authenticated delivery; the message arrived at the business mailbox and Gmail with SPF and DKIM passing. Database Mail and SQL Agent tests also succeeded. | Ready |
| Host capacity | Voyager 2 root filesystem was 65 percent used with approximately 34 GB available; monitored threshold is 85 percent. | Ready |
| Existing platform health | `caplab-health.timer` and `voyager-health.timer` were active and their latest observed services succeeded. | Ready |
| Search ownership | Search Console ownership and sitemap processing were verified. | Ready |

## Consolidated monitor

The bounded user-level timer in `ops/monitoring/` runs every fifteen minutes.
It checks the public Home page, release manifest, sitemap route count, last
publication result, publication timer, owner desk, backend health, SMTP relay
health and queue, and root-disk pressure. Results are stored owner-only at:

`~/.local/state/netherwood-ops-monitor/latest.txt`

On failure it sends one alert through the existing relay, then suppresses
duplicates until a successful run clears the incident marker. Because a failed
relay cannot alert through itself, the local failed state and the existing host
health review remain the fallback for that case. The acceptance run verifies
all live checks plus dry-run construction of the alert message; it does not
generate another external test email.

## Backup and recovery evidence

SQL Server backup history shows checksum-enabled, non-damaged sets for:

- `NDP_Web`: full backup September 13 at 01:30 UTC and differential backup
  September 19 at 01:30 UTC;
- `QueryVaultDB`: full backup September 13 at 01:30 UTC and differential backup
  September 19 at 01:30 UTC; and
- `master`, `model` and `msdb`: full backups September 19 at 00:30 UTC.

Restore history proves a full-plus-differential validation for QueryVaultDB on
August 28. It does **not** contain equivalent restore evidence for `NDP_Web`.
The account used for this audit can read backup history but is intentionally
not a SQL sysadmin, so no restore or permission expansion was attempted.

The recorded backup paths are on Voyager 2's local SQL Server volume. No
off-host copy or independently retained recovery destination was evidenced in
this audit. A current backup is not a substitute for an isolated copy or a
tested restore.

## Remaining recovery actions

These are the only material technical readiness gaps identified:

1. Using an explicitly authorized SQL administrator session, restore the latest
   `NDP_Web` full and differential backups under a temporary validation name,
   run application-level checks, record duration/results, then remove only the
   temporary validation database.
2. Select an encrypted off-host destination and retention policy; copy and
   verify the required backup sets without exposing credentials or client data.
3. Confirm a recurring review owner for backup age, failed SQL Agent jobs and
   monitor failures. Existing job failure mail covers failures but does not
   prove that a schedule actually ran.

## Email hardening boundary

The operational mail path is complete: credentials are stored owner-only, the
relay is loopback-only, the queue is clear, direct delivery is proven, and SPF
and DKIM pass. DMARC enforcement and mailbox/account two-factor authentication
are account-level hardening tasks. Begin DMARC in monitoring mode only after
confirming the reporting mailbox and DNS access; review reports before moving
to quarantine or reject. Never commit mailbox credentials or DMARC reports to
this repository.
