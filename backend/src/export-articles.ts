import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { compareArticleSnapshots, createArticleSnapshot, readArticleSnapshot, writeArticleSnapshotAtomic } from "./article-snapshot.ts";
import { loadConfig } from "./config.ts";
import { createDatabase } from "./database.ts";

const config = loadConfig();
if (!config.sql) throw new Error("SQL Server configuration is required to export articles");
const outputPath = resolve(process.argv[2] ?? "../pages-site/.publication-candidates/articles-snapshot.candidate.json");
const previousPath = resolve(process.argv[3] ?? "../pages-site/articles-snapshot.json");
const database = createDatabase(config.sql);

try {
  const articles = [];
  let page = 1;
  let expectedTotal: number | undefined;
  while (true) {
    const result = await database.listPublishedArticles({ page, pageSize: 50 });
    expectedTotal ??= result.total;
    if (result.total !== expectedTotal) throw new Error("Published article count changed during export; retry the export");
    for (const summary of result.articles) {
      const article = await database.getPublishedArticle(summary.slug);
      if (!article) throw new Error(`Published article changed during export: ${summary.articleId}`);
      articles.push(article);
    }
    if (page * result.pageSize >= result.total) break;
    page += 1;
  }
  if (articles.length !== expectedTotal) throw new Error("Published article export is incomplete");
  const finalCount = (await database.listPublishedArticles({ page: 1, pageSize: 1 })).total;
  if (finalCount !== expectedTotal) throw new Error("Published article count changed during export; retry the export");
  const snapshot = createArticleSnapshot(articles);
  let previous;
  try {
    await access(previousPath);
    previous = await readArticleSnapshot(previousPath, { allowLegacy: true });
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error;
  }
  const changes = compareArticleSnapshots(previous, snapshot);
  await writeArticleSnapshotAtomic(outputPath, snapshot);
  console.log(JSON.stringify({
    event: "article_export_candidate_written",
    articleCount: snapshot.articleCount,
    generatedAt: snapshot.generatedAt,
    contentDigest: snapshot.contentDigest,
    outputPath,
    changes,
  }));
} finally {
  await database.close();
}
