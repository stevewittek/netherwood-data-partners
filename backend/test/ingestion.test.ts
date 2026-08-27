import assert from "node:assert/strict";
import { mkdtemp, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { ingestFileKnowledge, ingestStructuredKnowledge } from "../src/ingestion.ts";
import type { KnowledgeSourceType, KnowledgeStore, ReplaceKnowledgeSourceInput, StoredKnowledgeSource } from "../src/knowledge.ts";

function memoryStore() {
  const indexed = new Map<string, StoredKnowledgeSource>();
  const replacements: ReplaceKnowledgeSourceInput[] = [];
  const hidden: string[] = [];
  const store: KnowledgeStore = {
    async searchKnowledge() { return []; },
    async listKnowledgeSources(sourceType: KnowledgeSourceType) {
      const prefix = sourceType === "document" ? "file:" : "sql:";
      return [...indexed.values()].filter((source) => source.sourceLocation.startsWith(prefix));
    },
    async listStructuredKnowledgeSources() {
      return [{
        sourceLocation: "sql:service-performance",
        displayName: "Performance Review Package",
        sourceUrl: "/services/performance",
        content: "Approved SQL Server performance review material for blocking, waits, plans, and indexes.",
        lastModifiedUtc: new Date("2026-08-23T00:00:00Z"),
      }];
    },
    async replaceKnowledgeSource(input) {
      replacements.push(input);
      indexed.set(input.sourceLocation, { sourceLocation: input.sourceLocation, contentHashHex: input.contentHash.toString("hex"), chatbotVisible: true });
      return true;
    },
    async hideKnowledgeSource(_sourceType, sourceLocation) {
      hidden.push(sourceLocation);
      const source = indexed.get(sourceLocation);
      if (source) source.chatbotVisible = false;
    },
  };
  return { store, indexed, replacements, hidden };
}

const embed = async (input: string[]) => input.map((text) => {
  assert.match(text, /^search_document: /);
  return Array.from({ length: 768 }, () => 0.01);
});

test("ingestion hashes, skips unchanged files, reindexes changes, and hides deletions", async () => {
  const root = await mkdtemp(join(tmpdir(), "ndp-ingest-"));
  const path = join(root, "services.md");
  await writeFile(path, "# Services\n\n" + "SQL Server performance troubleshooting. ".repeat(8));
  const memory = memoryStore();
  try {
    const first = await ingestFileKnowledge(root, memory.store, embed);
    assert.deepEqual(first, { scanned: 1, indexed: 1, unchanged: 0, hidden: 0, failed: 0 });
    const second = await ingestFileKnowledge(root, memory.store, embed);
    assert.equal(second.unchanged, 1);
    await writeFile(path, "# Services\n\n" + "Updated database reliability and performance material. ".repeat(8));
    const modified = await ingestFileKnowledge(root, memory.store, embed);
    assert.equal(modified.indexed, 1);
    await unlink(path);
    const deleted = await ingestFileKnowledge(root, memory.store, embed);
    assert.equal(deleted.hidden, 1);
    assert.deepEqual(memory.hidden, ["file:services.md"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("structured SQL content is embedded only through the controlled source interface", async () => {
  const memory = memoryStore();
  const result = await ingestStructuredKnowledge(memory.store, embed);
  assert.equal(result.indexed, 1);
  assert.equal(memory.replacements[0].sourceType, "database");
  assert.equal(memory.replacements[0].sourceLocation, "sql:service-performance");
});
