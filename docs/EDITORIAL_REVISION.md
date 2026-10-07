## Release authorization — October 7, 2026

The owner approved the reviewed company-focused revision and explicitly
requested publication to the live website. Release uses the existing GitHub
Pages workflow after CI. The separate Motion Relay privacy proposal is outside
this release. Article drafts remain documentation only; the deployment imports
the existing authoritative publication export. Pre-release live source was
`075a2233c8cbfd08020088c5b3a5337c7f4b70ae`, with 10 articles and chat disabled.
Earlier statements below describe the local review stage before this approval.

# Company homepage refinement — October 7, 2026

This revision supersedes the October 6 homepage arrangement recorded below.
The owner requested a company-focused homepage, services and products rather
than a personal profile, with the personal name displayed only on About.
Online Computers (https://onlinecomputers.com/) informed the clear service-area
structure; its copy, claims, staffing and theme were not adopted.

Home now contains a company introduction, four service areas, a concise product
directory, company background, articles and contact. Product descriptions,
Motion component explanations and the running origin story remain on product
pages. The station photograph replaces the watch simulator in the homepage
hero. Motion artwork, icon and screenshot remain on the product page. Existing
colors, fonts, shared styling, anchors and forms remain.

The name was removed from shared promotional copy, non-About metadata, the
shared organization schema and public article bylines/author metadata. Article
author records and published bodies were not changed; the publisher remains
Netherwood Data Partners. About retains the name and biography. A generated-page
text audit found the personal name only on About among public pages.

Home main-content text is now 370 words, compared with 563 in the first local
revision and 1,246 in the original baseline: 34.3% below the first revision and
70.3% below baseline. Current counts and before/after screenshots are in
`docs/evidence/company-home/`. `home-after-1440.jpg` is the desktop hero;
`home-after-1440-full.jpg` is the full page. Older evidence below is historical.

Validation: lint, production build (`pnpm test`), static Pages build, all 30
public route checks and `git diff --check` passed. The publication digest remains
unchanged. Home, About, Articles, Motion and Home contact were checked at 390,
768 and 1440 pixels with no horizontal overflow. Contact keyboard navigation
moves Name to Email with a visible outline. Form contracts remain unchanged;
no form was submitted. There are no animation changes, and existing reduced-
motion rules remain intact; OS-level reduced-motion emulation was not run.
No source push, publication or deployment was performed.

---

# Data and software editorial revision

Local review candidate, prepared October 6, 2026. Base: `origin/main` at `075a2233c8cbfd08020088c5b3a5337c7f4b70ae`. Branch: `codex/data-software-editorial`. No commit, push, deployment, store update or production change was performed.

## Approved direction

Netherwood is an independent data and software business. Products lead; SQL Server experience explains the engineering foundation. Consulting remains available for defined projects, including local businesses. The voice is personal, plain and factual.

The homepage leads with “Software built around data.” Motion has a personal origin story about using ChatGPT during a run and wanting to connect Garmin readings. Motion Connect is the watch data field, Motion Relay is the phone companion and data bridge, and a supported assistant interprets the information it receives. The story describes the goal without promising universal voice or platform compatibility.

## Page implementation

| Area | Implemented revision |
| --- | --- |
| Home | Short product-led introduction, personal Motion story, other software, founder, four consulting entry points, articles and contact. Existing anchors retained. |
| About | Independent developer background, data and performance interests, running origin and four concise technical examples. |
| Products | Motion listed first; shorter summaries and fewer repeated facts. QueryVault and PageMover remain. |
| Motion | Personal story, three clearly separated roles, testing availability, direct beta and setup links, one watch preview, original app artwork and phone icon. |
| Setup | Access check before installation, shorter steps and troubleshooting. No new compatibility claim. |
| Services | All eight routes retained. Shorter introductions, three-step approaches, concise deliverables and retained scope boundaries. |
| Contact and intake | Clearer labels and introductions; beta, contact and migration forms retained with existing fields and delivery behavior. |
| Articles | Shorter index and shared calls to action. Published article bodies and summaries remain publication-owned. Ten separate body drafts are prepared below. |
| Privacy | Shorter page heading only; commitments and legal meaning unchanged. |
| Shared copy | Products before Services in navigation; concise footer, metadata, public knowledge documents and chat busy message. |

## Visual treatment

The existing color palette, typography, buttons, cards and Motion artwork remain. No shared theme stylesheet or image file was edited. A small, scoped stylesheet places existing images: the homepage uses a genuine Connect IQ simulator preview and a smaller station photograph with attribution. The simulator caption explicitly distinguishes phone receipt from assistant delivery. Redundant decorative homepage and services imagery is no longer rendered; original assets are retained.

Screenshots are in `docs/evidence/data-software-editorial/`. Full-page captures can contain unloaded offscreen lazy images; they are layout evidence, not evidence of missing assets. The desktop hero capture shows the delivered first screen.

## Measured text reduction

Counts compare the generated main content at the base commit and this local candidate. Header, footer, scripts and styles are excluded. Form labels, options and collapsed FAQ text are included, so this is a reproducible text-density measure rather than only the text visible in one viewport. Percentages are rounded to one decimal. No blanket reduction is claimed for legal, form or publication-owned content.

| Route | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| `/about/` | 737 | 439 | 40.4% |
| `/articles/azure-sql-migration-lessons/` | 929 | 923 | 0.6% |
| `/articles/database-backups-what-companies-get-wrong/` | 902 | 896 | 0.7% |
| `/articles/database-health-checks-explained/` | 888 | 882 | 0.7% |
| `/articles/` | 481 | 471 | 2.1% |
| `/articles/moving-legacy-applications-to-modern-sql-server-platforms/` | 912 | 906 | 0.7% |
| `/articles/performance-tuning-before-buying-more-hardware/` | 885 | 879 | 0.7% |
| `/articles/query-store-finding-the-queries-that-are-breaking-your-database/` | 860 | 854 | 0.7% |
| `/articles/sql-server-indexing-mistakes-that-hurt-performance/` | 942 | 936 | 0.6% |
| `/articles/when-small-businesses-need-a-database-consultant/` | 879 | 873 | 0.7% |
| `/articles/why-nolock-does-not-fix-blocking-problems/` | 920 | 914 | 0.7% |
| `/articles/why-sql-server-databases-slow-down-over-time/` | 924 | 918 | 0.6% |
| `/` | 1246 | 563 | 54.8% |
| `/migration-intake/` | 510 | 444 | 12.9% |
| `/migration-readiness/` | 446 | 434 | 2.7% |
| `/motionrelay/setup/` | 223 | 192 | 13.9% |
| `/privacy/` | 340 | 338 | 0.6% |
| `/products/garmin-ai-connector/` | 871 | 477 | 45.2% |
| `/products/` | 277 | 171 | 38.3% |
| `/products/queryvault/` | 293 | 158 | 46.1% |
| `/products/sql-server-index-maintenance-visualizer/` | 228 | 122 | 46.5% |
| `/services/business-software-migration/` | 660 | 444 | 32.7% |
| `/services/data-migration/` | 659 | 443 | 32.8% |
| `/services/database-engineering/` | 593 | 372 | 37.3% |
| `/services/` | 541 | 291 | 46.2% |
| `/services/legacy-application-modernization/` | 634 | 442 | 30.3% |
| `/services/legacy-systems-assessment/` | 661 | 444 | 32.8% |
| `/services/practical-ai/` | 632 | 435 | 31.2% |
| `/services/software-systems-support/` | 550 | 390 | 29.1% |
| `/services/workflow-automation/` | 607 | 419 | 31.0% |

The small article-page reductions above are shared page copy only. Intake and readiness retain their questions and controls; privacy retains its commitments. These pages intentionally have smaller reductions.

## Article drafts and publication handoff

The ten HTML drafts in `docs/editorial/articles/` are review artifacts, not build inputs. They shorten introductions and conclusions while retaining technical examples, tables, lists and code. The manifest records original article identifiers, source hashes, publication digest and draft counts. Total body reduction ranges from 15.6% to 23.7%.

| Article | Before | Draft | Reduction |
| --- | ---: | ---: | ---: |
| [Why SQL Server Databases Slow Down Over Time](editorial/articles/why-sql-server-databases-slow-down-over-time.html) | 860 | 697 | 19.0% |
| [SQL Server Indexing Mistakes That Hurt Performance](editorial/articles/sql-server-indexing-mistakes-that-hurt-performance.html) | 879 | 731 | 16.8% |
| [Query Store: Finding the Queries That Are Breaking Your Database](editorial/articles/query-store-finding-the-queries-that-are-breaking-your-database.html) | 799 | 674 | 15.6% |
| [Why NOLOCK Does Not Fix Blocking Problems](editorial/articles/why-nolock-does-not-fix-blocking-problems.html) | 857 | 720 | 16.0% |
| [When Small Businesses Need a Database Consultant](editorial/articles/when-small-businesses-need-a-database-consultant.html) | 814 | 621 | 23.7% |
| [Moving Legacy Applications to Modern SQL Server Platforms](editorial/articles/moving-legacy-applications-to-modern-sql-server-platforms.html) | 848 | 711 | 16.2% |
| [Database Backups: What Companies Get Wrong](editorial/articles/database-backups-what-companies-get-wrong.html) | 837 | 697 | 16.7% |
| [Azure SQL Migration Lesson](editorial/articles/azure-sql-migration-lessons.html) | 862 | 726 | 15.8% |
| [Performance Tuning Before Buying More Hardware](editorial/articles/performance-tuning-before-buying-more-hardware.html) | 825 | 635 | 23.0% |
| [Database Health Checks Explained](editorial/articles/database-health-checks-explained.html) | 823 | 677 | 17.7% |

Before publishing article drafts, review technical accuracy against supported SQL Server/Azure versions, verify the source hashes still match, then use the existing article-authoring and publication workflow. Do not hand-edit the generated snapshot or overwrite a newer article. Publication digest remains `ac062026f7b108e1225a471f31cd78cabb32fbc4276dc5fa1d6f85f2faa650e8`.

## Verification

- ESLint passed.
- `pnpm test` passed; in this repository it runs the Vinext production build, not a separate unit test suite.
- Static Pages build and article validation passed.
- Static release checks passed for all 30 public routes and 10 articles.
- Migration tests passed: 11 of 11.
- `git diff --check` passed.
- Form action/method/IDs and input/select/textarea identifiers, names, types, required flags, length constraints, values and patterns match the baseline on all generated pages. Handlers and transport were preserved. No inquiry or beta form was submitted.
- Browser review covered Home, About, Motion, database engineering, article index, a full article and migration intake at 390, 768 and 1440 pixel widths. No horizontal overflow was observed. Each sampled page has one H1. Visible beta controls have labels and native required-field validity; Tab moves Name to Email with a visible outline.
- The homepage computed background color (`rgb(250, 249, 244)`) and heading family (Manrope) match baseline. No new animations were introduced.
- Node 22.23.3 and installed pnpm 11.25.0 were used. Dependencies were reused from the existing local checkout. Commands used `--config.verify-deps-before-run=false` to prevent pnpm from replacing the dependency symlink; no dependency or lockfile changes were made.

This was representative browser verification and static route checking, not an exhaustive accessibility audit or an end-to-end email delivery test. Native apps, store listings, authentication, APIs, databases, deployment configuration and production services were not changed. Existing phone-store availability flags, product identifiers, Garmin link and privacy commitments remain intact.

## Review and release boundary

Review the local preview before any release. Publishing this website or applying the article drafts is a separate action. Existing release and publication checks still apply; this editorial pass does not establish current store acceptance, assistant compatibility or production delivery.
