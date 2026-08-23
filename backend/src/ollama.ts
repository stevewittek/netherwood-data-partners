import { randomUUID } from "node:crypto";
import {
  CHAT_INSTRUCTIONS,
  ProviderError,
  providerFetch,
  providerHttpError,
  providerJson,
  type ChatProvider,
  type ChatResult,
} from "./ai.ts";

export type OllamaOptions = {
  baseUrl: string;
  model: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
};

export type OllamaMessage = { role: "system" | "user"; content: string };
export type OllamaChatClient = (messages: OllamaMessage[]) => Promise<ChatResult>;
export type OllamaEmbeddingClient = (input: string[]) => Promise<number[][]>;

function endpoint(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

export function createOllamaChatClient(options: OllamaOptions): OllamaChatClient {
  const timeoutMs = options.timeoutMs ?? 60_000;
  const fetcher = options.fetcher ?? fetch;
  return async (messages) => {
    const response = await providerFetch("ollama", fetcher, endpoint(options.baseUrl, "/api/chat"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: options.model,
        messages,
        stream: false,
        think: true,
        keep_alive: "5m",
        options: { num_ctx: 4_096, temperature: 0.1, num_predict: 1_200 },
      }),
    }, timeoutMs);
    if (!response.ok) throw providerHttpError("ollama", response);
    const body = await providerJson("ollama", response) as {
      model?: unknown;
      message?: { content?: unknown };
      done?: unknown;
    };
    const text = body.message?.content;
    if (typeof text !== "string" || !text.trim() || body.done !== true) {
      throw new ProviderError("ollama", "malformed_response");
    }
    return {
      responseId: `ollama-${randomUUID()}`,
      text: text.trim(),
      model: typeof body.model === "string" && body.model ? body.model : options.model,
    };
  };
}

export function createOllamaProvider(options: OllamaOptions): ChatProvider {
  const chat = createOllamaChatClient(options);
  return (message) => chat([
    { role: "system", content: CHAT_INSTRUCTIONS },
    { role: "user", content: message },
  ]);
}

export function createOllamaEmbeddingClient(options: OllamaOptions): OllamaEmbeddingClient {
  const timeoutMs = options.timeoutMs ?? 60_000;
  const fetcher = options.fetcher ?? fetch;
  return async (input) => {
    if (input.length === 0) return [];
    const response = await providerFetch("ollama", fetcher, endpoint(options.baseUrl, "/api/embed"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: options.model, input, truncate: true, keep_alive: "5m" }),
    }, timeoutMs);
    if (!response.ok) throw providerHttpError("ollama", response);
    const body = await providerJson("ollama", response) as { embeddings?: unknown };
    if (!Array.isArray(body.embeddings) || body.embeddings.length !== input.length) {
      throw new ProviderError("ollama", "malformed_response");
    }
    return body.embeddings.map((value) => {
      if (!Array.isArray(value) || value.length !== 768 || value.some((item) => typeof item !== "number" || !Number.isFinite(item))) {
        throw new ProviderError("ollama", "malformed_response");
      }
      return value as number[];
    });
  };
}
