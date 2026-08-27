import assert from "node:assert/strict";
import test from "node:test";
import { ProviderError } from "../src/ai.ts";
import { createOllamaChatClient, createOllamaEmbeddingClient, createOllamaProvider } from "../src/ollama.ts";

test("calls the native local Ollama chat endpoint without authentication", async () => {
  let endpoint = "";
  let requestBody: Record<string, unknown> | undefined;
  const fetcher: typeof fetch = async (input, init) => {
    endpoint = String(input);
    assert.equal(new Headers(init?.headers).has("authorization"), false);
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({ model: "qwen3:4b", message: { role: "assistant", content: "Local answer" }, done: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  const provider = createOllamaProvider({ baseUrl: "http://127.0.0.1:11434/", model: "qwen3:4b", fetcher });
  const result = await provider("Hello");
  assert.equal(endpoint, "http://127.0.0.1:11434/api/chat");
  assert.equal(requestBody?.think, true);
  assert.equal(requestBody?.stream, false);
  assert.match(result.responseId, /^ollama-/);
  assert.equal(result.text, "Local answer");
});

test("generates and validates 768-dimension local embeddings", async () => {
  let endpoint = "";
  const vector = Array.from({ length: 768 }, (_value, index) => index / 768);
  const fetcher: typeof fetch = async (input, init) => {
    endpoint = String(input);
    const body = JSON.parse(String(init?.body)) as { input: string[] };
    return new Response(JSON.stringify({ embeddings: body.input.map(() => vector) }), { status: 200 });
  };
  const embed = createOllamaEmbeddingClient({ baseUrl: "http://127.0.0.1:11434", model: "nomic-embed-text", fetcher });
  const result = await embed(["one", "two"]);
  assert.equal(endpoint, "http://127.0.0.1:11434/api/embed");
  assert.equal(result.length, 2);
  assert.equal(result[0].length, 768);
});

test("rejects malformed local chat and embedding responses", async () => {
  const malformedChat: typeof fetch = async () => new Response(JSON.stringify({ done: true, message: {} }), { status: 200 });
  await assert.rejects(
    () => createOllamaChatClient({ baseUrl: "http://localhost:11434", model: "qwen3:4b", fetcher: malformedChat })([]),
    (error: unknown) => error instanceof ProviderError && error.code === "malformed_response",
  );
  const malformedEmbedding: typeof fetch = async () => new Response(JSON.stringify({ embeddings: [[1, 2]] }), { status: 200 });
  await assert.rejects(
    () => createOllamaEmbeddingClient({ baseUrl: "http://localhost:11434", model: "nomic-embed-text", fetcher: malformedEmbedding })(["test"]),
    (error: unknown) => error instanceof ProviderError && error.code === "malformed_response",
  );
});
