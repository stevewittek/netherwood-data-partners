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
  printf '%s\n' 'Refusing to create credentials in a file that Git does not ignore.' >&2
  exit 1
fi
if [[ ! -f "$ENV_FILE" ]] || ! grep -q '^SQL_SERVER_PASSWORD=.' "$ENV_FILE"; then
  printf '%s\n' 'Create the runtime SQL credential first.' >&2
  exit 1
fi
if grep -Eq '^(SQL_ARTICLE_PASSWORD|ARTICLE_ADMIN_TOKEN)=.' "$ENV_FILE"; then
  printf '%s\n' 'Article credentials already exist; refusing to replace them.' >&2
  exit 1
fi

umask 077
article_password="Ndp_Article_A7_$(openssl rand -hex 32)"
admin_token="$(openssl rand -hex 32)"
temporary_file="$(mktemp "${BACKEND_DIR}/.env.local.tmp.XXXXXX")"
cleanup() {
  unset article_password admin_token
  if [[ -n "${temporary_file:-}" && -e "$temporary_file" ]]; then unlink "$temporary_file"; fi
}
trap cleanup EXIT

awk '!/^(SQL_ARTICLE_USER|SQL_ARTICLE_PASSWORD|ARTICLE_ADMIN_TOKEN)=/' "$ENV_FILE" > "$temporary_file"
printf '\n%s\n' \
  'SQL_ARTICLE_USER=ndp_article_author' \
  "SQL_ARTICLE_PASSWORD=${article_password}" \
  "ARTICLE_ADMIN_TOKEN=${admin_token}" \
  >> "$temporary_file"
chmod 0600 "$temporary_file"
mv "$temporary_file" "$ENV_FILE"
temporary_file=''
unset article_password admin_token

printf '%s\n' \
  'Stored new article SQL and API credentials in backend/.env.local.' \
  'No secret was printed and the SQL login has not been created yet.'
