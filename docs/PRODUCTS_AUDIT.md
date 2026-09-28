# Consulting and software audit — September 28, 2026

## Preserved work

Continue `feat/community-technology-website` from `b9b5734`, two commits ahead
of fetched `origin/main` (`840cf9a`). Status, staged/unstaged diffs, branches,
remote history, worktree inventory and stash lists were reviewed before editing.
The community and marketing checkouts were clean, with no stashes. Marketing
work is already an ancestor. The older Voyager site/design branches contain
no additional commits outside this candidate's history.

The primary checkout on D: has untracked `.vs/`. The separate publishing-desk
checkout has edits to `app/admin/ArticlesAdmin.tsx`, `app/admin/admin-utils.ts`
and `test/admin-publishing-desk.test.ts`. Those checkouts and their work remain
untouched. No reset, clean, stash discard, forced checkout or force push occurred.
PR #17 is the existing review workflow; main is checked out in the primary
checkout and should not be rewritten or switched by this task.

## Existing site and generated assets

The latest community candidate already integrates the warehouse, manufacturing
and medical-office scenes in Home/Services and the licensed station photo in
Home/About. Prompts, original image filenames and WebP derivatives are recorded
in `docs/INDUSTRY-IMAGE-PROMPTS.json`; credits are in
`public/images/community/CREDITS.md`. All were retained. Prior imagery and
acceptance evidence remain in Git history. No new image or fabricated product
screenshot was needed.

The ignored `pages-dist` preview was stale and showed the superseded people
imagery. Rebuilding the existing source restored the approved equipment scenes.
A corrected before baseline was then captured at 1440, 768 and 390 pixels.

The existing eight services, contact form, campaign attribution, migration
intake/readiness, ten article bodies, publication pipeline, robots, 404 and
metadata remain. Public chat and general analytics stay deliberately disabled.
The intentional founder monogram is retained; an actual portrait is a future
owner-selected asset, not an unfinished page to replace with an invented image.
No TODO/FIXME in the public page/component/content paths required a replacement.

## Product evidence

- **QueryVault** is the spelling in `D:/Dev/QueryVault/Databases/README.md` and
  `docs/CURRENT_STATE.md`. It archives selected SQL Server Query Store periods
  for historical investigation and reporting. GitHub confirms the Databases
  repository is public and its default branch is `master`. Its public README
  supplies the documentation link. No release was listed and no license was
  confirmed, so there is no download or open-source badge. Public source alone
  is not evidence of an open-source license.
- **PageMover** is the application name in the SQL Server Index Defragmenter 95
  README. It is a local index/heap analysis and maintenance utility with a
  classic Windows defragmenter interface, synthetic demo and unsigned developer
  preview status. Its GitHub repository is private; no private source/docs or
  release URL is exposed in the public site.
- **RunBridge AI** is a working name. An authenticated read of the private
  iPhone companion README confirms its simulator and local query interface;
  the Garmin adapter and external AI connection are unfinished. The website
  describes the intended Garmin/iPhone/ChatGPT experience as in development.
  No private source URL, store button, installation link or date is published.

## Product architecture and routes

`app/content/products.ts` owns stable IDs, editable slugs, names, statuses,
platforms, descriptions and optional link/media/privacy/support/release fields.
Cards, homepage highlights, detail pages, metadata, static generation and
sitemap use that catalog. Optional sections render only for populated values.

- `/products/`
- `/products/queryvault/`
- `/products/sql-server-index-visualizer/` — current display name PageMover
- `/products/activity-data-connector/` — display name RunBridge AI may change
- `/privacy/` — website data handling; no completed app privacy policy implied

The activity route is independent of the working product name. New products
need a catalog entry, not a new database or CMS. Products identify Netherwood
Data Partners as developer/publisher; the existing professional biography and
consulting identity are retained.

## Release and coordination

Push focused commits to the existing feature branch and update PR #17. GitHub
Pages remains the production channel; no competing Sites mirror, DNS change,
backend exposure, SQL mutation or real contact submission is part of this task.
A feature-branch push does not deploy production. Merge through the existing
main workflow after review; that workflow imports the authoritative article
export and deploys Pages. Before committing/pushing, fetch again and reconcile
any changes from Voyager 2 rather than overwriting them.

The separate dirty publishing-desk checkout needs its own review by the owner
of that work. Product-specific privacy, actual store/distribution links, a
QueryVault license decision and RunBridge's final name remain future decisions.
