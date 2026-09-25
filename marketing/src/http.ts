import { createHash, timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import type { MarketingConfig } from './config.ts';
import type { MarketingStore } from './store.ts';
import { EMAIL_TEMPLATES, type CampaignService } from './campaigns.ts';
import { campaignUrl } from './attribution.ts';

export interface HttpDependencies {
  store: MarketingStore;
  campaigns: CampaignService;
  config: MarketingConfig;
}
class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
const BODY_LIMIT = 2 * 1024 * 1024;
const assetPaths = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
]);
const safeEqual = (a: string, b: string) => timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
function authorized(req: IncomingMessage, token: string | undefined) {
  const authorization = req.headers.authorization ?? '';
  return !!token && authorization.startsWith('Bearer ') && safeEqual(authorization.slice(7), token);
}
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}
function text(value: unknown, name: string, max = 500) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new HttpError(400, name + ' is required and must be no more than ' + max + ' characters.');
  return value.trim();
}
function mapping(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'Choose CSV column mappings.');
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== 'string' || item.length > 250) throw new HttpError(400, 'Invalid CSV mapping.');
    if (item) result[key] = item;
  }
  return result;
}
async function rawBody(req: IncomingMessage): Promise<string> {
  const declared = Number(req.headers['content-length'] ?? 0);
  if (declared > BODY_LIMIT) throw new HttpError(413, 'Request exceeds the 2 MB limit.');
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > BODY_LIMIT) throw new HttpError(413, 'Request exceeds the 2 MB limit.');
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}
async function jsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw new HttpError(415, 'Use application/json.');
  try {
    const data: unknown = JSON.parse(await rawBody(req));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('object required');
    return data as Record<string, unknown>;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'Request body must be a JSON object.');
  }
}
function response(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}
function page(res: ServerResponse, title: string, content: string, status = 200) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml(title) + ' · Netherwood</title><link rel="stylesheet" href="/styles.css"></head><body><main class="public-message"><p class="eyebrow">Netherwood Data Partners</p><h1>' + escapeHtml(title) + '</h1>' + content + '</main></body></html>');
}
function parseFilters(url: URL) {
  return Object.fromEntries(['industry', 'city', 'county', 'state', 'zip'].flatMap(key => url.searchParams.get(key) ? [[key, url.searchParams.get(key)!]] : []));
}
/** One process, a loopback interface, no session cookies or ambient authorization. */
export function createMarketingHandler({ store, campaigns, config }: HttpDependencies) {
  const buckets = new Map<string, { count: number; failures: number; resets: number }>();
  const expectedHost = new URL(config.origin).host.toLowerCase();
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    try {
      if ((req.headers.host ?? '').toLowerCase() !== expectedHost) throw new HttpError(421, 'Unrecognized host.');
      const url = new URL(req.url ?? '/', config.origin);
      if (url.origin !== config.origin) throw new HttpError(400, 'Invalid request target.');
      const key = req.socket.remoteAddress ?? 'unknown';
      const now = Date.now();
      if (buckets.size > 1000) for (const [entry, value] of buckets) if (value.resets < now) buckets.delete(entry);
      let bucket = buckets.get(key);
      if (!bucket || bucket.resets < now) { bucket = { count: 0, failures: 0, resets: now + 60_000 }; buckets.set(key, bucket); }
      if (++bucket.count > 300 || bucket.failures > 30) { res.setHeader('Retry-After', '60'); throw new HttpError(429, 'Too many requests. Try again in one minute.'); }
      const method = req.method ?? 'GET';
      const asset = assetPaths.get(url.pathname);
      if (asset && method === 'GET') {
        const body = await readFile(new URL('../public/' + asset[0], import.meta.url));
        res.writeHead(200, { 'Content-Type': asset[1] }); res.end(body); return;
      }
      if (url.pathname === '/health' && method === 'GET') { response(res, 200, { status: 'ok', mode: 'local' }); return; }
      const unsubscribePath = /^\/unsubscribe\/([A-Za-z0-9_-]{43})$/.exec(url.pathname);
      if ((url.pathname === '/unsubscribe' || unsubscribePath) && (method === 'GET' || method === 'POST')) {
        const token = unsubscribePath?.[1] ?? url.searchParams.get('token') ?? '';
        if (!/^[A-Za-z0-9_-]{32,200}$/.test(token) || !campaigns.inspectUnsubscribe(token)) {
          page(res, 'Link not recognized', '<p>This unsubscribe link is invalid. Please contact the sender using the reply address in your email.</p>', 400); return;
        }
        if (method === 'GET') {
          page(res, 'Unsubscribe from marketing emails', '<p>Confirm below to stop Netherwood Data Partners marketing emails. No login or explanation is needed.</p><form method="post" action="/unsubscribe/' + escapeHtml(token) + '"><button type="submit" name="confirm" value="unsubscribe">Unsubscribe</button></form>'); return;
        }
        if (req.headers['content-type']?.split(';')[0].trim() !== 'application/x-www-form-urlencoded') throw new HttpError(415, 'Use a form submission.');
        const body = new URLSearchParams(await rawBody(req));
        if (body.get('confirm') !== 'unsubscribe' && body.get('List-Unsubscribe') !== 'One-Click') throw new HttpError(400, 'Unsubscribe confirmation is required.');
        campaigns.unsubscribe(token);
        page(res, 'You have been unsubscribed', '<p>You have been unsubscribed from Netherwood Data Partners marketing emails.</p>'); return;
      }
      const clickPath = /^\/r\/([A-Za-z0-9_-]{43})$/.exec(url.pathname);
      if ((url.pathname === '/click' || clickPath) && method === 'GET') {
        const token = clickPath?.[1] ?? url.searchParams.get('token') ?? '';
        if (!/^[A-Za-z0-9_-]{32,200}$/.test(token)) throw new HttpError(400, 'Invalid campaign link.');
        const target = campaigns.resolveClick(token);
        if (!target || new URL(target).origin !== config.websiteOrigin) throw new HttpError(400, 'Invalid campaign link.');
        res.writeHead(303, { Location: target }); res.end(); return;
      }
      if (url.pathname === '/api/attribution/events' && method === 'POST') {
        if (req.headers.origin) throw new HttpError(403, 'Attribution events require a server-to-server request.');
        if (!authorized(req, config.attributionToken)) { bucket.failures++; throw new HttpError(401, 'Attribution authorization required.'); }
        const input = await jsonBody(req);
        response(res, 200, campaigns.recordAttributionEvent(input as unknown as Parameters<CampaignService['recordAttributionEvent']>[0])); return;
      }
      if (!url.pathname.startsWith('/api/')) throw new HttpError(404, 'Not found.');
      if (!authorized(req, config.adminToken)) { bucket.failures++; throw new HttpError(401, 'Unlock the marketing desk to continue.'); }
      if (req.headers.origin && req.headers.origin !== config.origin) throw new HttpError(403, 'This request must come from the marketing desk.');
      if (req.headers['sec-fetch-site'] === 'cross-site') throw new HttpError(403, 'Cross-site requests are not accepted.');
      if (!['GET', 'HEAD'].includes(method) && (req.headers.origin !== config.origin || req.headers['x-marketing-request'] !== '1')) throw new HttpError(403, 'A same-origin marketing request is required.');
      if (method === 'GET' && url.pathname === '/api/session') {
        response(res, 200, { mode: 'local', senderName: config.senderName, senderEmail: config.senderEmail, postalAddress: config.postalAddress, testRecipient: config.testRecipient, websiteOrigin: config.websiteOrigin }); return;
      }
      if (method === 'GET' && url.pathname === '/api/templates') { response(res, 200, EMAIL_TEMPLATES); return; }
      if (method === 'GET' && url.pathname === '/api/lists') { response(res, 200, store.listLists()); return; }
      if (method === 'POST' && url.pathname === '/api/lists') {
        const body = await jsonBody(req); response(res, 201, store.createList(text(body.name, 'List name', 160))); return;
      }
      if (method === 'POST' && url.pathname === '/api/import/preview') {
        const body = await jsonBody(req);
        response(res, 200, store.previewImport(text(body.csv, 'CSV', BODY_LIMIT), mapping(body.mapping), text(body.source, 'Source', 300), typeof body.sourceReference === 'string' ? body.sourceReference : '')); return;
      }
      const listMatch = /^\/api\/lists\/([a-zA-Z0-9-]+)(?:\/(companies|import|archive))?$/.exec(url.pathname);
      if (listMatch) {
        const [, id, action] = listMatch;
        if (method === 'GET' && action === 'companies') { response(res, 200, store.listCompanies(id, parseFilters(url))); return; }
        if (method === 'POST' && action === 'import') {
          const body = await jsonBody(req);
          response(res, 200, store.importCsv(id, text(body.csv, 'CSV', BODY_LIMIT), mapping(body.mapping), text(body.source, 'Source', 300), typeof body.sourceReference === 'string' ? body.sourceReference : '', { skipInvalid: body.skipInvalid === true })); return;
        }
        if (method === 'POST' && action === 'companies') {
          const body = await jsonBody(req);
          if (!body.company || typeof body.company !== 'object' || Array.isArray(body.company)) throw new HttpError(400, 'Company fields are required.');
          response(res, 201, store.addCompany(id, body.company as Record<string, unknown>, text(body.source, 'Source', 300), typeof body.sourceReference === 'string' ? body.sourceReference : '')); return;
        }
        if (method === 'POST' && action === 'archive') { await jsonBody(req); store.archiveList(id); response(res, 200, { archived: true }); return; }
        if (method === 'DELETE' && !action) {
          const body = await jsonBody(req);
          if (body.confirmation !== 'DELETE') throw new HttpError(400, 'Type DELETE to confirm deletion.');
          store.deleteList(id); response(res, 200, { deleted: true, suppressionPreserved: true }); return;
        }
      }
      const memberMatch = /^\/api\/lists\/([a-zA-Z0-9-]+)\/companies\/([a-zA-Z0-9-]+)$/.exec(url.pathname);
      if (method === 'DELETE' && memberMatch) { await jsonBody(req); store.removeMember(memberMatch[1], memberMatch[2]); response(res, 200, { removed: true }); return; }
      if (method === 'GET' && url.pathname === '/api/suppression') { response(res, 200, store.listSuppression()); return; }
      if (method === 'POST' && url.pathname === '/api/suppression') {
        const body = await jsonBody(req);
        const reason = text(body.reason, 'Reason', 40);
        if (!['unsubscribe', 'complaint', 'hard_bounce', 'manual', 'legal_request'].includes(reason)) throw new HttpError(400, 'Choose a valid suppression reason.');
        store.suppress(text(body.email, 'Email', 254), reason, text(body.source, 'Source', 300)); response(res, 201, { suppressed: true }); return;
      }
      if (method === 'POST' && url.pathname === '/api/suppression/reinstate') {
        const body = await jsonBody(req);
        if (body.confirmation !== 'REINSTATE') throw new HttpError(400, 'Type REINSTATE to confirm this individual reinstatement.');
        store.reinstate(text(body.email, 'Email', 254), text(body.evidence, 'Documented permission', 2000)); response(res, 200, { reinstated: true }); return;
      }
      if (method === 'GET' && url.pathname === '/api/campaigns') { response(res, 200, campaigns.list()); return; }
      if (method === 'POST' && url.pathname === '/api/campaigns') { response(res, 201, campaigns.create(await jsonBody(req) as unknown as Parameters<CampaignService['create']>[0])); return; }
      if (method === 'GET' && url.pathname === '/api/attribution/summary') { response(res, 200, campaigns.sourceSummary()); return; }
      if (method === 'GET' && url.pathname === '/api/results') { response(res, 200, campaigns.dashboard()); return; }
      const campaignMatch = /^\/api\/campaigns\/([a-zA-Z0-9-]+)(?:\/(preview|test|ready|approve|send|results.csv|outcomes|traffic))?$/.exec(url.pathname);
      if (campaignMatch) {
        const [, id, action] = campaignMatch;
        if (method === 'GET' && !action) { const campaign = campaigns.get(id); response(res, 200, { ...campaign, tracked_url: campaignUrl(campaign, config.websiteOrigin) }); return; }
        if (method === 'GET' && action === 'results.csv') {
          res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="campaign-results.csv"' });
          res.end(campaigns.exportResults(id)); return;
        }
        if (method === 'POST') {
          const body = await jsonBody(req);
          if (action === 'preview') { response(res, 200, campaigns.preview(id)); return; }
          if (action === 'test') { response(res, 200, await campaigns.testSend(id)); return; }
          if (action === 'ready') { response(res, 200, campaigns.ready(id)); return; }
          if (action === 'approve' || action === 'send') {
            if (!Number.isSafeInteger(body.recipientCount) || Number(body.recipientCount) < 0) throw new HttpError(400, 'Exact recipient count is required.');
            if (action === 'approve') response(res, 200, campaigns.approve(id, body as unknown as Parameters<CampaignService['approve']>[1]));
            else response(res, 200, await campaigns.send(id, body as unknown as Parameters<CampaignService['send']>[1]));
            return;
          }
          if (action === 'outcomes') { response(res, 201, campaigns.recordOutcome(id, body as unknown as Parameters<CampaignService['recordOutcome']>[1])); return; }
          if (action === 'traffic') { response(res, 201, campaigns.recordTraffic(id, body as unknown as Parameters<CampaignService['recordTraffic']>[1])); return; }
        }
      }
      throw new HttpError(404, 'Not found.');
    } catch (error) {
      if (res.headersSent) { res.end(); return; }
      if (error instanceof HttpError) { if (error.status === 413) res.setHeader('Connection', 'close'); response(res, error.status, { error: error.message }); return; }
      // Domain validation messages contain no credentials; do not expose filesystem or SQL failures.
      const message = error instanceof Error ? error.message : '';
      const unsafe = /SQLITE|ENOENT|EACCES|SQL syntax|constraint failed|[A-Z]:\\|node:/i.test(message);
      response(res, 400, { error: unsafe || !message || message.length > 400 ? 'Request could not be completed. Check the submitted values and local configuration.' : message });
    }
  };
}
export function createMarketingServer(dependencies: HttpDependencies) {
  const server = createServer(createMarketingHandler(dependencies));
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;
  return server;
}
