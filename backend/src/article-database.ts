import sql from "mssql";
import type { SqlConfig } from "./config.ts";
import { sanitizeArticleHtml, type Article, type ArticleAdminStore, type ArticleInput, type ArticleStatus, type ArticleSummary } from "./articles.ts";

export const ARTICLE_PROCEDURES = {
  listPublished: "web.ListPublishedArticles",
  getPublished: "web.GetPublishedArticle",
  listAdmin: "web.ListAdminArticles",
  getAdmin: "web.GetAdminArticle",
  saveDraft: "web.SaveArticleDraft",
  publish: "web.PublishArticle",
  unpublish: "web.UnpublishArticle",
  archive: "web.ArchiveArticle",
  delete: "web.DeleteArticle",
  listKnowledge: "web.ListPublishedArticleKnowledge",
} as const;

export class ArticleConflictError extends Error {
  constructor() {
    super("article_conflict");
    this.name = "ArticleConflictError";
  }
}

export class PublishedArticleDeleteError extends Error {
  constructor() {
    super("published_article_must_be_unpublished");
    this.name = "PublishedArticleDeleteError";
  }
}

function tags(value: unknown): string[] {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

function date(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}

function optionalDate(value: unknown): Date | undefined {
  return value === null || value === undefined ? undefined : date(value);
}

function status(value: unknown): ArticleStatus {
  if (value === "published" || value === "Published") return "Published";
  if (value === "archived" || value === "Archived") return "Archived";
  return "Draft";
}

export function mapArticleSummary(row: Record<string, unknown>): ArticleSummary {
  return {
    articleId: String(row.ArticleId).toLowerCase(),
    title: String(row.Title),
    slug: String(row.Slug),
    summary: String(row.Summary ?? ""),
    category: String(row.Category),
    tags: tags(row.TagsJson),
    author: String(row.Author),
    status: status(row.Status),
    featuredImage: typeof row.FeaturedImage === "string" ? row.FeaturedImage : undefined,
    seoTitle: typeof row.SeoTitle === "string" ? row.SeoTitle : undefined,
    seoDescription: typeof row.SeoDescription === "string" ? row.SeoDescription : undefined,
    isFeatured: Boolean(row.IsFeatured),
    publishedDate: optionalDate(row.PublishedDate),
    createdDate: date(row.CreatedDate),
    modifiedDate: date(row.ModifiedDate),
    ...(row.HasUnpublishedChanges === undefined ? {} : { hasUnpublishedChanges: Boolean(row.HasUnpublishedChanges) }),
  };
}

export function mapArticle(row: Record<string, unknown>): Article {
  return {
    ...mapArticleSummary(row),
    html: sanitizeArticleHtml(String(row.HtmlContent ?? "")),
    plainText: String(row.PlainText ?? ""),
  };
}

function poolConfig(config: SqlConfig): sql.config {
  return {
    server: config.server,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    pool: { max: 3, min: 0, idleTimeoutMillis: 30_000 },
    connectionTimeout: 5_000,
    requestTimeout: 8_000,
    options: {
      encrypt: config.encrypt,
      trustServerCertificate: config.trustServerCertificate,
      enableArithAbort: true,
    },
  };
}

function handleSqlError(error: unknown): never {
  if (error && typeof error === "object" && "number" in error && error.number === 51010) {
    throw new ArticleConflictError();
  }
  if (error && typeof error === "object" && "number" in error && error.number === 51012) {
    throw new PublishedArticleDeleteError();
  }
  throw error;
}

export function createArticleAdminDatabase(config: SqlConfig): ArticleAdminStore {
  let poolPromise: Promise<sql.ConnectionPool> | undefined;
  async function pool(): Promise<sql.ConnectionPool> {
    if (!poolPromise) {
      const candidate = new sql.ConnectionPool(poolConfig(config));
      candidate.on("error", () => undefined);
      poolPromise = candidate.connect().catch((error) => {
        poolPromise = undefined;
        throw error;
      });
    }
    return poolPromise;
  }

  async function executeArticle(procedure: string, articleId: string, now?: Date): Promise<Article | undefined> {
    const request = (await pool()).request();
    request.input("ArticleId", sql.UniqueIdentifier, articleId);
    if (now) request.input("Now", sql.DateTime2(3), now);
    try {
      const result = await request.execute(procedure);
      const row = result.recordset[0] as Record<string, unknown> | undefined;
      return row ? mapArticle(row) : undefined;
    } catch (error) {
      return handleSqlError(error);
    }
  }

  return {
    async listAdminArticles() {
      const result = await (await pool()).request().execute(ARTICLE_PROCEDURES.listAdmin);
      return result.recordset.map((row: Record<string, unknown>) => mapArticleSummary(row));
    },
    async getAdminArticle(articleId) {
      return executeArticle(ARTICLE_PROCEDURES.getAdmin, articleId);
    },
    async saveArticleDraft(articleId, input: ArticleInput, now) {
      const request = (await pool()).request();
      request.input("ArticleId", sql.UniqueIdentifier, articleId);
      request.input("Title", sql.NVarChar(300), input.title);
      request.input("Slug", sql.NVarChar(200), input.slug);
      request.input("Summary", sql.NVarChar(1000), input.summary);
      request.input("HtmlContent", sql.NVarChar(sql.MAX), input.html);
      request.input("PlainText", sql.NVarChar(sql.MAX), input.plainText);
      request.input("Category", sql.NVarChar(100), input.category);
      request.input("TagsJson", sql.NVarChar(2000), JSON.stringify(input.tags));
      request.input("Author", sql.NVarChar(200), input.author);
      request.input("FeaturedImage", sql.NVarChar(2048), input.featuredImage ?? null);
      request.input("SeoTitle", sql.NVarChar(300), input.seoTitle ?? null);
      request.input("SeoDescription", sql.NVarChar(500), input.seoDescription ?? null);
      request.input("IsFeatured", sql.Bit, input.isFeatured);
      request.input("PublishedAtUtc", sql.DateTime2(3), input.publishedDate ?? null);
      request.input("Now", sql.DateTime2(3), now);
      try {
        const result = await request.execute(ARTICLE_PROCEDURES.saveDraft);
        return mapArticle(result.recordset[0] as Record<string, unknown>);
      } catch (error) {
        return handleSqlError(error);
      }
    },
    async publishArticle(articleId, now) {
      return executeArticle(ARTICLE_PROCEDURES.publish, articleId, now);
    },
    async unpublishArticle(articleId, now) {
      return executeArticle(ARTICLE_PROCEDURES.unpublish, articleId, now);
    },
    async archiveArticle(articleId, now) {
      return executeArticle(ARTICLE_PROCEDURES.archive, articleId, now);
    },
    async deleteArticle(articleId) {
      const request = (await pool()).request();
      request.input("ArticleId", sql.UniqueIdentifier, articleId);
      try {
        const result = await request.execute(ARTICLE_PROCEDURES.delete);
        return Boolean(result.recordset?.[0]?.Deleted);
      } catch (error) {
        return handleSqlError(error);
      }
    },
    async close() {
      if (!poolPromise) return;
      try { await (await poolPromise).close(); } finally { poolPromise = undefined; }
    },
  };
}
