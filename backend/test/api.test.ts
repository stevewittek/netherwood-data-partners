import assert from "node:assert/strict";
import test from "node:test";
import { ProviderError } from "../src/ai.ts";
import { createApp, type ChatHandler } from "../src/app.ts";
import { ArticleConflictError, PublishedArticleDeleteError } from "../src/article-database.ts";
import type { Config } from "../src/config.ts";
import type { ChatMessageInput, ChatReplyInput, Database, LeadInput, PageViewInput } from "../src/database.ts";
import type { Article, ArticleAdminStore, ArticleInput, ArticleSummary } from "../src/articles.ts";
import type { PublicationStatus, PublicationStatusReader } from "../src/publication-status.ts";

const visitorId = "11111111-1111-4111-8111-111111111111";
const sessionId = "22222222-2222-4222-8222-222222222222";
const chatSessionId = "33333333-3333-4333-8333-333333333333";
const ids = { visitorId, sessionId, chatSessionId };
const config: Config = {
  allowedOrigins: new Set(["https://www.netherwooddatapartners.com"]),
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
};

function database() {
  const calls = {
    pageViews: [] as PageViewInput[],
    chatMessages: [] as ChatMessageInput[],
    chatReplies: [] as ChatReplyInput[],
    leads: [] as LeadInput[],
  };
  const value: Database = {
    async ping() {},
    async recordPageView(input) { calls.pageViews.push(input); },
    async recordChatMessage(input) { calls.chatMessages.push(input); },
    async recordChatReply(input) { calls.chatReplies.push(input); },
    async recordLead(input) { calls.leads.push(input); },
    async listPublishedArticles({ page, pageSize }) { return { articles: [], page, pageSize, total: 0 }; },
    async getPublishedArticle() { return undefined; },
    async searchKnowledge() { return []; },
    async listKnowledgeSources() { return []; },
    async listStructuredKnowledgeSources() { return []; },
    async replaceKnowledgeSource() { return true; },
    async hideKnowledgeSource() {},
    async close() {},
  };
  return { calls, value };
}

