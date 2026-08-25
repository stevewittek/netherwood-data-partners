#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/../.." && pwd)"
readonly CREDENTIAL_FILE="${NDP_SQL_SETUP_CREDENTIAL_FILE:-$REPO_ROOT/backend/.env.sql-setup}"
readonly SQLCMD_BIN="${SQLCMD_BIN:-/opt/mssql-tools18/bin/sqlcmd}"
readonly SQL_HOST="${NDP_SQL_ADMIN_HOST:-127.0.0.1}"
readonly SQL_PORT="${NDP_SQL_ADMIN_PORT:-1433}"

cleanup() {
  unset NDP_SQL_ADMIN_USER NDP_SQL_ADMIN_PASSWORD SQLCMDPASSWORD SMTP_PASSWORD_B64
  unset smtp_password smtp_password_confirm
}
trap cleanup EXIT INT TERM

if [[ ! -x "$SQLCMD_BIN" ]]; then
  echo "sqlcmd is not executable at $SQLCMD_BIN." >&2
  exit 1
fi

read_encoded_credential() {
  local key="$1"
  local encoded
  encoded="$(awk -F= -v key="$key" '$1 == key { print substr($0, index($0, "=") + 1); exit }' "$CREDENTIAL_FILE")"
  [[ -n "$encoded" && "$encoded" =~ ^[A-Za-z0-9+/]+={0,2}$ ]] || return 1
  printf '%s' "$encoded" | base64 --decode
}

if [[ ! -f "$CREDENTIAL_FILE" || -L "$CREDENTIAL_FILE" ]]; then
  echo "The protected SQL setup credential file was not found: $CREDENTIAL_FILE" >&2
  echo "Run backend/scripts/capture-sql-setup-credential.sh first." >&2
  exit 1
fi

credential_mode="$(stat -c '%a' "$CREDENTIAL_FILE")"
if [[ ! "$credential_mode" =~ ^[0-7]{3,4}$ ]] || (( (8#$credential_mode & 8#077) != 0 )); then
  echo "The SQL setup credential file must not be accessible by group or other users." >&2
  exit 1
fi
if [[ "$(stat -c '%u' "$CREDENTIAL_FILE")" != "$(id -u)" ]]; then
  echo "The SQL setup credential file must be owned by the current user." >&2
  exit 1
fi

NDP_SQL_ADMIN_USER="$(read_encoded_credential NDP_SQL_ADMIN_USER_BASE64)"
NDP_SQL_ADMIN_PASSWORD="$(read_encoded_credential NDP_SQL_ADMIN_PASSWORD_BASE64)"

if [[ "${NDP_SQL_ADMIN_USER,,}" == "sa" ]]; then
  echo "Refusing to use the sa login. Capture the dedicated setup login instead." >&2
  exit 1
fi

if [[ ! "$SQL_PORT" =~ ^[0-9]+$ ]] || (( SQL_PORT < 1 || SQL_PORT > 65535 )); then
  echo "NDP_SQL_ADMIN_PORT must be an integer from 1 through 65535." >&2
  exit 1
fi

read -r -s -p "Namecheap password for steve@netherwooddatapartners.com: " smtp_password
printf '\n'
read -r -s -p "Confirm the Namecheap password: " smtp_password_confirm
printf '\n'

if [[ -z "$smtp_password" ]]; then
  echo "The SMTP password cannot be empty." >&2
  exit 1
fi

if [[ "$smtp_password" != "$smtp_password_confirm" ]]; then
  echo "The SMTP passwords did not match. No changes were made." >&2
  exit 1
fi

SMTP_PASSWORD_B64="$(printf '%s' "$smtp_password" | iconv -f UTF-8 -t UTF-16LE | base64 --wrap=0)"
export SMTP_PASSWORD_B64
unset smtp_password smtp_password_confirm

SQLCMDPASSWORD="$NDP_SQL_ADMIN_PASSWORD" "$SQLCMD_BIN" \
  -S "tcp:${SQL_HOST},${SQL_PORT}" \
  -U "$NDP_SQL_ADMIN_USER" \
  -d master \
  -N -C -b -V 16 -l 15 -t 60 \
  -i "$SCRIPT_DIR/configure_database_mail.sql"

sudo /opt/mssql/bin/mssql-conf set sqlagent.databasemailprofile "Netherwood Database Mail"

SQLCMDPASSWORD="$NDP_SQL_ADMIN_PASSWORD" "$SQLCMD_BIN" \
  -S "tcp:${SQL_HOST},${SQL_PORT}" \
  -U "$NDP_SQL_ADMIN_USER" \
  -d master \
  -N -C -b -V 16 -l 15 -t 60 \
  -i "$SCRIPT_DIR/verify_database_mail.sql"

echo "Voyager 2 Database Mail is configured."
echo "Restart SQL Server before using SQL Agent job notifications: sudo systemctl restart mssql-server"
echo "A test email has not been sent; use send_test_mail.sql when you are ready."
