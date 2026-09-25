import { randomBytes, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { readFile, realpath, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { approveOutreach, draftOutreach, INDUSTRIES, saveOutreach, SIGNALS, STATUSES, validateLead, ValidationError } from "./model.mjs";
import { LeadStore } from "./store.mjs";

const directory = dirname(fileURLToPath(import.meta.url));
const checkout = resolve(directory, "../..");
const ASSETS = { "/": ["index.html", "text/html; charset=utf-8"], "/app.js": ["app.js", "text/javascript; charset=utf-8"], "/style.css": ["style.css", "text/css; charset=utf-8"] };
export async function validateDataDirectory(input) {
  const resolved = resolve(input);
  const pathFromRepo = relative(checkout, resolved);
  const isOutside = (path) => path === ".." || path.startsWith(`..${sep}`) || isAbsolute(path);
  if (!isOutside(pathFromRepo)) throw new Error("Private prospect data must live outside the repository and public build.");
  await mkdir(resolved, { recursive: true, mode: 0o700 });
  const actual = await realpath(resolved);
  const actualRelative = relative(await realpath(checkout), actual);
  if (!isOutside(actualRelative)) throw new Error("Private data directory resolves inside the repository.");
  return actual;
}
function secureToken(actual, expected) {
  return typeof actual === "string" && Buffer.byteLength(actual) === Buffer.byteLength(expected) && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}
async function jsonBody(request) {
  if (request.headers["content-type"]?.split(";")[0] !== "application/json") throw new ValidationError("Use application/json.", 415);
  if (Number(request.headers["content-length"] || 0) > 256 * 1024) throw new ValidationError("Request is too large.", 413);
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 256 * 1024) throw new ValidationError("Request is too large.", 413);
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new ValidationError("Invalid JSON."); }
}
function reply(response, status, body, type = "application/json; charset=utf-8") {
  response.writeHead(status, { "Content-Type": type });
  response.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
}
export async function startProspecting({ port = 4319, dataDirectory = join(homedir(), ".local", "share", "netherwood", "prospecting") } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Invalid local port.");
  const store = await new LeadStore(await validateDataDirectory(dataDirectory)).init();
  const csrf = randomBytes(32).toString("hex");
  let origin;
  const server = createServer(async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.setHeader("Content-Security-Policy", "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try {
      if (request.socket.remoteAddress !== "127.0.0.1" || request.headers.host !== origin.slice(7) || (request.headers.origin && request.headers.origin !== origin) || (request.headers["sec-fetch-site"] && !["same-origin", "none"].includes(request.headers["sec-fetch-site"]))) throw new ValidationError("Only same-origin loopback access is allowed.", 403);
      const path = new URL(request.url, origin).pathname;
      const method = request.method;
      if (method === "GET" && Object.hasOwn(ASSETS, path)) {
        const [file, type] = ASSETS[path];
        return reply(response, 200, await readFile(join(directory, "ui", file)), type);
      }
      if (method === "GET" && path === "/api/session") return reply(response, 200, { csrf, statuses: STATUSES, industries: INDUSTRIES, signals: SIGNALS });
      if (method === "GET" && path === "/api/leads") return reply(response, 200, { leads: store.list() });
      if (method === "GET" && path === "/api/export") {
        response.setHeader("Content-Disposition", 'attachment; filename="netherwood-prospects-private.json"');
        return reply(response, 200, { schema_version: 1, exported_at: new Date().toISOString(), private: true, warning: "Research archive; includes suppressed records. Not an approved sending list.", leads: store.list() });
      }
      if (!path.startsWith("/api/") || !["POST", "PUT", "DELETE"].includes(method)) throw new ValidationError("Not found.", 404);
      if (request.headers.origin !== origin || !secureToken(request.headers["x-csrf-token"], csrf)) throw new ValidationError("Refresh the local app before making changes.", 403);
      const input = await jsonBody(request);
      if (method === "POST" && path === "/api/leads") {
        const lead = validateLead(input);
        await store.transact((leads) => { leads.push(lead); return lead; });
        return reply(response, 201, { lead });
      }
      const match = path.match(/^\/api\/leads\/([a-f0-9-]{36})(?:\/(draft|approve))?$/u);
      if (!match) throw new ValidationError("Not found.", 404);
      const [, id, action] = match;
      const result = await store.transact((leads) => {
        const index = leads.findIndex((lead) => lead.company_id === id);
        if (index === -1) throw new ValidationError("Company not found.", 404);
        const previous = leads[index];
        if (input.revision !== previous.revision) throw new ValidationError("This record changed in another tab. Reload it before saving.", 409);
        if (method === "DELETE" && !action) {
          if (previous.do_not_contact || previous.has_contact_history || previous.last_contacted || ["Approved for Outreach", "Contacted", "Responded", "Discovery Scheduled", "Opportunity", "Customer"].includes(previous.lead_status)) throw new ValidationError("Keep suppression and contact history. Mark this record Not a Fit instead.", 409);
          leads.splice(index, 1); return null;
        }
        if (method === "PUT" && !action) leads[index] = validateLead(input, previous);
        else if (method === "POST" && action === "draft") leads[index] = draftOutreach(previous);
        else if (method === "PUT" && action === "draft") leads[index] = saveOutreach(previous, input);
        else if (method === "POST" && action === "approve") leads[index] = approveOutreach(previous, input);
        else throw new ValidationError("Not found.", 404);
        return leads[index];
      });
      return reply(response, 200, { lead: result });
    } catch (error) {
      return reply(response, error instanceof ValidationError ? error.status : 500, { error: error instanceof ValidationError ? error.message : "The local operation failed. Your existing data has been preserved; check the storage and try again." });
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.maxHeadersCount = 40;
  try {
    await new Promise((resolveListening, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", resolveListening); });
  } catch (error) { await store.close(); throw error; }
  origin = `http://127.0.0.1:${server.address().port}`;
  return { origin, store, server, close: async () => { server.closeIdleConnections(); await new Promise((resolveClose) => server.close(resolveClose)); await store.close(); } };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const application = await startProspecting({ port: Number(process.env.PROSPECTING_PORT || 4319), dataDirectory: process.env.PROSPECTING_DATA_DIR });
  console.log(`Private prospecting desk: ${application.origin}\nLoopback only. No email sending or website collection is implemented.`);
  for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, async () => { await application.close(); process.exit(0); });
}
