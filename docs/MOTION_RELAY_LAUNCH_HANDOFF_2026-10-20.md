# Motion Relay website and tester acquisition handoff

Candidate only, October 20, 2026. Owner: Codex Mac website lane.
Tracking: Netherwood website #38 / Project 3. Dependencies: Motion Relay
#217 coordination, #218 enrollment/assistant availability, #239 public experience,
#216 outreach. No publication, invitations, form delivery, store action, billing,
merge or deployment was performed by this handoff.

## Website findings and candidate

Baseline: `856465e60c6cfc1e0833c5c5b96c80a9eaf0ddfc`.
The live access page was independently read in a browser on October 20:
https://netherwooddatapartners.com/motionrelay/access/.

The product leads with live phone readings, but its invitation form requires
ChatGPT Voice. This excludes people who could test the core phone dashboard.
The candidate makes Voice readiness optional and aligns the compatibility page.
Existing field names, transport, spam controls and invitation review remain.
The form now states the existing U.S. adult preview scope and provides a direct
business email fallback beside the form. No date of birth, address or health
details are requested. This is an access request, not an account or legal-terms
acceptance, a public install guarantee, or evidence of compatibility.

Keep the established headline: “Your Garmin metrics. Relayed live.”
Keep the verified product route and lead with the watch → phone experience.
Do not replace invitation CTAs with generic store homepages. Do not publish an
Android enrollment link, public ChatGPT directory claim, or ChatGPT Free claim
without #218 acceptance. iPhone store approval and phone installation do not
prove a successful unaffiliated tester workout.

## Reviewable copy for owned or explicitly permitted channels

These drafts are for owner review and factual revision. They are not for
r/Garmin, which prohibits AI-written submissions.

### Short tester invitation

I’m building Motion Relay to bring current Garmin workout readings onto your
phone, so you can see your workout in a larger view while your watch records it.
I’m looking for a few people to help test setup, readability and connection
reliability on different watches and phones.

ChatGPT testing is optional and needs a separately supported connection.
The preview is for United States residents age 18 or older. Phone access is by
invitation, and I’ll confirm the supported setup before sending instructions.
If you’re interested, tell me your watch and phone models here:
https://netherwooddatapartners.com/motionrelay/access/

### Product page / profile introduction

Your Garmin metrics. Relayed live.

Motion Relay brings current Garmin workout readings to your phone. Check your
workout dashboard and the supported workout displays while your watch records
the activity. An optional, separately authorized ChatGPT connection supports
conversation about available readings on eligible testing setups.

Explore Motion Relay and request a testing invitation:
https://netherwooddatapartners.com/products/garmin-ai-connector/

## Channel plan and current constraints

| Priority | Channel | Concrete next step | Gate |
| --- | --- | --- | --- |
| 1 | People who explicitly request testing | Review watch/phone setup, then individually invite after the supported build/path is verified | Owner-authorized invite; no unsolicited list |
| 1 | Owner’s own Strava profile or a relevant club with administrator permission | Use a short personal update and one access link; seek feedback on setup and readability | Owner approves copy and publication; club-specific rules checked |
| 2 | Garmin Connect IQ listing | Keep beta/access/support links consistent with verified store status | Owner retains store submission |
| 2 | r/Garmin | Owner writes an original introduction in their own words; check developer flair, title, prior-post count and current rules | AI-written posts/comments prohibited; narrow developer exception and link eligibility require review |
| 3 | Other running/cycling communities | Select one relevant community; read its current self-promotion/tester rules before preparing a post | Do not assume permission from relevance; no bulk cross-posting |
| Later | Product Hunt or broad paid launch | Wait until an unfamiliar person can install, start and finish the supported flow without manual rescue | Public access, privacy/provider/store acceptance and support coverage |

Current official sources checked October 20, 2026:

- https://www.reddit.com/r/Garmin/about/rules.json : advertising restrictions,
  a narrow creator exception for Connect IQ items, and a prohibition on AI-written
  posts/comments. This pack provides no ready-to-post r/Garmin text. The owner
  should consult the current rules/moderators about any ambiguity.
- https://www.strava.com/legal/acceptable_use?hl=en-GB : spam and disruptive
  behavior restrictions, including club content unrelated to the club purpose.
- https://support.strava.com/en-us/articles/15402158-spam-bots-and-unwanted-solicitations :
  unsolicited promotions and repeated comments/follow requests are spam signals.
- https://support.strava.com/en-us/articles/15401625-what-are-the-club-moderation-guidelines-for-admins-and-owners-on-strava :
  club rules and platform standards remain applicable. Permission in one club
  does not authorize another.

No claim that a venue permits this exact post has been made. No moderator or
club administrator was contacted.

## First tester cohort acceptance

Start small enough to respond personally. Record only voluntary operational
feedback, never workout packets, routes, account credentials or health details.
Use a short checklist per supported setup:

1. Did the person understand the watch/phone requirements before applying?
2. Could the eligible person install through the supplied invitation path?
3. Could they pair the watch and start receiving the current workout?
4. Were labels, units, numbers and connection state readable outside?
5. Did pause/resume/reconnect and supported background/Lock Screen behavior work?
6. Could they find support, disconnect/sharing controls and deletion instructions?
7. If separately eligible, did a text question and then Voice use current readings?

