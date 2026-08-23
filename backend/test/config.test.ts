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
  assert.equal(config.aiProvider, "openai");
  assert.equal(config.ollamaBaseUrl, "http://127.0.0.1:11434/v1");
});

test("loads GitHub Models and Ollama provider settings", () => {
  const github = loadConfig({ AI_PROVIDER: "github", GITHUB_MODELS_TOKEN: "github-token", GITHUB_MODELS_MODEL: "openai/gpt-4.1" });
  assert.equal(github.aiProvider, "github");
  assert.equal(github.githubModelsToken, "github-token");
  assert.equal(github.githubModelsModel, "openai/gpt-4.1");
  const ollama = loadConfig({ AI_PROVIDER: "ollama", OLLAMA_BASE_URL: "http://localhost:11434/v1/", OLLAMA_MODEL: "llama3.2" });
  assert.equal(ollama.aiProvider, "ollama");
  assert.equal(ollama.ollamaBaseUrl, "http://localhost:11434/v1");
  assert.equal(ollama.ollamaModel, "llama3.2");
});

test("rejects partial or invalid configuration", () => {
  assert.throws(() => loadConfig({ SQL_SERVER_HOST: "db.example" }), /incomplete/);
  assert.throws(() => loadConfig({ RATE_LIMIT: "zero" }), /RATE_LIMIT/);
  assert.throws(() => loadConfig({ ALLOWED_ORIGINS: "https://example.com/path" }), /URL origins/);
  assert.throws(() => loadConfig({ IP_ABUSE_HASH_SECRET: "too-short" }), /at least 32/);
  assert.throws(() => loadConfig({ AI_PROVIDER: "unknown" }), /AI_PROVIDER/);
  assert.throws(() => loadConfig({ OLLAMA_BASE_URL: "file:///tmp/ollama" }), /http or https/);
});