async function withServer(
  check: (base: string) => Promise<void>,
  options: {
    config?: Config;
    database?: Database;
    articleAdmin?: ArticleAdminStore;
    publicationStatus?: PublicationStatusReader;
    chat?: ChatHandler;
    now?: () => number;
  } = {},
): Promise<void> {
  const server = createApp({ config, ...options });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    assert(address && typeof address === "object");
    await check("http://127.0.0.1:" + address.port);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

const articleDate = new Date("2026-08-23T12:00:00Z");
const article: Article = {
  articleId: "44444444-4444-4444-8444-444444444444",
  title: "Query Store performance analysis",
  slug: "query-store-performance-analysis",
  summary: "A practical Query Store workflow.",
  html: "<h2>Start with evidence</h2><p>Measure first.</p>",
  plainText: "Start with evidence\n\nMeasure first.",
  category: "SQL Server",
  tags: ["performance", "Query Store"],
  author: "Steven Wittek",
  status: "Published",
  seoTitle: "Query Store performance analysis | Netherwood Data Partners",
  seoDescription: "How to use Query Store evidence to isolate production regressions.",
  isFeatured: false,
  createdDate: articleDate,
  modifiedDate: articleDate,
  publishedDate: articleDate,
};

function articleAdminStore(): ArticleAdminStore {
  return {
    async listAdminArticles(): Promise<ArticleSummary[]> { return [article]; },
    async getAdminArticle(id) { return id === article.articleId ? article : undefined; },
    async saveArticleDraft(id: string, input: ArticleInput) { return { ...article, ...input, articleId: id, status: "Draft" }; },
    async publishArticle(id) { return id === article.articleId ? article : undefined; },
    async unpublishArticle(id) { return id === article.articleId ? { ...article, status: "Draft", publishedDate: undefined } : undefined; },
    async archiveArticle(id) { return id === article.articleId ? { ...article, status: "Archived" } : undefined; },
    async deleteArticle(id) { return id === article.articleId; },
    async close() {},
  };
}

test("lists published article metadata without returning every HTML body", async () => {
  const db = database();
  let filters: { category?: string; tag?: string; search?: string } = {};
  db.value.listPublishedArticles = async ({ page, pageSize, ...input }) => {
    filters = input;
    return { articles: [article], page, pageSize, total: 1 };
  };
  await withServer(async (base) => {
    const response = await fetch(base + "/api/articles?category=SQL%20Server&tag=performance&search=Query%20Store&page=1");
    assert.equal(response.status, 200);
    assert.match(response.headers.get("cache-control") ?? "", /stale-if-error/);
    const body = await response.json() as { articles: Array<Record<string, unknown>> };
    assert.equal(body.articles[0].slug, article.slug);
    assert.equal("html" in body.articles[0], false);
  }, { database: db.value });
  assert.deepEqual(filters, { category: "SQL Server", tag: "performance", search: "Query Store" });
});

test("returns only an available published article by slug", async () => {
  const db = database();
  db.value.getPublishedArticle = async (slug) => slug === article.slug ? article : undefined;
  await withServer(async (base) => {
    const found = await fetch(base + "/api/articles/" + article.slug);
    assert.equal(found.status, 200);
    const body = (await found.json()) as { article: { html: string; metaTitle: string; metaDescription: string } };
    assert.equal(body.article.html, article.html);
    assert.equal(body.article.metaTitle, article.seoTitle);
    assert.equal(body.article.metaDescription, article.seoDescription);
    assert.equal((await fetch(base + "/api/articles/draft-article")).status, 404);
  }, { database: db.value });
});

test("validates pagination and passes injection-like search text as one literal value", async () => {
  const db = database();
  let captured: { search?: string; page: number; pageSize: number } | undefined;
  db.value.listPublishedArticles = async (input) => {
    captured = { search: input.search, page: input.page, pageSize: input.pageSize };
    return { articles: [article], page: input.page, pageSize: input.pageSize, total: 3 };
  };
  const search = "query%' OR 1=1;--_[";
  await withServer(async (base) => {
    const query = new URLSearchParams({ search, page: "2", pageSize: "1" });
    const response = await fetch(`${base}/api/articles?${query}`);
    assert.equal(response.status, 200);
    const body = await response.json() as { page: number; pageSize: number; total: number; articles: ArticleSummary[] };
    assert.deepEqual({ page: body.page, pageSize: body.pageSize, total: body.total }, { page: 2, pageSize: 1, total: 3 });
    assert.equal(body.articles[0].slug, article.slug);
    assert.equal((await fetch(`${base}/api/articles?page=0&pageSize=100`)).status, 400);
  }, { database: db.value });
  assert.deepEqual(captured, { search, page: 2, pageSize: 1 });
});

test("public article routes fail safely when SQL Server is unavailable", async () => {
  const db = database();
  db.value.listPublishedArticles = async () => {
    throw new Error("connect ECONNREFUSED sql.example password=must-not-leak");
  };
  await withServer(async (base) => {
    const response = await fetch(base + "/api/articles");
    assert.equal(response.status, 502);
    const raw = await response.text();
    assert.match(raw, /upstream_unavailable/);
    assert.doesNotMatch(raw, /sql\.example|password|ECONNREFUSED/);
  }, { database: db.value });
});

test("admin article writes require a bearer token and validate HTML", async () => {
  const db = database();
  const securedConfig = { ...config, articleAdminToken: "test-admin-token-that-is-at-least-32-characters" };
  await withServer(async (base) => {
    assert.equal((await fetch(base + "/api/admin/articles")).status, 401);
    assert.equal((await fetch(base + "/api/admin/articles", {
      method: "POST",
      headers: { authorization: "Bearer incorrect-token", "content-type": "application/json" },
      body: "{}",
    })).status, 401);
    const headers = {
      authorization: "Bearer test-admin-token-that-is-at-least-32-characters",
      "content-type": "application/json",
    };
    assert.equal((await fetch(base + "/api/admin/articles", { headers })).status, 200);
    const preview = await fetch(base + "/api/admin/articles/preview", {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "Preview", slug: "preview", summary: "Summary", category: "SQL Server",
        tags: ["performance"], author: "Steven Wittek",
        html: "<p onclick=\"bad()\">Safe</p><script>bad()</script>",
      }),
    });
    assert.equal(preview.status, 200);
    const body = await preview.json() as { html: string };
    assert.equal(body.html, "<p>Safe</p>");
  }, { config: securedConfig, database: db.value, articleAdmin: articleAdminStore() });
});