Count requested → eligible → invited → installed → first successful workout →
repeat tester using owner-reviewed notes. Do not introduce tracking pixels or
analytics, fabricate conversions, or count requests as active users. Ask a
satisfied tester for permission before using their quote or screenshot publicly.

## Launch items that need explicit evidence

- Verified unaffiliated enrollment on each offered platform; truthful restrictions.
- Genuine, current screenshots with synthetic or explicitly approved display data.
- Brief watch → phone setup demonstration; distinguish recordings from concepts.
- Current public compatibility and known-issue pages tied to released versions.
- Actual signup delivery and support response ownership. The candidate tests
  intercept Formspark locally; no real request or email was sent.
- Paid entitlement, restore purchases, cancellation/manage subscription, receipt
  validation and pricing disclosure acceptance before selling. No prices or
  paid availability are promised by this website change.
- Provider/privacy release decisions, owner-approved copy and publication.
- A tested rollback for the exact release, followed by public route/readback QA.

## Dependency audit follow-up

A fresh backend install reported six audit findings: source-map-js high;
sanitize-html, sprintf-js, argparse, mammoth and tedious moderate. This is a
private backend dependency finding, not evidence of an exploitable public
website. Exact audit output is a local verification artifact. Assess the paths
and update in a separate tracked dependency change; do not use a forced audit
fix or mix backend changes into this signup candidate.

## P1 disclosure reconciliation

The release audit identified stale public iPhone persistence wording. The
candidate now describes iPhone 0.3.0 (45) and Android 0.3.3 (9) local current/last-workout storage,
implemented iOS data protection and Android Keystore encrypted storage, backup
exclusion, local clearing/session markers and separate compact backup. It also
reconciles terms, deletion/support guidance and the completed Health removal
in that exact iPhone beta. It adds no fixed retention promise or legal guarantee.

Source inspected: Motion Relay `6c31961b3f0184c6002e7b288c86d2d102ab3467`,
`ios-app/RunBridgeAI/MetricsRecorderService.swift` lines 95–100,
`shared/Sources/RunBridgeCore/WorkoutLocalStore.swift` lines 722–752,
and `ios-app/RunBridgeAI/HelpView.swift` workout retention/recovery articles.
Android source independently inspected: `3bf2cceaca9f5a334d3866bee5fa6c279bc40ae4`,
`WorkoutVault.kt` and `CompanionModel.kt` current-workout clear path. The website
JSON matches the root-reviewed four-page portable payload in all paragraphs,
sections, links and metadata. Platform claims remain version-specific. Physical locked-phone, recovery and
end-to-end deletion acceptance remain open under Motion Relay #221/#156.
Owner review and independent publication are still required.

### r/Garmin facts for the owner to consider in their own writing

- Disclose that you created the Connect IQ item and Motion Relay phone app.
- Describe the specific running problem you personally wanted to solve.
- State the watch and phone you actually tested; distinguish that from support.
- Explain watch data field → phone readings in your own words.
- If discussing ChatGPT, state separate supported access and authorization.
- Use the required developer flair and app-title format, only if the item and
  post meet the current creator exception. Check whether an earlier post already
  used the one-post-per-item allowance. Follow current link restrictions.
- Ask one useful question about setup or readability, without a survey or data
  collection request. Do not paste this AI-generated checklist as a post.

## Candidate verification and release gates

Validated with Node 22.23.3 and required pnpm 11.19.0: lint, Vinext test/build,
static Pages build, generated route/link/schema checks and diff whitespace.
The static release retains all 37 canonical routes and ten articles with digest
`ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8`.
Responsive browser checks use installed Chrome with the repository QA script.
Before/after signup screenshots at 1440, 768 and 390 pixels are saved under
`docs/evidence/2026-10-20-motion-relay-launch/`. Home, About, Articles, product,
setup and companion documentation are included in the browser regression.
The phone-only signup's synthetic Formspark request is intercepted locally;
no real request is sent. Keyboard skip-link and no-JavaScript route checks pass.
These checks establish local candidate behavior, not production form delivery,
physical app acceptance or external enrollment.

Merge and publish only after owner review, current platform/access receipts and
required disclosure approval. After deployment, independently read the live
access, compatibility, privacy, terms, deletion and support routes. Confirm the
exact Pages source and public policy version. Revert this focused change if a
regression is found; preserve the existing publication pipeline and content.

Website backend security follow-up is separately tracked as Netherwood #39 on
Project 3. It is not hidden inside this copy/signup change.

Final browser result: **PASS 39 responsive renders** at 1440/768/390,
no document overflow, one main heading per route, no broken images or browser
page errors, plus intercepted phone-only signup, required eligibility checkbox,
keyboard skip link and no-JavaScript document checks. Complete metrics are in
`docs/evidence/2026-10-20-motion-relay-launch/browser-results.json`.
Policy mobile screenshots accompany the signup before/after evidence.
