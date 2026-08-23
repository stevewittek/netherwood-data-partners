#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
BACKEND_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
readonly BACKEND_DIR
readonly ENV_FILE="${BACKEND_DIR}/.env.local"

if [[ -L "$ENV_FILE" ]]; then
  printf '%s\n' 'Refusing to write through a symlink at backend/.env.local.' >&2
  exit 1
fi

if ! git -C "$BACKEND_DIR" check-ignore -q .env.local; then
  printf '%s\n' 'Refusing to create a credential in a file that Git does not ignore.' >&2
  exit 1
fi

if [[ -f "$ENV_FILE" ]] && grep -q '^SQL_SERVER_PASSWORD=.' "$ENV_FILE"; then
  printf '%s\n' 'A SQL_SERVER_PASSWORD is already stored; refusing to replace it.' >&2
  exit 1
fi

umask 077
runtime_password="Ndp_A9_$(openssl rand -hex 32)"
temporary_file="$(mktemp "${BACKEND_DIR}/.env.local.tmp.XXXXXX")"

cleanup() {
  unset runtime_password
  if [[ -n "${temporary_file:-}" && -e "$temporary_file" ]]; then
    unlink "$temporary_file"
  fi
}
trap cleanup EXIT

if [[ -f "$ENV_FILE" ]]; then
  awk '
    !/^(SQL_SERVER_HOST|SQL_SERVER_PORT|SQL_SERVER_DATABASE|SQL_SERVER_USER|SQL_SERVER_PASSWORD)=/
  ' "$ENV_FILE" > "$temporary_file"
fi

if [[ -s "$temporary_file" ]]; then
  printf '\n' >> "$temporary_file"
fi

printf '%s\n' \
  'SQL_SERVER_HOST=localhost' \
  'SQL_SERVER_PORT=1433' \
  'SQL_SERVER_DATABASE=NDP_Web' \
  'SQL_SERVER_USER=ndp_web_app' \
  "SQL_SERVER_PASSWORD=${runtime_password}" \
  >> "$temporary_file"

chmod 0600 "$temporary_file"
mv "$temporary_file" "$ENV_FILE"
temporary_file=''
unset runtime_password

printf '%s\n' \
  'Stored a new ndp_web_app runtime credential in backend/.env.local.' \
  'The password was not printed. The SQL login has not been created yet.'
