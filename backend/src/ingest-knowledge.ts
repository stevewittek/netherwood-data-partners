import { loadConfig } from "./config.ts";
import { createDatabase } from "./database.ts";
import { ingestFileKnowledge, ingestStructuredKnowledge } from "./ingestion.ts";
import { createOllamaEmbeddingClient } from "./ollama.ts";

const config = loadConfig();
if (!config.sql) throw new Error("SQL Server configuration is required for knowledge ingestion");
if (!config.knowledgeRoot) throw new Error("KNOWLEDGE_ROOT is required for knowledge ingestion");
const database = createDatabase(config.sql);
try {
  const embed = createOllamaEmbeddingClient({
    baseUrl: config.ollamaBaseUrl,
    model: config.ollamaEmbeddingModel,
    timeoutMs: config.aiTimeoutMs,
  });
  const files = await ingestFileKnowledge(config.knowledgeRoot, database, embed);
  const databaseSources = await ingestStructuredKnowledge(database, embed);
  console.log(JSON.stringify({ event: "knowledge_ingestion_complete", files, databaseSources }));
  if (files.failed > 0 || databaseSources.failed > 0) process.exitCode = 1;
} finally {
  await database.close();
}
