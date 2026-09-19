# Netherwood Data Partners design system

## Authorized redesign — September 19, 2026

The owner explicitly requested a distinctive professional design and dual
local-business/database positioning. This section supersedes conflicting
historical specifications below; unrelated redesigns still require approval.

- Character: warm-paper editorial consulting practice, forest-green ink,
  restrained lime accents, open numbered rows, and two service panels.
- Existing self-hosted Manrope and DM Sans retained; no font CDN, new UI
  framework, motion dependency, or stock photography introduced.
- Current colors: ink `#203c32`, paper `#f8f7f1`, cream `#eaece2`, moss
  `#466d56`, lime `#d0e79f`; secondary ink unchanged. The background grid is
  removed. Publication/admin layouts remain structurally unchanged.
- New layouts are scoped in `app/studio.css`. Public marketing containers
  are 1240px maximum, desktop 40px gutters, tablet 24px and phone 20px.
  Existing article reading measures are preserved.
- Homepage/About headings use medium weights and tighter tracking; body copy
  has generous line-height. Main buttons have 4px corners. Shared article
  controls retain their existing primitives.
- `SystemsIllustration` is decorative, code-native SVG brand artwork. It does
  not represent a client system or live data. No invented dashboards/results.
- Navigation keeps Business help, Database help, About, Articles, and contact
  visible on mobile through a second row. A keyboard skip link is included.
- The real-portrait slot is configured by `app/content/founder.ts`. Until an
  owner-approved photograph is supplied, an intentional SW monogram is used.
  The older novelty illustration is no longer presented as a headshot.
- Contact transport, validation, honeypot, status states, privacy copy, and
  fallback email remain intact. Only DBA topic options are added.
- Evidence and acceptance record: `docs/REDESIGN_ACCEPTANCE.md`.

## Historical launch specification

Status: launch source of truth, derived from `origin/main` at `b431beb` and the
production site inspected on 2026-09-02. This document records the approved
direction; it does not authorize a redesign.

## Design character

Netherwood should read as a small specialist engineering consultancy: calm,
specific, experienced, and easy to trust. The approved visual character is
professional editorial/engineering consulting: clean typography, restrained
color, strong whitespace, fine rules, limited card use, purposeful real
imagery, and minimal motion.

When code and this document differ, preserve the production baseline until a
scoped visual task explicitly resolves the difference with before/after
screenshots and responsive checks. Do not opportunistically normalize CSS.

## Typography

- Approved display face: self-hosted Manrope through `--font-display`,
  declared in `app/globals.css`. Headings, the brand, and selected labels use
  it throughout the static Pages and Next/Vinext builds.
- Approved body face: self-hosted DM Sans through `--font-body`, also declared
  in `app/globals.css`.
- The tracked Latin and Latin Extended variable-font files live under
  `public/fonts/manrope/` and `public/fonts/dm-sans/`; their license is
  `public/fonts/LICENSES.txt`. The public site does not contact a font CDN.
- Technical text uses the existing system monospace stack on
  `.technical-label`, `.node-index`, `.article-content code`, and
  `.article-content pre code`.
- Headings use tight tracking (`letter-spacing: -0.045em`) and compact line
  heights. Body copy remains open, generally between `1.5` and `1.78` line
  height.
- Eyebrows use `.eyebrow`: 12px, weight 800, uppercase, `0.11em` tracking, and
  `--moss` on light surfaces or `--lime` on dark surfaces.

Approved choice: Manrope for display and DM Sans for body. The 2026-09-02
launch task removed the production mismatch by defining the variables and
font faces in the shared stylesheet. Do not change the families, files,
weights, type sizes, or tracking through unrelated work.

## Color

The canonical tokens are in `app/globals.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#172329` | Primary text and dark sections |
| `--ink-soft` | `#46545a` | Secondary text |
| `--cream` | `#e9edef` | Muted bands and table headers |
| `--paper` | `#f7f8f7` | Page background |
| `--moss` | `#3d6a68` | Links, labels, rules, and restrained emphasis |
| `--lime` | `#c3dc72` | Accent on dark surfaces and primary light CTA |
| `--line` | `rgba(23, 35, 41, 0.16)` | Borders and dividers |
| `--panel` | `#eef1f1` | Quiet inset panels |
| `--shadow` | `rgba(23, 35, 41, 0.12)` | Reserved shadow color |

Use these tokens before adding new colors. Existing literal dark and muted
values in the diagnostic panel, contact sections, articles, and admin desk are
implementation debt, not permission to expand the palette. Consolidation is a
later scoped task.

## Width and layout

- Primary container: `width: min(1220px, calc(100% - 48px))` on
  `.site-header`, `.hero`, `.section`, `.articles-masthead`,
  `.articles-publication`, and `footer`.
- Mobile primary gutter: 16px per side through
  `width: min(100% - 32px, 1220px)` at 640px and below.
- Article container: 1040px on `.article-header`, `.article-layout`, and
  `.related-articles`; the main reading column is at most 720px.
- The approved layout language is editorial grids separated by whitespace and
  rules. Full-width dark or muted bands may frame important engagement or CTA
  sections.
- Do not change page width, global gutters, or major grid proportions without
  treating the change as protected visual work.

## Spacing

There is no formal spacing-token scale today. Preserve the established rhythm:

- Desktop public sections generally use 80-132px vertical padding.
- Mobile public sections generally use 60-92px vertical padding.
- Major grid gaps use responsive `clamp()` values; local control gaps normally
  fall between 8px and 38px.
- Use whitespace and dividers before adding containers, backgrounds, or cards.

