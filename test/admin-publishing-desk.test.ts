import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createApp } from "../backend/src/app.ts";
import { PublishedArticleDeleteError } from "../backend/src/article-database.ts";
import type { Config } from "../backend/src/config.ts";
import type { Database } from "../backend/src/database.ts";
import {
  editorFromArticle,
  fromUtcInputString,
  getPublicVerification,
  isFutureDate,
  isoLabel,
  slugify,
  toUtcInputString,
  verifySqlPublicationEvidence,
  verifyWebsitePublicationEvidence,
  type AdminArticle,
  type PublicArticleVersion,
  type WebsitePublicationEvidence,
} from "../app/admin/admin-utils.ts";
import {
  sanitizeArticleHtml,
  type Article,
  type ArticleAdminStore,
  type ArticleInput,
  type ArticleSummary,
} from "../backend/src/articles.ts";

const testConfig: Config = {
  allowedOrigins: new Set(["https://www.netherwooddatapartners.com", "http://127.0.0.1:3000"]),
  aiProvider: "openai",
  openaiApiKey: "test-key",
  openaiModel: "test-model",
  ollamaBaseUrl: "http://127.0.0.1:11434",
  ollamaEmbeddingModel: "nomic-embed-text",
  aiTimeoutMs: 60_000,
  chatMaxConcurrent: 1,
  chatBusyRetryAfterSeconds: 120,
  ragResultLimit: 5,
  ragMaxDistance: 0.65,
  ipAbuseHashSecret: "test-hash-secret",
  maxBodyBytes: 1_024,
  rateLimit: 10,
  articleRateLimit: 100,
  adminRateLimit: 10,
  rateWindowMs: 60_000,
  articleAdminToken: "test-admin-secret-token-32-chars-long",
};

