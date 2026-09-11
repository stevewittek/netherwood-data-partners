import { validateArticleSnapshot } from "./article-snapshot.ts";
import { loadConfig } from "./config.ts";
import { createDatabase } from "./database.ts";
import { exportPublication } from "./publication-export.ts";
import { ingestPublicationKnowledge } from "./publication-knowledge.ts";
import { createOllamaEmbeddingClient } from "./ollama.ts";

const origin = "https://netherwooddatapartners.com";
async function publicJson(path: string): Promise<unknown> {
  const response = await fetch(`${origin}/${path}?check=${Date.now()}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!response.ok || !response.body) throw new Error("Deployed publication unavailable");
  let length = 0; const parts: Uint8Array[] = [];
  for await (const part of response.body) {
    length += part.length;
    if (length > 20_000_000) throw new Error("Deployed artifact too large");
    parts.push(part);
  }
  return JSON.parse(Buffer.concat(parts).toString("utf8"));
}
const config = loadConfig();
if (!config.sql) throw new Error("SQL configuration required");
const database = createDatabase(config.sql);
try {
  const manifest = await publicJson("publication.json") as { contentDigest?: string };
  const deployed = validateArticleSnapshot(await publicJson("articles-snapshot.json"));
  const confirm = await publicJson("publication.json") as { contentDigest?: string };
  if (manifest.contentDigest !== deployed.contentDigest || confirm.contentDigest !== deployed.contentDigest) throw new Error("Website publication changed during knowledge refresh; retry next cycle");
  const current = await exportPublication(config.sql);
  const embed = createOllamaEmbeddingClient({ baseUrl: config.ollamaBaseUrl, model: config.ollamaEmbeddingModel, timeoutMs: config.aiTimeoutMs });
  const result = await ingestPublicationKnowledge(deployed, current, database, embed);
  console.log(JSON.stringify({ event: result.failed ? "publication_knowledge_incomplete" : deployed.contentDigest === current.contentDigest ? "publication_knowledge_current" : "publication_knowledge_waiting_for_website", ...result }));
  if (result.failed) process.exitCode = 1;
} catch {
  console.error(JSON.stringify({ event: "publication_knowledge_failed", message: "Public chat must remain disabled. Verify matching website artifacts, SQL export, and local embeddings; retry after repair." }));
  process.exitCode = 1;
} finally { await database.close(); }
