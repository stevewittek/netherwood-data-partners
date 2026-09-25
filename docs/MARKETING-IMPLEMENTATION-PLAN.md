# Voyager 1 marketing implementation

Baseline: origin/main at b54819b, inspected September 25, 2026. Isolated branch:
feat/voyager1-marketing. Original main's untracked .vs/ and publishing desk's
uncommitted changes are preserved.

The public website is static React/Vite on GitHub Pages; contact posts to
Formspark. Its optional private backend uses Node/TypeScript and SQL Server.
Public pages must remain available independently of Voyager. This work avoids
shared visuals, Formspark transport, SQL storage, DNS and public exposure.

1. Add a single private Node/TypeScript application under marketing/, using
   Node's built-in SQLite for durable local persistence. No new database service,
   SQL credentials or dependency tree. Hosting requires persistent disk.
2. Implement bounded CSV mapping, normalization, provenance, transactional
   import, deterministic duplicate detection, working-list lifecycle and
   independent suppression with documented individual reinstatement only.
3. Add reusable templates, campaign snapshots, explicit preview/test/approval/send
   transitions, provider interface and a local outbox. No bulk-provider credentials
   were found in the current process or repository environment files.
   Production sending must fail closed.
4. Add opaque unsubscribe and click tokens, idempotent conversion ingestion,
   simple reporting and a private authenticated interface.
5. Deliver an exact Voyager 2 integration contract without public site edits.
   Static Pages cannot perform unsubscribe writes. Separately approved reliable
   HTTPS hosting is a production outreach prerequisite.
6. Produce launch, services, credibility, case-study and future roadmap documents
   with official sources and explicit verification/approval gaps.
7. Verify imports, suppression, approval, simulated delivery, authorization, links
   and attribution. Run repository lint/builds, backend tests and typechecks.
   Commit cohesive reviewed changes.

No real email, advertisement, phone call or publication during development.
No scores, sales forecasting or relationship graphs.
