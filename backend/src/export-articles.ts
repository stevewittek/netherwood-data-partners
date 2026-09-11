import { resolve } from "node:path";
import { loadConfig } from "./config.ts";
import { exportPublication } from "./publication-export.ts";
import { writeArticleSnapshotAtomic } from "./article-snapshot.ts";

const config = loadConfig();
if (!config.sql) throw new Error("SQL configuration required");
const outputPath = resolve(process.argv[2] ?? "../pages-site/.publication-candidates/articles-snapshot.candidate.json");
try {
  const publication = await exportPublication(config.sql);
  await writeArticleSnapshotAtomic(outputPath, publication);
  console.log(JSON.stringify({ event: "articles_exported", articleCount: publication.articleCount, contentDigest: publication.contentDigest, generatedAt: publication.generatedAt }));
} catch {
  console.error(JSON.stringify({ event: "articles_export_failed", message: "Check SQL health, reviewed export procedure and permissions. Last good artifact retained." }));
  process.exitCode = 1;
}
