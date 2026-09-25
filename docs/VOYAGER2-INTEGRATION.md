# Voyager 2 integration contract

Version 1, 2026-09-25. Voyager 1 implemented `marketing/`, a separate private Node/SQLite marketing desk. No public website, contact form, Formspark configuration, DNS, firewall, existing backend or SQL Server schema was changed. Local email simulation is working; production sending and public ingress remain unavailable until separately reviewed and configured.

## Ownership and current boundaries

Voyager 2 owns public website changes. Preserve both the GitHub Pages static build and the existing contact form, spam protections, timeout/error behavior and visible business-email fallback. The public site must remain useful when either Voyager and the marketing desk are offline. Do not make the marketing API a page-rendering or form-delivery dependency.

Current safe landing targets are the existing homepage anchors `/#business-systems`, `/#database-services` and `/#contact`. Dedicated `/data-migration`, `/legacy-systems`, `/access-migration` and `/database-services` pages are proposals for Voyager 2, not routes introduced or claimed as deployed by this change. Verify a route exists before using it in a real campaign.

The app starts on loopback. Do not expose the entire marketing HTTP application, its authentication endpoint, private API, SQLite file, outbox or admin UI to make the public routes available. A future approved deployment must provide reliable public handlers for exactly the unsubscribe and click paths and a private authenticated integration path for conversion events. No tunnel or router forwarding was created.

## URL contract

Every campaign has an opaque, random `campaign_code` that identifies the campaign, not the recipient. Use these conventional fields:

| URL field | Example | Meaning |
| --- | --- | --- |
| `utm_source` | `email`, `google`, `referral` | Campaign source |
| `utm_medium` | `outbound`, `cpc`, `organic`, `referral` | Channel medium |
| `utm_campaign` | `nj_manufacturing_2026_10` | Stable campaign slug |
| `utm_content` | `access_migration` | Optional message/creative variation |
| `nwd_campaign` | App-generated opaque campaign code | Internal campaign join |

Values must be 1–100 characters matching `[A-Za-z0-9][A-Za-z0-9_.-]*`. Lowercase underscore-separated UTM slugs are recommended. Never encode email, name, phone, company contacts, form content, database record IDs or private inference in URL parameters. The app rejects off-origin landing URLs, unsupported query parameters and unsafe fragment anchors.

Example shape, with the real app-generated code substituted:

```text
https://netherwooddatapartners.com/?utm_source=email&utm_medium=outbound&utm_campaign=nj_manufacturing_2026_10&nwd_campaign=APP_GENERATED_CODE#business-systems
```

A production email uses an opaque `/r/:token` link. The handler redirects to the stored allowlisted HTTPS campaign URL with these parameters. The token is never copied into the destination query string. Direct campaign URLs are suitable for ads/referrals. Ordinary public navigation must continue to work with no parameters.

## Public-site attribution capture: Voyager 2 work

1. Read only the five allowed fields above. Use the same bounds/character rules as `parseAttribution` in `marketing/src/attribution.ts`. Ignore unknown fields and malformed values.
2. Capture `landing_page` as a path only (maximum 200 characters), without query, fragment, email, referrer URL or form content. Keep a small first-touch attribution object. Do not create a visitor identity or browsing history.
3. Initially use in-memory/session attribution if approved. Any longer first-party persistence needs an owner-approved privacy/consent decision, a bounded expiry (proposed maximum 30 days), a clear reset/expiry rule, and graceful behavior when browser storage is denied. This change does not implement cookies or browser storage.
4. Preserve the first valid touch until session/expiry; a direct internal navigation should not overwrite it. If a later campaign touch is needed, keep one bounded last-touch record explicitly, not a clickstream. Version 1 reporting uses the selected attributed campaign only and must state the selected model.
5. Absence of UTM is **unknown**, not evidence of direct traffic. Classify organic Google, referral, direct and Google Ads only when supported by approved analytics or a reliable source. If using a referrer to classify, reduce it locally to a coarse channel and do not send/store the full URL.
6. Display no attribution error to a prospect and never block the existing contact submission. Keep the no-JavaScript form and email fallback operational.

## Contact form fields and handoff

Proposed hidden metadata field names for the existing form:

```text
nwd_campaign
utm_source
utm_medium
utm_campaign
utm_content
landing_page
attribution_model = first_touch_v1
```

These are untrusted metadata, not proof of permission or identity. The public browser does not send the marketing administrative token or conversion integration token. Keep existing Formspark validation and spam controls; do not recreate or replace the form.

A successful form submission remains owned by the current form service. Voyager 2 must verify an available, authenticated server-side event/export integration before wiring conversion delivery. A browser success message alone is insufficient for trusted server-to-server ingestion. If the form provider cannot supply a securely verified receipt, use the private desk's manual outcome entry or a reviewed import until an approved relay exists.

The relay reads only allowlisted attribution fields from accepted inquiries, maps the external inquiry to a stable opaque event ID, and posts the conversion event below after the form service confirms acceptance. Do not send name, email, phone, message body, IP address, user agent or CRM payload to this API. Do not report a conversion on button click, failed submission, validation error or spam rejection.

## Conversion event API: implemented

```http
POST /api/attribution/events
Authorization: Bearer <MARKETING_ATTRIBUTION_TOKEN>
Content-Type: application/json
```

Server-to-server only. Requests containing an `Origin` header are rejected. No browser CORS permission is granted. A separate integration secret of at least 32 characters is required; it must differ from the admin secret. Without it the endpoint remains unavailable to callers. Use an approved private network path; deployment is not performed by this change.

```json
{
  "event_id": "formspark_inquiry_102",
  "event_name": "inquiry_submitted",
  "campaign_code": "REPLACE_WITH_REAL_CAMPAIGN_CODE",
  "source": "email",
  "occurred_at": "2026-09-25T14:00:00.000Z",
  "attribution": {
    "utm_source": "email",
    "utm_medium": "outbound",
    "utm_campaign": "nj_manufacturing_2026_10",
    "landing_page": "/"
  }
}
```

Allowed `event_name` values:

- `inquiry_submitted`: a new accepted inquiry, confirmed by the form backend.
- `conversation_booked`: a confirmed booking, emitted by an authenticated scheduler integration or entered manually.
- `customer_created`: owner-confirmed customer relationship; do not infer it from a click or inquiry.

`event_id` is mandatory, globally stable per event, opaque and bounded by the same safe slug rule. Use different stable IDs for each event type. It must not contain personal information. Replaying the same event ID and type/campaign returns `{"accepted":true,"duplicate":true}` and does not increment totals. A conflicting reuse is rejected. A new event returns `{"accepted":true,"duplicate":false}`. Unknown campaign codes and unsupported event types fail validation. Keep source IDs in the existing form/scheduler business system, not a new CRM.

`campaign_code` may be omitted for a genuinely unattributed event. If both `campaign_code` and `attribution.nwd_campaign` are supplied, they must agree. Missing source is recorded as `unknown`. Timestamps are UTC; future timestamps beyond a small clock-skew window are rejected. The relay should retry transient transport/server failures with the exact same ID, persist a small bounded retry queue, and stop retrying permanent validation/authentication errors until corrected. Delivery failures must not block the prospect's form submission.

Authenticated `GET /api/attribution/summary` reports events with no campaign code grouped by source and medium, keeping Google organic, Google paid and unknown separate. These source totals remain visible without inventing campaigns or classifying absent UTM as direct.

The desk can record inquiry, booked conversation, customer and reply manually. Use an opaque reference ID to avoid double-counting repeat entries. Do not enter a manual copy of an inquiry already ingested automatically; the operator must reconcile cross-system duplicate reporting.

## Unsubscribe routes: implemented locally, public hosting required

| Route | Behavior |
| --- | --- |
| `GET /unsubscribe/:token` | Validate opaque token and show a short confirmation form; no suppression mutation |
| `POST /unsubscribe/:token` | Immediately suppress the snapshot address; repeat-safe; no login or explanation |
| `GET /r/:token` | Resolve stored destination; redirect only to the configured website origin |

