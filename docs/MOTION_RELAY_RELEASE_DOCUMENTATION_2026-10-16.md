# Motion Relay release documentation — October 16, 2026

## Owner direction and tracking

The owner explicitly approved polished public release-format documentation,
separate invited-tester material and documentation publication after revision.
Website issue #19 and Motion Relay #239/#216/#217 record the scope. This is
website/documentation authorization, not permission to release the latest apps,
merge app/backend/watch fixes, submit binaries or make provider declarations.

## Published-page scope

- Product and catalog use the exact approved dashboard sentence, positive
  activity/display descriptions and one visible Beta status near the headline.
- `/motionrelay/setup/` provides normal setup and everyday-use instructions.
- `/motionrelay/access/` contains the existing testing-invitation form, eligibility,
  consent and submission behavior. Phone buttons use this route while verified
  distribution URLs are unavailable. A request is not guaranteed enrollment.
- `/motionrelay/compatibility/` explains watch/phone, sensor, account and display
  requirements without cluttering the marketing pitch.
- `/motionrelay/releases/` covers update channels and actual current known issues;
  corrected candidates are not described as released.
- The old product `#beta-signup` anchor leads visitors to the access page.

The public pitch omits repeated preview/missing-reading warnings and free-during-
beta language. Tester instructions retain appropriate pre-release information.
Privacy/Terms policy bodies, form transport/fields/consents, global theme, layouts,
article publication, all unrelated products and services remain unchanged.

## Assets and screenshot status

All existing Motion Relay artwork stays in place. No synthetic app screen is
promoted as a release capture. Eight iPhone and nine Android fixed-candidate
capture rows in Motion Relay remain PLANNED with null actual capture identities.
Actual app screenshots are pending. The before/after page PNGs generated here
are website/document previews only and are saved locally under
`outputs/motion-connect-qa/`; they are not public application evidence.

Motion Relay draft provenance: accepted iPhone guide PR314 at
675d1b2ea78db1da8e64c69969a85e6e43080bc9, Android guide PR320 at
54d8e8b9a1b5207e0f4f81bc09fbac5ad1415a3a and qualified copy PR324 at
f93051df6323923713b25a3e7dfc7a66ad7e7ce5. Revised public/tester versions are
in Motion Relay PR325. Website source baseline is
bd6b92e9f97697add42f15ea1ae7d8dbf8835bca.

## Validation

Passed production build, static Pages build and all 37 route/link/metadata checks.
The 10-article content digest remains
ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8.
Responsive browser QA passed 27 renders at 1440, 768 and 390 pixels, with no
horizontal overflow or broken images, one main heading, keyboard navigation and
no-JavaScript routes. Invitation form submission was intercepted with synthetic
data; no real inquiry was sent. Final lint and whitespace checks are required
before commit. The revised standalone iPhone guide was rendered separately at
1440/390 pixels with exactly one Beta marker and no horizontal overflow.

An initial lint/build attempt encountered ETIMEDOUT reading a reused synced
cache. Only this task's stalled process and cache links were stopped/removed;
a frozen offline dependency install reused all 464 cached packages with zero
downloads. Subsequent production/static builds, lint and browser checks passed.
An obsolete beta-signup link assertion was updated to check the actual new
access route, after its first failure was retained in the local check log.
No dependencies, lockfiles or workflows were changed.

## Publication and rollback

Merge only this focused website change after its CI checks pass. Main push uses
the existing gated Publish website workflow; do not dispatch a duplicate run.
Record the exact merged source, successful run and actual public manifest and
route readbacks in #19/#239/#217. Preserve the current 10-article content digest,
content commit and disabled chat state. Before publication, public manifest
source is bd6b92e9f97697add42f15ea1ae7d8dbf8835bca, content commit
cb8ca812278afbde28a83309976a1823f6cf3fdd, run 38841481611.
Use the existing Pages rollback workflow with that retained release artifact,
or a reviewed source revert, if rollback is required. No rollback is performed
as part of this documentation update.
