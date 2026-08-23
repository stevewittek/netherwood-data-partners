import { randomUUID } from "node:crypto";

export const CHAT_INSTRUCTIONS = `You are the Netherwood Data Partners website assistant. Be concise, accurate, and professional. Explain database and SQL Server topics clearly. Help visitors understand Netherwood services and qualify legitimate projects. Never invent pricing, guarantees, clients, credentials, or company facts. Ask for contact details only voluntarily and never request passwords, secrets, payment data, or sensitive personal data. If uncertain, recommend emailing contact@netherwooddatapartners.com.`;

export type AiProviderName = "openai" | "ollama";
export type SourceCitation = { title: string; type: "document" | "database"; url?: string };
export type ChatResult = { responseId: string; text: string; model: string; sources?: SourceCitation[] };
export type ChatProvider = (message: string, safetyIdentifier?: string) => Promise<ChatResult>;
export type ProviderErrorCode = "authentication" | "rate_limited" | "timeout" | "malformed_response" | "unavailable";

export class ProviderError extends Error {
  readonly code: ProviderErrorCode;
  readonly provider: AiProviderName;
  readonly retryAfterSeconds?: number;

  constructor(provider: AiProviderName, code: ProviderErrorCode, retryAfterSeconds?: number) {
    super(`AI provider ${code}`);
    this.name = "ProviderError";
    this.provider = provider;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function providerHttpError(provider: AiProviderName, response: Response): ProviderError {
  if (response.status === 401 || response.status === 403) return new ProviderError(provider, "authentication");
  if (response.status === 429) {
    const raw = response.headers.get("retry-after");
    const parsed = raw && /^\d{1,6}$/.test(raw) ? Number(raw) : undefined;
    return new ProviderError(provider, "rate_limited", parsed && parsed <= 3_600 ? parsed : undefined);
  }
  return new ProviderError(provider, "unavailable");
}

export async function providerFetch(
  provider: AiProviderName,
  fetcher: typeof fetch,
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetcher(input, { ...init, signal: controller.signal });
  } catch {
    throw new ProviderError(provider, controller.signal.aborted ? "timeout" : "unavailable");
  } finally {
    clearTimeout(timeout);
  }
}

export async function providerJson(provider: AiProviderName, response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ProviderError(provider, "malformed_response");
  }
}

export function normalizeChatCompletion(provider: AiProviderName, body: unknown, fallbackModel: string): ChatResult {
  if (!body || typeof body !== "object") throw new ProviderError(provider, "malformed_response");
  const value = body as {
    id?: unknown;
    model?: unknown;
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const text = value.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new ProviderError(provider, "malformed_response");
  return {
    responseId: typeof value.id === "string" && value.id ? value.id : `${provider}-${randomUUID()}`,
    text: text.trim(),
    model: typeof value.model === "string" && value.model ? value.model : fallbackModel,
  };
}
