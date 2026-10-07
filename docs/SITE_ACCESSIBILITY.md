# Browser identity and accessibility review

October 7, 2026. Scope: the 30 public pages and the 404 page, preserving the
approved company design. Based on deployed source `edcf6f2e244968d08a484ea4c046befd71d01f75`.

## Implemented

| Area | Result |
| --- | --- |
| Browser tab | Homepage title is exactly “Netherwood Data Partners”. Other pages retain distinct, descriptive titles. |
| Company icon | Replaced the default blue asset with a green N using the existing company colors. A new favicon URL avoids reuse of the old cached asset; the legacy SVG also contains the company mark. |
| Logo links | Accessible names use the visible company words, with correct separation. The redundant decorative N stays hidden from screen readers. |
| Skip navigation | “Skip to content” focuses the actual H1, including the 404 page. The private login retains its own heading target. |
| Image descriptions | Existing station, Motion artwork and phone-icon descriptions retained. Watch screenshot alt text now conveys both “Phone received” and “Cloud not confirmed”. Every current public image has an alt attribute. Decorative imagery may appropriately use empty alt; article-cover illustrations are decorative beside their article titles. |
| Repeated links | Service, product and article links include their destination topic in the accessible name while retaining visible link text. |
| Product status | Status badges have a named group role, rather than a label on an unnamed generic container. |
| Forms | Existing labels, autocomplete, required fields and native validation retained. Status messages announce atomically. Contact, beta and migration transport unchanged. |
| Contrast | Three small homepage product numbers changed from #557761 to #51715c on #ecefe7: 4.30:1 to 4.67:1. This is the only content-area color change. |
| Regression checks | Generated public pages are checked for company favicon, unique descriptive titles, document language, heading skip target and image alt attributes. |

No layout, image, navigation, service, product availability, privacy commitment,
authentication behavior, publication data or deployment configuration was redesigned.

## Checks completed

- Axe-core 4.14.0 scans: 31 pages at each of 1440, 768 and 390 CSS pixels (93
  scans). Actual viewport width recorded. Zero detected violations; no page-wide
  horizontal overflow. Tags include WCAG 2 A/AA, 2.1 A/AA, 2.2 AA and best practices.
- Axe ran only on a loopback QA copy. No checker, third-party script or testing
  dependency enters the published website or package lockfiles.
- Before/after results and screenshots are in `evidence/site-accessibility/`.
- Keyboard: activating the skip link moves focus to the H1. Contact Name to
  Email tab order and visible focus verified. Required name, email and message
  fields retain native missing-value validation and associated labels.
- 320px reflow: Home, About, Articles, database engineering, Motion, migration
  intake and Privacy fit without page-wide overflow.
- Home section geometry matches the released version at 390px. Desktop and
  tablet full-page screenshot dimensions match; changed pixel regions are
  confined to the product numbers. No fonts, spacing or page-width rules changed.
- Build checks: lint, Vinext production build, static Pages build, all 30 public
  route checks, migration tests and whitespace checks passed locally.
- Published article snapshot and its digest remain unchanged.

## Manual review of automated uncertainties

Axe cannot resolve every background gradient or decorative arrow glyph. On the
featured article's existing gradient, computed color and gradient-endpoint
checks give minimum ratios of 5.33:1 (green labels), 7.14:1 (body text) and 10.89:1
(headline). These exceed the relevant text thresholds. Decorative arrows add no
information beyond the accompanying link text. Raw incomplete results are kept;
they were reviewed, not hidden by disabling rules. Calculations are saved in
`evidence/site-accessibility/manual-contrast.json`.

## Limits and remaining verification

This is a technical accessibility review, not a claim of complete WCAG or legal
compliance. Automated tools cannot establish full conformance. Real VoiceOver
and NVDA spoken-output testing, browser zoom at 200%/400%, forced-colors mode,
and testing by users of assistive technology remain recommended. Narrow-width
reflow is not a substitute for a browser zoom test. Existing reduced-motion
rules were preserved; OS preference emulation was not performed. No live form
was submitted, so this review does not establish email delivery or every
submission-error announcement. Future content needs the same review, especially
meaningful image descriptions and article table semantics.

Guidance: [W3C preliminary accessibility checks](https://www.w3.org/WAI/test-evaluate/preliminary/),
[WCAG 2.2 page titles](https://www.w3.org/WAI/WCAG22/Understanding/page-titled),
[WCAG 2.2](https://www.w3.org/TR/WCAG22/).
