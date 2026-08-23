import assert from "node:assert/strict";
import test from "node:test";
import { ProviderError } from "../src/ai.ts";
import { createChatResponse } from "../src/openai.ts";

test("creates a non-stored Responses API request", async () => {
  let requestBody: Record<string, unknown> | undefined;
  const fetcher: typeof fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    assert.equal(new Headers(init?.headers).get("authorization"), "Bearer test-key");
    return new Response(JSON.stringify({ id: "resp_123", model: "test-model", output_text: "Ready" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  const result = await createChatResponse("Hello", "test-key", "test-model", "safe-user", fetcher);
  assert.equal(result.text, "Ready");
  assert.equal(requestBody?.store, false);
  assert.equal(requestBody?.safety_identifier, "safe-user");
  assert.equal(requestBody?.max_output_tokens, 500);
});

test("rejects unsuccessful or empty provider responses", async () => {
  const failed: typeof fetch = async () => new Response(JSON.stringify({ error: { message: "secret detail" } }), { status: 401 });
  await assert.rejects(
    () => createChatResponse("Hello", "bad", "test", undefined, failed),
    (error: unknown) => error instanceof ProviderError && error.code === "authentication" && !error.message.includes("secret detail"),
  );
  const empty: typeof fetch = async () => new Response(JSON.stringify({ id: "resp_empty", output: [] }), { status: 200 });
  await assert.rejects(
    () => createChatResponse("Hello", "key", "test", undefined, empty),
    (error: unknown) => error instanceof ProviderError && error.code === "malformed_response",
  );
});
