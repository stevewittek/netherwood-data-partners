# Email provider setup and sending operations

Implemented on Voyager 1, 2026-09-25. No production provider is installed, no real email was sent, and no provider account was created. The shipped provider writes `.eml` and `.json` files to a private local outbox. It never opens a network connection. Setting `MARKETING_MODE` to a value other than `local` prevents startup.

## Local configuration

Follow `marketing/README.md` and `marketing/.env.example`. Keep `.env`, the SQLite database, backups and outbox untracked and restricted to the operator's account.

| Variable | Purpose |
| --- | --- |
| `MARKETING_ADMIN_TOKEN` | Unique random secret, at least 32 characters, for the private operator interface |
| `MARKETING_DB_PATH` | Private SQLite file; includes durable suppression and campaign audit history |
| `MARKETING_OUTBOX_DIR` | Local simulated email files; these contain recipient addresses and unsubscribe capabilities |
| `MARKETING_MODE` | Must be `local`; no environment switch enables real delivery |
| `MARKETING_SENDER_NAME` | Clear business sender name |
| `MARKETING_SENDER_EMAIL` | Configured sender address; local default is synthetic |
| `MARKETING_POSTAL_ADDRESS` | Actual approved business mailing address before real outreach; local placeholder is visibly labeled |
| `MARKETING_TEST_RECIPIENT` | Fixed test destination; arbitrary test recipients are not accepted through the UI |
| `MARKETING_PUBLIC_BASE_URL` | Local loopback URL now; a reliable approved HTTPS unsubscribe/click service is required for production |
| `MARKETING_WEBSITE_ORIGIN` | Allowlisted HTTPS landing-page origin, default `https://netherwooddatapartners.com` |

Do not put a home address in public materials by default. The owner must choose valid business contact details. Changing sender settings applies to new campaign drafts; existing drafts preserve the sender identity captured when created.

## Deliberate campaign workflow

1. Create a working company list with documented source and usage rights. Import a synthetic CSV first.
2. Create an email campaign, choose a short template and safe landing page, and review subject/body and filters.
3. **Preview** freezes an eligible recipient snapshot. Further imports, edits and list membership changes do not enlarge it. Preview again to review the same snapshot. Create a new campaign if content or audience must change.
4. **Test send** writes one message to the configured local outbox for the fixed test recipient. It does not send to prospects. Inspect both plain text and HTML, footer, destination and unsubscribe behavior.
5. Mark **Ready for approval** only after reviewing the test.
6. **Approve** requires the explicit `APPROVE` action and exact frozen recipient count.
7. **Send local simulation** requires `SEND` and the same count. The UI shows how many recipients are in the approved snapshot. Addresses suppressed since approval, inactive companies, deleted companies, and companies marked do-not-contact are skipped immediately before delivery.
8. Inspect results and export CSV. `local_sent` and `simulated` mean files were written, not messages delivered. Local test/simulation clicks do not increase real click totals. The export includes a summary row and recipient rows.

Production requests are rejected by the local provider even after approval. There is no scheduled sending or automatic campaign launch.

## Suppression and unsubscribe

Suppression is stored separately from working lists, normalized case-insensitively, and consulted both at preview and immediately before each send. Deleting or archiving a working list does not remove suppression or campaign history. A later CSV import cannot silently reactivate an unsubscribed address. Individual reinstatement requires the explicit documented evidence process in the operator tool; it is not a bulk reset.

Actual message unsubscribe links use 32 random bytes encoded as an opaque token. Only its SHA-256 digest is persisted. The token binds to the email address captured in the campaign snapshot, even if the company address later changes. Tokens have no automatic expiry; preserve their database records and service availability. Outbox files contain the raw URL and must be treated as private.

`GET /unsubscribe/:token` displays a confirmation page and never suppresses an address. `POST /unsubscribe/:token` suppresses immediately and is repeat-safe, with no login, explanation, tracking cookie or charge. Human confirmation and mail-receiver `List-Unsubscribe=One-Click` POSTs share this route. Test messages bind to the test address only. Footer text explicitly identifies the message as business marketing and includes sender, email, postal address and opt-out link.

