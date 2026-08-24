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
backend/scripts/capture-sql-setup-credential.sh
backend/scripts/setup-sql-server.sh preflight
```

The capture helper prompts through the local terminal, stores base64-encoded
credential fields in ignored `backend/.env.sql-setup` at mode `0600`, and never
prints the password. Base64 is only a safe file format here, not encryption;
owner-only permissions and Git exclusion provide the protection. Delete the
temporary setup file after provisioning and disabling the setup login.

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
delete records or directly access article authoring, configuration, retention
policy, or migration data. The article migrations grant the runtime identity
only the fixed public list/detail and bounded knowledge-export procedures, with
no direct article-table access. Article authoring uses the separate
`ndp_article_author` identity and `web_article_author` procedure-only role described in
[`docs/ARTICLES_CMS.md`](../../docs/ARTICLES_CMS.md).

## Articles CMS

Migration `005_articles_cms.sql` extends the reserved `web.BlogPosts` model and
adds `web.ArticleDrafts`. Migration `006_articles_content_workflow.sql`
completes SEO/featured metadata, search, unpublish, guarded deletion, filtered
indexes, and procedure-only permission boundaries. Migration
`007_starter_articles.sql` idempotently adds the ten provided starter articles
from `sql/seeds/articles.seed.json`. Published rows remain unchanged while an
edit is saved in `ArticleDrafts`; publish promotes the draft atomically.

`validate_articles_migrations.sql` applies migrations 006 and 007 inside an
outer transaction, validates the seed and metadata, and rolls everything back.
It is a compile/smoke check, not a publishing command.

Create authoring credentials only after making the operator credential
decision:

```bash
backend/scripts/create-article-author-credentials.sh
```

The normal gated `apply` workflow detects `SQL_ARTICLE_PASSWORD` in the ignored
local environment, provisions `ndp_article_author`, and verifies that it can
execute only the article procedures and cannot directly read or modify either
content table. If article credentials are absent, the schema and public reads
can still be applied, but Voyager's admin routes remain disabled.

## Chatbot knowledge store

Migrations `003` and `004` add the cited-chat knowledge store:

- `web.KnowledgeSources` records approved document/database source metadata,
  SHA-256 content hashes, public URLs, and the `ChatbotVisible` boundary.
- `web.KnowledgeChunks` stores numbered text chunks and stable SQL Server 2025
  `vector(768)` embeddings generated by `nomic-embed-text`.
- `web.ChatbotStructuredContent` is the controlled staging table for explicitly
  visible service, FAQ, business, article, case-study, contact, and pricing
  information.

The application login receives `EXECUTE` only on five fixed procedures:
`web.SearchChatbotKnowledge`, `web.ListIndexedKnowledgeSources`,
`web.GetApprovedStructuredContent`, `web.ReplaceKnowledgeSource`, and
`web.HideKnowledgeSource`. Direct reads and writes on all three tables are
denied. Retrieval is an exact cosine `VECTOR_DISTANCE` query filtered by
`ChatbotVisible=1`; the implementation does not enable a preview vector index
or accept generated SQL from the model.

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
SQL_SERVER_HOST=localhost
SQL_SERVER_PORT=1433
SQL_SERVER_DATABASE=NDP_Web
SQL_SERVER_USER=ndp_web_app
SQL_SERVER_PASSWORD=<the runtime password chosen above>
```

Never put the setup principal, `sa`, or a plaintext password in a committed
file. Unset the temporary shell variables after setup:

```bash
unset NDP_SQL_APPLY_CONFIRM
```

Re-run the non-destructive verification with the authorized setup principal:

```bash
backend/scripts/setup-sql-server.sh verify
```

## Files

- `preflight.sql` proves server defaults, permissions, and existing file paths.
- `create_database.sql` creates only the named database and fixes safe baseline
  database options.
- `migrations/` contains ordered, idempotent schema, article, and retention
  migrations; the setup wrapper runs them in filename order.
- `provision_app_login.sql` creates the dedicated login and explicit grants.
- `verify_database.sql` checks the migrations, required tables, article
  columns/indexes/procedures, retention rules,
  and runtime role membership.
- `verify_runtime_login.sql` connects as the application identity and proves
  required grants and prohibited permissions.
- `provision_article_login.sql` and `verify_article_login.sql` establish and
  prove the separate procedure-only authoring identity when explicitly enabled.
