# Articles CMS

## Architecture

SQL Server in `NDP_Web` is the source of truth. The private/public Voyager API
continues to expose eligible SQL rows, but the public Pages candidate always
uses one validated full public export. Its route bodies, index, metadata,
related links and sitemaps cannot diverge through a live API or browser cache.
The export is a release artifact, never a second authoring store.

The candidate's prepared automation evaluates all public rows every 15 minutes,
including future publications becoming due and removals. It retains the last
successful website if export/build fails. See
[PUBLICATION_OPERATIONS.md](PUBLICATION_OPERATIONS.md) for the combined runbook,
approval gates, expected 15–30 minute healthy interval and rollback.
The new export procedure, grants and timer have not been applied or activated.

```text
approved private authoring -> authenticated Voyager API -> fixed author procedures
                                                       -> SQL articles/drafts
SQL complete public set -> validated export -> content-only Git branch
                       -> hosted build -> independent static Pages release
SQL current set + deployed export -> matching article knowledge (chat disabled)
```

The existing `web.BlogPosts` table remains the main article record. Its fields
map directly to the public vocabulary: `BlogPostId` is `ArticleID`,
`SanitizedHtml` is `ContentHTML`, `TagsJson` is `Tags`, `PublishedAtUtc` is
`PublishedDate`, and the constrained status is the publish state. The original
schema already supplied SEO description and UTC creation/modification dates.

Migration `005_articles_cms.sql` adds category, JSON tags, author, featured
image, searchable plain text, content type, the `web.ArticleDrafts` table, an
efficient filtered publication index, fixed public/admin procedures, and the
`web_article_author` role. Migration `006_articles_content_workflow.sql` adds
SEO-aware drafts, explicit featured selection, public search, unpublish, and
guarded deletion. Migration `007_starter_articles.sql` idempotently installs
the ten provided production-ready starter articles. Migration
`008_article_metadata_and_scheduling.sql` adds draft SEO titles and editable
UTC publication dates, and keeps future-dated published records out of public
reads until their publication time. API field names keep clients independent
of the physical legacy table names.

Saving an edit to an already published article writes `ArticleDrafts`; the
currently published row does not change. Publish atomically promotes that
draft and ensures at most one published article is featured. Unpublish removes
the public article while preserving the latest staged edit as a draft. Archive
removes the article from public view. Permanent delete is allowed only after an
article is no longer published and removes its associated draft and image rows
inside the same transaction.

## API

- `GET /api/articles?category=Query%20Tuning&tag=performance&search=Query%20Store&page=1&pageSize=10`
  returns newest-first metadata and pagination without HTML bodies.
- `GET /api/articles/{slug}` returns a published article. Draft, archived, and
  missing slugs all return `404`.
- `GET /api/admin/articles` and `GET /api/admin/articles/{id}` list and load
  private article records.
- `POST /api/admin/articles` and `PUT /api/admin/articles/{id}` create and save
  drafts; `POST /api/admin/articles/preview` returns sanitized preview HTML.
- `POST /api/admin/articles/{id}/publish`, `/unpublish`, and `/archive` change
  state through fixed procedures. `DELETE /api/admin/articles/{id}` permanently
  deletes only a non-published article.

Admin routes return `404` when authoring is not configured and require
`Authorization: Bearer ...` when it is. Authentication attempts and other
admin requests share the bounded source rate limiter.

Public responses use a short cache lifetime plus `stale-if-error`. Admin
responses are `no-store` and carry `X-Robots-Tag: noindex, nofollow`.
Public article reads default to 120 requests per source per minute; admin
authentication and operations use the stronger default of 10 per minute.
Configure these with `ARTICLE_RATE_LIMIT`, `ADMIN_RATE_LIMIT`, and
`RATE_WINDOW_MS` without weakening the existing general write limit.

## HTML safety

Voyager sanitizes every preview and save with `sanitize-html` before SQL is
called. The allowlist keeps normal technical writing elements: headings,
paragraphs, lists, blockquotes, links, images, figures, tables, inline code,
code blocks, horizontal rules and three controlled callout classes. It removes
scripts, iframes/embeds, forms, style elements, unknown attributes, inline event
handlers, protocol-relative URLs, JavaScript/data URLs and other unapproved
schemes. External new-window links receive `noopener noreferrer`; images are
forced to lazy-load. Plain searchable text is derived only from the sanitized
HTML.

The frontend inserts only the sanitized API/snapshot HTML into the controlled
article template. Article styling never comes from stored `<style>` or inline
style attributes.

## Enable private authoring

Do not reuse `sa` or the runtime login. For article data, the runtime
`ndp_web_app` login can execute only the fixed public list/detail and bounded
knowledge-export procedures, and it still has no direct table access. The
separate `ndp_article_author` login can execute only the fixed article admin
and public-read procedures and likewise has no direct table access.

After the normal SQL preflight, create local credentials without printing
them:

```bash
backend/scripts/create-article-author-credentials.sh
```

This adds `SQL_ARTICLE_USER`, `SQL_ARTICLE_PASSWORD`, and
`ARTICLE_ADMIN_TOKEN` to ignored, owner-only `backend/.env.local`. Review the
preflight and use the existing explicit apply gate to apply all ordered
migrations and provision/verify both identities:

```bash
export NDP_SQL_APPLY_CONFIRM=NDP_Web
backend/scripts/setup-sql-server.sh apply
unset NDP_SQL_APPLY_CONFIRM
```

Restart the local API after provisioning. The publishing token is entered into
the admin page and held only in that page's memory. It is never embedded in the
static build, persisted by the site, sent to SQL Server, logged, or returned by
an API response.

Do not configure a public Voyager URL, tunnel, DNS or router rule as part of
this database setup. Public exposure remains a separate network/security
approval; router port forwarding and public SQL Server access are prohibited.

## Publish and preview

1. Open `/admin/articles`, enter the publishing credential, and choose **New
   Article**.
2. Enter metadata and HTML. The suggested normalized slug remains editable.
   SEO title and description are optional (article title and summary are the
   fallbacks), and the featured option controls the lead article on the public
   index. Publication date is an optional UTC value; publishing uses the
   current time when it is blank, and a future value remains private until due.
3. **Preview** sends the draft through the same server sanitizer and renders it
   inside the actual article typography without creating a public URL.
4. **Save Draft** persists without publishing. On an existing live article it
   leaves the live content unchanged.
5. **Publish** saves and then atomically publishes. **Unpublish** returns live
   content to draft state. **Archive** removes an article from public view.
6. **Delete** is shown only for non-published content and asks for confirmation
   before permanent removal.

The initial SQL seed and static snapshot contain ten starter articles written
in a senior database-consultant voice. `backend/sql/seeds/articles.seed.json`
is the one-time source for those artifacts; ordinary future authoring happens
through the private desk, not by editing that file.

## Refresh the public release and AI knowledge

Use the approved cycle and activation steps in
[PUBLICATION_OPERATIONS.md](PUBLICATION_OPERATIONS.md). The new export writes
an ignored candidate atomically, validates the public-only contract and never
writes directly to `main`. The build imports that same candidate before any
output directory is cleared. Do not run the old seed generator as an article
update, edit snapshot text manually, or run two competing refresh timers.

The existing bounded `web.ListPublishedArticleKnowledge` API remains available.
The candidate article ingestion instead reconciles current SQL and the deployed
full export by article version. It hides removed/stale article sources before
embedding and preserves unrelated business knowledge. Chat remains disabled
until current-source retrieval and measured endpoint behavior are approved.