The FTC guidance covers commercial B2B email as well as consumer messages. Verify headers and subject accuracy, advertising identification, postal address and opt-out operation before outreach. Its guide specifies honoring opt-outs within 10 business days and keeping the mechanism available at least 30 days; this implementation suppresses immediately and retains tokens indefinitely. List licensing alone does not establish permission under a provider's acceptable-use policy. Verify applicable jurisdictions and provider conditions before sending. [FTC CAN-SPAM compliance guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business).

## Adding a real provider: future implementation gate

The interface in `marketing/src/provider.ts` has `validateConfiguration`, `sendMessage`, `sendCampaign` and `handleWebhook`. An adapter must be intentionally implemented, reviewed and tested; a credential in `.env` is insufficient. Keep production credentials in server environment/secret storage. Do not reuse SQL Database Mail or a personal mailbox for bulk outreach.

Before implementing an adapter, the owner must select a provider that permits the intended recipient acquisition and commercial use. Some reputable providers prohibit purchased lists or unsolicited marketing. Confirm the source-specific permission and the provider's current terms. Start with a small, manually approved audience only after configuration and end-to-end verification.

Adapter acceptance criteria:

- Validate real account/region, verified sender domain, approved business identity, provider policy and authorized usage. Fail closed on missing settings.
- Configure SPF, DKIM, DMARC and provider-specific domain validation through a separately approved infrastructure change. Verify mailbox reply receipt and monitored complaint handling.
- Use a bounded API request and the campaign recipient's persisted idempotency key. A provider timeout may occur after acceptance: never assume it is safe to resend.
- Return provider message ID and `accepted` only on confirmed acceptance. Accepted is distinct from delivered; delivery counts require authenticated delivery events.
- Implement throttling, provider rate-limit handling and a controlled queue appropriate to expected volume. Do not loop blindly over SMTP.
- Implement official vendor webhook signature verification on the exact raw bytes **before** JSON parsing or database action. Reject missing/invalid signatures, old timestamps, unsupported event types and replayed event IDs. Normalize provider events to delivered, hard_bounce or complaint.
- Store deduplicated webhook events keyed by provider/event ID. Suppress hard bounces and complaints globally, even after working lists disappear. Soft bounces do not automatically become hard-bounce suppressions.
- Persist sender/recipient content and show explicit recipient-count approval. A production adapter requires the separate explicit production action and an HTTPS public unsubscribe service. It must not convert local simulations into sends.
- Carry `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click`. Production RFC 8058 operation requires HTTPS and a DKIM signature covering both headers; the unsigned local `.eml` is only a fixture, not a production-compliance claim. [RFC 8058](https://www.rfc-editor.org/rfc/rfc8058).
- Test malformed signatures, duplicate/out-of-order events, opt-out during sending, reimport, provider timeouts, restart after pending send, deleted lists and blocked production configuration using synthetic data.

`verifySignedWebhook` is a tested illustrative HMAC primitive, not an implementation of any vendor's scheme. The HTTP application does not expose a production webhook endpoint until a real adapter and its authentication have been implemented.

## Failure handling, recovery and retention

A campaign claims `sending` before calling the provider. Each recipient gets a unique persisted send record and stable idempotency key before the provider call. Concurrent sends are refused; repeats of completed sends return the existing result. A provider exception leaves the campaign `failed` and the ambiguous recipient `needs_review`; automatic retries are deliberately blocked. After a process crash, a campaign may remain `sending` with `pending` rows. An operator must reconcile provider acceptance by message/idempotency key before any reviewed recovery code changes state. Do not delete send rows or reset approval to force a retry.

Keep suppression durable. Back up the SQLite database consistently with its WAL state; close the app before a simple file copy or use SQLite backup tooling. Test restoration locally before relying on it. Remove unused prospect working lists when no longer needed. There is no automatic erasure of compliance/audit records in this phase; the owner should set an appropriate documented retention period before production, and any purge must preserve valid opt-outs and the required unsubscribe-service window. Do not retain message content, company details or event payloads indefinitely merely because storage is available.
