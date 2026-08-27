import { loadConfig } from "./config.ts";
import { createDatabase } from "./database.ts";
import { createConfiguredProvider } from "./providers.ts";

const config = loadConfig();
if (!config.sql) throw new Error("SQL Server configuration is required");
const database = createDatabase(config.sql);
try {
  const provider = createConfiguredProvider({ ...config, aiProvider: "ollama" }, database);
  if (!provider) throw new Error("Local RAG provider is unavailable");
  const result = await provider("What database performance services do you offer?");
  console.log(JSON.stringify({ question: "What database performance services do you offer?", answer: result.text, sources: result.sources ?? [] }, null, 2));
} finally {
  await database.close();
}