test("duplicate normalized slugs return conflict without replacing an article", async () => {
  const securedConfig = { ...config, articleAdminToken: "test-admin-token-that-is-at-least-32-characters" };
  const store = articleAdminStore();
  store.saveArticleDraft = async () => { throw new ArticleConflictError(); };
  await withServer(async (base) => {
    const response = await fetch(base + "/api/admin/articles", {
      method: "POST",
      headers: {
        authorization: "Bearer test-admin-token-that-is-at-least-32-characters",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: "Existing URL",
        slug: "Existing URL",
        summary: "A duplicate normalized slug.",
        category: "SQL Server",
        tags: [],
        author: "Steven Wittek",
        html: "<p>Do not overwrite the existing row.</p>",
      }),
    });
    assert.equal(response.status, 409);
    assert.equal((await response.json() as { error: string }).error, "slug_conflict");
  }, { config: securedConfig, database: database().value, articleAdmin: store });
});

test("admin can create, edit, and publish an article", async () => {
  const securedConfig = { ...config, articleAdminToken: "test-admin-token-that-is-at-least-32-characters" };
  let stored: Article | undefined;
  const store: ArticleAdminStore = {
    async listAdminArticles() { return stored ? [stored] : []; },
    async getAdminArticle(id) { return stored?.articleId === id ? stored : undefined; },
    async saveArticleDraft(id, input, now) {
      stored = {
        ...input,
        articleId: id,
        status: "Draft",
        createdDate: stored?.createdDate ?? now,
        modifiedDate: now,
      };
      return stored;
    },
    async publishArticle(id, now) {
      if (!stored || stored.articleId !== id) return undefined;
      stored = { ...stored, status: "Published", publishedDate: now, modifiedDate: now };
      return stored;
    },
    async unpublishArticle() { return undefined; },
    async archiveArticle() { return undefined; },
    async deleteArticle() { return false; },
    async close() {},
  };
  const headers = {
    authorization: "Bearer test-admin-token-that-is-at-least-32-characters",
    "content-type": "application/json",
  };
  const draft = {
    title: "A production checklist",
    slug: "production-checklist",
    summary: "Checks to run before changing a production SQL Server.",
    category: "Operations",
    tags: ["production", "change control"],
    author: "Steven Wittek",
    seoDescription: "A practical production SQL Server change checklist.",
    isFeatured: false,
    html: "<h2>Establish a baseline</h2><p>Record the current state first.</p>",
  };

  await withServer(async (base) => {
    const created = await fetch(`${base}/api/admin/articles`, { method: "POST", headers, body: JSON.stringify(draft) });
    assert.equal(created.status, 201);
    const createdArticle = (await created.json() as { article: { articleId: string; title: string } }).article;
    assert.match(createdArticle.articleId, /^[0-9a-f-]{36}$/);

    const updated = await fetch(`${base}/api/admin/articles/${createdArticle.articleId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ ...draft, title: "A safer production checklist" }),
    });
    assert.equal(updated.status, 200);
    assert.equal((await updated.json() as { article: { title: string } }).article.title, "A safer production checklist");

    const missingUpdate = await fetch(`${base}/api/admin/articles/55555555-5555-4555-8555-555555555555`, {
      method: "PUT",
      headers,
      body: JSON.stringify(draft),
    });
    assert.equal(missingUpdate.status, 404);

    const published = await fetch(`${base}/api/admin/articles/${createdArticle.articleId}/publish`, { method: "POST", headers });
    assert.equal(published.status, 200);
    assert.equal((await published.json() as { article: { status: string } }).article.status, "Published");
  }, { config: securedConfig, database: database().value, articleAdmin: store, now: () => articleDate.valueOf() });
});

test("admin can unpublish and delete an article through authenticated routes", async () => {
  const securedConfig = { ...config, articleAdminToken: "test-admin-token-that-is-at-least-32-characters" };
  const headers = { authorization: "Bearer test-admin-token-that-is-at-least-32-characters" };
  await withServer(async (base) => {
    const unpublished = await fetch(`${base}/api/admin/articles/${article.articleId}/unpublish`, { method: "POST", headers });
    assert.equal(unpublished.status, 200);
    assert.equal(((await unpublished.json()) as { article: { status: string } }).article.status, "Draft");

    const deleted = await fetch(`${base}/api/admin/articles/${article.articleId}`, { method: "DELETE", headers });
    assert.equal(deleted.status, 200);
    assert.equal(((await deleted.json()) as { deleted: boolean }).deleted, true);

    const missing = await fetch(`${base}/api/admin/articles/55555555-5555-4555-8555-555555555555`, { method: "DELETE", headers });
    assert.equal(missing.status, 404);
  }, { config: securedConfig, database: database().value, articleAdmin: articleAdminStore() });
});

test("unpublish and archive remove an article from the public API", async () => {
  const securedConfig = { ...config, articleAdminToken: "test-admin-token-that-is-at-least-32-characters" };
  const db = database();
  let visible = true;
  db.value.getPublishedArticle = async (slug) => visible && slug === article.slug ? article : undefined;
  const store = articleAdminStore();
  store.unpublishArticle = async (id) => {
    if (id !== article.articleId) return undefined;
    visible = false;
    return { ...article, status: "Draft", publishedDate: undefined };
  };
  store.archiveArticle = async (id) => {
    if (id !== article.articleId) return undefined;
    visible = false;
    return { ...article, status: "Archived" };
  };
  const headers = { authorization: "Bearer test-admin-token-that-is-at-least-32-characters" };
  await withServer(async (base) => {
    assert.equal((await fetch(`${base}/api/articles/${article.slug}`)).status, 200);
    assert.equal((await fetch(`${base}/api/admin/articles/${article.articleId}/unpublish`, { method: "POST", headers })).status, 200);
    assert.equal((await fetch(`${base}/api/articles/${article.slug}`)).status, 404);
    visible = true;
    assert.equal((await fetch(`${base}/api/admin/articles/${article.articleId}/archive`, { method: "POST", headers })).status, 200);
    assert.equal((await fetch(`${base}/api/articles/${article.slug}`)).status, 404);
  }, { config: securedConfig, database: db.value, articleAdmin: store });
});

test("admin delete refuses a published article with a safe conflict response", async () => {
  const securedConfig = { ...config, articleAdminToken: "test-admin-token-that-is-at-least-32-characters" };
  const store = articleAdminStore();
  store.deleteArticle = async () => { throw new PublishedArticleDeleteError(); };
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/admin/articles/${article.articleId}`, {
      method: "DELETE",
      headers: { authorization: "Bearer test-admin-token-that-is-at-least-32-characters" },
    });
    assert.equal(response.status, 409);
    assert.equal((await response.json() as { error: string }).error, "article_must_be_unpublished");
  }, { config: securedConfig, database: database().value, articleAdmin: store });
});

