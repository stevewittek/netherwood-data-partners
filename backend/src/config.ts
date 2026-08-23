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
  openaiApiKey?: string;
  openaiModel: string;
  ipAbuseHashSecret?: string;
  sql?: SqlConfig;
  maxBodyBytes: number;
  rateLimit: number;
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
  return {
    allowedOrigins: new Set(origins),
    openaiApiKey: env.OPENAI_API_KEY?.trim() || undefined,
    openaiModel: env.OPENAI_MODEL?.trim() || "gpt-5.4-mini",
    ipAbuseHashSecret,
    sql: sqlConfig(env),
    maxBodyBytes: integer(env.MAX_BODY_BYTES, 16_384, "MAX_BODY_BYTES", 1_024, 1_048_576),
    rateLimit: integer(env.RATE_LIMIT, 30, "RATE_LIMIT", 1, 10_000),
    rateWindowMs: integer(env.RATE_WINDOW_MS, 60_000, "RATE_WINDOW_MS", 1_000, 3_600_000),
  };
}
