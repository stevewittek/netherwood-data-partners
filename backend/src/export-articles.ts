import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { loadConfig } from "./config.ts";
import { articleJson } from "./articles.ts";
import { createDatabase } from "./database.ts";

const config = loadConfig();
if (!config.sql) throw new Error("SQL Server configuration is required to export articles");
const outputPath = resolve(process.argv[2] ?? "../pages-site/articles-snapshot.json");
const temporaryPath = `${outputPath}.tmp`;
const database = createDatabase(config.sql);

try {
  const articles = [];
  let page = 1;
  while (true) {
    const result = await database.listPublishedArticles({ page, pageSize: 50 });
    for (const summary of result.articles) {
      const article = await database.getPublishedArticle(summary.slug);
      if (article) articles.push(articleJson(article));
    }
    if (page * result.pageSize >= result.total) break;
    page += 1;
  }
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), articles }, null, 2)}\n`, { mode: 0o644 });
  await rename(temporaryPath, outputPath);
  console.log(JSON.stringify({ event: "articles_exported", articleCount: articles.length, outputPath }));
} finally {
  await database.close();
}
