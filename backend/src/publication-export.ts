import sql from "mssql";
import type { SqlConfig } from "./config.ts";
import { mapArticle } from "./article-database.ts";
import { createArticleSnapshot, type ArticleSnapshot } from "./article-snapshot.ts";

export async function retryExport<T>(operation: () => Promise<T>, wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try { return await operation(); }
    catch {
      if (attempt === 2) throw new Error("Publication export failed after 3 attempts; previous artifact preserved");
      await wait([1000, 4000][attempt]);
    }
  }
}

export async function exportPublication(config: SqlConfig): Promise<ArticleSnapshot> {
  return retryExport(async () => {
    const pool = new sql.ConnectionPool({
      ...config, pool: { min: 0, max: 1 }, connectionTimeout: 5000, requestTimeout: 15000,
      options: { encrypt: config.encrypt, trustServerCertificate: config.trustServerCertificate, enableArithAbort: true },
    });
    pool.on("error", () => undefined);
    try {
      await pool.connect();
      const result = await pool.request().execute("web.ExportPublishedArticles");
      const sets = result.recordsets as unknown as Record<string, unknown>[][];
      const meta = sets[1]?.[0];
      if (sets.length !== 2 || sets[1]?.length !== 1 || !meta || Number(meta.ArticleCount) !== sets[0].length || !(meta.GeneratedAtUtc instanceof Date)) throw new Error("Incomplete export");
      const articles = sets[0].map(row => mapArticle(row)).sort((a, b) =>
        (b.publishedDate?.valueOf() ?? 0) - (a.publishedDate?.valueOf() ?? 0)
        || b.modifiedDate.valueOf() - a.modifiedDate.valueOf() || a.slug.localeCompare(b.slug));
      return createArticleSnapshot(articles, meta.GeneratedAtUtc);
    } finally { await pool.close(); }
  });
}
