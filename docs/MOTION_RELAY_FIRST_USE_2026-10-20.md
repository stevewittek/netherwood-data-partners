# Motion Relay first-use website candidate

Tracking: Netherwood #42 / Project 3. Owner: Codex Mac website lane.
Base: actually published `3a66d636d45300fe5568568684f24ad8765aef6a`.
This candidate is separate from completed website #38 and security #39. The
owner’s approval for PR40/41 does not authorize this candidate’s publication.

## Problem and result

An unfamiliar person arriving directly at the invitation page had no nearby
phone/watch requirements or compatibility link. The candidate puts the existing
iOS17+/Android8+ requirements before the form and links the compatibility guide,
while retaining installation-channel qualification and invitation review.

The compatibility guide referred to a Connect IQ listing without linking it.
It now uses the existing configured canonical Garmin URL:
`https://apps.garmin.com/apps/48fdea2a-2703-4873-a483-13cae2a9f1ec`.
This is the same `motionRelayDownloads.garmin.url` already used in the product
and setup page and the current native build configuration; it was not guessed
from a new identifier. No new supported model or store availability is claimed.

The setup instructions previously combined start/pause/resume/save without a
first-reading checkpoint. The candidate tells the tester to keep Motion Relay
open nearby, confirm available current readings on Home, and use connection help
if absent before proceeding to pause/save. It promises no latency or background
reliability. New links reuse the existing underlined text-link style.

Only three page components change. Approved headline, global styles, form
transport/fields/eligibility, policy payload and release pipeline remain intact.
No native source was edited. The stale native “Account” setup-footer label was
reported separately to the native owner; actual navigation is Settings.

## Verification

- Node22.23.3 / pinned pnpm11.19.0 lint, Vinext test/build, static Pages build.
- Generated37-route metadata/link/schema check; ten-article digest unchanged.
- Nine local responsive renders: access, compatibility and setup at1440/768/390;
  one main heading, HTTP200, no document overflow or page errors.
- Exact compatibility/ConnectIQ/support link targets and first-reading copy.
- One synthetic signup intercepted locally: request payload retains the source,
  optional Voice remains unchecked, required eligibility acknowledgement remains.
  No real Formspark submission, message or invitation.
- Diff whitespace check and focused source review.

Screenshots and machine-readable browser results are under
`docs/evidence/2026-10-20-motion-relay-first-use/`. Before access screenshots are
from the independently verified public3a66release; after screenshots are the
local candidate. This is not an additional live21-render or native-device run.

## Review and release gates

Source review and explicit approval are needed before merge/publication. After
any authorized release, check the exact public source manifest and these three
routes. Do not infer enrollment, actual signup delivery or app/device acceptance
from a website build. Revert this focused candidate for rollback; no unrelated
content, policies or publication workflow should change.
