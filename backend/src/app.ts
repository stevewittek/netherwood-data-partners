import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { ArticleConflictError, PublishedArticleDeleteError, createArticleAdminDatabase } from "./article-database.ts";
import {
  ArticleValidationError,
  articleJson,
  articleSummaryJson,
  parseArticleInput,
  sanitizeArticleHtml,
  type ArticleAdminStore,
} from "./articles.ts";
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
const browserPostRoutes = new Set(["/api/chat", "/api/telemetry/page-view", "/api/leads"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ChatHandler = ChatProvider;

type Deps = {
  config?: Config;
  database?: Database;
  articleAdmin?: ArticleAdminStore;
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

function pageNumber(value: string | null, fallback: number, maximum: number): number | undefined {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= maximum ? parsed : undefined;
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

function authorized(request: IncomingMessage, expected: string | undefined): boolean {
  if (!expected) return false;
  const supplied = request.headers.authorization;
  if (!supplied?.startsWith("Bearer ")) return false;
  const expectedHash = createHash("sha256").update(expected).digest();
  const suppliedHash = createHash("sha256").update(supplied.slice(7)).digest();
  return timingSafeEqual(expectedHash, suppliedHash);
}

function adminPath(path: string): boolean {
  return path === "/api/admin/articles" || path === "/api/admin/articles/preview" || path.startsWith("/api/admin/articles/");
}

export function createApp(deps: Deps = {}) {
  const config = deps.config ?? loadConfig();
  const database = deps.database ?? (config.sql ? createDatabase(config.sql) : undefined);
  const articleAdmin = deps.articleAdmin ?? (config.articleSql ? createArticleAdminDatabase(config.articleSql) : undefined);
  const chat = deps.chat ?? createConfiguredProvider(config, database);
  const now = deps.now ?? Date.now;
  const buckets = new Map<string, { start: number; count: number }>();
  let activeChats = 0;

  function consumeRateLimit(client: string, current: number, limit: number, scope: string): number | undefined {
    const key = `${scope}:${client}`;
    let bucket = buckets.get(key);
    if (!bucket || current - bucket.start >= config.rateWindowMs) bucket = { start: current, count: 0 };
    bucket.count += 1;
    buckets.set(key, bucket);
    if (buckets.size > 10_000) {
      for (const [key, value] of buckets) if (current - value.start >= config.rateWindowMs) buckets.delete(key);
    }
    return bucket.count > limit
      ? Math.max(1, Math.ceil((config.rateWindowMs - (current - bucket.start)) / 1_000))
      : undefined;
  }

  const server = createServer(async (request, response) => {
    const requestId = randomUUID();
    const url = new URL(request.url ?? "/", "http://localhost");
    const origin = request.headers.origin;
    const cors: Record<string, string> = origin && config.allowedOrigins.has(origin)
      ? { "access-control-allow-origin": origin, vary: "Origin" }
      : {};
    const isAdmin = adminPath(url.pathname);

    if (request.method === "OPTIONS") {
      const known = browserPostRoutes.has(url.pathname) || url.pathname === "/api/articles" || url.pathname.startsWith("/api/articles/") || isAdmin;
      if (!known) return send(response, 404, { error: "not_found", requestId });
      if (!origin || !config.allowedOrigins.has(origin)) return send(response, 403, { error: "origin_not_allowed", requestId });
      response.writeHead(204, {
        ...cors,
        "access-control-allow-methods": isAdmin ? "GET,POST,PUT,DELETE,OPTIONS" : "GET,POST,OPTIONS",
        "access-control-allow-headers": isAdmin ? "authorization,content-type" : "content-type",
        "access-control-max-age": "600",
      });
      return response.end();
    }
    if (origin && !config.allowedOrigins.has(origin)) return send(response, 403, { error: "origin_not_allowed", requestId });
    if (request.method === "GET" && url.pathname === "/health") return send(response, 200, { status: "ok" }, cors);

    try {
      if (request.method === "GET" && (url.pathname === "/api/articles" || url.pathname.startsWith("/api/articles/"))) {
        const retryAfter = consumeRateLimit(
          request.socket.remoteAddress ?? "unknown",
          now(),
          config.articleRateLimit,
          "public-articles",
        );
        if (retryAfter !== undefined) {
          return send(response, 429, { error: "rate_limited", requestId }, {
            ...cors,
            "retry-after": String(retryAfter),
          });
        }
      }

      if (request.method === "GET" && url.pathname === "/api/articles") {
        if (!database) return send(response, 503, { error: "service_unavailable", requestId }, cors);
        const category = url.searchParams.has("category") ? text(url.searchParams.get("category"), 100) : undefined;
        const tag = url.searchParams.has("tag") ? text(url.searchParams.get("tag"), 50) : undefined;
        const search = url.searchParams.has("search") ? text(url.searchParams.get("search"), 200) : undefined;
        const page = pageNumber(url.searchParams.get("page"), 1, 1_000_000);
        const pageSize = pageNumber(url.searchParams.get("pageSize"), 10, 50);
        if ((url.searchParams.has("category") && !category) || (url.searchParams.has("tag") && !tag)
          || (url.searchParams.has("search") && !search) || !page || !pageSize) {
          return send(response, 400, { error: "invalid_query", requestId }, cors);
        }
        const result = await database.listPublishedArticles({ category, tag, search, page, pageSize });
        return send(response, 200, {
          articles: result.articles.map(articleSummaryJson),
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          requestId,
        }, { ...cors, "cache-control": "public, max-age=60, stale-if-error=86400" });
      }

      if (request.method === "GET" && url.pathname.startsWith("/api/articles/")) {
        if (!database) return send(response, 503, { error: "service_unavailable", requestId }, cors);
        const slug = decodeURIComponent(url.pathname.slice("/api/articles/".length));
        if (!slugPattern.test(slug) || slug.length > 200) return send(response, 404, { error: "not_found", requestId }, cors);
        const article = await database.getPublishedArticle(slug);
        if (!article) return send(response, 404, { error: "not_found", requestId }, cors);
        return send(response, 200, { article: articleJson(article), requestId }, {
          ...cors,
          "cache-control": "public, max-age=60, stale-if-error=86400",
        });
      }

      if (isAdmin) {
        const retryAfter = consumeRateLimit(
          request.socket.remoteAddress ?? "unknown",
          now(),
          config.adminRateLimit,
          "article-admin",
        );
        if (retryAfter !== undefined) {
          return send(response, 429, { error: "rate_limited", requestId }, {
            ...cors,
            "retry-after": String(retryAfter),
            "x-robots-tag": "noindex, nofollow",
          });
        }
        if (!articleAdmin || !config.articleAdminToken) {
          return send(response, 404, { error: "not_found", requestId }, {
            ...cors,
            "x-robots-tag": "noindex, nofollow",
          });
        }
        if (!authorized(request, config.articleAdminToken)) {
          return send(response, 401, { error: "unauthorized", requestId }, {
            ...cors,
            "www-authenticate": "Bearer",
            "x-robots-tag": "noindex, nofollow",
          });
        }
        const adminHeaders = { ...cors, "x-robots-tag": "noindex, nofollow" };
        if (request.method === "GET" && url.pathname === "/api/admin/articles") {
          const articles = await articleAdmin.listAdminArticles();
          return send(response, 200, { articles: articles.map(articleSummaryJson), requestId }, adminHeaders);
        }
        const match = url.pathname.match(/^\/api\/admin\/articles\/([0-9a-f-]{36})(?:\/(publish|unpublish|archive))?$/i);
        if (request.method === "GET" && match && !match[2] && uuid(match[1])) {
          const article = await articleAdmin.getAdminArticle(match[1]);
          return article
            ? send(response, 200, { article: articleJson(article), requestId }, adminHeaders)
            : send(response, 404, { error: "not_found", requestId }, adminHeaders);
        }
        if (request.method === "POST" && url.pathname === "/api/admin/articles/preview") {
          const body = await readJson(request, 600_000);
          const parsed = parseArticleInput(body);
          return send(response, 200, { html: sanitizeArticleHtml(parsed.html), requestId }, adminHeaders);
        }
        if ((request.method === "POST" && url.pathname === "/api/admin/articles") || (request.method === "PUT" && match && !match[2])) {
          const articleId = request.method === "POST" ? randomUUID() : uuid(match?.[1]);
          if (!articleId) return send(response, 404, { error: "not_found", requestId }, adminHeaders);
          if (request.method === "PUT" && !(await articleAdmin.getAdminArticle(articleId))) {
            return send(response, 404, { error: "not_found", requestId }, adminHeaders);
          }
          const body = await readJson(request, 600_000);
          const article = await articleAdmin.saveArticleDraft(articleId, parseArticleInput(body), new Date(now()));
          return send(response, request.method === "POST" ? 201 : 200, { article: articleJson(article), requestId }, adminHeaders);
        }
        if (request.method === "DELETE" && match && !match[2] && uuid(match[1])) {
          const deleted = await articleAdmin.deleteArticle(match[1]);
          return deleted
            ? send(response, 200, { deleted: true, requestId }, adminHeaders)
            : send(response, 404, { error: "not_found", requestId }, adminHeaders);
        }
        if (request.method === "POST" && match && match[2] && uuid(match[1])) {
          const article = match[2] === "publish"
            ? await articleAdmin.publishArticle(match[1], new Date(now()))
            : match[2] === "unpublish"
              ? await articleAdmin.unpublishArticle(match[1], new Date(now()))
              : await articleAdmin.archiveArticle(match[1], new Date(now()));
          return article
            ? send(response, 200, { article: articleJson(article), requestId }, adminHeaders)
            : send(response, 404, { error: "not_found", requestId }, adminHeaders);
        }
        return send(response, 404, { error: "not_found", requestId }, adminHeaders);
      }

      if (request.method !== "POST" || !browserPostRoutes.has(url.pathname)) {
        return send(response, 404, { error: "not_found", requestId }, cors);
      }

      const current = now();
      const retryAfter = consumeRateLimit(
        request.socket.remoteAddress ?? "unknown",
        current,
        config.rateLimit,
        "browser-posts",
      );
      if (retryAfter !== undefined) {
        return send(response, 429, { error: "rate_limited", requestId }, {
          ...cors,
          "retry-after": String(retryAfter),
        });
      }

      const body = await readJson(request, config.maxBodyBytes);
      const requestContext = context(request, body, config, current);
      if (!requestContext) return send(response, 400, { error: "invalid_session", requestId }, cors);
      if (!database) return send(response, 503, { error: "service_unavailable", requestId }, cors);

      if (url.pathname === "/api/chat") {
        const message = text(body.message, 4_000);
        const chatSessionId = uuid(body.chatSessionId);
        if (!message || !chatSessionId) return send(response, 400, { error: "invalid_message", requestId }, cors);
        if (!chat) return send(response, 503, { error: "chat_unavailable", requestId }, cors);
        if (activeChats >= config.chatMaxConcurrent) {
          return send(response, 503, { error: "chat_busy", requestId }, {
            ...cors,
            "retry-after": String(config.chatBusyRetryAfterSeconds),
          });
        }
        activeChats += 1;
        try {
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
        } finally {
          activeChats -= 1;
        }
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
      const safeRouteHeaders = isAdmin ? { ...cors, "x-robots-tag": "noindex, nofollow" } : cors;
      if (code === "too_large") return send(response, 413, { error: "payload_too_large", requestId }, safeRouteHeaders);
      if (code === "invalid_json") return send(response, 400, { error: "invalid_json", requestId }, safeRouteHeaders);
      if (code === "unsupported_media_type") return send(response, 415, { error: "unsupported_media_type", requestId }, safeRouteHeaders);
      if (error instanceof ArticleValidationError) return send(response, 400, { error: "invalid_article", fields: error.fields, requestId }, safeRouteHeaders);
      if (error instanceof ArticleConflictError) return send(response, 409, { error: "slug_conflict", requestId }, safeRouteHeaders);
      if (error instanceof PublishedArticleDeleteError) {
        return send(response, 409, { error: "article_must_be_unpublished", requestId }, safeRouteHeaders);
      }
      if (error instanceof ProviderError) {
        console.error(JSON.stringify({ event: "provider_failed", requestId, provider: error.provider, providerError: error.code }));
        if (error.code === "authentication") return send(response, 503, { error: "chat_unavailable", requestId }, cors);
        if (error.code === "rate_limited") {
          const retry: Record<string, string> = error.retryAfterSeconds ? { "retry-after": String(error.retryAfterSeconds) } : {};
          return send(response, 503, { error: "chat_unavailable", requestId }, { ...cors, ...retry });
        }
        if (error.code === "timeout") return send(response, 504, { error: "upstream_unavailable", requestId }, cors);
        return send(response, 502, { error: "upstream_unavailable", requestId }, cors);
      }
      console.error(JSON.stringify({ event: "request_failed", requestId, route: url.pathname, errorType: error instanceof Error ? error.name : "unknown" }));
      return send(response, 502, { error: "upstream_unavailable", requestId }, safeRouteHeaders);
    }
  });

  server.requestTimeout = Math.max(35_000, config.aiTimeoutMs + 10_000);
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;
  server.maxRequestsPerSocket = 100;
  server.on("close", () => {
    if (database) void database.close().catch(() => undefined);
    if (articleAdmin) void articleAdmin.close().catch(() => undefined);
  });
  return server;
}
