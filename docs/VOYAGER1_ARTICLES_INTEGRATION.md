# Voyager 1 Articles API integration

## Configuration and failure behavior

Set `VITE_VOYAGER_API_URL` to the approved Voyager 2 HTTPS API origin without
a trailing slash. The Pages workflow accepts `VOYAGER_API_URL` and exposes it
to Vite under that browser configuration name. No API URL is currently set in
the tracked build or GitHub Pages configuration.

The static site must render before this API responds. Use a 5-second browser
timeout, keep the last successful response only as a convenience, and fall
back to the tracked static article snapshot. If Voyager 2, SQL Server, Docker,
the tunnel, or home Internet is unavailable, the marketing site and exported
articles remain available; only newer dynamic content is unavailable.

## Public endpoints

`GET /api/articles?page=1&pageSize=10` returns published, due articles newest
first. Optional `category`, `tag`, and `search` parameters are supported.
`pageSize` is limited to 50. List responses intentionally omit `html`.
`featuredImage`, `seoTitle`, and `seoDescription` are omitted when unset.

```json
{
  "articles": [
    {
      "articleId": "5c914054-7d6a-5bb4-89e9-7fa3093cae76",
      "title": "Why SQL Server Databases Slow Down Over Time",
      "slug": "why-sql-server-databases-slow-down-over-time",
      "summary": "SQL Server does not become slow simply because a database is old. Performance declines when data volume, workload shape, execution plans, and operating practices drift away from the assumptions under which the system was built.",
      "category": "SQL Server Performance",
      "tags": ["SQL Server", "performance tuning", "execution plans", "database maintenance"],
      "author": "Steven Wittek",
      "status": "Published",
      "seoDescription": "Learn why SQL Server performance declines as data, workloads, plans, and operating practices change, plus a practical method for diagnosing the cause.",
      "isFeatured": true,
      "publishedDate": "2026-08-22T14:00:00.000Z",
      "createdDate": "2026-08-22T14:00:00.000Z",
      "modifiedDate": "2026-08-22T14:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 10,
  "requestId": "0ac472ec-3528-42d7-8dd4-30226a66b05c"
}
```

`GET /api/articles/{slug}` returns one complete published, due article. Draft,
archived, future-dated, unknown, and invalid slugs all return the same normal
`404` contract.

```json
{
  "article": {
    "articleId": "5c914054-7d6a-5bb4-89e9-7fa3093cae76",
    "title": "Why SQL Server Databases Slow Down Over Time",
    "slug": "why-sql-server-databases-slow-down-over-time",
    "summary": "SQL Server does not become slow simply because a database is old. Performance declines when data volume, workload shape, execution plans, and operating practices drift away from the assumptions under which the system was built.",
    "html": "<p>A SQL Server database does not wear out with age...</p>",
    "plainText": "A SQL Server database does not wear out with age...",
    "category": "SQL Server Performance",
    "tags": ["SQL Server", "performance tuning", "execution plans", "database maintenance"],
    "author": "Steven Wittek",
    "status": "Published",
    "seoDescription": "Learn why SQL Server performance declines as data, workloads, plans, and operating practices change, plus a practical method for diagnosing the cause.",
    "metaTitle": "Why SQL Server Databases Slow Down Over Time",
    "metaDescription": "Learn why SQL Server performance declines as data, workloads, plans, and operating practices change, plus a practical method for diagnosing the cause.",
    "isFeatured": true,
    "publishedDate": "2026-08-22T14:00:00.000Z",
    "createdDate": "2026-08-22T14:00:00.000Z",
    "modifiedDate": "2026-08-22T14:00:00.000Z"
  },
  "requestId": "6b545dd4-d873-4da2-b30c-ad7e0664ebef"
}
```

## Errors, caching, and CORS

- `400 invalid_query`: invalid filters or pagination.
- `403 origin_not_allowed`: browser origin is not allowlisted.
- `404 not_found`: no public article for the slug.
- `429 rate_limited`: retry after the response's `Retry-After` seconds.
- `502 upstream_unavailable` or `503 service_unavailable`: treat Voyager as
  temporarily unavailable and use the static/cache fallback.

Successful public reads send `Cache-Control: public, max-age=60,
stale-if-error=86400`. Do not retry in the render-critical path. The frontend
origins must be listed exactly in Voyager 2's comma-separated
`ALLOWED_ORIGINS`; production does not use wildcard CORS. Preflight permits
`GET,POST,OPTIONS` for public routes and the response varies on `Origin`.

Voyager 1 never needs SQL credentials, the authoring token, table names, or
stored-procedure details.
