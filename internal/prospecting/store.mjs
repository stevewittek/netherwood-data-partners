import { randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { restoreLead, ValidationError } from "./model.mjs";

export class LeadStore {
  constructor(directory) { this.directory = directory; this.file = join(directory, "leads.json"); this.queue = Promise.resolve(); this.lock = null; this.leads = []; }
  async init() {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    try { this.lock = await open(join(this.directory, "writer.lock"), "wx", 0o600); }
    catch (error) { if (error.code === "EEXIST") throw new Error("Prospecting storage is locked. Stop the other process first; after a crash, inspect and remove writer.lock manually."); throw error; }
    await this.lock.writeFile(String(process.pid));
    try {
      const info = await stat(this.file).catch((error) => { if (error.code === "ENOENT") return null; throw error; });
      if (info) {
        if (info.size > 20 * 1024 * 1024) throw new Error("Prospecting storage exceeds the 20 MB limit.");
        const document = JSON.parse(await readFile(this.file, "utf8"));
        if (document.schema_version !== 1 || !Array.isArray(document.leads) || document.leads.length > 5000 || document.leads.some((lead) => !lead || typeof lead.company_id !== "string" || typeof lead.company_name !== "string" || !Number.isInteger(lead.revision)) || new Set(document.leads.map((lead) => lead.company_id)).size !== document.leads.length) throw new Error("Invalid prospecting storage. Restore a reviewed backup; the file has not been overwritten.");
        this.leads = document.leads.map(restoreLead);
      }
    } catch (error) { await this.close(); throw error; }
    return this;
  }
  list() { return structuredClone(this.leads); }
  async transact(operation) {
    const transaction = this.queue.then(async () => {
      const next = structuredClone(this.leads);
      const result = operation(next);
      if (next.length > 5000) throw new ValidationError("This local store supports at most 5,000 companies.");
      const serialized = JSON.stringify({ schema_version: 1, leads: next }, null, 2);
      if (Buffer.byteLength(serialized) > 20 * 1024 * 1024) throw new ValidationError("This local store supports at most 20 MB. Export and review your retention needs.");
      const temporary = join(this.directory, `leads.${randomUUID()}.tmp`);
      try {
        const handle = await open(temporary, "wx", 0o600);
        try { await handle.writeFile(serialized); await handle.sync(); } finally { await handle.close(); }
        await rename(temporary, this.file);
      } finally { await rm(temporary, { force: true }); }
      this.leads = next;
      return structuredClone(result);
    });
    this.queue = transaction.catch(() => {});
    return transaction;
  }
  async close() {
    await this.queue;
    if (this.lock) { await this.lock.close(); this.lock = null; await rm(join(this.directory, "writer.lock"), { force: true }); }
  }
}
