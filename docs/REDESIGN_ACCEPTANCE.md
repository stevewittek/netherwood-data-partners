# Founder-led website redesign — September 19, 2026

## Scope and source

Owner authorized a creative, professional redesign serving both local
business owners and fractional DBA/database customers. Baseline main:
`9baee001b6a8ac137b738a82b7e2af80b7617723`.

Public biography and service descriptions are grounded in the owner-supplied
Senior Database Engineer Technical Summary and previously approved founder
facts (technology experience since 2009; New Jersey; independent consultant).
The private source PDF is not copied into this repository or public assets.
Employer names, financial scale, private procedure names, and private project
details are omitted. Professional experience is not represented as Netherwood
client work. Local business examples are explicitly illustrative.

## Deliberate boundaries

- Real photo is the remaining visual owner input. Add an approved image in
  `public/images/` and set `founderPortrait` in `app/content/founder.ts` to its
  public path. The monogram is an intentional fallback, not a fake portrait.
- No home address or walk-in availability. Meetings are by appointment.
- No invented pricing, staff, clients, testimonials, SLA, or result guarantee.
- Original Formspark behavior preserved; only service options added.
- No backend, SQL, mail, credentials, DNS, or publication-timer changes.
- Articles and private publishing remain independent of the visual work.

## Verification

Build and browser acceptance is recorded below before release. Baseline
screenshots were captured in the task at desktop 1440, tablet 768, and phone
390 for Home, About, Articles, and Contact before editing the public design.
The baseline showed the prior grid background, narrow-screen hidden service
links, and novelty founder illustration. After screenshots must cover the
same routes and sizes, plus article detail and responsive overflow checks.

Candidate checks passed on Voyager 2 in the existing Node 22.13.1 image with
pnpm 11.19.0. The isolated checkout is `/home/nasa/netherwood-local-business-design`.

- `pnpm lint`: passed.
- `pnpm test`: passed (Vinext production build).
- `pnpm build:pages`: passed.
- `node scripts/check-pages.mjs`: passed, all 13 public routes, both sitemaps,
  canonical/metadata/assets, private admin noindex, and public chat disabled.
- `pnpm test:publication`: all 23 publication/admin and 3 pipeline tests passed.
- `tsc --noEmit`: passed.
- Browser: Home, About, Articles index, and article detail checked at 1440,
  768, 390, and 320 CSS pixels. All four primary navigation links visible at
  every width. No document overflow or broken images found.
- All ten article details rendered at 1440 and 390 with body content, no
  horizontal document overflow, and no out-of-viewport heading/paragraph boxes.
- Before/after Home, About, Articles, and Contact screenshots captured and
  retained in the task conversation at 1440/768/390; full-page Home and About
  reviewed. No screenshot binaries are committed to the public repository.
- Keyboard Tab exposes the skip link with a solid focus outline; Enter moves
  focus to the content boundary. Native FAQ disclosure opens with Enter.
- Empty contact submission remains local and focuses the required Name field;
  required Name/Email/Message fields remain invalid until supplied. New
  fractional DBA option selects correctly. No real inquiry was sent.
- Contact action remains `https://submit-form.com/5bzGZaPs6`; no handler or
  credential changes. Visible fallback email remains on Home and in noscript.
- No broken same-page anchors. Browser console errors/warnings absent during
  the contact/FAQ check. Reduced-motion rules reviewed in source; OS-level
  reduced-motion emulation was not performed.
- Search Console verification tag preserved in static and Vinext entries.
- Article snapshot unchanged: ten articles, content digest
  `ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8`.

Build-environment notes: the image's old Corepack signing-key bootstrap failed,
so the exact supported pnpm version was installed only inside the temporary
container. A clean locked install resolved copied dependency-path metadata.
The private preview was restarted after a simultaneous rebuild replaced its
generated 404 file; completed static output and all route checks passed.
Neither issue involved the public production site or shared services.

Known limitations: no fresh real email sent in this design pass; mailbox and
relay acceptance are separate operational evidence. Screenshot evidence is in
the task, not a committed image archive. Owner photo is still optional input.

## Rollback

Revert the isolated redesign merge commit through a reviewed PR, then allow
the existing Pages workflow to publish. Do not reset shared Voyager checkouts
or roll back article content, SMTP, SQL, or the independent content branch.
