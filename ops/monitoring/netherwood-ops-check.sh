#!/usr/bin/env bash
set -u

state_dir=${NDP_MONITOR_STATE_DIR:-"$HOME/.local/state/netherwood-ops-monitor"}
mkdir -p "$state_dir"
chmod 700 "$state_dir"
result_file="$state_dir/latest.txt"
work_file=$(mktemp "$state_dir/.latest.XXXXXX")
trap 'rm -f "$work_file"' EXIT

failures=0
timestamp=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
printf 'checked_at=%s\n' "$timestamp" > "$work_file"

record() {
  printf '%s=%s\n' "$1" "$2" >> "$work_file"
}

pass() {
  record "$1" ok
}

fail() {
  record "$1" "failed:$2"
  failures=$((failures + 1))
}

home_body=$(mktemp "$state_dir/.home.XXXXXX")
manifest_body=$(mktemp "$state_dir/.manifest.XXXXXX")
sitemap_body=$(mktemp "$state_dir/.sitemap.XXXXXX")
trap 'rm -f "$work_file" "$home_body" "$manifest_body" "$sitemap_body"' EXIT

if curl --fail --silent --show-error --location --max-time 20 \
  https://netherwooddatapartners.com/ -o "$home_body" && \
  grep -q 'contact@netherwooddatapartners.com' "$home_body"; then
  pass website_home
else
  fail website_home unavailable_or_contact_missing
fi

if curl --fail --silent --show-error --location --max-time 20 \
  https://netherwooddatapartners.com/publication.json -o "$manifest_body" && \
  grep -q '"format":"netherwood.website-release/v1"' "$manifest_body" && \
  grep -Eq '"articleCount":(10|[1-9][0-9]+)' "$manifest_body"; then
  pass publication_manifest
else
  fail publication_manifest invalid_or_unavailable
fi

if curl --fail --silent --show-error --location --max-time 20 \
  https://netherwooddatapartners.com/sitemap.xml -o "$sitemap_body"; then
  route_count=$(grep -o '<loc>' "$sitemap_body" | wc -l | tr -d ' ')
  record sitemap_routes "$route_count"
  if test "$route_count" -ge 13; then
    pass sitemap
  else
    fail sitemap "expected_at_least_13_found_$route_count"
  fi
else
  fail sitemap unavailable
fi

dmarc_record=$(dig +time=5 +tries=1 +short TXT \
  _dmarc.netherwooddatapartners.com 2>/dev/null | tr -d '"' | head -n 1)
if grep -q '^v=DMARC1;' <<< "$dmarc_record" && \
  grep -Eq '(^|;[[:space:]]*)p=(none|quarantine|reject)(;|$)' <<< "$dmarc_record"; then
  pass email_dmarc
else
  fail email_dmarc missing_or_invalid
fi

for timer_name in ndp-publication.timer; do
  if systemctl --user is-active --quiet "$timer_name"; then
    pass "unit_${timer_name//[.-]/_}"
  else
    fail "unit_${timer_name//[.-]/_}" inactive
  fi
done

if systemctl --user is-active --quiet ndp-owner-desk.service; then
  pass unit_ndp_owner_desk_service
else
  fail unit_ndp_owner_desk_service inactive
fi

publication_result=$(systemctl --user show ndp-publication.service -p Result --value 2>/dev/null || true)
publication_exit=$(systemctl --user show ndp-publication.service -p ExecMainStatus --value 2>/dev/null || true)
record publication_last_result "${publication_result:-unknown}"
record publication_last_exit "${publication_exit:-unknown}"
if test "$publication_result" != success || test "$publication_exit" != 0; then
  fail publication_last_run "result_${publication_result:-unknown}_exit_${publication_exit:-unknown}"
else
  pass publication_last_run
fi

container_state=$(docker inspect --format '{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' netherwood-smtp-relay 2>/dev/null || true)
record smtp_relay_state "${container_state:-missing}"
if test "$container_state" = 'running|healthy'; then
  pass smtp_relay
else
  fail smtp_relay "${container_state:-missing}"
fi

backend_state=$(docker inspect --format '{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' backend-api-1 2>/dev/null || true)
record backend_state "${backend_state:-missing}"
if test "$backend_state" = 'running|healthy'; then
  pass backend
else
  fail backend "${backend_state:-missing}"
fi

queue_state=$(docker exec netherwood-smtp-relay postqueue -p 2>&1 || true)
if grep -q '^Mail queue is empty' <<< "$queue_state"; then
  pass smtp_queue
else
  fail smtp_queue nonempty_or_unreadable
fi

disk_used=$(df -P / | awk 'NR==2 {gsub(/%/,"",$5); print $5}')
record root_disk_used_percent "$disk_used"
if test "$disk_used" -lt 85; then
  pass root_disk
else
  fail root_disk "${disk_used}_percent"
fi

record failures "$failures"
chmod 600 "$work_file"
mv "$work_file" "$result_file"
trap 'rm -f "$home_body" "$manifest_body" "$sitemap_body"' EXIT

if test "$failures" -eq 0; then
  rm -f "$state_dir/alerted"
  printf 'Netherwood operations checks passed at %s\n' "$timestamp"
  exit 0
fi

printf 'Netherwood operations checks found %s failure(s) at %s\n' "$failures" "$timestamp" >&2
cat "$result_file" >&2
exit 1
