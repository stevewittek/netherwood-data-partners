import {
  CHAT_INSTRUCTIONS,
  ProviderError,
  providerFetch,
  providerHttpError,
  providerJson,
  type ChatProvider,
  type ChatResult,
} from "./ai.ts";

export type OpenAiOptions = {
  apiKey: string;
  model: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
};

export function createOpenAiProvider(options: OpenAiOptions): ChatProvider {
  const timeoutMs = options.timeoutMs ?? 25_000;
  const fetcher = options.fetcher ?? fetch;
  return async (message, safetyIdentifier) => {
    const response = await providerFetch("openai", fetcher, "https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${options.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: options.model,
        instructions: CHAT_INSTRUCTIONS,
        input: message,
        max_output_tokens: 500,
        store: false,
        ...(safetyIdentifier ? { safety_identifier: safetyIdentifier } : {}),
      }),
    }, timeoutMs);
    if (!response.ok) throw providerHttpError("openai", response);
    const body = await providerJson("openai", response) as {
      id?: string;
      model?: string;
      output_text?: string;
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };
    const text = (body.output_text ?? body.output?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text")
      .map((item) => item.text ?? "").join("\n") ?? "").trim();
    if (!body.id || !text) throw new ProviderError("openai", "malformed_response");
    return { responseId: body.id, text, model: body.model ?? options.model };
  };
}

export async function createChatResponse(
  message: string,
  apiKey: string,
  model: string,
  safetyIdentifier?: string,
  fetcher: typeof fetch = fetch,
): Promise<ChatResult> {
  return createOpenAiProvider({ apiKey, model, fetcher })(message, safetyIdentifier);
}
