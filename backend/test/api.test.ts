import assert from "node:assert/strict";
import test from "node:test";
import { ProviderError } from "../src/ai.ts";
import { createApp, type ChatHandler } from "../src/app.ts";
import type { Config } from "../src/config.ts";
import type { ChatMessageInput, ChatReplyInput, Database, LeadInput, PageViewInput } from "../src/database.ts";
import type { Article, ArticleAdminStore, ArticleInput, ArticleSummary } from "../src/articles.ts";

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
  options: { config?: Config; database?: Database; articleAdmin?: ArticleAdminStore; chat?: ChatHandler; now?: () => number } = {},
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
    async archiveArticle(id) { return id === article.articleId ? { ...article, status: "Archived" } : undefined; },
    async close() {},
  };
}

test("lists published article metadata without returning every HTML body", async () => {
  const db = database();
  db.value.listPublishedArticles = async ({ page, pageSize }) => ({ articles: [article], page, pageSize, total: 1 });
  await withServer(async (base) => {
    const response = await fetch(base + "/api/articles?category=SQL%20Server&tag=performance&page=1");
    assert.equal(response.status, 200);
    assert.match(response.headers.get("cache-control") ?? "", /stale-if-error/);
    const body = await response.json() as { articles: Array<Record<string, unknown>> };
    assert.equal(body.articles[0].slug, article.slug);
    assert.equal("html" in body.articles[0], false);
  }, { database: db.value });
});

test("returns only an available published article by slug", async () => {
  const db = database();
  db.value.getPublishedArticle = async (slug) => slug === article.slug ? article : undefined;
  await withServer(async (base) => {
    const found = await fetch(base + "/api/articles/" + article.slug);
    assert.equal(found.status, 200);
    assert.equal(((await found.json()) as { article: { html: string } }).article.html, article.html);
    assert.equal((await fetch(base + "/api/articles/draft-article")).status, 404);
  }, { database: db.value });
});

test("admin article writes require a bearer token and validate HTML", async () => {
  const db = database();
  const securedConfig = { ...config, articleAdminToken: "test-admin-token-that-is-at-least-32-characters" };
  await withServer(async (base) => {
    assert.equal((await fetch(base + "/api/admin/articles")).status, 401);
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

test("admin routes are absent when authoring credentials are disabled", async () => {
  await withServer(async (base) => {
    const response = await fetch(base + "/api/admin/articles", { headers: { authorization: "Bearer anything" } });
    assert.equal(response.status, 404);
  }, { database: database().value });
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
