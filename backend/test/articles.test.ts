import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseArticleInput, sanitizeArticleHtml } from "../src/articles.ts";

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
    slug: "query-store-notes",
    summary: "A practical note.",
    category: "SQL Server",
    tags: ["Performance", "performance", "Query Store"],
    author: "Steven Wittek",
    featuredImage: "/images/query-store.png",
    html: "<h2>Baseline</h2><p>Capture the evidence.</p>",
  });
  assert.equal(article.title, "Query Store Notes");
  assert.deepEqual(article.tags, ["Performance", "Query Store"]);
  assert.match(article.plainText, /Baseline/i);
  assert.match(article.plainText, /Capture the evidence/);
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
});

test("article migration uses indexed public reads and fixed author procedures", async () => {
  const migration = await readFile(new URL("../sql/migrations/005_articles_cms.sql", import.meta.url), "utf8");
  assert.match(migration, /IX_BlogPosts_Status_PublishedAtUtc/);
  assert.match(migration, /WHERE Status = 'published'/);
  assert.match(migration, /CREATE OR ALTER PROCEDURE web\.GetPublishedArticle/);
  assert.match(migration, /CREATE OR ALTER PROCEDURE web\.SaveArticleDraft/);
  assert.match(migration, /DENY SELECT, INSERT, UPDATE, DELETE ON web\.BlogPosts TO web_article_author/);
  assert.doesNotMatch(migration, /EXEC\s*\(\s*@/i);
});
