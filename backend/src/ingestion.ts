import { createHash } from "node:crypto";
import { chunkDocument, extractDocument, scanKnowledgeFiles } from "./documents.ts";
import type { KnowledgeSourceType, KnowledgeStore, PublishedArticleKnowledgeSource, StructuredKnowledgeSource } from "./knowledge.ts";
import type { OllamaEmbeddingClient } from "./ollama.ts";

export type IngestionSummary = { scanned: number; indexed: number; unchanged: number; hidden: number; failed: number };

async function embedChunks(chunks: string[], embed: OllamaEmbeddingClient): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (let index = 0; index < chunks.length; index += 8) {
    embeddings.push(...await embed(chunks.slice(index, index + 8).map((chunk) => `search_document: ${chunk}`)));
  }
  return embeddings;
}

async function hideMissing(
  sourceType: KnowledgeSourceType,
  existing: Awaited<ReturnType<KnowledgeStore["listKnowledgeSources"]>>,
  seen: Set<string>,
  store: KnowledgeStore,
  belongsToIngestion: (sourceLocation: string) => boolean = () => true,
): Promise<number> {
  let hidden = 0;
  for (const source of existing) {
    if (!belongsToIngestion(source.sourceLocation) || seen.has(source.sourceLocation) || !source.chatbotVisible) continue;
    await store.hideKnowledgeSource(sourceType, source.sourceLocation);
    hidden += 1;
  }
  return hidden;
}

export async function ingestFileKnowledge(root: string, store: KnowledgeStore, embed: OllamaEmbeddingClient): Promise<IngestionSummary> {
  const existing = await store.listKnowledgeSources("document");
  const byLocation = new Map(existing.map((source) => [source.sourceLocation, source]));
  const files = await scanKnowledgeFiles(root);
  const seen = new Set<string>();
  const summary: IngestionSummary = { scanned: files.length, indexed: 0, unchanged: 0, hidden: 0, failed: 0 };
  for (const file of files) {
    const sourceLocation = `file:${file.relativePath}`;
    seen.add(sourceLocation);
    try {
      const document = await extractDocument(file.absolutePath);
      const current = byLocation.get(sourceLocation);
      if (current?.chatbotVisible && current.contentHashHex === document.contentHash.toString("hex")) {
        summary.unchanged += 1;
        continue;
      }
      const chunks = chunkDocument(document.text);
      const embeddings = await embedChunks(chunks, embed);
      await store.replaceKnowledgeSource({
        sourceType: "document",
        displayName: document.title,
        sourceLocation,
        sourceUrl: document.url,
        lastModifiedUtc: file.modifiedUtc,
        contentHash: document.contentHash,
        chunks: chunks.map((content, index) => ({ chunkNumber: index + 1, content, embedding: embeddings[index] })),
      });
      summary.indexed += 1;
    } catch {
      summary.failed += 1;
    }
  }
  summary.hidden = await hideMissing("document", existing, seen, store);
  return summary;
}

function structuredHash(source: StructuredKnowledgeSource): Buffer {
  return createHash("sha256").update(JSON.stringify({
    title: source.displayName,
    url: source.sourceUrl ?? null,
    content: source.content,
  })).digest();
}

export async function ingestStructuredKnowledge(store: KnowledgeStore, embed: OllamaEmbeddingClient): Promise<IngestionSummary> {
  const approved = await store.listStructuredKnowledgeSources();
  const existing = await store.listKnowledgeSources("database");
  const byLocation = new Map(existing.map((source) => [source.sourceLocation, source]));
  const seen = new Set<string>();
  const summary: IngestionSummary = { scanned: approved.length, indexed: 0, unchanged: 0, hidden: 0, failed: 0 };
  for (const source of approved) {
    seen.add(source.sourceLocation);
    try {
      const hash = structuredHash(source);
      const current = byLocation.get(source.sourceLocation);
      if (current?.chatbotVisible && current.contentHashHex === hash.toString("hex")) {
        summary.unchanged += 1;
        continue;
      }
      const chunks = chunkDocument(source.content);
      const embeddings = await embedChunks(chunks, embed);
      await store.replaceKnowledgeSource({
        sourceType: "database",
        displayName: source.displayName,
        sourceLocation: source.sourceLocation,
        sourceUrl: source.sourceUrl,
        lastModifiedUtc: source.lastModifiedUtc,
        contentHash: hash,
        chunks: chunks.map((content, index) => ({ chunkNumber: index + 1, content, embedding: embeddings[index] })),
      });
      summary.indexed += 1;
    } catch {
      summary.failed += 1;
    }
  }
  summary.hidden = await hideMissing("database", existing, seen, store, (location) => !location.startsWith("sql:article:"));
  return summary;
}

function publishedArticleContent(source: PublishedArticleKnowledgeSource): string {
  return [
    `Title: ${source.title}`,
    `Summary: ${source.summary}`,
    `Category: ${source.category}`,
    `Tags: ${source.tags.join(", ")}`,
    `Author: ${source.author}`,
    `Published: ${source.publishedDate.toISOString()}`,
    "",
    source.plainText,
  ].join("\n");
}

function publishedArticleHash(source: PublishedArticleKnowledgeSource, content: string): Buffer {
  return createHash("sha256").update(JSON.stringify({
    articleId: source.articleId,
    title: source.title,
    slug: source.slug,
    url: source.sourceUrl,
    summary: source.summary,
    content,
    category: source.category,
    tags: source.tags,
    author: source.author,
    seoTitle: source.seoTitle ?? null,
    seoDescription: source.seoDescription ?? null,
    isFeatured: source.isFeatured,
    publishedDate: source.publishedDate.toISOString(),
    modifiedDate: source.modifiedDate.toISOString(),
  })).digest();
}

export async function ingestPublishedArticleKnowledge(store: KnowledgeStore, embed: OllamaEmbeddingClient): Promise<IngestionSummary> {
  const approved = await store.listPublishedArticleKnowledgeSources();
  const existing = await store.listKnowledgeSources("database");
  const byLocation = new Map(existing.map((source) => [source.sourceLocation, source]));
  const seen = new Set<string>();
  const summary: IngestionSummary = { scanned: approved.length, indexed: 0, unchanged: 0, hidden: 0, failed: 0 };
  for (const source of approved) {
    const sourceLocation = `sql:article:${source.articleId}`;
    seen.add(sourceLocation);
    try {
      const content = publishedArticleContent(source);
      const hash = publishedArticleHash(source, content);
      const current = byLocation.get(sourceLocation);
      if (current?.chatbotVisible && current.contentHashHex === hash.toString("hex")) {
        summary.unchanged += 1;
        continue;
      }
      const chunks = chunkDocument(content);
      const embeddings = await embedChunks(chunks, embed);
      await store.replaceKnowledgeSource({
        sourceType: "database",
        displayName: source.title,
        sourceLocation,
        sourceUrl: source.sourceUrl,
        lastModifiedUtc: source.modifiedDate,
        contentHash: hash,
        chunks: chunks.map((chunk, index) => ({ chunkNumber: index + 1, content: chunk, embedding: embeddings[index] })),
      });
      summary.indexed += 1;
    } catch {
      summary.failed += 1;
    }
  }
  summary.hidden = await hideMissing("database", existing, seen, store, (location) => location.startsWith("sql:article:"));
  return summary;
}
