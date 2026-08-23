import {
  CHAT_INSTRUCTIONS,
  normalizeChatCompletion,
  providerFetch,
  providerHttpError,
  providerJson,
  type ChatProvider,
} from "./ai.ts";

export const GITHUB_MODELS_ENDPOINT = "https://models.github.ai/inference/chat/completions";

export type GitHubModelsOptions = {
  token: string;
  model: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
};

export function createGitHubModelsProvider(options: GitHubModelsOptions): ChatProvider {
  const timeoutMs = options.timeoutMs ?? 25_000;
  const fetcher = options.fetcher ?? fetch;
  return async (message) => {
    const response = await providerFetch("github", fetcher, GITHUB_MODELS_ENDPOINT, {
      method: "POST",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${options.token}`,
        "content-type": "application/json",
      },
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
    if (!response.ok) throw providerHttpError("github", response);
    return normalizeChatCompletion("github", await providerJson("github", response), options.model);
  };
}
