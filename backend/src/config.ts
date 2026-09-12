import type { AiProviderName } from "./ai.ts";

export type SqlConfig = {
  server: string;
  port: number;
  database: string;
  user: string;
  password: string;
  encrypt: boolean;
  trustServerCertificate: boolean;
};

export type Config = {
  allowedOrigins: Set<string>;
  aiProvider: AiProviderName;
  openaiApiKey?: string;
  openaiModel: string;
  ollamaBaseUrl: string;
  ollamaModel?: string;
  ollamaEmbeddingModel: string;
  aiTimeoutMs: number;
  chatMaxConcurrent: number;
  chatBusyRetryAfterSeconds: number;
  ragResultLimit: number;
  ragMaxDistance: number;
  knowledgeRoot?: string;
  ipAbuseHashSecret?: string;
  sql?: SqlConfig;
  articleSql?: SqlConfig;
  articleAdminToken?: string;
  maxBodyBytes: number;
  rateLimit: number;
  articleRateLimit: number;
  adminRateLimit: number;
  rateWindowMs: number;
};

function integer(value: string | undefined, fallback: number, name: string, minimum: number, maximum: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be an integer from ${minimum} through ${maximum}`);
  }
  return parsed;
}

function boolean(value: string | undefined, fallback: boolean, name: string): boolean {
  if (value === undefined) return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be true or false`);
}

function sqlConfig(env: NodeJS.ProcessEnv): SqlConfig | undefined {
  const values = [env.SQL_SERVER_HOST, env.SQL_SERVER_DATABASE, env.SQL_SERVER_USER, env.SQL_SERVER_PASSWORD];
  if (values.every((value) => !value)) return undefined;
  if (values.some((value) => !value)) throw new Error("SQL Server configuration is incomplete");
  return {
    server: env.SQL_SERVER_HOST!,
    port: integer(env.SQL_SERVER_PORT, 1433, "SQL_SERVER_PORT", 1, 65_535),
    database: env.SQL_SERVER_DATABASE!,
    user: env.SQL_SERVER_USER!,
    password: env.SQL_SERVER_PASSWORD!,
    encrypt: boolean(env.SQL_ENCRYPT, true, "SQL_ENCRYPT"),
    trustServerCertificate: boolean(env.SQL_TRUST_SERVER_CERTIFICATE, true, "SQL_TRUST_SERVER_CERTIFICATE"),
  };
}

function articleSqlConfig(env: NodeJS.ProcessEnv, base?: SqlConfig): SqlConfig | undefined {
  const user = env.SQL_ARTICLE_USER?.trim();
  const password = env.SQL_ARTICLE_PASSWORD;
  if (!user && !password) return undefined;
  if (!user || !password || !base) throw new Error("SQL article-author configuration is incomplete");
  return { ...base, user, password };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const origins = (env.ALLOWED_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  for (const origin of origins) {
    const parsed = new URL(origin);
    if (!(["http:", "https:"] as string[]).includes(parsed.protocol) || parsed.origin !== origin) {
      throw new Error("ALLOWED_ORIGINS must contain only URL origins");
    }
  }
  const ipAbuseHashSecret = env.IP_ABUSE_HASH_SECRET?.trim() || undefined;
  if (ipAbuseHashSecret && ipAbuseHashSecret.length < 32) {
    throw new Error("IP_ABUSE_HASH_SECRET must contain at least 32 characters");
  }
  const aiProvider = env.AI_PROVIDER?.trim().toLowerCase() || "ollama";
  if (!(["openai", "ollama"] as string[]).includes(aiProvider)) {
    throw new Error("AI_PROVIDER must be openai or ollama");
  }
  const ollamaBaseUrl = (env.OLLAMA_BASE_URL?.trim() || "http://127.0.0.1:11434").replace(/\/$/, "");
  const ollamaUrl = new URL(ollamaBaseUrl);
  if (!(ollamaUrl.protocol === "http:" || ollamaUrl.protocol === "https:")) {
    throw new Error("OLLAMA_BASE_URL must use http or https");
  }
  const ragMaxDistance = Number(env.RAG_MAX_DISTANCE ?? "0.35");
  if (!Number.isFinite(ragMaxDistance) || ragMaxDistance < 0 || ragMaxDistance > 2) {
    throw new Error("RAG_MAX_DISTANCE must be a number from 0 through 2");
  }
  const knowledgeRoot = env.KNOWLEDGE_ROOT?.trim() || undefined;
  if (knowledgeRoot && !knowledgeRoot.startsWith("/")) {
    throw new Error("KNOWLEDGE_ROOT must be an absolute path");
  }
  const sql = sqlConfig(env);
  const articleAdminToken = env.ARTICLE_ADMIN_TOKEN?.trim() || undefined;
  if (articleAdminToken && articleAdminToken.length < 32) {
    throw new Error("ARTICLE_ADMIN_TOKEN must contain at least 32 characters");
  }
  const articleSql = articleSqlConfig(env, sql);
  if ((articleAdminToken && !articleSql) || (!articleAdminToken && articleSql)) {
    throw new Error("ARTICLE_ADMIN_TOKEN and SQL article-author configuration must be set together");
  }
  return {
    allowedOrigins: new Set(origins),
    aiProvider: aiProvider as AiProviderName,
    openaiApiKey: env.OPENAI_API_KEY?.trim() || undefined,
    openaiModel: env.OPENAI_MODEL?.trim() || "gpt-5.4-mini",
    ollamaBaseUrl,
    ollamaModel: env.OLLAMA_MODEL?.trim() || "qwen3:4b",
    ollamaEmbeddingModel: env.OLLAMA_EMBEDDING_MODEL?.trim() || "nomic-embed-text",
    aiTimeoutMs: integer(env.AI_TIMEOUT_MS, 600_000, "AI_TIMEOUT_MS", 5_000, 900_000),
    chatMaxConcurrent: integer(env.CHAT_MAX_CONCURRENT, 1, "CHAT_MAX_CONCURRENT", 1, 10),
    chatBusyRetryAfterSeconds: integer(env.CHAT_BUSY_RETRY_AFTER_SECONDS, 120, "CHAT_BUSY_RETRY_AFTER_SECONDS", 1, 3_600),
    ragResultLimit: integer(env.RAG_RESULT_LIMIT, 2, "RAG_RESULT_LIMIT", 1, 10),
    ragMaxDistance,
    knowledgeRoot,
    ipAbuseHashSecret,
    sql,
    articleSql,
    articleAdminToken,
    maxBodyBytes: integer(env.MAX_BODY_BYTES, 16_384, "MAX_BODY_BYTES", 1_024, 1_048_576),
    rateLimit: integer(env.RATE_LIMIT, 30, "RATE_LIMIT", 1, 10_000),
    articleRateLimit: integer(env.ARTICLE_RATE_LIMIT, 120, "ARTICLE_RATE_LIMIT", 1, 10_000),
    adminRateLimit: integer(env.ADMIN_RATE_LIMIT, 10, "ADMIN_RATE_LIMIT", 1, 1_000),
    rateWindowMs: integer(env.RATE_WINDOW_MS, 60_000, "RATE_WINDOW_MS", 1_000, 3_600_000),
  };
}
