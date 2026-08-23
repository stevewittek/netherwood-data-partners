import type { ChatProvider } from "./ai.ts";
import type { Config } from "./config.ts";
import type { KnowledgeStore } from "./knowledge.ts";
import { createOllamaChatClient, createOllamaEmbeddingClient } from "./ollama.ts";
import { createOpenAiProvider } from "./openai.ts";
import { createRagChatProvider } from "./rag.ts";

export function createConfiguredProvider(config: Config, store?: KnowledgeStore): ChatProvider | undefined {
  if (config.aiProvider === "ollama") {
    if (!config.ollamaModel || !store) return undefined;
    return createRagChatProvider({
      store,
      resultLimit: config.ragResultLimit,
      maxDistance: config.ragMaxDistance,
      chat: createOllamaChatClient({ baseUrl: config.ollamaBaseUrl, model: config.ollamaModel, timeoutMs: config.aiTimeoutMs }),
      embed: createOllamaEmbeddingClient({ baseUrl: config.ollamaBaseUrl, model: config.ollamaEmbeddingModel, timeoutMs: config.aiTimeoutMs }),
    });
  }
  if (!config.openaiApiKey) return undefined;
  return createOpenAiProvider({ apiKey: config.openaiApiKey, model: config.openaiModel });
}
