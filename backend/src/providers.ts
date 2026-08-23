import type { ChatProvider } from "./ai.ts";
import type { Config } from "./config.ts";
import { createGitHubModelsProvider } from "./github-models.ts";
import { createOllamaProvider } from "./ollama.ts";
import { createOpenAiProvider } from "./openai.ts";

export function createConfiguredProvider(config: Config): ChatProvider | undefined {
  if (config.aiProvider === "github") {
    if (!config.githubModelsToken || !config.githubModelsModel) return undefined;
    return createGitHubModelsProvider({ token: config.githubModelsToken, model: config.githubModelsModel });
  }
  if (config.aiProvider === "ollama") {
    if (!config.ollamaModel) return undefined;
    return createOllamaProvider({ baseUrl: config.ollamaBaseUrl, model: config.ollamaModel });
  }
  if (!config.openaiApiKey) return undefined;
  return createOpenAiProvider({ apiKey: config.openaiApiKey, model: config.openaiModel });
}
