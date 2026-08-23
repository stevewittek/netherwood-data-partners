import { createServer, type ServerResponse } from "node:http";
const headers = { "cache-control": "no-store", "content-type": "application/json; charset=utf-8", "x-content-type-options": "nosniff" } as const;
function json(response: ServerResponse, status: number, body: unknown): void { response.writeHead(status, headers); response.end(JSON.stringify(body)); }
export function createApp() { return createServer((request, response) => { const url = new URL(request.url ?? "/", "http://localhost"); if (request.method === "GET" && url.pathname === "/health") { json(response, 200, { status: "ok" }); return; } json(response, 404, { error: "not_found" }); }); }
