import { createHmac, randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { ProviderError, type ChatProvider } from "./ai.ts";
import { loadConfig, type Config } from "./config.ts";
import { createDatabase, type Database, type RequestContext } from "./database.ts";
import { createConfiguredProvider } from "./providers.ts";

const baseHeaders = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
} as const;
const apiRoutes = new Set(["/api/chat", "/api/telemetry/page-view", "/api/leads"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ChatHandler = ChatProvider;

type Deps = {
  config?: Config;
  database?: Database;
  chat?: ChatHandler;
  now?: () => number;
};

function send(response: ServerResponse, status: number, body: unknown, extra: Record<string, string> = {}): void {
  response.writeHead(status, { ...baseHeaders, ...extra });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage, limit: number): Promise<Record<string, unknown>> {
  const contentType = request.headers["content-type"]?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") throw new Error("unsupported_media_type");
  const declared = Number(request.headers["content-length"]);
  if (Number.isFinite(declared) && declared > limit) throw new Error("too_large");
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const rawChunk of request) {
    const chunk = Buffer.isBuffer(rawChunk) ? rawChunk : Buffer.from(rawChunk);
    size += chunk.length;
    if (size > limit) throw new Error("too_large");
    chunks.push(chunk);
  }
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid_json");
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error("invalid_json");
  }
}

function text(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : undefined;
}

function uuid(value: unknown): string | undefined {
  const parsed = text(value, 36);
  return parsed && uuidPattern.test(parsed) ? parsed : undefined;
}

function referrer(value: unknown): string | undefined {
  const parsed = text(value, 2_048);
  if (!parsed) return undefined;
  try {
    const url = new URL(parsed);
    return url.protocol === "http:" || url.protocol === "https:" ? `${url.origin}${url.pathname}` : undefined;
  } catch {
    return undefined;
  }
}

function context(request: IncomingMessage, body: Record<string, unknown>, config: Config, current: number): RequestContext | undefined {
  const visitorId = uuid(body.visitorId);
  const visitorSessionId = uuid(body.sessionId);
  if (!visitorId || !visitorSessionId) return undefined;
  const address = request.socket.remoteAddress ?? "unknown";
  const ipAbuseHash = config.ipAbuseHashSecret
    ? createHmac("sha256", config.ipAbuseHashSecret).update(address).digest()
    : undefined;
  return {
    visitorId,
    visitorSessionId,
    now: new Date(current),
    browserLanguage: text(body.browserLanguage, 32),
    referrer: referrer(body.referrer),
    userAgent: text(request.headers["user-agent"], 1_024),
    ipAbuseHash,
    ipAbuseHashExpiresAtUtc: ipAbuseHash ? new Date(current + 7 * 24 * 60 * 60 * 1_000) : undefined,
  };
}