const currentPublicationStatus: PublicationStatus = {
  checkedAtUtc: "2026-09-12T10:00:00.000Z",
  sqlSaved: {
    state: "available", capturedAtUtc: "2026-09-12T09:59:58.000Z", articleCount: 10, contentDigest: "a".repeat(64),
  },
  deployedWebsite: {
    state: "current", capturedAtUtc: "2026-09-12T09:45:00.000Z", builtAtUtc: "2026-09-12T09:46:00.000Z",
    articleCount: 10, contentDigest: "a".repeat(64),
  },
  aiKnowledge: {
    state: "current", checkedAtUtc: "2026-09-12T10:00:00.000Z", expectedArticleCount: 10,
    matchingArticleCount: 10, withheldArticleCount: 0, unexpectedVisibleArticleCount: 0,
    contentDigest: "a".repeat(64),
  },
};

test("publication status uses the private admin authentication, CORS, and response headers", async () => {
  const securedConfig = { ...config, articleAdminToken: "test-admin-token-that-is-at-least-32-characters" };
  let reads = 0;
  const publicationStatus: PublicationStatusReader = async () => {
    reads += 1;
    return currentPublicationStatus;
  };
  await withServer(async (base) => {
    const preflight = await fetch(base + "/api/admin/publication-status", {
      method: "OPTIONS",
      headers: {
        origin: "https://www.netherwooddatapartners.com",
        "access-control-request-method": "GET",
        "access-control-request-headers": "authorization",
      },
    });
    assert.equal(preflight.status, 204);
    assert.match(preflight.headers.get("access-control-allow-headers") ?? "", /authorization/);

    assert.equal((await fetch(base + "/api/admin/publication-status")).status, 401);
    assert.equal((await fetch(base + "/api/admin/publication-status", {
      headers: { authorization: "Bearer incorrect-token" },
    })).status, 401);
    assert.equal(reads, 0);

    const response = await fetch(base + "/api/admin/publication-status", {
      headers: { authorization: "Bearer test-admin-token-that-is-at-least-32-characters" },
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
    const body = await response.json() as { status: PublicationStatus; requestId: string };
    assert.deepEqual(body.status, currentPublicationStatus);
    assert.match(body.requestId, /^[0-9a-f-]{36}$/);
    assert.equal(reads, 1);
  }, { config: securedConfig, database: database().value, articleAdmin: articleAdminStore(), publicationStatus });
});

test("admin routes are absent when authoring credentials are disabled", async () => {
  await withServer(async (base) => {
    for (const path of ["/api/admin/articles", "/api/admin/publication-status"]) {
      const response = await fetch(base + path, { headers: { authorization: "Bearer anything" } });
      assert.equal(response.status, 404);
      assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
    }
  }, { database: database().value, publicationStatus: async () => currentPublicationStatus });
});

test("chat validates, persists, and returns the provider result", async () => {
  const db = database();
  let safetyIdentifier: string | undefined;
  await withServer(async (base) => {
    const response = await fetch(base + "/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://www.netherwooddatapartners.com" },
      body: JSON.stringify({ ...ids, message: "How can you help?" }),
    });
    assert.equal(response.status, 200);
    const body = await response.json() as { message: string; answer: string; sources: unknown[]; chatSessionId: string };
    assert.equal(body.message, "Hello");
    assert.equal(body.answer, "Hello");
    assert.deepEqual(body.sources, []);
    assert.equal(body.chatSessionId, chatSessionId);
    assert.equal(response.headers.get("access-control-allow-origin"), "https://www.netherwooddatapartners.com");
  }, {
    database: db.value,
    chat: async (_message, safety) => {
      safetyIdentifier = safety;
      return { responseId: "resp_test", text: "Hello", model: "test-model" };
    },
    now: () => Date.parse("2026-08-23T12:00:00Z"),
  });
  assert.equal(db.calls.chatMessages.length, 1);
  assert.equal(db.calls.chatReplies.length, 1);
  assert.equal(db.calls.chatMessages[0].message, "How can you help?");
  assert.equal(db.calls.chatReplies[0].providerResponseId, "resp_test");
  assert.match(safetyIdentifier ?? "", /^[0-9a-f]{64}$/);
});

