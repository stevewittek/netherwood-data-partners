# Articles CMS

## Architecture

SQL Server in `NDP_Web` is the source of truth. Voyager exposes current
published data through `GET /api/articles` and `GET /api/articles/{slug}`. The
static site uses the live API when `VITE_VOYAGER_API_URL` is configured, keeps
the last successful response in that visitor's browser, and falls back to
`pages-site/articles-snapshot.json` when Voyager is unavailable.

The snapshot is deliberately a reliability layer, not a second authoring
store. `npm run articles:export` replaces it from SQL data, and the Pages build
generates the Articles index, one route per exported slug, a no-index router
fallback, article metadata/structured data, and `articles-sitemap.xml`. A new
publication appears immediately through Voyager; a later snapshot export and
normal Pages build advances the backend-independent copy and the pre-generated
search route. No source edit is needed per article.

```text
admin browser -> authenticated Voyager API -> web_article_author procedures
                                              -> NDP_Web BlogPosts/ArticleDrafts

public browser -> static Articles route -> live Voyager public procedures
                         |                     failure
                         +-> browser cache -> exported static snapshot
```

The existing `web.BlogPosts` table remains the main article record. Migration
`005_articles_cms.sql` adds category, JSON tags, author, featured image,
searchable plain text, content type, the `web.ArticleDrafts` table, an efficient
filtered publication index, fixed public/admin procedures, and the
`web_article_author` role. The API maps `BlogPostId` to `articleId` so the public
content vocabulary is not coupled to the physical legacy table name.

Saving an edit to an already published article writes `ArticleDrafts`; the
currently published row does not change. Publish atomically promotes that
draft. Archive removes the public article without deleting it. There is no
delete endpoint in version one.

## API

- `GET /api/articles?category=SQL-Server&tag=performance&page=1&pageSize=10`
  returns newest-first metadata and pagination without HTML bodies.
- `GET /api/articles/{slug}` returns a published article. Draft, archived, and
  missing slugs all return `404`.
- `/api/admin/articles` endpoints list, load, save, preview, publish and archive
  through fixed operations. They return `404` when authoring is not configured
  and require `Authorization: Bearer ...` when it is.

Public responses use a short cache lifetime plus `stale-if-error`. Admin
responses are `no-store` and carry `X-Robots-Tag: noindex, nofollow`.

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

Do not reuse `sa` or the runtime login. The runtime `ndp_web_app` login can
execute only public article reads and still has no direct table access. The
separate `ndp_article_author` login can execute only the five admin procedures
and likewise has no direct table access.

After the normal SQL preflight, create local credentials without printing
them:

```bash
backend/scripts/create-article-author-credentials.sh
```

This adds `SQL_ARTICLE_USER`, `SQL_ARTICLE_PASSWORD`, and
`ARTICLE_ADMIN_TOKEN` to ignored, owner-only `backend/.env.local`. Review the
preflight and use the existing explicit apply gate to apply migration 005 and
provision/verify both identities:

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
2. Enter metadata and HTML. The suggested slug remains editable.
3. **Preview** sends the draft through the same server sanitizer and renders it
   inside the actual article typography without creating a public URL.
4. **Save Draft** persists without publishing. On an existing live article it
   leaves the live content unchanged.
5. **Publish** saves and then atomically publishes. **Archive** makes an article
   unavailable publicly without deleting it.

The initial snapshot is intentionally empty. No fake published articles or
sample production records are inserted by the migration.

## Refresh the outage snapshot

Run the one-shot hardened Compose tool on Voyager after approved publications
or on a later schedule:

```bash
docker compose -f backend/compose.yaml run --rm articles-export
```

Then run `pnpm run build:pages` to verify the emitted routes. Deploying that
snapshot is not required for the live API publication, but it is what advances
the backend-independent copy and makes a new slug a native `200` GitHub Pages
route with build-time SEO metadata. Automating export/build/deploy requires a
separately approved private-to-GitHub credential and is intentionally not
introduced in version one.

## Future knowledge use

`web.ListPublishedArticleKnowledge` returns article ID, title, relative public
URL, sanitized plain text, category, JSON tags, publication date and
modification date. The runtime login can execute this bounded procedure. A
future ingestion pass can reuse it without allowing model-generated SQL or
coupling the publishing UI to an AI provider.
