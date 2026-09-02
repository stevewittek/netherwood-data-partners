import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { normalizeArticleSlug, parseArticleInput, sanitizeArticleHtml } from "../src/articles.ts";

test("article HTML sanitizer preserves technical formatting and removes scriptable markup", () => {
  const html = sanitizeArticleHtml(`
    <h2 onclick="alert(1)">Execution plans</h2>
    <p>Use <code class="language-sql">SET STATISTICS IO ON</code>.</p>
    <pre><code class="language-sql">SELECT * FROM dbo.Users;</code></pre>
    <table><tbody><tr><th scope="col">Wait</th><td>LCK_M_X</td></tr></tbody></table>
    <aside class="callout callout-evil">Review this first.</aside>
    <a href="javascript:alert(1)">bad</a>
    <a href="https://example.com" target="_blank">safe</a>
    <img src="data:text/html,bad" onerror="alert(1)" alt="bad">
    <script>alert(1)</script><iframe src="https://evil.example"></iframe>
  `);
  assert.match(html, /<h2>Execution plans<\/h2>/);
  assert.match(html, /class="language-sql"/);
  assert.match(html, /<table>/);
  assert.match(html, /class="callout"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /onclick|onerror|javascript:|data:text|script|iframe|callout-evil/);
});

test("article input is normalized and searchable plain text is derived", () => {
  const article = parseArticleInput({
    title: "  Query Store Notes  ",
    slug: "Query Store: Notes",
    summary: "A practical note.",
    category: "SQL Server",
    tags: ["Performance", "performance", "Query Store"],
    author: "Steven Wittek",
    seoDescription: "A concise Query Store guide for production troubleshooting.",
    seoTitle: "Query Store Notes | Netherwood Data Partners",
    publishedDate: "2026-08-27T12:30:00.000Z",
    isFeatured: true,
    featuredImage: "/images/query-store.png",
    html: "<h2>Baseline</h2><p>Capture the evidence.</p>",
  });
  assert.equal(article.title, "Query Store Notes");
  assert.equal(article.slug, "query-store-notes");
  assert.deepEqual(article.tags, ["Performance", "Query Store"]);
  assert.match(article.plainText, /Baseline/i);
  assert.match(article.plainText, /Capture the evidence/);
  assert.equal(article.isFeatured, true);
  assert.match(article.seoDescription ?? "", /Query Store/);
  assert.match(article.seoTitle ?? "", /Netherwood/);
  assert.equal(article.publishedDate?.toISOString(), "2026-08-27T12:30:00.000Z");
});

test("article slugs normalize consistently and reject empty normalized values", () => {
  assert.equal(
    normalizeArticleSlug("How to Know When You Need a Fractional DBA"),
    "how-to-know-when-you-need-a-fractional-dba",
  );
  assert.throws(() => parseArticleInput({
    title: "Title",
    slug: "💾💾💾",
    summary: "Summary",
    category: "SQL Server",
    tags: [],
    author: "Steven",
    html: "<p>Body</p>",
  }), /invalid_article/);
  assert.throws(() => parseArticleInput({
    title: "Title",
    slug: "impossible-date",
    summary: "Summary",
    category: "SQL Server",
    tags: [],
    author: "Steven",
    publishedDate: "2026-02-31T12:30:00.000Z",
    html: "<p>Body</p>",
  }), /invalid_article/);
});

test("article input rejects unsafe URLs and invalid slugs", () => {
  assert.throws(() => parseArticleInput({
    title: "Title",
    slug: "Bad Slug",
    summary: "Summary",
    category: "SQL Server",
    tags: [],
    author: "Steven",
    featuredImage: "javascript:alert(1)",
    html: "<p>Body</p>",
  }), /invalid_article/);
  assert.throws(() => parseArticleInput({
    title: "Title",
    slug: "textless-article",
    summary: "Summary",
    category: "SQL Server",
    tags: [],
    author: "Steven",
    html: "<p></p>",
  }), (error: unknown) => (
    error instanceof Error
    && error.message === "invalid_article"
    && "fields" in error
    && (error.fields as Record<string, string>).html === "Article content must contain readable text"
  ));
  assert.throws(() => parseArticleInput({
    title: "Title",
    slug: "invalid-date",
    summary: "Summary",
    category: "SQL Server",
    tags: [],
    author: "Steven",
    publishedDate: "2026-08-27 12:30",
    html: "<p>Body</p>",
  }), /invalid_article/);
});

