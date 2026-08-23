#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
SQL_DIR="$(cd -- "${SCRIPT_DIR}/../sql" && pwd)"
readonly SQL_DIR
readonly SQLCMD_BIN="${SQLCMD_BIN:-/opt/mssql-tools18/bin/sqlcmd}"
readonly SQL_HOST="${NDP_SQL_ADMIN_HOST:-127.0.0.1}"
readonly SQL_PORT="${NDP_SQL_ADMIN_PORT:-1433}"
readonly MODE="${1:-preflight}"

usage() {
  printf '%s\n' \
    'Usage: setup-sql-server.sh [preflight|apply|verify]' \
    '' \
    'Required environment:' \
    '  NDP_SQL_ADMIN_USER       one-time authorized setup principal' \
    '  NDP_SQL_ADMIN_PASSWORD   read interactively; do not save in .env.local' \
    '' \
    'Additionally for apply:' \
    '  NDP_APP_SQL_PASSWORD     new 24-128 character runtime password' \
    '  NDP_SQL_APPLY_CONFIRM    exact value: NDP_Web' \
    '' \
    'Optional environment:' \
    '  NDP_SQL_ADMIN_HOST       default: 127.0.0.1' \
    '  NDP_SQL_ADMIN_PORT       default: 1433' \
    '  SQLCMD_BIN               default: /opt/mssql-tools18/bin/sqlcmd'
}

if [[ "$MODE" != "preflight" && "$MODE" != "apply" && "$MODE" != "verify" ]]; then
  usage >&2
  exit 2
fi

if [[ ! -x "$SQLCMD_BIN" ]]; then
  printf 'sqlcmd is not executable at %s\n' "$SQLCMD_BIN" >&2
  exit 1
fi

: "${NDP_SQL_ADMIN_USER:?Set NDP_SQL_ADMIN_USER to the authorized one-time setup principal.}"
: "${NDP_SQL_ADMIN_PASSWORD:?Set NDP_SQL_ADMIN_PASSWORD without writing it to a repository file.}"

if [[ "${NDP_SQL_ADMIN_USER,,}" == "sa" ]]; then
  printf '%s\n' 'Refusing to use sa. Supply a separately authorized one-time setup principal.' >&2
  exit 1
fi

if [[ ! "$SQL_PORT" =~ ^[0-9]+$ ]] || (( SQL_PORT < 1 || SQL_PORT > 65535 )); then
  printf '%s\n' 'NDP_SQL_ADMIN_PORT must be an integer from 1 through 65535.' >&2
  exit 1
fi

run_sql() {
  local input_file="$1"
  SQLCMDPASSWORD="$NDP_SQL_ADMIN_PASSWORD" "$SQLCMD_BIN" \
    -S "tcp:${SQL_HOST},${SQL_PORT}" \
    -U "$NDP_SQL_ADMIN_USER" \
    -d master \
    -N -C -b -V 16 -l 15 -t 60 \
    -i "$input_file"
}

run_runtime_sql() {
  SQLCMDPASSWORD="$NDP_APP_SQL_PASSWORD" "$SQLCMD_BIN" \
    -S "tcp:${SQL_HOST},${SQL_PORT}" \
    -U ndp_web_app \
    -d NDP_Web \
    -N -C -b -V 16 -l 15 -t 60 \
    -i "$SQL_DIR/verify_runtime_login.sql"
}

run_sql "$SQL_DIR/preflight.sql"

if [[ "$MODE" == "preflight" ]]; then
  printf '%s\n' 'Read-only SQL preflight passed; no database changes were made.'
  exit 0
fi

if [[ "$MODE" == "verify" ]]; then
  run_sql "$SQL_DIR/verify_database.sql"
  exit 0
fi

: "${NDP_APP_SQL_PASSWORD:?Set NDP_APP_SQL_PASSWORD for the dedicated ndp_web_app login.}"

if [[ "${NDP_SQL_APPLY_CONFIRM:-}" != "NDP_Web" ]]; then
  printf '%s\n' 'Refusing to apply. Set NDP_SQL_APPLY_CONFIRM=NDP_Web after reviewing the preflight output.' >&2
  exit 1
fi

if (( ${#NDP_APP_SQL_PASSWORD} < 24 || ${#NDP_APP_SQL_PASSWORD} > 128 )); then
  printf '%s\n' 'NDP_APP_SQL_PASSWORD must contain 24 to 128 characters.' >&2
  exit 1
fi

run_sql "$SQL_DIR/create_database.sql"

migration_files=("$SQL_DIR"/migrations/[0-9][0-9][0-9]_*.sql)
if [[ ! -e "${migration_files[0]}" ]]; then
  printf '%s\n' 'No ordered SQL migrations were found.' >&2
  exit 1
fi
for migration_file in "${migration_files[@]}"; do
  run_sql "$migration_file"
done

app_password_hex="$(printf '%s' "$NDP_APP_SQL_PASSWORD" | iconv -f UTF-8 -t UTF-16LE | od -An -v -tx1 | tr -d ' \n')"
export AppPasswordHex="$app_password_hex"
run_sql "$SQL_DIR/provision_app_login.sql"
unset AppPasswordHex app_password_hex

run_sql "$SQL_DIR/verify_database.sql"
run_runtime_sql
printf '%s\n' 'NDP_Web schema and the least-privileged ndp_web_app login are verified.'
