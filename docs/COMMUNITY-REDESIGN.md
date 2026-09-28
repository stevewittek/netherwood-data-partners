# Community, software and systems support redesign

Owner request: September 25, 2026. Branch: `feat/community-technology-website`.
Baseline: released `origin/main` at `840cf9a`. This branch is a review candidate;
the existing production site stays in place until this revision is released.

## What changed

- Home now leads with personal software, data and systems support. Four clear
  paths cover support, database services, connected workflows and migrations.
- Three photography-style generated scenes depict fictional business people,
  with the mixed community representation specifically requested by the owner.
  The revised hero is set in a working print/sign business; the handshake scene
  is a workshop consultation. The first all-white drafts were not used.
- A licensed photograph of the actual Netherwood station anchors the local
  community section and About. An original schematic links selected communities
  along the Raritan Valley Line; it does not claim to be an official map.
- Home has a substantial photographic hero, business scenes and a station
  backdrop. Existing fonts and green identity remain, with lighter surfaces.
  New styles are scoped to community components; article reading styles remain.
- `/services/software-systems-support/` adds a concrete service for application
  investigation, vendor coordination, reporting and agreed ongoing support.
  The same existing catalog generates its page, metadata, schema and sitemap.
- About and the service index now support the broader positioning. General
  contact links go to `/#contact`; the contact form adds a software-support
  option. Migration-specific intake and readiness tools remain available.
- Public company knowledge and current design/voice/architecture guidance match
  the new positioning. Older dated instructions remain as historical records.

## Images and factual boundaries

Images are local optimized WebP assets in `public/images/community/`. Generated
photographs are 1536px with 768px variants, 44–132 KB each. The station image is
229 KB. Images have explicit dimensions; only the page's lead image is eager.
No image hotlink, tracking image, font CDN or runtime dependency was added.

The image-generation prompts and source filenames are recorded in
[COMMUNITY-IMAGE-PROMPTS.json](COMMUNITY-IMAGE-PROMPTS.json). Built-in image
generation was used; no API key was required. Asset attribution and license
details are in [CREDITS.md](../public/images/community/CREDITS.md).

Generated people are labeled illustrative, not clients, staff or Steven. No
testimonial, performance claim, family staffing claim or unapproved client
story was added. Steven's established professional experience remains distinct
from Netherwood client work. The station photograph is credited on the page and
its resized derivative is CC BY-SA 4.0. No unsupported historical claim about a
rail terminus, university relationship or official transit affiliation appears.

## Verification

Passed checks (Node 24.19.0, supported by the repository's Node >=22.13 engine;
required builds and lint through pinned pnpm 11.19.0):

- ESLint and strict frontend TypeScript.
- Static Pages and Vinext production builds.
- All 24 public static routes, metadata, schema, sitemap, links and ten-article
  content parity. Article digest unchanged:
  `ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8`.
- 11 readiness/attribution tests, 26 publication/admin/pipeline tests and
  40 marketing tests; no failures or skips in these suites.
- 18 baseline and 21 candidate focused responsive captures, plus 72 broader
  public-route renders at 1440/768/390. No page overflow or broken images;
  additional 320px, keyboard-focus and reduced-motion checks passed.
- 36 automated accessibility scans: zero reported violations. This is not a
  complete assistive-technology certification.
- 22 inquiry/readiness/attribution browser cases, with 14 locally intercepted
  form POSTs and no real submission or unexpected external request.
- Article search, missing routes, explicit index.html paths, footer-year rollover,
  and readable no-JavaScript content/contact paths on all 24 routes.

Representative [before/after evidence](evidence/2026-09-25/community/), image
sources, and machine-readable summaries are committed. Full page captures are
retained locally in ignored `outputs/community-qa/` and `outputs/migration-qa/`.

The initial broad runner completed all 72 valid-route renders, then found that
Vite's generic preview returned the homepage for an unknown URL. That does not
match GitHub Pages. The repository preview was repaired for Windows path
separators, given WebP MIME support and an optional validated `NDP_PREVIEW_PORT`.
Missing-route and remaining interaction checks then passed on that proper
static server. The no-JavaScript contact assertion was updated to recognize
the intentionally new `/#contact` route. No application hydration workaround
or production routing change was introduced.

The repeatable visual runner is `scripts/qa-community.mjs`; it captures Home,
About, Services, Articles, an article and intake at 1440/768/390, plus the new
support page in the candidate. It checks overflow, image loading, headings,
reduced motion, the keyboard skip link and no-JavaScript contact operation.
Broader existing migration/publication checks protect the rest of the site.

Local review: run `pnpm preview:pages` after `pnpm build:pages`, or set
`NDP_PREVIEW_PORT=4178` for the review port used in this task. The optional
`--interactions-only` mode of `scripts/qa-migration.mjs` rechecks route and
interaction behavior without repeating already-verified screenshots.

No real inquiry was sent. Browser form checks intercept external requests.
Formspark delivery, marketing-provider configuration, public unsubscribe hosting,
database state, DNS and the production publishing service are outside this change.

## Review and rollback

Use the existing static Pages release workflow after reviewing this candidate.
There is no separate deployment mechanism. Revert the focused redesign commit
to restore the prior website; no database or environment rollback is needed.

## Industry systems revision

The owner replaced the people-photo direction with equipment and workflows from
established warehouses, manufacturers and medical practices. Home now shows
legacy terminals, paper records, printers and phones alongside possible modern
interfaces. A readable HTML comparison illustrates inventory lookup and an
AI-assisted question with fictional data and human review. No live assistant,
client result, vendor partnership or product implementation is implied.

All three staged people assets were removed from public assets. Services uses
the manufacturing scene. The station photograph, local rail motif, founder
monogram, support services and contact behavior remain. Current prompts and
asset paths are in INDUSTRY-IMAGE-PROMPTS.json; earlier community prompts and
screenshots are historical evidence only.

Rollback: revert this follow-up commit to return to the preceding imagery.

Final industry revision checks passed: pinned pnpm lint, strict frontend
TypeScript, both production builds, the 24-route static audit and diff check.
Responsive review captured 18 before and 21 after pages at 1440/768/390,
including About, Articles, Services and intake. No overflow, broken images or
browser errors; 320px, keyboard, reduced-motion and no-JavaScript contact checks
passed. Four automated accessibility scans of the affected Home/Services pages
at desktop and phone widths reported zero violations. This is not a complete
accessibility certification. Evidence: `evidence/2026-09-25/industry/`.
