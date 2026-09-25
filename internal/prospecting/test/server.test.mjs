import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { LeadStore } from "../store.mjs";
import { startProspecting, validateDataDirectory } from "../server.mjs";
import { validateLead } from "../model.mjs";

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), "ndp-prospecting-test-"));
  const app = await startProspecting({ port: 0, dataDirectory: directory });
  t.after(async () => { await app.close(); await rm(directory, { recursive: true, force: true }); });
  const session = await (await fetch(`${app.origin}/api/session`)).json();
  const call = async (path, method = "GET", body, headers = {}) => {
    const response = await fetch(`${app.origin}${path}`, { method, headers: { Origin: app.origin, "Content-Type": "application/json", "X-CSRF-Token": session.csrf, ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json() };
  };
  return { ...app, call, directory };
}
test("binds to loopback, rejects foreign origin, CSRF and DNS rebinding host, and serves no private paths", async (t) => {
  const app = await fixture(t);
  assert.equal(app.server.address().address, "127.0.0.1");
  assert.equal((await app.call("/api/leads", "GET", null, { Origin: "https://example.com" })).status, 403);
  assert.equal((await app.call("/api/leads", "POST", {}, { "X-CSRF-Token": "wrong" })).status, 403);
  assert.equal((await app.call("/api/leads", "POST", {}, { Origin: "null" })).status, 403);
  assert.equal((await app.call("/api/leads", "POST", { company_name: "a".repeat(300000) })).status, 413);
  assert.equal((await app.call("/api/leads", "POST", {}, { "Content-Type": "text/plain" })).status, 415);
  assert.equal((await app.call("/api/leads", "GET", null, { "Sec-Fetch-Site": "cross-site" })).status, 403);
  const reboundStatus = await new Promise((resolveStatus, reject) => {
    const req = request(`${app.origin}/api/leads`, { headers: { Host: "evil.example" } }, (response) => { response.resume(); resolveStatus(response.statusCode); });
    req.on("error", reject); req.end();
  });
  assert.equal(reboundStatus, 403);
  for (const path of ["/leads.json", "/writer.lock", "/server.mjs", "/api/send", "/api/crawl"]) assert.equal((await app.call(path)).status, 404);
  const html = await fetch(app.origin);
  assert.equal(html.status, 200);
  assert.match(html.headers.get("Content-Security-Policy"), /frame-ancestors 'none'/);
  assert.equal(html.headers.get("Cache-Control"), "no-store");
});
test("CRUD, stale revision, evidence, drafts, approval, export and suppression survive persistence", async (t) => {
  const app = await fixture(t);
  const created = await app.call("/api/leads", "POST", { company_name: "Synthetic test fixture", public_email: "research@example.com", lead_status: "Qualified" });
  assert.equal(created.status, 201);
  const id = created.body.lead.company_id;
  const path = `/api/leads/${id}`;
  let lead = (await app.call(path, "PUT", { ...created.body.lead, city: "Test city" })).body.lead;
  assert.equal((await app.call(path, "PUT", created.body.lead)).status, 409);
  lead = (await app.call(`${path}/draft`, "POST", { revision: lead.revision })).body.lead;
  lead = (await app.call(`${path}/approve`, "POST", { revision: lead.revision, reviewer: "Test Reviewer", confirm_reviewed: true })).body.lead;
  assert.equal(lead.lead_status, "Approved for Outreach");
  assert.equal((await app.call(path, "DELETE", { revision: lead.revision })).status, 409);
  lead = (await app.call(path, "PUT", { ...lead, do_not_contact: true })).body.lead;
  assert.equal(lead.lead_status, "Do Not Contact");
  assert.equal((await app.call(`${path}/draft`, "POST", { revision: lead.revision })).status, 409);
  assert.equal((await app.call(path, "DELETE", { revision: lead.revision })).status, 409);
  const exported = await app.call("/api/export");
  assert.equal(exported.body.leads[0].do_not_contact, true);
  assert.match(exported.body.warning, /suppressed/);
  const document = JSON.parse(await readFile(join(app.directory, "leads.json"), "utf8"));
  assert.equal(document.leads[0].outreach, null);
  assert.equal(document.leads[0].do_not_contact, true);
  const uncontacted = (await app.call("/api/leads", "POST", { company_name: "Synthetic disposable fixture" })).body.lead;
  assert.equal((await app.call(`/api/leads/${uncontacted.company_id}`, "DELETE", { revision: uncontacted.revision })).status, 200);
  assert.equal((await app.call("/api/leads")).body.leads.length, 1);
});
test("local store serializes writes, refuses a second writer, reloads, and preserves corrupt files", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "ndp-prospecting-store-"));
  t.after(async () => { await rm(directory, { recursive: true, force: true }); });
  const store = await new LeadStore(directory).init();
  await assert.rejects(new LeadStore(directory).init(), /locked/);
  await Promise.all(Array.from({ length: 8 }, (_, index) => store.transact((leads) => { leads.push(validateLead({ company_name: `Synthetic ${index}` })); })));
  assert.equal(store.list().length, 8);
  await store.close();
  const reloaded = await new LeadStore(directory).init();
  assert.equal(reloaded.list().length, 8);
  await reloaded.close();
  await writeFile(join(directory, "leads.json"), "invalid fixture");
  await assert.rejects(new LeadStore(directory).init());
  assert.equal(await readFile(join(directory, "leads.json"), "utf8"), "invalid fixture");
});
test("private store cannot be configured inside the checkout or public build", async () => {
  for (const directory of [resolve("internal/prospecting/.data"), resolve("public"), resolve("pages-dist"), resolve("..private")]) await assert.rejects(validateDataDirectory(directory), /outside the repository/);
});
test("private store rejects an outside symlink that resolves into the checkout", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "ndp-prospecting-symlink-"));
  t.after(async () => { await rm(directory, { recursive: true, force: true }); });
  const link = join(directory, "private");
  await symlink(resolve("."), link, "junction");
  await assert.rejects(validateDataDirectory(link), /resolves inside the repository/);
});
