#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
readonly ENV_FILE="${SCRIPT_DIR}/../.env.local"

umask 077
if [[ -L "$ENV_FILE" ]]; then
  printf '%s\n' 'Refusing to write through a symbolic link.' >&2
  exit 1
fi
if [[ -f "$ENV_FILE" ]] && grep -q '^IP_ABUSE_HASH_SECRET=.' "$ENV_FILE"; then
  printf '%s\n' 'IP_ABUSE_HASH_SECRET is already stored; leaving it unchanged.'
  exit 0
fi

secret="$(openssl rand -hex 32)"
temporary="$(mktemp "${ENV_FILE}.tmp.XXXXXX")"
trap 'rm -f -- "$temporary"' EXIT

if [[ -f "$ENV_FILE" ]]; then
  awk '!/^IP_ABUSE_HASH_SECRET=/' "$ENV_FILE" > "$temporary"
fi
printf 'IP_ABUSE_HASH_SECRET=%s\n' "$secret" >> "$temporary"
chmod 0600 "$temporary"
mv -- "$temporary" "$ENV_FILE"
trap - EXIT
printf '%s\n' 'Stored IP_ABUSE_HASH_SECRET in backend/.env.local without displaying it.'
