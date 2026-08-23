# NDP_Web SQL Server setup

These scripts prepare the private SQL Server database used by the optional
Voyager backend. The public GitHub Pages site never reads SQL Server directly
and remains available when this database is offline.

The setup is deliberately split into a read-only preflight and an explicit
apply step. The preflight runs inside SQL Server and refuses to continue unless
the instance reports these exact defaults:

- DATA: `/var/opt/mssql/data/`
- LOG: `/var/opt/mssql/logdata/`

It also checks that the one-time setup principal can create a database and a
login. The wrapper refuses `sa`: use a separately authorized one-time setup
principal with the two reported server permissions. Do not use the future
`ndp_web_app` runtime login for setup, and do not put the setup credential in
`.env.local` or any repository file.

## 1. Run the read-only preflight

From the repository root:

```bash
read -r -p "Authorized SQL setup user: " NDP_SQL_ADMIN_USER
read -r -s -p "SQL setup password: " NDP_SQL_ADMIN_PASSWORD; echo
export NDP_SQL_ADMIN_USER NDP_SQL_ADMIN_PASSWORD

backend/scripts/setup-sql-server.sh preflight
```

The command connects only to `127.0.0.1:1433` by default. Override
`NDP_SQL_ADMIN_HOST` or `NDP_SQL_ADMIN_PORT` only for an already approved local
endpoint. Stop if either reported path differs, if `NDP_Web` already has files
elsewhere, or if the permission checks fail.

## 2. Apply after reviewing preflight output

Choose a unique 24-128 character password for the runtime login. This is a
credential decision for the operator; the repository does not contain a
default. Keep the same value available for `SQL_SERVER_PASSWORD` in the ignored
`backend/.env.local` file after setup.

To generate and store a new runtime credential locally without printing it,
run this once from the repository root:

```bash
backend/scripts/create-runtime-sql-credential.sh
```

The helper preserves other local settings, requires `.env.local` to be ignored,
sets owner-only file permissions, and refuses to rotate an existing password.
It prepares the credential but does not create the SQL login by itself.

```bash
read -r -s -p "New ndp_web_app password: " NDP_APP_SQL_PASSWORD; echo
export NDP_APP_SQL_PASSWORD
export NDP_SQL_APPLY_CONFIRM=NDP_Web

backend/scripts/setup-sql-server.sh apply
```

The apply command repeats preflight, creates `NDP_Web` only when absent, runs
the idempotent migrations, provisions `ndp_web_app`, verifies the required
objects, and opens a second connection as the runtime login to prove both its
password and its permission boundaries. The initial database uses `SIMPLE`
recovery until a tested backup and restore policy exists; a later rerun will not
silently undo a deliberate switch to `FULL` recovery.

The runtime login is a member only of `web_runtime`. It can read/write the
operational visitor, chat, contact, and lead tables needed by the API. It cannot
delete records or access blog authoring, configuration, retention policy, or
migration data. Blog authoring will receive a separate identity in a later
phase.

## Retention maintenance

Ordered migrations install `web.PurgeExpiredData`, which applies the checked-in
retention policies in batches of 1-10,000 rows. It clears expired keyed IP
hashes and removes expired analytics, chats without retained leads, leads and
orphaned contacts, and audit events in foreign-key-safe order.

Only the database role `web_maintenance` receives execute permission; the
runtime application role is explicitly denied. Setup does not create a
maintenance login or schedule a job. Choose that operator identity and cadence
only after backup/restore and monitoring procedures are approved. A maintenance
session can run one bounded pass with:

```sql
EXEC web.PurgeExpiredData @AsOfUtc = NULL, @BatchSize = 1000;
```

## 3. Configure the private API

Copy only the placeholder structure from `backend/.env.example` into the
already ignored `backend/.env.local` and set:

```dotenv
SQL_SERVER_HOST=host.docker.internal
SQL_SERVER_PORT=1433
SQL_SERVER_DATABASE=NDP_Web
SQL_SERVER_USER=ndp_web_app
SQL_SERVER_PASSWORD=<the runtime password chosen above>
```

Never put the setup principal, `sa`, or a plaintext password in a committed
file. Unset the temporary shell variables after setup:

```bash
unset NDP_SQL_ADMIN_USER NDP_SQL_ADMIN_PASSWORD NDP_APP_SQL_PASSWORD NDP_SQL_APPLY_CONFIRM
```

Re-run the non-destructive verification with the authorized setup principal:

```bash
backend/scripts/setup-sql-server.sh verify
```

## Files

- `preflight.sql` proves server defaults, permissions, and existing file paths.
- `create_database.sql` creates only the named database and fixes safe baseline
  database options.
- `migrations/` contains ordered, idempotent schema and retention migrations;
  the setup wrapper runs them in filename order.
- `provision_app_login.sql` creates the dedicated login and explicit grants.
- `verify_database.sql` checks the migration, required tables, retention rules,
  and runtime role membership.
- `verify_runtime_login.sql` connects as the application identity and proves
  required grants and prohibited permissions.
