# Hang in There, Dad! website showcase — November 5, 2026

## Scope

Owner-requested addition and publication on the existing GitHub Pages website.
The Products page adds `#fun-projects` after the three existing products, using
the existing `ProductCard`. The dedicated route is `/games/hang-in-there-dad/`.
The supplied first-person story, instructions, favorite jokes, and closing are
preserved. Native details/summary disclosures work with mouse and keyboard and
without JavaScript. The page and gallery remain readable without any backend.

Global styles, navigation, homepage, other product detail pages, package inputs,
article content, deployment configuration, hosting and DNS are unchanged.
New styles are scoped to the game page. Metadata, canonical URL, social image,
keywords, collection entry and sitemap follow the existing two-build workflow.

## Assets and provenance

All sources are existing Hang in There Dad game assets in `stevewittek/reddit-games`.
Files were copied from the November 4 free-mobile release checkout; no new art
or reconstructed game screenshots were generated.

| Website asset under `public/images/hang-in-there-dad/` | Game source | Use |
| --- | --- | --- |
| `oreo-tree-rescue.svg` | `games/hang-in-there-dad/src/client/assets/oreo-tree-rescue.svg` | Original tree-rescue splash artwork, hero and product card; 870 × 520, 19 KB |
| `game-banner.png` | `games/hang-in-there-dad/marketing/launch/game-tile.png` | Original branded social banner; 560 × 256, 67 KB |
| `splash-390.webp` | `games/hang-in-there-dad/docs/launch-2026-11-04/free-rescue-splash-390.png` | Genuine local release-source browser screenshot; 390 × 620, 104 KB |
| `puzzle-390.webp` | `games/hang-in-there-dad/docs/launch-2026-11-04/free-rescue-game-390.png` | Genuine local release-source browser screenshot including letter keyboard; 390 × 650, 94 KB |

The two screenshot conversions are lossless WebP with no crop or visual changes.
Their source README explicitly identifies them as local Chromium captures, not
physical-device or hosted-version acceptance. The website labels them as screens
from the latest game preview. The older outdoor playground capture does not meet
the requested indoor ball-pit view and is omitted. Further approved indoor-scene
captures can be added later; no placeholder image is shipped.

## Reddit link and embedding decision

The public permalink is:
https://www.reddit.com/r/HangInThereDad/comments/1xm6tkb/hang_in_there_dad/

Verified November 5 by opening the public post, its Start the adventure control,
and the hosted adventure map. The signed-in browser loaded the 1.0.6 Devvit host.
No game guesses, purchase, progress reset, app update or Reddit publication was
performed for this website task. This verifies the entry point, not ordinary-
account or physical-device gameplay acceptance.

Official Reddit documentation reviewed:
- https://developers.reddit.com/docs/guides/faq
- https://support.reddithelp.com/hc/en-us/articles/360043033532-How-do-I-embed-a-Reddit-post-or-comment-in-an-article-or-other-publication

These describe Reddit-hosted Devvit apps and post/comment embeds. They do not
establish supported external interactive Devvit gameplay meeting the owner's
requirements. Use the verified external play link; no iframe or embed script.

## Validation

- Node 22.23.3; locked dependencies installed without package/lockfile changes.
- ESLint, strict frontend TypeScript, Vinext production build, static Pages build,
  and existing publication, migration/attribution and marketing tests passed.
- Strict marketing TypeScript and `git diff --check` passed.
- Existing static release checker updated with the new route and game checks;
  all 46 public routes, internal destinations/anchors/assets, metadata and sitemap
  pass. All ten article bodies and their digest remain unchanged.
- Desktop/tablet/phone layout checks at 1440, 768, 390 and 320 CSS pixels pass
  without horizontal overflow. One H1, descriptive alt text and explicit image
  dimensions are present. Image links load at their original aspect ratios.
- All four joke disclosures start closed; click, Enter and Space were exercised.
  Keyboard focus is visible. The skip link reaches `main-content` and the catalog
  Learn more link reaches the new route. No browser warning/error was observed.
- Before/after Home, About and Articles screenshots are pixel-identical at
  1440/768/390. Existing Products top-of-page content also matches; differences
  are limited to the scrollbar because the page is longer. No shared CSS changed.
- Evidence is retained in ignored `outputs/hang-dad-qa/` (not published).
- Existing backend dependency audit reports high-severity advisories for the
  transitive `@azure/msal-node` and `@azure/identity` packages. This showcase does
  not change or deploy the backend; dependency remediation is separate work.

## Publication and rollback

Publish using the unchanged main-push `Publish website` workflow. The GitHub
release performs the full existing CI/build checks before deploying Pages. Do
not call this live until the successful workflow and public `publication.json`
source commit match. Rollback is a normal revert of the focused showcase commit,
followed by the same workflow; the previous release artifacts also remain valid.
