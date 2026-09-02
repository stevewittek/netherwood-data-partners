import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../src/config.ts";

test("loads a complete SQL configuration", () => {
  const config = loadConfig({
    SQL_SERVER_HOST: "db.example",
    SQL_SERVER_PORT: "1433",
    SQL_SERVER_DATABASE: "NDP_Web",
    SQL_SERVER_USER: "ndp_web_app",
    SQL_SERVER_PASSWORD: "test-password",
    SQL_ENCRYPT: "true",
    SQL_TRUST_SERVER_CERTIFICATE: "false",
  });
  assert.equal(config.sql?.server, "db.example");
  assert.equal(config.sql?.trustServerCertificate, false);
  assert.equal(config.aiProvider, "ollama");
  assert.equal(config.ollamaBaseUrl, "http://127.0.0.1:11434");
  assert.equal(config.ollamaModel, "qwen3:4b");
  assert.equal(config.ollamaEmbeddingModel, "nomic-embed-text");
  assert.equal(config.chatMaxConcurrent, 1);
  assert.equal(config.chatBusyRetryAfterSeconds, 120);
  assert.equal(config.articleRateLimit, 120);
  assert.equal(config.adminRateLimit, 10);
});

test("loads local RAG settings", () => {
  const ollama = loadConfig({
    AI_PROVIDER: "ollama",
    OLLAMA_BASE_URL: "http://localhost:11434/",
    OLLAMA_MODEL: "qwen3:4b",
    OLLAMA_EMBEDDING_MODEL: "nomic-embed-text",
    KNOWLEDGE_ROOT: "/knowledge",
    RAG_RESULT_LIMIT: "4",
    RAG_MAX_DISTANCE: "0.5",
  });
  assert.equal(ollama.aiProvider, "ollama");
  assert.equal(ollama.ollamaBaseUrl, "http://localhost:11434");
  assert.equal(ollama.knowledgeRoot, "/knowledge");
  assert.equal(ollama.ragResultLimit, 4);
  assert.equal(ollama.ragMaxDistance, 0.5);
});

test("rejects partial or invalid configuration", () => {
  assert.throws(() => loadConfig({ SQL_SERVER_HOST: "db.example" }), /incomplete/);
  assert.throws(() => loadConfig({ RATE_LIMIT: "zero" }), /RATE_LIMIT/);
  assert.throws(() => loadConfig({ ALLOWED_ORIGINS: "https://example.com/path" }), /URL origins/);
  assert.throws(() => loadConfig({ IP_ABUSE_HASH_SECRET: "too-short" }), /at least 32/);
  assert.throws(() => loadConfig({ AI_PROVIDER: "unknown" }), /AI_PROVIDER/);
  assert.throws(() => loadConfig({ OLLAMA_BASE_URL: "file:///tmp/ollama" }), /http or https/);
  assert.throws(() => loadConfig({ KNOWLEDGE_ROOT: "relative/path" }), /absolute/);
  assert.throws(() => loadConfig({ RAG_MAX_DISTANCE: "2.1" }), /RAG_MAX_DISTANCE/);
  assert.throws(() => loadConfig({ CHAT_MAX_CONCURRENT: "0" }), /CHAT_MAX_CONCURRENT/);
  assert.throws(() => loadConfig({ CHAT_BUSY_RETRY_AFTER_SECONDS: "3601" }), /CHAT_BUSY_RETRY_AFTER_SECONDS/);
  assert.throws(() => loadConfig({ ARTICLE_RATE_LIMIT: "0" }), /ARTICLE_RATE_LIMIT/);
  assert.throws(() => loadConfig({ ADMIN_RATE_LIMIT: "1001" }), /ADMIN_RATE_LIMIT/);
  assert.throws(() => loadConfig({ AI_PROVIDER: "github" }), /AI_PROVIDER/);
  assert.throws(() => loadConfig({ ARTICLE_ADMIN_TOKEN: "too-short" }), /ARTICLE_ADMIN_TOKEN/);
  assert.throws(() => loadConfig({
    SQL_SERVER_HOST: "db.example",
    SQL_SERVER_DATABASE: "NDP_Web",
    SQL_SERVER_USER: "ndp_web_app",
    SQL_SERVER_PASSWORD: "runtime-secret",
    ARTICLE_ADMIN_TOKEN: "a".repeat(32),
  }), /article-author configuration/);
});

test("loads article authoring only when both security layers are configured", () => {
  const config = loadConfig({
    SQL_SERVER_HOST: "db.example",
    SQL_SERVER_DATABASE: "NDP_Web",
    SQL_SERVER_USER: "ndp_web_app",
    SQL_SERVER_PASSWORD: "runtime-secret",
    SQL_ARTICLE_USER: "ndp_article_author",
    SQL_ARTICLE_PASSWORD: "article-secret",
    ARTICLE_ADMIN_TOKEN: "a".repeat(32),
  });
  assert.equal(config.articleSql?.user, "ndp_article_author");
  assert.equal(config.articleAdminToken, "a".repeat(32));
});