test("rejects an unapproved origin", async () => {
  const db = database();
  await withServer(async (base) => {
    const response = await fetch(base + "/api/chat", {
      method: "POST",
      headers: { origin: "https://evil.example", "content-type": "application/json" },
      body: "{}",
    });
    assert.equal(response.status, 403);
  }, { database: db.value });
  assert.equal(db.calls.chatMessages.length, 0);
});

test("persists a valid page-view contract", async () => {
  const db = database();
  await withServer(async (base) => {
    const response = await fetch(base + "/api/telemetry/page-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...ids, path: "/services", browserLanguage: "en-US" }),
    });
    assert.equal(response.status, 202);
  }, { database: db.value });
  assert.equal(db.calls.pageViews.length, 1);
  assert.equal(db.calls.pageViews[0].path, "/services");
  assert.equal(db.calls.pageViews[0].browserLanguage, "en-US");
});

test("persists a voluntary lead contract", async () => {
  const db = database();
  await withServer(async (base) => {
    const response = await fetch(base + "/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...ids, name: "Test User", email: "test@example.com", project: "Migration planning" }),
    });
    assert.equal(response.status, 202);
    const body = await response.json() as { leadId: string };
    assert.match(body.leadId, /^[0-9a-f-]{36}$/);
  }, { database: db.value });
  assert.equal(db.calls.leads.length, 1);
  assert.equal(db.calls.leads[0].email, "test@example.com");
});

