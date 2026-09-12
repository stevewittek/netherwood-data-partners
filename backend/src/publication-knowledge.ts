import { createHash } from "node:crypto";
import { articlePlainTextFromHtml } from "./articles.ts";
import { validateArticleSnapshot, type ArticleSnapshot } from "./article-snapshot.ts";
import { chunkDocument } from "./documents.ts";
import type { KnowledgeStore } from "./knowledge.ts";
import type { OllamaEmbeddingClient } from "./ollama.ts";

export const publicationArticleHash = (article: unknown): Buffer => createHash("sha256").update(JSON.stringify(article)).digest();

// Only content both deployed and still approved in SQL is eligible for article RAG.
// A SQL edit/unpublish is hidden while its replacement website release is pending.
export async function ingestPublicationKnowledge(deployed: ArticleSnapshot, current: ArticleSnapshot, store: KnowledgeStore, embed: OllamaEmbeddingClient) {
  validateArticleSnapshot(deployed); validateArticleSnapshot(current);
  const currentById = new Map(current.articles.map(article => [article.articleId, publicationArticleHash(article).toString("hex")]));
  const eligible = deployed.articles.filter(article => currentById.get(article.articleId) === publicationArticleHash(article).toString("hex"));
  const desired = new Map(eligible.map(article => [`sql:article:${article.articleId}`, { article, hash: publicationArticleHash(article) }]));
  const existing = await store.listKnowledgeSources("database");
  const byLocation = new Map(existing.map(source => [source.sourceLocation, source]));
  const summary = { scanned: eligible.length, withheld: deployed.articleCount - eligible.length, indexed: 0, unchanged: 0, hidden: 0, failed: 0, deployedDigest: deployed.contentDigest, sqlDigest: current.contentDigest };
  // Hide ALL removed/stale sources before any model work. Failed embeddings cannot
  // leave an obsolete article visible. Other company database sources are untouched.
  for (const source of existing) {
    if (!source.sourceLocation.startsWith("sql:article:") || !source.chatbotVisible) continue;
    const next = desired.get(source.sourceLocation);
    if (!next || next.hash.toString("hex") !== source.contentHashHex) {
      await store.hideKnowledgeSource("database", source.sourceLocation);
      summary.hidden += 1;
    }
  }
  for (const [sourceLocation, { article, hash }] of desired) {
    const prior = byLocation.get(sourceLocation);
    if (prior?.chatbotVisible && prior.contentHashHex === hash.toString("hex")) { summary.unchanged += 1; continue; }
    try {
      const text = `${article.title}\n${article.summary}\n\n${articlePlainTextFromHtml(String(article.html))}`;
      const chunks = chunkDocument(text);
      const vectors: number[][] = [];
      for (let offset = 0; offset < chunks.length; offset += 8) vectors.push(...await embed(chunks.slice(offset, offset + 8).map(chunk => `search_document: ${chunk}`)));
      await store.replaceKnowledgeSource({
        sourceType: "database", displayName: String(article.title), sourceLocation,
        sourceUrl: `/articles/${article.slug}`, lastModifiedUtc: new Date(String(article.modifiedDate)), contentHash: hash,
        chunks: chunks.map((content, index) => ({ chunkNumber: index + 1, content, embedding: vectors[index] })),
      });
      summary.indexed += 1;
    } catch { summary.failed += 1; }
  }
  return summary;
}