async function withTestServer(
  check: (base: string) => Promise<void>,
  options: { config?: Config; database?: Database; articleAdmin?: ArticleAdminStore } = {},
): Promise<void> {
  const server = createApp({ config: testConfig, ...options });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    assert(address && typeof address === "object");
    await check(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

test("slugify creates URL-safe slugs with length limit and normalization", () => {
  assert.equal(slugify("Why SQL Server Databases Slow Down Over Time"), "why-sql-server-databases-slow-down-over-time");
  assert.equal(slugify("  Café & Résumé: High-Performance SQL!  "), "cafe-resume-high-performance-sql");
  assert.equal(slugify("---Multiple---Dashes---"), "multiple-dashes");
  assert.equal(slugify("Special @#$% Characters *&^ Here"), "special-characters-here");
  const longTitle = "a".repeat(300);
  assert.equal(slugify(longTitle).length, 200);
});

test("toUtcInputString converts ISO timestamp to YYYY-MM-DDTHH:mm in UTC", () => {
  assert.equal(toUtcInputString("2026-08-22T14:30:00.000Z"), "2026-08-22T14:30");
  assert.equal(toUtcInputString("2026-01-05T09:05:22.123Z"), "2026-01-05T09:05");
  assert.equal(toUtcInputString(""), "");
  assert.equal(toUtcInputString(undefined), "");
  assert.equal(toUtcInputString("invalid-date"), "");
});

test("fromUtcInputString formats datetime-local input to standard ISO UTC string", () => {
  assert.equal(fromUtcInputString("2026-09-15T10:00"), "2026-09-15T10:00:00.000Z");
  assert.equal(fromUtcInputString("2026-09-15T10:00:30"), "2026-09-15T10:00:30.000Z");
  assert.equal(fromUtcInputString("2026-09-15T10:00:30Z"), "2026-09-15T10:00:30Z");
  assert.equal(fromUtcInputString(""), undefined);
  assert.equal(fromUtcInputString("   "), undefined);
});

test("isoLabel formats UTC dates with time zone suffix", () => {
  assert.equal(isoLabel(undefined), "—");
  assert.equal(isoLabel(""), "—");
  assert.equal(isoLabel("invalid"), "—");
  const formatted = isoLabel("2026-08-22T14:00:00.000Z");
  assert.match(formatted, /Aug 22, 2026/);
  assert.match(formatted, /UTC/);
});

test("isFutureDate correctly identifies upcoming scheduled dates", () => {
  const baseTime = new Date("2026-09-12T12:00:00.000Z").getTime();
  assert.equal(isFutureDate("2026-09-15T10:00:00.000Z", baseTime), true);
  assert.equal(isFutureDate("2026-09-12T11:59:00.000Z", baseTime), false);
  assert.equal(isFutureDate("2026-08-22T14:00:00.000Z", baseTime), false);
  assert.equal(isFutureDate(undefined, baseTime), false);
});

function publicArticle(overrides: Partial<PublicArticleVersion> = {}): PublicArticleVersion {
  return {
    articleId: "12345678-1234-4234-8234-123456789abc",
    title: "Deployment evidence must compare content",
    slug: "deployment-evidence-must-compare-content",
    summary: "A complete public-version comparison prevents false publication success.",
    category: "Operations",
    tags: ["publishing", "verification"],
    author: "Steven Wittek",
    status: "Published",
    isFeatured: false,
    publishedDate: "2026-09-12T10:00:00.000Z",
    createdDate: "2026-09-12T09:00:00.000Z",
    modifiedDate: "2026-09-12T10:00:00.000Z",
    html: "<p>First published version.</p>",
    plainText: "First published version.",
    metaTitle: "Deployment evidence must compare content",
    metaDescription: "A complete public-version comparison prevents false publication success.",
    ...overrides,
  };
}

async function websiteEvidence(articles: PublicArticleVersion[]): Promise<WebsitePublicationEvidence> {
  const contentDigest = createHash("sha256").update(JSON.stringify(articles)).digest("hex");
  const generatedAt = "2026-09-12T10:05:00.000Z";
  const result = await verifyWebsitePublicationEvidence(
    {
      format: "netherwood.website-release/v1",
      sourceCommit: "a".repeat(40),
      contentCommit: "b".repeat(40),
      contentDigest,
      articleCount: articles.length,
      generatedAt,
      builtAt: "2026-09-12T10:06:00.000Z",
      runUrl: null,
      chatEnabled: false,
    },
    {
      format: "netherwood.public-articles/v1",
      generatedAt,
      articleCount: articles.length,
      contentDigest,
      articles,
    },
  );
  assert.equal(result.status, "verified");
  return result;
}

test("publication success requires exact current SQL and deployed content/version equality", async () => {
  const deployed = publicArticle();
  const website = await websiteEvidence([deployed]);
  const exactSql = verifySqlPublicationEvidence([deployed]);
  const exact = getPublicVerification(
    { articleId: deployed.articleId, status: "Published", hasUnpublishedChanges: false },
    false,
    website,
    exactSql,
  );
  assert.equal(exact.label, "Current version verified on website");
  assert.equal(exact.badgeClass, "status-live");
  assert.match(exact.details, /Every public field, including article content/);

  const changedContentSameSlugAndTimestamp = publicArticle({
    html: "<p>Changed SQL content with the same slug and modified timestamp.</p>",
    plainText: "Changed SQL content with the same slug and modified timestamp.",
  });
  const changedSql = verifySqlPublicationEvidence([changedContentSameSlugAndTimestamp]);
  const pending = getPublicVerification(
    { articleId: deployed.articleId, status: "Published", hasUnpublishedChanges: false },
    false,
    website,
    changedSql,
  );
  assert.equal(pending.label, "Published in SQL; website update pending");
  assert.equal(pending.badgeClass, "status-pending-sync");
  assert.match(pending.details, /Slug presence and timestamps alone do not verify equality/);
});

test("staged draft fields remain separate from the SQL-published version comparison", async () => {
  const publishedVersion = publicArticle();
  const stagedAdminArticle: AdminArticle = {
    articleId: publishedVersion.articleId,
    title: "Unpublished replacement title",
    slug: "unpublished-replacement-slug",
    summary: "These draft fields must not be compared with the deployed published version.",
    html: "<p>Unpublished replacement content.</p>",
    plainText: "Unpublished replacement content.",
    category: "Draft category",
    tags: ["draft"],
    author: publishedVersion.author,
    status: "Published",
    isFeatured: false,
    publishedDate: publishedVersion.publishedDate,
    createdDate: publishedVersion.createdDate,
    modifiedDate: "2026-09-12T10:04:00.000Z",
    hasUnpublishedChanges: true,
  };
  const result = getPublicVerification(
    stagedAdminArticle,
    false,
    await websiteEvidence([publishedVersion]),
    verifySqlPublicationEvidence([publishedVersion]),
  );
  assert.equal(result.label, "Current version verified on website");
  assert.match(result.details, /separate unpublished draft is staged in SQL and is not part of this comparison/);
});

test("a staged future date cannot withdraw or reschedule the current SQL-published version", async () => {
  const published = publicArticle();
  const article = { articleId: published.articleId, status: "Published" as const, hasUnpublishedChanges: true };
  const website = await websiteEvidence([published]);
  const current = getPublicVerification(article, true, website, verifySqlPublicationEvidence([published]));
  assert.equal(current.label, "Current version verified on website");

  const changed = publicArticle({ html: "<p>New published version.</p>", plainText: "New published version." });
  const pending = getPublicVerification(article, true, website, verifySqlPublicationEvidence([changed]));
  assert.equal(pending.label, "Published in SQL; website update pending");

  for (const sql of [verifySqlPublicationEvidence([]), verifySqlPublicationEvidence([{}])]) {
    const unknown = getPublicVerification(article, true, website, sql);
    assert.equal(unknown.badgeClass, "status-unverified");
    assert.match(unknown.details, /publication date does not establish/);
    assert.doesNotMatch(unknown.label, /Withdrawal|Scheduled/);
  }
});

test("withdrawal remains pending while a validated deployed snapshot contains the article", async () => {
  const deployed = publicArticle();
  const website = await websiteEvidence([deployed]);
  const noPublishedSqlArticles = verifySqlPublicationEvidence([]);

  for (const status of ["Draft", "Archived"] as const) {
    const result = getPublicVerification(
      { articleId: deployed.articleId, status, hasUnpublishedChanges: false },
      false,
      website,
      noPublishedSqlArticles,
    );
    assert.equal(result.label, "Withdrawal pending on website");
    assert.equal(result.badgeClass, "status-pending-sync");
  }

  const scheduled = getPublicVerification(
    { articleId: deployed.articleId, status: "Published", hasUnpublishedChanges: false },
    true,
    website,
    noPublishedSqlArticles,
  );
  assert.equal(scheduled.label, "Withdrawal pending on website");
});

test("validated absence distinguishes draft, archived, scheduled, and newly published SQL states", async () => {
  const emptyWebsite = await websiteEvidence([]);
  const emptySql = verifySqlPublicationEvidence([]);
  const articleId = "12345678-1234-4234-8234-123456789abc";

  assert.equal(
    getPublicVerification({ articleId, status: "Draft" }, false, emptyWebsite, emptySql).label,
    "Draft in SQL; not on website",
  );
  assert.equal(
    getPublicVerification({ articleId, status: "Archived" }, false, emptyWebsite, emptySql).label,
    "Archived in SQL; not on website",
  );
  assert.equal(
    getPublicVerification({ articleId, status: "Published" }, true, emptyWebsite, emptySql).label,
    "Scheduled in SQL; not on website",
  );

  const currentSql = publicArticle();
  const pending = getPublicVerification(
    { articleId, status: "Published" },
    false,
    emptyWebsite,
    verifySqlPublicationEvidence([currentSql]),
  );
  assert.equal(pending.label, "Published in SQL; website update pending");
});

test("missing or inconsistent evidence reports uncertainty instead of publication success", async () => {
  const article = publicArticle();
  const sql = verifySqlPublicationEvidence([article]);
  const unavailableWebsite: WebsitePublicationEvidence = {
    status: "unavailable",
    reason: "Website deployment evidence is missing or inconsistent; the current version is not verified.",
  };
  const missingWebsite = getPublicVerification(
    { articleId: article.articleId, status: "Published" },
    false,
    unavailableWebsite,
    sql,
  );
  assert.equal(missingWebsite.label, "Published in SQL (Current version not verified)");
  assert.equal(missingWebsite.badgeClass, "status-unverified");

  const consistentWebsite = await websiteEvidence([article]);
  const missingSql = getPublicVerification(
    { articleId: article.articleId, status: "Published" },
    false,
    consistentWebsite,
    verifySqlPublicationEvidence([]),
  );
  assert.equal(missingSql.label, "Published in SQL (Current version not verified)");

  const invalid = await verifyWebsitePublicationEvidence(
    {
      format: "netherwood.website-release/v1",
      sourceCommit: "a".repeat(40),
      contentCommit: "b".repeat(40),
      contentDigest: "0".repeat(64),
      articleCount: 1,
      generatedAt: "2026-09-12T10:05:00.000Z",
    },
    {
      format: "netherwood.public-articles/v1",
      generatedAt: "2026-09-12T10:05:00.000Z",
      articleCount: 1,
      contentDigest: "0".repeat(64),
      articles: [article],
    },
  );
  assert.equal(invalid.status, "unavailable");
});

test("editorFromArticle maps article fields to editor state and preserves values", () => {
  const article: AdminArticle = {
    articleId: "12345678-1234-1234-1234-123456789abc",
    title: "SQL Index Fragmentation Myths",
    slug: "sql-index-fragmentation-myths",
    summary: "Why index rebuilds are often unnecessary.",
    html: "<p>Rebuilding indexes on every maintenance window wastes I/O.</p>",
    category: "SQL Server",
    tags: ["indexes", "maintenance", "storage"],
    author: "Steven Wittek",
    status: "Published",
    featuredImage: "/images/indexes.jpg",
    seoTitle: "Index Fragmentation Myths | Netherwood Data Partners",
    seoDescription: "Learn when index maintenance helps and when it hurts.",
    isFeatured: true,
    publishedDate: "2026-08-22T14:00:00.000Z",
    createdDate: "2026-08-20T10:00:00.000Z",
    modifiedDate: "2026-08-22T14:00:00.000Z",
    hasUnpublishedChanges: false,
  };

  const editor = editorFromArticle(article);
  assert.equal(editor.title, article.title);
  assert.equal(editor.slug, article.slug);
  assert.equal(editor.summary, article.summary);
  assert.equal(editor.category, article.category);
  assert.equal(editor.tags, "indexes, maintenance, storage");
  assert.equal(editor.author, article.author);
  assert.equal(editor.featuredImage, article.featuredImage);
  assert.equal(editor.seoTitle, article.seoTitle);
  assert.equal(editor.seoDescription, article.seoDescription);
  assert.equal(editor.isFeatured, true);
  assert.equal(editor.publishedDate, "2026-08-22T14:00");
  assert.equal(editor.html, article.html);
});

test("preview and editor sanitize HTML to remove scripts, iframes, inline event handlers, and data URIs", () => {
  const unsafeHtml = `
    <h2>Valid Heading</h2>
    <p>Valid text with <a href="https://example.com" onclick="alert(1)">link</a>.</p>
    <p>External with <a href="https://example.com/ext" target="_blank">external link</a>.</p>
    <script>alert("exploit");</script>
    <iframe src="https://evil.com"></iframe>
    <img src="javascript:alert(1)" onerror="alert('xss')" alt="test" />
    <aside class="callout">Safe callout block</aside>
    <aside class="unapproved-class">Stripped class</aside>
    <style>body { background: red; }</style>
  `;

  const sanitized = sanitizeArticleHtml(unsafeHtml);
  assert.match(sanitized, /<h2>Valid Heading<\/h2>/);
  assert.match(sanitized, /<p>Valid text with <a href="https:\/\/example.com">link<\/a>\.<\/p>/);
  assert.match(sanitized, /<a href="https:\/\/example.com\/ext" target="_blank" rel="noopener noreferrer">external link<\/a>/);
  assert.match(sanitized, /<aside class="callout">Safe callout block<\/aside>/);
  assert.doesNotMatch(sanitized, /<script/i);
  assert.doesNotMatch(sanitized, /<iframe/i);
  assert.doesNotMatch(sanitized, /<style/i);
  assert.doesNotMatch(sanitized, /onclick/i);
  assert.doesNotMatch(sanitized, /onerror/i);
  assert.doesNotMatch(sanitized, /javascript:/i);
  assert.doesNotMatch(sanitized, /unapproved-class/);
});

test("publishing desk API lifecycle: auth failure, draft isolation, preview, publish, unpublish, archive, delete", async () => {
  const articlesMap = new Map<string, Article>();
  const adminStore: ArticleAdminStore = {
    async listAdminArticles(): Promise<ArticleSummary[]> {
      return Array.from(articlesMap.values());
    },
    async getAdminArticle(id: string): Promise<Article | undefined> {
      return articlesMap.get(id);
    },
    async saveArticleDraft(id: string, input: ArticleInput, now: Date): Promise<Article> {
      const existing = articlesMap.get(id);
      const article: Article = {
        ...input,
        articleId: id,
        status: existing?.status ?? "Draft",
        createdDate: existing?.createdDate ?? now,
        modifiedDate: now,
        publishedDate: existing?.publishedDate,
        hasUnpublishedChanges: existing?.status === "Published",
      };
      articlesMap.set(id, article);
      return article;
    },
    async publishArticle(id: string, now: Date): Promise<Article | undefined> {
      const existing = articlesMap.get(id);
      if (!existing) return undefined;
      const published: Article = {
        ...existing,
        status: "Published",
        publishedDate: existing.publishedDate ?? now,
        modifiedDate: now,
        hasUnpublishedChanges: false,
      };
      articlesMap.set(id, published);
      return published;
    },
    async unpublishArticle(id: string, now: Date): Promise<Article | undefined> {
      const existing = articlesMap.get(id);
      if (!existing) return undefined;
      const unpublished: Article = {
        ...existing,
        status: "Draft",
        publishedDate: undefined,
        modifiedDate: now,
        hasUnpublishedChanges: false,
      };
      articlesMap.set(id, unpublished);
      return unpublished;
    },
    async archiveArticle(id: string, now: Date): Promise<Article | undefined> {
      const existing = articlesMap.get(id);
      if (!existing) return undefined;
      const archived: Article = {
        ...existing,
        status: "Archived",
        modifiedDate: now,
        hasUnpublishedChanges: false,
      };
      articlesMap.set(id, archived);
      return archived;
    },
    async deleteArticle(id: string): Promise<boolean> {
      const existing = articlesMap.get(id);
      if (!existing) return false;
      if (existing.status === "Published") throw new PublishedArticleDeleteError();
      return articlesMap.delete(id);
    },
    async close(): Promise<void> {},
  };

  const publicDb: Database = {
    async ping() {},
    async recordPageView() {},
    async recordChatMessage() {},
    async recordChatReply() {},
    async recordLead() {},
    async listPublishedArticles() {
      const published = Array.from(articlesMap.values()).filter(
        (a) => a.status === "Published" && a.publishedDate && a.publishedDate.getTime() <= Date.now(),
      );
      return { articles: published, page: 1, pageSize: 10, total: published.length };
    },
    async getPublishedArticle(slug: string) {
      const article = Array.from(articlesMap.values()).find(
        (a) => a.slug === slug && a.status === "Published" && a.publishedDate && a.publishedDate.getTime() <= Date.now(),
      );
      return article;
    },
    async searchKnowledge() { return []; },
    async listKnowledgeSources() { return []; },
    async listStructuredKnowledgeSources() { return []; },
    async replaceKnowledgeSource() { return true; },
    async hideKnowledgeSource() {},
    async close() {},
  };

  await withTestServer(
    async (base) => {
      const authHeader = {
        authorization: "Bearer test-admin-secret-token-32-chars-long",
        "content-type": "application/json",
      };

      // 1. Unauthorized request fails
      const unauthRes = await fetch(`${base}/api/admin/articles`);
      assert.equal(unauthRes.status, 401);

      // 2. Create Draft in SQL
      const draftPayload = {
        title: "Controlled Production Testing",
        slug: "controlled-production-testing",
        summary: "A step-by-step test for the owner publishing desk.",
        category: "Operations",
        tags: ["testing", "operations", "publishing"],
        author: "Steven Wittek",
        html: "<h2>Preflight</h2><p>Always verify the current state first.</p>",
        isFeatured: false,
      };

      const createRes = await fetch(`${base}/api/admin/articles`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify(draftPayload),
      });
      assert.equal(createRes.status, 201);
      const createdData = (await createRes.json()) as { article: Article };
      const articleId = createdData.article.articleId;
      assert.equal(createdData.article.status, "Draft");

      // 3. Draft isolation: Draft does NOT appear on public endpoint
      const publicListRes = await fetch(`${base}/api/articles`);
      assert.equal(publicListRes.status, 200);
      const publicList = (await publicListRes.json()) as { articles: ArticleSummary[] };
      assert.equal(publicList.articles.length, 0);

      const publicSlugRes = await fetch(`${base}/api/articles/${draftPayload.slug}`);
      assert.equal(publicSlugRes.status, 404);

      // 4. Server-sanitized preview
      const previewRes = await fetch(`${base}/api/admin/articles/preview`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({
          ...draftPayload,
          html: "<h2>Preview Title</h2><script>alert(1)</script><p>Safe paragraph</p>",
        }),
      });
      assert.equal(previewRes.status, 200);
      const previewData = (await previewRes.json()) as { html: string };
      assert.match(previewData.html, /<h2>Preview Title<\/h2>/);
      assert.doesNotMatch(previewData.html, /<script>/);

      // 5. Publish the article
      const publishRes = await fetch(`${base}/api/admin/articles/${articleId}/publish`, {
        method: "POST",
        headers: authHeader,
      });
      assert.equal(publishRes.status, 200);
      const publishedData = (await publishRes.json()) as { article: Article };
      assert.equal(publishedData.article.status, "Published");

      // 6. Published article now appears in public API
      const pubListAfter = (await (await fetch(`${base}/api/articles`)).json()) as { articles: ArticleSummary[] };
      assert.equal(pubListAfter.articles.length, 1);
      assert.equal(pubListAfter.articles[0].slug, draftPayload.slug);

      // 7. Delete fails when article is published
      const deleteFailRes = await fetch(`${base}/api/admin/articles/${articleId}`, {
        method: "DELETE",
        headers: authHeader,
      });
      assert.equal(deleteFailRes.status, 409);

      // 8. Unpublish article
      const unpubRes = await fetch(`${base}/api/admin/articles/${articleId}/unpublish`, {
        method: "POST",
        headers: authHeader,
      });
      assert.equal(unpubRes.status, 200);
      const unpubData = (await unpubRes.json()) as { article: Article };
      assert.equal(unpubData.article.status, "Draft");

      // 9. Now delete succeeds
      const deleteSuccessRes = await fetch(`${base}/api/admin/articles/${articleId}`, {
        method: "DELETE",
        headers: authHeader,
      });
      assert.equal(deleteSuccessRes.status, 200);

      // 10. List is empty again
      const listAfterDelete = (await (await fetch(`${base}/api/admin/articles`, { headers: authHeader })).json()) as {
        articles: ArticleSummary[];
      };
      assert.equal(listAfterDelete.articles.length, 0);
    },
    { database: publicDb, articleAdmin: adminStore },
  );
});

test("public static distribution bundles never contain tokens, credentials, or private keys", () => {
  const distPath = path.resolve(process.cwd(), "pages-dist");
  if (!fs.existsSync(distPath)) {
    return;
  }

  function scanDir(dir: string): string[] {
    const files: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...scanDir(full));
      } else if (/\.(html|js|json|css)$/.test(entry.name)) {
        files.push(full);
      }
    }
    return files;
  }

  const files = scanDir(distPath);
  assert(files.length > 0, "Expected generated static files in pages-dist");

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(content, /ARTICLE_ADMIN_TOKEN/);
    assert.doesNotMatch(content, /SQL_ARTICLE_PASSWORD/);
    assert.doesNotMatch(content, /SQL_SERVER_PASSWORD/);
    assert.doesNotMatch(content, /Bearer\s+[a-zA-Z0-9_-]{20,}/);
  }
});
