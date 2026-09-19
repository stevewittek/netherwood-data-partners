# Netherwood operations monitor

This bounded user-level timer checks the paths required to operate the public
site and article workflow:

- public Home, publication manifest and sitemap;
- published DMARC policy presence and syntax;
- enabled publication timer and successful last publication run;
- private owner desk;
- backend API and loopback SMTP relay container health;
- empty SMTP queue; and
- root filesystem use below 85 percent.

The result is written with owner-only permissions to
`~/.local/state/netherwood-ops-monitor/latest.txt`. A failure sends one email to
the configured operator through the existing loopback relay. The alert is
suppressed until a successful check clears the marker, preventing a message
every fifteen minutes during one incident. A relay failure is still recorded
locally but cannot use that same relay to notify the operator; inspect the timer
as part of host health review.

Installation acceptance may run the alert helper with
`NDP_ALERT_DRY_RUN=1`. That writes an owner-only `alert-preview.txt` in the
state directory and does not enqueue or send a message.

The monitor never reads or prints SMTP, SQL, article-admin or API credentials.
It does not submit the public contact form or send a success email.

Install the scripts in `~/.local/lib/netherwood-ops-monitor/` and the three
units in `~/.config/systemd/user/`, then reload the user manager. Run the service
once before enabling the timer. Production activation and its evidence are
recorded in `docs/OPERATIONS_READINESS_2026-09-19.md`.
