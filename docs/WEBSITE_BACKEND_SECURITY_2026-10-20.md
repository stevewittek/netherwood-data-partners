# Website backend security candidate

Tracking: Netherwood #39 / Project 3. Owner: Codex Mac, October 20, 2026.
Separate branch `codex/website-backend-security-patches`, explicitly based on
website PR #40 head `8d5476c`. No deployment or merge is performed.

## Changes and evidence

- Direct `sanitize-html` 2.17.7 → 2.18.1, retaining the existing major version and
  supported Node floor. Its dependency graph updates PostCSS, launder and nanoid
  to compatible required versions and removes unused deepmerge.
- Locked `source-map-js` 1.2.1 → 1.2.2, resolving the high-severity
  [indexed source map denial of service advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q).
- Explicitly discard `noscript` bodies as well as script/style/textarea/option
  bodies in the article sanitizer. An integration probe with a malformed
  `noscript` wrapper otherwise left a hidden remote image in sanitized output,
  even after the library update. A regression test covers that boundary,
  rejected meta refresh and rejected SVG animation while retaining ordinary text.
- The sanitizer update addresses [implied-close/noscript handling](https://github.com/advisories/GHSA-x3q4-9hxx-gx8m),
  [SMIL namespace URL bypass](https://github.com/advisories/GHSA-374f-7chj-9948)
  and [meta refresh URL handling](https://github.com/advisories/GHSA-cv27-6wvh-8x7j).
  The existing article allowlist excludes meta/SVG and scriptable attributes;
  those controls remain. This is defense in depth, not evidence the public site
  was exploited.

The backend is separate from the static public website. Its document extractor
reads local bounded .docx files through `mammoth.extractRawText`; it does not
invoke the Mammoth command line. Source maps enter through PostCSS internals,
not a website upload route observed in this audit. Public article output still
uses the same explicit tag/attribute/scheme allowlist and static publication.
No backend exposure, database, credentials, billing or hosting changed.

## Remaining advisory

Before: npm audit reported 6 entries: 1 high, 5 moderate.
After: **0 high, 4 moderate**, also **4 moderate with development packages omitted**.
All residual entries describe the same
[sprintf-js unbounded precision advisory](https://github.com/advisories/GHSA-hp3w-g68c-fv3c)
through sprintf-js / argparse / mammoth / tedious. The official advisory lists
**no patched version**, and npm reports 1.1.3 as the latest release at this check.
A forced audit fix suggests an inappropriate major downgrade of Mammoth; this
candidate does not perform it or replace the SQL driver.

Reachability review: Mammoth uses argparse in its CLI; our document path calls
its library extractor. Tedious uses sprintf-js for diagnostic packet/error text
with literal format strings in the inspected calls. The advisory requires an
attacker-controlled format string. No application path forwarding user input as
that format string was found in this bounded review. This reduces observed
exposure; it is not a proof of non-exploitability or a closure of the advisory.
Keep #39 open for upstream monitoring or a separately reviewed replacement if
required by release policy.

## Verification and handoff

- Backend suite: 71 tests passed, zero failed/skipped; strict typecheck passed.
- Publication tests and static article parity must pass before PR handoff.
- Required pnpm 11.19.0 lint, Vinext test/build and static Pages build, route/
  metadata/link/schema validation and diff whitespace check cover integration.
- Website local browser smoke checks confirm affected article and product routes
  still render. They do not establish live server, database or production behavior.

Review exact package/lockfile/source/test changes, retain #40 as the explicit
base dependency, and deploy only through the existing owner-approved release
workflow. Revert this focused dependency/sanitizer commit for rollback.

Final local results: all checks above passed. Publication suite passed 23 tests
plus 3 pipeline tests; static verification retained 37 canonical routes and the
unchanged ten-article content digest. Browser smoke passed 6 renders: one full
article, Motion Relay product and privacy pages at 1440/390, with one heading,
HTTP200, no overflow and zero page errors. No real external form was submitted.
