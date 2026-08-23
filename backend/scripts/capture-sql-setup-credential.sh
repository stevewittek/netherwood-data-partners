#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
BACKEND_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
readonly BACKEND_DIR
readonly CREDENTIAL_FILE="${BACKEND_DIR}/.env.sql-setup"

if [[ -e "$CREDENTIAL_FILE" || -L "$CREDENTIAL_FILE" ]]; then
  printf '%s\n' 'A SQL setup credential file already exists; refusing to replace it.' >&2
  exit 1
fi

if ! git -C "$BACKEND_DIR" check-ignore -q .env.sql-setup; then
  printf '%s\n' 'Refusing to create a credential file that Git does not ignore.' >&2
  exit 1
fi

read -r -p 'SQL setup login [ndp_setup_admin]: ' setup_login </dev/tty
setup_login="${setup_login:-ndp_setup_admin}"
if [[ "${setup_login,,}" == "sa" ]]; then
  printf '%s\n' 'Refusing to store sa. Use the dedicated setup login.' >&2
  exit 1
fi

read -r -s -p 'SQL setup password: ' setup_password </dev/tty
printf '\n' >/dev/tty
read -r -s -p 'Confirm SQL setup password: ' setup_password_confirmation </dev/tty
printf '\n' >/dev/tty

if [[ -z "$setup_password" || "$setup_password" != "$setup_password_confirmation" ]]; then
  unset setup_password setup_password_confirmation
  printf '%s\n' 'Passwords were empty or did not match.' >&2
  exit 1
fi

umask 077
temporary_file="$(mktemp "${BACKEND_DIR}/.env.sql-setup.tmp.XXXXXX")"
cleanup() {
  unset setup_password setup_password_confirmation
  if [[ -n "${temporary_file:-}" && -e "$temporary_file" ]]; then
    unlink "$temporary_file"
  fi
}
trap cleanup EXIT

login_base64="$(printf '%s' "$setup_login" | base64 --wrap=0)"
password_base64="$(printf '%s' "$setup_password" | base64 --wrap=0)"
printf '%s\n' \
  "NDP_SQL_ADMIN_USER_BASE64=${login_base64}" \
  "NDP_SQL_ADMIN_PASSWORD_BASE64=${password_base64}" \
  > "$temporary_file"

chmod 0600 "$temporary_file"
mv "$temporary_file" "$CREDENTIAL_FILE"
temporary_file=''
unset setup_password setup_password_confirmation password_base64

printf '%s\n' \
  'Stored the SQL setup credential in backend/.env.sql-setup.' \
  'The password was not printed and the file is ignored by Git.'
