# Android build 6 disclosure update — October 10, 2026

Scope: Motion Relay issue #156. Update the four existing privacy, Terms,
support and deletion routes without changing layout, CSS, images or navigation.
The public policy version is 2026-10-10.

## Release evidence

- Android source: `c4aa5793c790ac9202ad31839d601d70a8b17b1e`.
- Version: 0.3.0, version code 6.
- Signed AAB SHA-256: `DDA88E59C61734C0D6DBE56A5779BF1A5ED85ABC145895C73C1E1E5B0D5E3F6E`.
- Release owner verified matching registered upload certificate and Google Play
  internal track: active, latest 6 (0.3.0), available to internal testers on
  October 10 at 12:12 PM America/New_York. Website lane independently checked
  the artifact hash and inspected the saved Play publication evidence.
- Store record: https://github.com/stevewittek/motionrelay/issues/155#issuecomment-6099557629
- The release owner reported 69 passing tests and zero lint errors. These were
  not rerun by this website-only change and do not establish physical acceptance.

## Copy reconciliation

The October 8 policy said all complete local workout storage was planned.
Android build 6 now has experimental one-current-or-last storage, eligible
numeric readings, timing and association fields, interruption markers, new
workout replacement and ended-workout review. Source inspection of
WorkoutHistory.kt and WorkoutVault.kt confirms the allowlist, access gate,
app-private encrypted payloads, Android Keystore, backup exclusions and
retired session markers. Markers remain after clearing readings. No GPS or
full-series cloud archive is added. Optional compact backup requires separate
consent and is a different feature.

The public copy qualifies this behavior by platform and exact version and
states the unverified physical-storage, background-recovery and deletion
acceptance limits. iPhone persistence is not established by this Android
release. Local clearing, sign-out, stopping sharing and service-account deletion
remain distinct. No legal review or security certification is claimed.

Support includes the existing authorized-tester Play URL with an internal-test
label. The link does not grant access to new testers. No account, subscription,
store configuration, tester list or app code is changed.

## Open acceptance

Tester installation/version confirmation remains with #153/#155. Physical
storage, crash/reboot/lock recovery, account isolation and end-to-end deletion
remain with #42/#88/#151. This website publication cannot close those gates.
Bundled help and store declarations remain the release owner's reconciliation
responsibility under #156; website changes alone do not synchronize app bundles.

Product-row placeholder follow-up is tracked separately in #160; this policy
change adds the limited tester link to Support without changing the product UI.

The release owner reviewed the exact JSON diff before publication and requested
no additional copy changes.

Rollback: revert the focused website commit and use the standard Pages workflow.