test("requires JSON and valid anonymous session identifiers", async () => {
  const db = database();
  await withServer(async (base) => {
    const wrongType = await fetch(base + "/api/telemetry/page-view", { method: "POST", body: "{}" });
    assert.equal(wrongType.status, 415);
    const wrongIds = await fetch(base + "/api/telemetry/page-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorId: "bad", sessionId, path: "/" }),
    });
    assert.equal(wrongIds.status, 400);
  }, { database: db.value });
});

test("rate limits requests by the short in-memory window", async () => {
  const db = database();
  await withServer(async (base) => {
    const request = () => fetch(base + "/api/telemetry/page-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...ids, path: "/" }),
    });
    assert.equal((await request()).status, 202);
    const limited = await request();
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("retry-after"), "60");
  }, { database: db.value, config: { ...config, rateLimit: 1 } });
});

test("uses separate stronger admin and bounded public article rate limits", async () => {
  const securedConfig = {
    ...config,
    articleAdminToken: "test-admin-token-that-is-at-least-32-characters",
    articleRateLimit: 1,
    adminRateLimit: 1,
  };
  await withServer(async (base) => {
    assert.equal((await fetch(base + "/api/articles")).status, 200);
    assert.equal((await fetch(base + "/api/articles")).status, 429);
    const headers = { authorization: "Bearer test-admin-token-that-is-at-least-32-characters" };
    assert.equal((await fetch(base + "/api/admin/articles", { headers })).status, 200);
    assert.equal((await fetch(base + "/api/admin/articles", { headers })).status, 429);
  }, { config: securedConfig, database: database().value, articleAdmin: articleAdminStore() });
});

test("rejects concurrent model work with a bounded busy response", async () => {
  const db = database();
  let releaseChat: (() => void) | undefined;
  let markStarted: (() => void) | undefined;
  const started = new Promise<void>((resolve) => { markStarted = resolve; });
  const release = new Promise<void>((resolve) => { releaseChat = resolve; });
  await withServer(async (base) => {
    const request = () => fetch(base + "/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...ids, message: "How can you help?" }),
    });
    const first = request();
    await started;
    const rejected = await request();
    assert.equal(rejected.status, 503);
    assert.equal(rejected.headers.get("retry-after"), "120");
    assert.equal((await rejected.json() as { error: string }).error, "chat_busy");
    assert.equal(db.calls.chatMessages.length, 1);
    releaseChat?.();
    assert.equal((await first).status, 200);
  }, {
    database: db.value,
    chat: async () => {
      markStarted?.();
      await release;
      return { responseId: "resp_concurrent", text: "Ready", model: "test-model" };
    },
  });
  assert.equal(db.calls.chatMessages.length, 1);
  assert.equal(db.calls.chatReplies.length, 1);
});

for (const scenario of [
  { code: "authentication" as const, expectedStatus: 503, expectedError: "chat_unavailable" },
  { code: "rate_limited" as const, expectedStatus: 503, expectedError: "chat_unavailable" },
  { code: "timeout" as const, expectedStatus: 504, expectedError: "upstream_unavailable" },
  { code: "malformed_response" as const, expectedStatus: 502, expectedError: "upstream_unavailable" },
  { code: "unavailable" as const, expectedStatus: 502, expectedError: "upstream_unavailable" },
]) {
  test(`returns a safe response for provider ${scenario.code}`, async () => {
    const db = database();
    await withServer(async (base) => {
      const response = await fetch(base + "/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...ids, message: "Hello" }),
      });
      assert.equal(response.status, scenario.expectedStatus);
      const body = await response.json() as Record<string, unknown>;
      assert.equal(body.error, scenario.expectedError);
      assert.equal(JSON.stringify(body).includes("upstream secret"), false);
      if (scenario.code === "rate_limited") assert.equal(response.headers.get("retry-after"), "30");
    }, {
      database: db.value,
      chat: async () => {
        throw new ProviderError("ollama", scenario.code, scenario.code === "rate_limited" ? 30 : undefined);
      },
    });
  });
}