export function createApp(deps: Deps = {}) {
  const config = deps.config ?? loadConfig();
  const database = deps.database ?? (config.sql ? createDatabase(config.sql) : undefined);
  const chat = deps.chat ?? createConfiguredProvider(config, database);
  const now = deps.now ?? Date.now;
  const buckets = new Map<string, { start: number; count: number }>();

  const server = createServer(async (request, response) => {
    const requestId = randomUUID();
    const url = new URL(request.url ?? "/", "http://localhost");
    const origin = request.headers.origin;
    const cors: Record<string, string> = origin && config.allowedOrigins.has(origin)
      ? { "access-control-allow-origin": origin, vary: "Origin" }
      : {};

    if (request.method === "OPTIONS") {
      if (!apiRoutes.has(url.pathname)) return send(response, 404, { error: "not_found", requestId });
      if (!origin || !config.allowedOrigins.has(origin)) return send(response, 403, { error: "origin_not_allowed", requestId });
      response.writeHead(204, {
        ...cors,
        "access-control-allow-methods": "POST,OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "600",
      });
      return response.end();
    }
    if (origin && !config.allowedOrigins.has(origin)) return send(response, 403, { error: "origin_not_allowed", requestId });
    if (request.method === "GET" && url.pathname === "/health") return send(response, 200, { status: "ok" }, cors);
    if (request.method !== "POST" || !apiRoutes.has(url.pathname)) return send(response, 404, { error: "not_found", requestId }, cors);

    const client = request.socket.remoteAddress ?? "unknown";
    const current = now();
    let bucket = buckets.get(client);
    if (!bucket || current - bucket.start >= config.rateWindowMs) bucket = { start: current, count: 0 };
    bucket.count += 1;
    buckets.set(client, bucket);
    if (buckets.size > 10_000) {
      for (const [key, value] of buckets) if (current - value.start >= config.rateWindowMs) buckets.delete(key);
    }
    if (bucket.count > config.rateLimit) {
      return send(response, 429, { error: "rate_limited", requestId }, {
        ...cors,
        "retry-after": String(Math.max(1, Math.ceil((config.rateWindowMs - (current - bucket.start)) / 1_000))),
      });
    }

    try {
      const body = await readJson(request, config.maxBodyBytes);
      const requestContext = context(request, body, config, current);
      if (!requestContext) return send(response, 400, { error: "invalid_session", requestId }, cors);
      if (!database) return send(response, 503, { error: "service_unavailable", requestId }, cors);

      if (url.pathname === "/api/chat") {
        const message = text(body.message, 4_000);
        const chatSessionId = uuid(body.chatSessionId);
        if (!message || !chatSessionId) return send(response, 400, { error: "invalid_message", requestId }, cors);
        if (!chat) return send(response, 503, { error: "chat_unavailable", requestId }, cors);
        await database.recordChatMessage({ ...requestContext, chatSessionId, message });
        const safetyIdentifier = requestContext.ipAbuseHash?.toString("hex");
        const result = await chat(message, safetyIdentifier);
        await database.recordChatReply({ chatSessionId, message: result.text, providerResponseId: result.responseId, now: new Date(now()) });
        return send(response, 200, {
          message: result.text,
          answer: result.text,
          sources: result.sources ?? [],
          responseId: result.responseId,
          chatSessionId,
          requestId,
        }, cors);
      }

      if (url.pathname === "/api/telemetry/page-view") {
        const path = text(body.path, 2_048);
        if (!path?.startsWith("/") || path.startsWith("//")) return send(response, 400, { error: "invalid_page_view", requestId }, cors);
        await database.recordPageView({ ...requestContext, path });
        return send(response, 202, { accepted: true, requestId }, cors);
      }

      const email = text(body.email, 320);
      const name = text(body.name, 200);
      const project = text(body.project, 4_000);
      const company = text(body.company, 200);
      const phone = text(body.phone, 50);
      const chatSessionId = body.chatSessionId === undefined ? undefined : uuid(body.chatSessionId);
      if (!email || !emailPattern.test(email) || !name || !project || (body.chatSessionId !== undefined && !chatSessionId)) {
        return send(response, 400, { error: "invalid_lead", requestId }, cors);
      }
      const leadId = randomUUID();
      await database.recordLead({
        ...requestContext,
        leadId,
        contactId: randomUUID(),
        chatSessionId,
        name,
        email,
        company,
        phone,
        project,
      });
      return send(response, 202, { accepted: true, leadId, requestId }, cors);
    } catch (error) {
      const code = error instanceof Error ? error.message : "unknown";
      if (code === "too_large") return send(response, 413, { error: "payload_too_large", requestId }, cors);
      if (code === "invalid_json") return send(response, 400, { error: "invalid_json", requestId }, cors);
      if (code === "unsupported_media_type") return send(response, 415, { error: "unsupported_media_type", requestId }, cors);
      if (error instanceof ProviderError) {
        console.error(JSON.stringify({ event: "provider_failed", requestId, provider: error.provider, providerError: error.code }));
        if (error.code === "authentication") return send(response, 503, { error: "chat_unavailable", requestId }, cors);
        if (error.code === "rate_limited") {
          const retry: Record<string, string> = error.retryAfterSeconds
            ? { "retry-after": String(error.retryAfterSeconds) }
            : {};
          return send(response, 503, { error: "chat_unavailable", requestId }, { ...cors, ...retry });
        }
        if (error.code === "timeout") return send(response, 504, { error: "upstream_unavailable", requestId }, cors);
        return send(response, 502, { error: "upstream_unavailable", requestId }, cors);
      }
      console.error(JSON.stringify({ event: "request_failed", requestId, route: url.pathname, errorType: error instanceof Error ? error.name : "unknown" }));
      return send(response, 502, { error: "upstream_unavailable", requestId }, cors);
    }
  });

  server.requestTimeout = Math.max(35_000, config.aiTimeoutMs + 10_000);
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;
  server.maxRequestsPerSocket = 100;
  if (database) server.on("close", () => void database.close().catch(() => undefined));
  return server;
}
