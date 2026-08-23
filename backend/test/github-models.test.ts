import assert from "node:assert/strict";
import test from "node:test";
import { ProviderError } from "../src/ai.ts";
import { createGitHubModelsProvider, GITHUB_MODELS_ENDPOINT } from "../src/github-models.ts";

test("calls GitHub Models and normalizes a chat completion", async () => {
  let endpoint = "";
  let requestBody: Record<string, unknown> | undefined;
  const fetcher: typeof fetch = async (input, init) => {
    endpoint = String(input);
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("authorization"), "Bearer github-test-token");
    assert.equal(headers.get("accept"), "application/vnd.github+json");
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({
      id: "github-response-1",
      model: "openai/gpt-4.1",
      choices: [{ message: { role: "assistant", content: "Ready" } }],
    }), { status: 200, headers: { "content-type": "application/json" } });
  };
  const provider = createGitHubModelsProvider({ token: "github-test-token", model: "openai/gpt-4.1", fetcher });
  const result = await provider("Hello");
  assert.equal(endpoint, GITHUB_MODELS_ENDPOINT);
  assert.equal(requestBody?.model, "openai/gpt-4.1");
  assert.equal(requestBody?.max_tokens, 500);
  assert.equal(requestBody?.stream, false);
  assert.deepEqual(result, { responseId: "github-response-1", text: "Ready", model: "openai/gpt-4.1" });
});

for (const status of [401, 403]) {
  test(`classifies GitHub Models ${status} as authentication failure`, async () => {
    const fetcher: typeof fetch = async () => new Response("upstream secret", { status });
    const provider = createGitHubModelsProvider({ token: "bad-token", model: "test-model", fetcher });
    await assert.rejects(
      () => provider("Hello"),
      (error: unknown) => error instanceof ProviderError && error.code === "authentication" && !error.message.includes("upstream secret"),
    );
  });
}

test("classifies GitHub Models rate limiting without exposing the response", async () => {
  const fetcher: typeof fetch = async () => new Response("quota detail", { status: 429, headers: { "retry-after": "45" } });
  const provider = createGitHubModelsProvider({ token: "token", model: "test-model", fetcher });
  await assert.rejects(
    () => provider("Hello"),
    (error: unknown) => error instanceof ProviderError && error.code === "rate_limited" && error.retryAfterSeconds === 45 && !error.message.includes("quota detail"),
  );
});

test("classifies GitHub Models timeout", async () => {
  const fetcher: typeof fetch = async (_input, init) => await new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
  });
  const provider = createGitHubModelsProvider({ token: "token", model: "test-model", fetcher, timeoutMs: 5 });
  await assert.rejects(
    () => provider("Hello"),
    (error: unknown) => error instanceof ProviderError && error.code === "timeout",
  );
});

test("classifies malformed GitHub Models responses", async () => {
  const invalidJson: typeof fetch = async () => new Response("not json", { status: 200 });
  const invalidShape: typeof fetch = async () => new Response(JSON.stringify({ choices: [] }), { status: 200 });
  for (const fetcher of [invalidJson, invalidShape]) {
    const provider = createGitHubModelsProvider({ token: "token", model: "test-model", fetcher });
    await assert.rejects(
      () => provider("Hello"),
      (error: unknown) => error instanceof ProviderError && error.code === "malformed_response",
    );
  }
});