test("article migration uses indexed public reads and fixed author procedures", async () => {
  const migration = await readFile(new URL("../sql/migrations/005_articles_cms.sql", import.meta.url), "utf8");
  const workflow = await readFile(new URL("../sql/migrations/006_articles_content_workflow.sql", import.meta.url), "utf8");
  const metadata = await readFile(new URL("../sql/migrations/008_article_metadata_and_scheduling.sql", import.meta.url), "utf8");
  const databaseAdapter = await readFile(new URL("../src/article-database.ts", import.meta.url), "utf8");
  assert.match(migration, /IX_BlogPosts_Status_PublishedAtUtc/);
  assert.match(migration, /WHERE Status = 'published'/);
  assert.match(migration, /CREATE ROLE web_runtime/);
  assert.match(migration, /CREATE OR ALTER PROCEDURE web\.GetPublishedArticle/);
  assert.match(migration, /CREATE OR ALTER PROCEDURE web\.SaveArticleDraft/);
  assert.match(migration, /DENY SELECT, INSERT, UPDATE, DELETE ON web\.BlogPosts TO web_article_author/);
  assert.match(workflow, /@Search nvarchar\(200\)/);
  assert.match(workflow, /SELECT COUNT_BIG\(\*\) AS TotalCount/);
  assert.match(workflow, /CREATE UNIQUE INDEX UX_BlogPosts_SinglePublishedFeaturedArticle/);
  assert.match(workflow, /CREATE OR ALTER PROCEDURE web\.UnpublishArticle/);
  assert.match(workflow, /CREATE OR ALTER PROCEDURE web\.DeleteArticle/);
  assert.match(workflow, /THROW 51012/);
  assert.match(workflow, /DENY EXECUTE ON web\.DeleteArticle TO web_runtime/);
  assert.match(metadata, /MigrationId = '008_article_metadata_and_scheduling'/);
  assert.match(metadata, /ALTER TABLE web\.ArticleDrafts ADD SeoTitle nvarchar\(300\) NULL/);
  assert.match(metadata, /ALTER TABLE web\.ArticleDrafts ADD PublishedAtUtc datetime2\(3\) NULL/);
  assert.match(metadata, /ORDER BY post\.PublishedAtUtc DESC/);
  assert.match(metadata, /OFFSET \(@Page - 1\) \* @PageSize ROWS FETCH NEXT @PageSize ROWS ONLY/);
  assert.match(metadata, /PublishedAtUtc <= SYSUTCDATETIME\(\)/);
  assert.match(databaseAdapter, /request\.input\("Slug", sql\.NVarChar\(200\), input\.slug\)/);
  assert.match(databaseAdapter, /request\.input\("PublishedAtUtc", sql\.DateTime2\(3\), input\.publishedDate \?\? null\)/);
  assert.doesNotMatch(migration, /EXEC\s*\(\s*@/i);
  assert.doesNotMatch(workflow, /EXEC\s*\(\s*@/i);
  assert.doesNotMatch(metadata, /EXEC\s*\(\s*@/i);
});

test("starter article source, SQL seed, and available static snapshot stay aligned and sanitizer-safe", async () => {
  const source = JSON.parse(await readFile(new URL("../sql/seeds/articles.seed.json", import.meta.url), "utf8")) as Array<Record<string, unknown>>;
  let snapshot: { articles: Array<Record<string, unknown>> } | undefined;
  try {
    snapshot = JSON.parse(await readFile(new URL("../../pages-site/articles-snapshot.json", import.meta.url), "utf8")) as typeof snapshot;
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error;
  }
  const seedMigration = await readFile(new URL("../sql/migrations/007_starter_articles.sql", import.meta.url), "utf8");
  const expectedTitles = [
    "Why SQL Server Databases Slow Down Over Time",
    "SQL Server Indexing Mistakes That Hurt Performance",
    "Query Store: Finding the Queries That Are Breaking Your Database",
    "Why NOLOCK Does Not Fix Blocking Problems",
    "When Small Businesses Need a Database Consultant",
    "Moving Legacy Applications to Modern SQL Server Platforms",
    "Database Backups: What Companies Get Wrong",
    "Azure SQL Migration Lessons",
    "Performance Tuning Before Buying More Hardware",
    "Database Health Checks Explained",
  ];

  assert.deepEqual(source.map((article) => article.title), expectedTitles);
  assert.equal(source.filter((article) => article.isFeatured === true).length, 1);
  if (snapshot) assert.equal(snapshot.articles.length, source.length);
  for (const article of source) {
    assert.equal(typeof article.articleId, "string");
    assert.match(String(article.slug), /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(typeof article.seoDescription, "string");
    assert.ok(Array.isArray(article.tags) && article.tags.length >= 3);
    const html = String(article.contentHTML);
    assert.equal(sanitizeArticleHtml(html), html);
    assert.ok(html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length >= 700);
    const exported = snapshot?.articles.find((candidate) => candidate.articleId === article.articleId);
    if (snapshot) {
      assert.ok(exported);
      assert.equal(exported.html, html);
      assert.equal(exported.seoDescription, article.seoDescription);
    }
    assert.match(seedMigration, new RegExp(String(article.articleId), "i"));
    assert.match(seedMigration, new RegExp(String(article.slug)));
  }
  assert.match(seedMigration, /MigrationId = '007_starter_articles'/);
  assert.doesNotMatch(seedMigration, /EXEC\s*\(\s*@/i);
});
