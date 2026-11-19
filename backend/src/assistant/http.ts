import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { AssistantError } from "./store.ts";
import { AssistantService } from "./service.ts";

async function body(req: IncomingMessage) {
  if (!req.headers["content-type"]?.startsWith("application/json"))
    throw new AssistantError("json_required", 415);
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16_384) throw new AssistantError("body_too_large", 413);
    chunks.push(chunk);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString());
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new AssistantError("invalid_json", 400);
  }
}
export function createAssistantServer(
  service: AssistantService,
  origins: string[],
) {
  const rates = new Map<string, { at: number; count: number }>();
  let active = 0;
  function send(res: ServerResponse, status: number, value: unknown) {
    res.writeHead(status, {
      "content-type": "application/json",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    });
    res.end(JSON.stringify(value));
  }
  const server = createServer(async (req, res) => {
    try {
      const origin = req.headers.origin;
      if (!origin || !origins.includes(origin))
        throw new AssistantError("origin_denied", 403);
      res.setHeader("access-control-allow-origin", origin);
      res.setHeader("vary", "Origin");
      if (req.method === "OPTIONS") {
        res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
        res.setHeader(
          "access-control-allow-headers",
          "Content-Type, Authorization",
        );
        res.writeHead(204);
        res.end();
        return;
      }
      const now = Date.now();
      for (const [key, rate] of rates)
        if (now - rate.at > 60_000) rates.delete(key);
      const address = req.socket.remoteAddress ?? "unknown";
      const rate = rates.get(address) ?? { at: now, count: 0 };
      if (rates.size >= 5000 || ++rate.count > 60)
        throw new AssistantError("rate_limited", 429);
      rates.set(address, rate);
      if (req.url === "/api/assistant/availability" && req.method === "GET") {
        send(res, 200, { enabled: await service.available() });
        return;
      }
      if (req.method !== "POST") throw new AssistantError("not_found", 404);
      const data = await body(req);
      const token = req.headers.authorization?.replace(/^Bearer /, "") ?? "";
      if (req.url === "/api/assistant/session") {
        send(res, 200, await service.start());
        return;
      }
      if (req.url === "/api/assistant/history") {
        send(res, 200, await service.history(token));
        return;
      }
      if (req.url === "/api/assistant/inquiry") {
        send(res, 200, await service.inquiry(token, data));
        return;
      }
      if (req.url !== "/api/assistant/message")
        throw new AssistantError("not_found", 404);
      if (active >= 2) throw new AssistantError("assistant_busy", 429);
      active++;
      try {
        send(
          res,
          200,
          await service.message(
            token,
            String(data.id ?? ""),
            typeof data.message === "string" ? data.message : "",
          ),
        );
      } finally {
        active--;
      }
    } catch (error) {
      const known = error instanceof AssistantError;
      send(res, known ? error.status : 503, {
        error: known ? error.message : "chat_unavailable",
      });
    }
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 10_000;
  return server;
}
