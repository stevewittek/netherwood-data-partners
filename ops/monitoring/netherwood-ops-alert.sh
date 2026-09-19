#!/usr/bin/env bash
set -u

failed_unit=${1:-netherwood-ops-check.service}
state_dir=${NDP_MONITOR_STATE_DIR:-"$HOME/.local/state/netherwood-ops-monitor"}
alert_to=${NDP_ALERT_TO:-steven.wittek@gmail.com}
alert_marker="$state_dir/alerted"
result_file="$state_dir/latest.txt"
mkdir -p "$state_dir"
chmod 700 "$state_dir"

# One alert per uninterrupted failure. A successful check removes the marker.
if test -f "$alert_marker"; then
  exit 0
fi

subject="Netherwood operations check needs attention on $(hostname)"
message_file=$(mktemp "$state_dir/.alert.XXXXXX")
trap 'rm -f "$message_file"' EXIT
{
  printf 'From: steve@netherwooddatapartners.com\n'
  printf 'To: %s\n' "$alert_to"
  printf 'Subject: %s\n' "$subject"
  printf 'Content-Type: text/plain; charset=UTF-8\n'
  printf '\n'
  printf 'The scheduled Netherwood operations check failed.\n\n'
  printf 'Host: %s\n' "$(hostname)"
  printf 'Unit: %s\n' "$failed_unit"
  printf 'Time: %s\n\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  if test -r "$result_file"; then
    printf 'Latest check state:\n'
    sed -n '1,120p' "$result_file"
  fi
  printf '\nReview with: systemctl --user status %s\n' "$failed_unit"
} > "$message_file"
chmod 600 "$message_file"

# Exercise message construction without sending during installation acceptance.
if test "${NDP_ALERT_DRY_RUN:-0}" = 1; then
  cp "$message_file" "$state_dir/alert-preview.txt"
  chmod 600 "$state_dir/alert-preview.txt"
  exit 0
fi

docker exec -i netherwood-smtp-relay /usr/sbin/sendmail -t < "$message_file"

touch "$alert_marker"
chmod 600 "$alert_marker"
