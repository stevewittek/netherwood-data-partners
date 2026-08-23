import assert from "node:assert/strict";
import test from "node:test";
import { createApp, type ChatHandler } from "../src/app.ts";
import type { Config } from "../src/config.ts";
import type { ChatMessageInput, ChatReplyInput, Database, LeadInput, PageViewInput } from "../src/database.ts";

const visitorId = "11111111-1111-4111-8111-111111111111";
const sessionId = "22222222-2222-4222-8222-222222222222";
const chatSessionId = "33333333-3333-4333-8333-333333333333";
const ids = { visitorId, sessionId, chatSessionId };
const config: Config = {
  allowedOrigins: new Set(["https://www.netherwooddatapartners.com"]),
  openaiApiKey: "test-key",
  openaiModel: "test-model",
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
    async close() {},
  };
  return { calls, value };
}

async function withServer(
  check: (base: string) => Promise<void>,
  options: { config?: Config; database?: Database; chat?: ChatHandler; now?: () => number } = {},
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
    const body = await response.json() as { message: string; chatSessionId: string };
    assert.equal(body.message, "Hello");
    assert.equal(body.chatSessionId, chatSessionId);
    assert.equal(response.headers.get("access-control-allow-origin"), "https://www.netherwooddatapartners.com");
  }, {
    database: db.value,
    chat: async (_message, _key, _model, safety) => {
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
