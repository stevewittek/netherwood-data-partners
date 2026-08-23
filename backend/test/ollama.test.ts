import assert from "node:assert/strict";
import test from "node:test";
import { createOllamaProvider } from "../src/ollama.ts";

test("calls an OpenAI-compatible local Ollama endpoint", async () => {
  let endpoint = "";
  const fetcher: typeof fetch = async (input, init) => {
    endpoint = String(input);
    assert.equal(new Headers(init?.headers).has("authorization"), false);
    return new Response(JSON.stringify({
      id: "ollama-response-1",
      model: "llama3.2",
      choices: [{ message: { role: "assistant", content: "Local answer" } }],
    }), { status: 200, headers: { "content-type": "application/json" } });
  };
  const provider = createOllamaProvider({ baseUrl: "http://127.0.0.1:11434/v1/", model: "llama3.2", fetcher });
  const result = await provider("Hello");
  assert.equal(endpoint, "http://127.0.0.1:11434/v1/chat/completions");
  assert.deepEqual(result, { responseId: "ollama-response-1", text: "Local answer", model: "llama3.2" });
});
