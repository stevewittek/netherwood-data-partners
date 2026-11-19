# Netherwood website assistant

This is the dedicated OpenAI chatbot service. It runs independently of the existing Voyager article/SQL/Ollama service and never requires a database migration. GitHub Pages remains static. **Do not point the widget at the legacy `/api/chat` route**: that route does not implement this service's spending gate.

## Local use

From the website root:

1. Put `OPENAI_API_KEY` in **backend/.env.local**, not a `VITE_` variable. Keep the file ignored and mode 0600.
2. `pnpm --dir backend assistant:setup` creates owner-only `.private-chatbot` storage and seeds verified public service facts. Existing knowledge and spending are preserved.
3. Verify the organization's actual remaining credits, grant expiry and auto-reload setting in OpenAI billing. Allocate only credit already available, leaving a reserve for other usage. Example syntax: `pnpm --dir backend assistant:manage credit GRANT-ID ALLOCATION-USD DAILY-USD EXPIRY-ISO`. Reuse the **same grant ID** whenever verification is renewed. Do not reset the ledger or invent a new grant to bypass a cap. Verification defaults to 24 hours. After reviewing a prepaid grant, append `--prepaid-grant` to allocate it through its actual expiry (at most 31 days from verification). This never resets spending or assumes renewal.
4. `pnpm --dir backend assistant:start` binds only to 127.0.0.1:8787.
5. For the static-site dev server, put `VITE_PUBLIC_CHAT_ENABLED=true` and `VITE_ASSISTANT_API_URL=http://127.0.0.1:8787` in ignored `pages-site/.env.local`; run `pnpm exec vite --config vite.pages.config.ts --host 127.0.0.1 --port 5173`.

The client only accepts HTTP loopback during development. A public build requires HTTPS. The default publication workflow still disables chat until the backend gateway is reviewed and verified.

## Appearance and business content

`app/content/chatbot.ts` controls name, subtitle, portrait, colors, welcome copy, suggested questions and contact link. `app/chatbot.css` is scoped to the floating widget. No generated image is used for interactive text or buttons.

Approved facts live in `backend/.private-chatbot/knowledge.json` (or an absolute `NDP_ASSISTANT_DATA_DIR`). The directory is private and ignored; never put original documents in this public repository. Its contents are data for public answers, **not a confidential vault that the model may freely read**. Only approve excerpts you are comfortable having a visitor learn. Each document can have `expiresAt`; expired/unapproved documents are excluded. Changes invalidate stored chat context.

To add a Word, PDF, Markdown or text document:

- `pnpm --dir backend assistant:manage draft /absolute/path/to/document.docx`
- Read the private draft JSON file reported by the command. Review extracted text, names, client confidentiality, facts and dates. A draft is not used in answers.
- `pnpm --dir backend assistant:manage approve SHA256-FROM-DRAFT`

Approval checks the draft hash. Changed text needs a new reviewed hash. Remove/withdraw a source in the private knowledge file to stop its use. No HTTP upload or document download route exists. The initial retrieval is bounded keyword search, not paid embeddings; it is suitable for a small reviewed corpus. Large files must be split into reviewed sections.

## Inquiries and conversation review

`pnpm --dir backend assistant:inbox` displays saved inquiries and recent conversations privately in the terminal. `pnpm --dir backend assistant:manage reviewed INQUIRY-ID` marks an inquiry reviewed. When `NDP_INQUIRY_FORM_URL` is set to the existing approved Formspark endpoint, new consented inquiries queue an owner email. Set `NDP_REQUIRE_NOTIFICATIONS=true` in production so a missing notification destination prevents startup. The durable outbox retries up to five times with backoff; its stable inquiry reference helps identify a possible duplicate after an ambiguous acknowledgement. `accepted` means Formspark accepted the submission, not proof of mailbox delivery. Existing saved inquiries are not emailed retroactively. Failed notifications leave the inquiry available for private owner review.

The visitor explicitly submits contact details and consent. Success appears only after a durable save. Duplicate submissions reuse an inquiry ID. Only the last five exchanges per conversation are retained, for up to 30 days after activity; inquiries expire after 90 days. Hourly maintenance, startup and inbox reads purge expired data. A stopped server cannot run maintenance; restart purges before serving. Local backups, if introduced, need matching retention. Budget totals are never purged. Session credentials are random server-issued bearer tokens, hashed at rest and kept in the visitor's tab storage. A full navigation restores recent history; a new chat discards the tab's old session token.

