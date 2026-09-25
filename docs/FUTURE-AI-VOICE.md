# Future AI-assisted phone outreach

**Future design only. Disabled; no automated marketing calls in this phase.** Prepared September 25, 2026. Core email/list/suppression and attribution work takes priority. This design does not establish a right to call any number.

## Transparency and launch boundary

An AI voice assistant must identify itself as an automated/AI assistant representing Netherwood Data Partners. It must never secretly impersonate the founder or clone a person's voice without appropriate permission. Suggested opening, for a future reviewed and consented scenario:

> Hello, this is an automated AI assistant calling for Netherwood Data Partners about [accurate purpose]. You can ask to speak with a person or ask us not to call again at any time.

This is company policy for a future system, not a representation that this wording alone satisfies every legal disclosure. A disclosure does not replace required consent.

## Current legal facts and items to verify before implementation

- The FCC treats AI-generated human voices as artificial/prerecorded voice for TCPA purposes. The current [47 CFR 64.1200](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200) generally requires prior express written consent for telemarketing using artificial/prerecorded voice to covered mobile numbers and residential lines, subject to specific exceptions. A publicly listed business number is not evidence of consent or proof that it is a business landline.
- The FCC's 2026 proposal reiterates the earlier AI-voice determination; **proposed rules are not adopted requirements**. [FCC 26-16, footnote 77](https://docs.fcc.gov/public/attachments/FCC-26-16A1.pdf)
- The FTC extended misrepresentation protections to B2B telemarketing and updated recordkeeping. Do not interpret older broad B2B exemptions as blanket permission. [FTC rule summary](https://www.ftc.gov/policy/public-comments/telemarketing-sales-rule-9)
- New Jersey has telemarketer registration and do-not-call requirements. Have counsel assess the actual calling model, exemptions, numbers, locations, disclosure, recording/transcription, calling hours, and current effective rules before any pilot. [NJ Consumer Affairs](https://www.njconsumeraffairs.gov/telemarketers)

The future policy should require documented, applicable prior written permission for every AI marketing call, even if a particular narrow legal exception might exist. An ordinary inquiry, email opt-in, bought company list, or existing customer relationship must not automatically enable AI calling. This conservative product rule is distinct from a legal conclusion about every possible call.

## Small architecture

`Approved consented list -> authorization/compliance gate -> calling provider -> bounded AI script -> human transfer or scheduling -> result + suppression`

Keep this a separate disabled adapter, reusing the company's lightweight campaign records. Do not build a dialer now.

- **Eligibility record:** normalized phone, source, consent evidence reference, specific seller/purpose/AI-call scope, capture time, revocation status, and counsel-approved call eligibility. Store evidence privately with limited access.
- **Suppression:** separate persistent phone do-not-call store, normalized internationally; survive list deletion/re-import. Check before scheduling and again immediately before dialing. An explicit “do not contact” request should reach every applicable channel.
- **Provider:** reputable calling service, approved caller identity, secure credentials, authenticated/idempotent callbacks, bounded concurrency, cost ceiling, and immediate kill switch. Reject missing consent or ambiguous eligibility.
- **Agent:** fixed approved purpose, concise script, truthful identity, clear opt-out, no invented customer knowledge, no promises or contracts, no collection of sensitive information.
- **Human handoff:** transfer only to an available person; otherwise offer an actual scheduling option. Confirm timezone and slot before booking. Never represent a failed transfer as a booked conversation.
- **Results:** attempted, connected, declined, do-not-call, human transfer, booked, or provider failure. Save minimum useful data; define counsel-reviewed audit retention. Recording and transcription remain off until their lawful basis, notice/consent, security, and retention are approved.

## Required future acceptance tests

Use synthetic records and provider sandbox only: missing/revoked consent blocks; suppression survives re-import; stop request cancels queued calls; unknown number eligibility blocks; time/cost limits block; duplicate callback cannot duplicate a booking; human transfer failure is truthful; provider outage fails closed; kill switch stops new calls. Test script disclosure and opt-out recognition with human review.

Recommended first experiment, only after review: explicitly consented callbacks requested by customers who knowingly choose an AI assistant. Do not start with automated cold calls to purchased or publicly researched numbers.