The local HTTP adapter also supports legacy query-form unsubscribe/click aliases; new messages use the paths above. GET confirmation is intentional because mail-security scanners fetch links. A human submits form data `confirm=unsubscribe`; a mail receiver may submit `List-Unsubscribe=One-Click` using `application/x-www-form-urlencoded`. Successful POST displays “You have been unsubscribed from Netherwood Data Partners marketing emails.” No address or internal ID is disclosed. Missing/invalid tokens produce a generic failure page. Never require marketing-admin authentication for these public token actions.

Production one-click support requires public HTTPS and correctly signed email headers; see [EMAIL-PROVIDER-SETUP.md](EMAIL-PROVIDER-SETUP.md). Preserve tokens and suppression across deployments and list deletion. Do not expire links merely because a campaign ended. Keep opt-out functional during application failures and after working data is archived, using a reliable hosted service rather than relying on Voyager uptime.

At a future public gateway, allow only intended methods and exact routes, apply bounded request bodies and abuse controls without preventing legitimate mail-provider unsubscribe requests, redact token paths from access logs, and emit `Referrer-Policy: no-referrer`, `Cache-Control: no-store` and restrictive content/security headers. Do not forward the token to analytics, advertisements or third-party resources. Private admin routes must remain inaccessible externally. A proxy must preserve authenticated integration boundaries and account for the local app's strict Host/origin validation; simply publishing its port is not an integration.

## Metrics and Google Ads readiness

Implemented dashboard metrics: recipient snapshot, manual aggregate traffic, simulated/accepted/delivered messages, unique clicked recipients, inquiries, bookings, customers, replies, hard bounces, unsubscribes, skipped recipients and uncertain sends. No open pixels, fingerprinting, profile enrichment or lead score exists.

- Email click-through = unique clicked recipients / provider-confirmed delivered recipients.
- Email inquiry conversion = inquiry events / unique clicked recipients.
- Other-channel inquiry conversion = inquiry events / recorded aggregate visits.
- Customer conversion = customer events / inquiry events.

A missing denominator produces no rate, not zero. These are event ratios, not deduplicated person-level funnels; manually confirmed outcomes and incomplete delivery data can exceed a denominator. Mail-security scanners can follow click links, so clicks indicate requests, not verified human intent. Interpret inquiries and customers as the useful outcomes. Local simulations never count as delivered or clicked.

Non-email traffic can be entered per campaign/source/date through the authenticated desk. Updating the same source/date replaces that report total, avoiding repeat-import inflation. Use mutually exclusive source reports to avoid counting the same visits twice. No browser pageview collection is added by this phase. The CSV includes a campaign summary even for non-email campaigns.

For Google Ads, preserve `utm_source=google`, `utm_medium=cpc`, the campaign code, and an optional content slug; see [GOOGLE-ADS-PLAN.md](GOOGLE-ADS-PLAN.md). Voyager 2 must separately review analytics/consent, landing pages, verified form-success conversion mapping and any Ads tag or conversion API. This subsystem does not capture `gclid`, upload conversion data to Google, create advertising audiences or launch ads. Do not send personal form data to analytics.

## Environment and acceptance handoff

Existing variables: `MARKETING_PUBLIC_BASE_URL`, `MARKETING_WEBSITE_ORIGIN`, `MARKETING_ATTRIBUTION_TOKEN`, and the separate private `MARKETING_ADMIN_TOKEN`. Only the public base/site origin may appear in public configuration; both tokens remain server-only. No provider credentials or analytics IDs were invented.

Voyager 2 acceptance before enabling production attribution:

1. Demonstrate the website and contact fallback with the marketing service offline, storage denied and JavaScript disabled.
2. Verify UTM/campaign fields and proposed landing routes on actual static output, with no unrelated redesign.
3. Prove malformed fields and personal query values are dropped; no secret appears in browser assets or requests.
4. Use a synthetic accepted inquiry to verify stable-ID retry, duplicate suppression, wrong-token rejection and no conversion on failure/spam.
5. Verify GET unsubscribe does nothing, POST opts out, repeated POST succeeds, and reimport still excludes that address.
6. Verify synthetic tracked links resolve only to the allowlisted site; local simulation counts remain separate.
7. Confirm approved public hosting, HTTPS, reliable opt-out availability, backups and token/log privacy before any real email.
8. Confirm owner-approved source rights, provider policy, sender contact details, initial audience and deliberate send approval. No step here authorizes launch automatically.