The lack of spacing tokens is documented debt. Do not introduce a replacement
scale during an unrelated feature.

## Buttons and links

- `.button` is the shared CTA primitive: inline flex, pill radius (`999px`),
  16px/24px padding, 14px bold text, and a restrained two-pixel hover lift.
- `.button-primary` is `--ink` on white and changes to `--moss` on interaction.
- `.button-light` is `--lime` on `--ink` and is used on dark CTA sections.
- `.nav-cta` is the outlined navigation CTA.
- `.text-link` and `.article-read-link` are the preferred low-emphasis links.
  Editorial links may underline on hover or remain underlined in long-form copy.
- All interactive controls must retain a visible `:focus-visible` state. Never
  remove an outline without supplying an equally visible replacement.

Pill shapes are approved for buttons, not as a default container or card style.

## Forms

Production uses `app/components/ContactForm.tsx`, originating from the preserved
Formspark work at `f982599`. It posts directly to Formspark and retains the
email fallback. September 11 small-business copy changes may update labels and
service choices while preserving transport, validation and styling.

- Use `.contact-form`, `.contact-form-grid`, `.contact-field`,
  `.contact-form-actions`, and `.contact-form-status--success`/`--error`.
- Labels stay visible; placeholders never replace labels.
- Required fields, length limits, autofill attributes, native validation,
  sending/success/error states, an accessible live region, and the email
  fallback are required.
- Inputs on the dark contact surface use a subtle translucent fill, six-pixel
  radius, visible border, and lime focus treatment.
- A third-party outage must not remove the visible contact email. Voyager must
  never be required to submit or display the contact path.

## Cards, panels, and rules

- Prefer open rows, bordered grids, and section bands over isolated rounded
  cards.
- Approved uses include the connected `.service-grid`, restrained
  `.about-panel`, `.diagnostic-panel`, and related-article grid.
- Borders use `--line`; corner radii stay small (generally 4-8px) except for
  buttons and deliberately circular marks.
- Shadows are rare and structural. Do not add floating card stacks, deep
  shadows, or a card around every piece of content.

## Navigation and footer

`app/components/SiteChrome.tsx` owns the shared `SiteHeader` and `SiteFooter`.
The header uses the N mark, wordmark, text navigation, active-page underline,
and one outlined CTA. The footer uses the same brand, a short service line, and
the copyright. Do not create page-specific copies of either component.

The current mobile rule hides nonessential navigation links below 980px while
preserving About, Articles, and the CTA. Any navigation change is protected and
must be verified at 390px, 768px, and a normal desktop width.

## Article layouts

- `.articles-masthead` and `.articles-publication` establish the index.
- Article previews use editorial rows with metadata separated from title and
  summary. Images are optional; missing images must not leave empty frames.
- `.article-header` and `.article-layout` establish the detail page. The rail
  may be sticky on desktop and becomes normal flow on small screens.
- Long-form copy stays in `.article-content` at a readable measure and uses
  consistent headings, lists, links, blockquotes, figures, and captions.

Tables use collapsed one-pixel `--line` borders, left-aligned cells, and a
`--cream` header. On small screens `.article-content table` becomes a block
with horizontal scrolling. Inline code uses a quiet light background; code
blocks use the existing dark surface, lime left rule, horizontal overflow, and
monospace stack.

## Responsive behavior

Existing breakpoints are 980px and 640px for the main public layout, 900px,
850px, and 640px for article/admin layouts, and 600px for the chat position.
The 2026-09-02 production check at a 390px viewport found no horizontal page
overflow. Preserve that result.

Responsive acceptance for public changes:

1. No horizontal document overflow at 390px.
2. Navigation and primary CTA remain usable by keyboard and touch.
3. Two-column sections become single-column without reordering the meaning.
4. Forms, tables, images, code blocks, and long words remain contained.
5. Text does not overlap, clip, or fall below practical reading size.

## Images

Use real, purposeful images or genuine product screenshots with accurate alt
text. Use `object-fit: cover` only when the crop has been checked at desktop and
mobile. Article images should support the subject, not decorate empty space.

`public/images/steven-wittek.jpg` is a temporary, highly stylized founder image
introduced by commit `907d3b5`. The owner approved retaining it for the Friday
launch while preparing a real professional portrait; it is not the final
portrait. Replacing it requires an explicitly selected real image plus
before/after and responsive review; do not synthesize or swap it incidentally.

## Motion

Approved motion is limited to short color/border transitions, the existing
two-pixel button lift, and smooth anchor scrolling. The
`prefers-reduced-motion: reduce` rule must continue to disable smooth scrolling
and transitions. Do not add entrance animations, parallax, looping effects, or
motion that delays reading or contact.

## Inconsistencies to retire in scoped work

- `app/globals.css` combines public, article, admin, and chat rules and contains
  two `.chat-widget` definitions with competing layout assumptions.
- Broad selectors such as `nav`, `footer`, `h1`, `h2`, `h3`, and `a` increase
  regression risk.
- Several literal colors duplicate or drift from the root tokens.
- The body grid and the featured-article wash use CSS gradients. They are
  current production behavior but conflict with the approved no-gradient
  launch direction and should be retired only through explicit visual tasks.
- `app/about/about.css` is page-specific while much of the article and admin
  styling remains global. Do not reorganize these files during feature work.

## Forbidden patterns

Do not add gradients, glowing effects, generic AI-tech visuals, fake
dashboards, meaningless statistics, excessive rounded cards, decorative
charts, stock-tech clichés, gratuitous animation, invented social proof, or
visual flourishes that make the site feel like a generic software startup.
