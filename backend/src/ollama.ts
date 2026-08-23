import {
  CHAT_INSTRUCTIONS,
  normalizeChatCompletion,
  providerFetch,
  providerHttpError,
  providerJson,
  type ChatProvider,
} from "./ai.ts";

export type OllamaOptions = {
  baseUrl: string;
  model: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
};

export function createOllamaProvider(options: OllamaOptions): ChatProvider {
  const timeoutMs = options.timeoutMs ?? 25_000;
  const fetcher = options.fetcher ?? fetch;
  const endpoint = `${options.baseUrl.replace(/\/$/, "")}/chat/completions`;
  return async (message) => {
    const response = await providerFetch("ollama", fetcher, endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: options.model,
        messages: [
          { role: "system", content: CHAT_INSTRUCTIONS },
          { role: "user", content: message },
        ],
        max_tokens: 500,
        stream: false,
      }),
    }, timeoutMs);
    if (!response.ok) throw providerHttpError("ollama", response);
    return normalizeChatCompletion("ollama", await providerJson("ollama", response), options.model);
  };
}
