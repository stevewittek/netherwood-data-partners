import assert from "node:assert/strict";
import { mkdtemp, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { ingestFileKnowledge, ingestPublishedArticleKnowledge, ingestStructuredKnowledge } from "../src/ingestion.ts";
import type { KnowledgeSourceType, KnowledgeStore, PublishedArticleKnowledgeSource, ReplaceKnowledgeSourceInput, StoredKnowledgeSource } from "../src/knowledge.ts";

function memoryStore() {
  const indexed = new Map<string, StoredKnowledgeSource>();
  const replacements: ReplaceKnowledgeSourceInput[] = [];
  const hidden: string[] = [];
  let publishedArticles: PublishedArticleKnowledgeSource[] = [{
    articleId: "11111111-1111-4111-8111-111111111111",
    title: "Why NOLOCK Does Not Fix Blocking Problems",
    slug: "why-nolock-does-not-fix-blocking-problems",
    sourceUrl: "/articles/why-nolock-does-not-fix-blocking-problems",
    summary: "NOLOCK changes isolation semantics rather than fixing the cause of blocking.",
    plainText: "Blocking must be diagnosed from transactions, waits, plans, and access patterns. ".repeat(8),
    category: "SQL Server Performance",
    tags: ["SQL Server", "blocking", "NOLOCK"],
    author: "Steven Wittek",
    seoDescription: "A practical explanation of NOLOCK and blocking.",
    isFeatured: false,
    publishedDate: new Date("2026-08-19T14:00:00Z"),
    modifiedDate: new Date("2026-08-19T14:00:00Z"),
  }];
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
    async listPublishedArticleKnowledgeSources() { return publishedArticles; },
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
  return { store, indexed, replacements, hidden, setPublishedArticles(value: typeof publishedArticles) { publishedArticles = value; } };
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

test("published article ingestion refreshes edits and hides articles removed from the public procedure", async () => {
  const memory = memoryStore();
  const first = await ingestPublishedArticleKnowledge(memory.store, embed);
  assert.deepEqual(first, { scanned: 1, indexed: 1, unchanged: 0, hidden: 0, failed: 0 });
  assert.equal(memory.replacements[0].sourceType, "database");
  assert.equal(memory.replacements[0].sourceLocation, "sql:article:11111111-1111-4111-8111-111111111111");
  assert.equal(memory.replacements[0].sourceUrl, "/articles/why-nolock-does-not-fix-blocking-problems");
  const unchanged = await ingestPublishedArticleKnowledge(memory.store, embed);
  assert.equal(unchanged.unchanged, 1);

  const edited = (await memory.store.listPublishedArticleKnowledgeSources())[0];
  memory.setPublishedArticles([{ ...edited, plainText: `${edited.plainText} Published edit.`, modifiedDate: new Date("2026-09-11T00:00:00Z") }]);
  const refreshed = await ingestPublishedArticleKnowledge(memory.store, embed);
  assert.equal(refreshed.indexed, 1);

  memory.setPublishedArticles([]);
  const removed = await ingestPublishedArticleKnowledge(memory.store, embed);
  assert.equal(removed.hidden, 1);
  assert.deepEqual(memory.hidden, ["sql:article:11111111-1111-4111-8111-111111111111"]);
});

test("structured and article ingestion do not hide each other's SQL knowledge namespace", async () => {
  const memory = memoryStore();
  await ingestStructuredKnowledge(memory.store, embed);
  await ingestPublishedArticleKnowledge(memory.store, embed);
  assert.deepEqual(memory.hidden, []);
});