No page-view telemetry is triggered by this widget. The model has no browsing, SQL, shell, email, scheduling or purchasing tools. Instructions limit it to business services and relevant technical guidance. Simple scope filters catch obvious misuse but are not a universal classifier. Source citations are allowlisted. AI answers still require human judgment.

## Credit controls and failure behavior

Every paid request reserves a conservative input/output cost **before** reaching OpenAI. A file lock serializes the ledger across processes. Usage settles the reservation only after a complete validated response. Timeouts and ambiguous failures retain the full reservation. Same-ID retries never repeat a paid call. Two global requests and one request per conversation may be in flight. There are input-size, request-rate, history, session and lifetime-turn caps.

Quota/billing errors, invalid credentials or missing usage persistently disable paid chat. The launcher is checked on load and every minute and disappears when unavailable; an already-open conversation retains its contact fallback. Exceeding a budget estimate also blocks further requests. Restore service only after investigating: `assistant:manage resume`. It does not reset spending or renew verification.

A crashed process can leave `state.lock`. Keep chat offline, verify no process is running, reconcile pending reservations and remove the stale lock as an owner recovery action. Never simply delete `state.json` to restore service.

This local allocation is not a live OpenAI organization balance API. Other keys share the organization's credits; a monthly calendar reset does not prove a renewed grant. OpenAI billing enforcement may lag. The credit lease and conservative reserve reduce exposure, but are not a promise of mathematically exact zero-dollar overdraft. Production needs a documented balance-verification/renewal process and account-level recharge/spend controls. Leave auto-reload off.

Price assumptions: gpt-5.4-mini standard tier, $0.75 input / $4.50 output per million tokens, 500 output tokens, reasoning `none`, verified 2026-11-19 against https://developers.openai.com/api/docs/models/gpt-5.4-mini. Update reservation rates before changing models/prices. `store:false` prevents stored Responses, but does not establish Zero Data Retention; see https://platform.openai.com/docs/guides/your-data.

## Public deployment boundary

Deploy this service on an approved private host with persistent owner-only storage, a supervised process and an approved HTTPS gateway that exposes **only** `/api/assistant/*`. Do not expose the data directory, terminal inbox, backend source or legacy paid endpoint. Set `NDP_ASSISTANT_ORIGINS` to the exact public website origins. The service intentionally does not trust `X-Forwarded-For`; behind a proxy its rate limit is shared. Apply additional gateway limits before launch, and configure trusted client-IP handling explicitly if needed.

The dedicated `Assistant.Dockerfile` and `assistant.compose.yaml` run only this service, with persistent private files and a loopback-only host port 18887. Set `NDP_ASSISTANT_RELEASE` and `NDP_ASSISTANT_PRIVATE_DIR`; the runtime env file mounts read-only. A separate approved HTTPS tunnel is needed for public access. `assistant.tunnel.compose.yaml` adds a pinned Cloudflare connector to the assistant network without host networking or published ports. Its owner-only token file is mounted read-only. Configure only the hostname `chat.netherwooddatapartners.com`, path `^/api/assistant/.*$`, service `http://assistant:8787`, and a 404 catch-all. The model key is never given to the connector. No SQL service or router forwarding is required. Do not add the OpenAI key to GitHub Pages settings or client code. Before release, verify the public gateway, retention, spend controls, cross-origin behavior, privacy copy, mobile keyboard and VoiceOver/NVDA. Existing contact form/email remain available. Revert the release commit or set the frontend flag false to roll back the widget; stop the assistant process to stop paid requests.

## Accessibility and voice

Keyboard focus enters the question field; Escape closes and restores the launcher. The conversation uses a polite live region. The dialog is non-modal; the rest of the site remains usable. Reduced-motion and forced-color styles are included. Optional read-aloud uses only an English voice reported by the device as local. Native device dictation can enter text. This version does not capture/upload audio; custom microphone and Realtime integration are follow-on work. Automated lint and browser checks are not a claim of WCAG compliance or a substitute for screen-reader testing.
