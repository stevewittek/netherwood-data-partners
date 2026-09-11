import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { articleJson, sanitizeArticleHtml, type Article } from "./articles.ts";

export const ARTICLE_SNAPSHOT_FORMAT = "netherwood.public-articles/v1";

export type PublicArticleJson = ReturnType<typeof articleJson>;

export type ArticleSnapshot = {
  format: typeof ARTICLE_SNAPSHOT_FORMAT;
  generatedAt: string;
  articleCount: number;
  contentDigest: string;
  articles: PublicArticleJson[];
};

export type ArticleChange = {
  articleId: string;
  slug: string;
  title: string;
};

export type ArticleSnapshotChanges = {
  changed: boolean;
  previousDigest?: string;
  candidateDigest: string;
  added: ArticleChange[];
  updated: ArticleChange[];
  removed: ArticleChange[];
  scheduledDue: ArticleChange[];
};

type SnapshotValidationOptions = { allowLegacy?: boolean };

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, label: string, maximum: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > maximum) {
    throw new Error(`${label} must contain 1 to ${maximum} characters`);
  }
  return value;
}

function optionalString(value: unknown, label: string, maximum: number): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !value.trim() || value.length > maximum) {
    throw new Error(`${label} must contain 1 to ${maximum} characters when present`);
  }
  return value;
}

function isoDate(value: unknown, label: string): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw new Error(`${label} must be a canonical ISO 8601 UTC date`);
  }
  return value;
}

function safePublicUrl(value: unknown, label: string): string | undefined {
  const candidate = optionalString(value, label, 2_048);
  if (!candidate) return undefined;
  if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
  let parsed: URL;
  try { parsed = new URL(candidate); } catch { throw new Error(`${label} must be a relative path or HTTPS URL`); }
  if (parsed.protocol !== "https:") throw new Error(`${label} must be a relative path or HTTPS URL`);
  return candidate;
}

function articleDigest(article: PublicArticleJson): string {
  return createHash("sha256").update(JSON.stringify(article)).digest("hex");
}

export function snapshotContentDigest(articles: PublicArticleJson[]): string {
  return createHash("sha256").update(JSON.stringify(articles)).digest("hex");
}

function validateArticle(value: unknown, index: number, generatedAt: string): PublicArticleJson {
  const article = record(value, `articles[${index}]`);
  const prefix = `articles[${index}]`;
  const articleId = requiredString(article.articleId, `${prefix}.articleId`, 36).toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(articleId)) {
    throw new Error(`${prefix}.articleId must be a UUID`);
  }
  const slug = requiredString(article.slug, `${prefix}.slug`, 200);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${prefix}.slug is invalid`);
  const title = requiredString(article.title, `${prefix}.title`, 300);
  const summary = requiredString(article.summary, `${prefix}.summary`, 1_000);
  const html = requiredString(article.html, `${prefix}.html`, 500_000);
  if (sanitizeArticleHtml(html) !== html) throw new Error(`${prefix}.html is not sanitizer-canonical`);
  const plainText = requiredString(article.plainText, `${prefix}.plainText`, 500_000);
  const category = requiredString(article.category, `${prefix}.category`, 100);
  const author = requiredString(article.author, `${prefix}.author`, 200);
  if (!Array.isArray(article.tags) || article.tags.length > 20
    || article.tags.some((tag) => typeof tag !== "string" || !tag.trim() || tag.length > 50)) {
    throw new Error(`${prefix}.tags is invalid`);
  }
  if (article.status !== "Published") throw new Error(`${prefix}.status must be Published`);
  if (typeof article.isFeatured !== "boolean") throw new Error(`${prefix}.isFeatured must be boolean`);
  const publishedDate = isoDate(article.publishedDate, `${prefix}.publishedDate`);
  const createdDate = isoDate(article.createdDate, `${prefix}.createdDate`);
  const modifiedDate = isoDate(article.modifiedDate, `${prefix}.modifiedDate`);
  if (Date.parse(publishedDate) > Date.parse(generatedAt)) throw new Error(`${prefix} is not due for publication`);
  if (Date.parse(modifiedDate) < Date.parse(createdDate)) throw new Error(`${prefix}.modifiedDate precedes createdDate`);
  const featuredImage = safePublicUrl(article.featuredImage, `${prefix}.featuredImage`);
  const seoTitle = optionalString(article.seoTitle, `${prefix}.seoTitle`, 300);
  const seoDescription = optionalString(article.seoDescription, `${prefix}.seoDescription`, 500);
  const metaTitle = requiredString(article.metaTitle, `${prefix}.metaTitle`, 300);
  const metaDescription = requiredString(article.metaDescription, `${prefix}.metaDescription`, 1_000);
  if (metaTitle !== (seoTitle ?? title)) throw new Error(`${prefix}.metaTitle does not match its public fallback`);
  if (metaDescription !== (seoDescription ?? summary)) throw new Error(`${prefix}.metaDescription does not match its public fallback`);
  if (article.hasUnpublishedChanges !== undefined) throw new Error(`${prefix} exposes a private draft marker`);
  return {
    articleId, title, slug, summary, category, tags: [...article.tags], author, status: "Published",
    ...(featuredImage ? { featuredImage } : {}),
    ...(seoTitle ? { seoTitle } : {}),
    ...(seoDescription ? { seoDescription } : {}),
    isFeatured: article.isFeatured, publishedDate, createdDate, modifiedDate,
    html, plainText, metaTitle, metaDescription,
  };
}

function sorted(articles: PublicArticleJson[]): PublicArticleJson[] {
  return [...articles].sort((left, right) => (
    Date.parse(String(right.publishedDate)) - Date.parse(String(left.publishedDate))
    || Date.parse(String(right.modifiedDate)) - Date.parse(String(left.modifiedDate))
    || String(left.slug).localeCompare(String(right.slug))
  ));
}

export function validateArticleSnapshot(value: unknown, options: SnapshotValidationOptions = {}): ArticleSnapshot {
  const snapshot = record(value, "snapshot");
  const legacy = snapshot.format === undefined && options.allowLegacy === true;
  if (!legacy && snapshot.format !== ARTICLE_SNAPSHOT_FORMAT) {
    throw new Error(`snapshot.format must be ${ARTICLE_SNAPSHOT_FORMAT}`);
  }
  const generatedAt = isoDate(snapshot.generatedAt, "snapshot.generatedAt");
  if (!Array.isArray(snapshot.articles)) throw new Error("snapshot.articles must be an array");
  const articles = snapshot.articles.map((article, index) => {
    const input = record(article, `articles[${index}]`);
    if (legacy) {
      input.metaTitle ??= input.seoTitle ?? input.title;
      input.metaDescription ??= input.seoDescription ?? input.summary;
    }
    return validateArticle(input, index, generatedAt);
  });
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const article of articles) {
    const id = String(article.articleId);
    const slug = String(article.slug);
    if (ids.has(id)) throw new Error(`duplicate articleId: ${id}`);
    if (slugs.has(slug)) throw new Error(`duplicate slug: ${slug}`);
    ids.add(id);
    slugs.add(slug);
  }
  if (JSON.stringify(articles) !== JSON.stringify(sorted(articles))) throw new Error("snapshot.articles is not in public sort order");
  if (articles.filter((article) => article.isFeatured === true).length > 1) throw new Error("snapshot has multiple featured articles");
  const articleCount = legacy ? articles.length : snapshot.articleCount;
  if (!Number.isInteger(articleCount) || articleCount !== articles.length) throw new Error("snapshot.articleCount does not match articles");
  const contentDigest = snapshotContentDigest(articles);
  if (!legacy && snapshot.contentDigest !== contentDigest) throw new Error("snapshot.contentDigest does not match articles");
  return { format: ARTICLE_SNAPSHOT_FORMAT, generatedAt, articleCount, contentDigest, articles };
}

export function createArticleSnapshot(articles: Article[], generatedAt = new Date()): ArticleSnapshot {
  const serialized = articles.map((article) => articleJson(article));
  return validateArticleSnapshot({
    format: ARTICLE_SNAPSHOT_FORMAT,
    generatedAt: generatedAt.toISOString(),
    articleCount: serialized.length,
    contentDigest: snapshotContentDigest(serialized),
    articles: serialized,
  });
}

function change(article: PublicArticleJson): ArticleChange {
  return { articleId: String(article.articleId), slug: String(article.slug), title: String(article.title) };
}

export function compareArticleSnapshots(previous: ArticleSnapshot | undefined, candidate: ArticleSnapshot): ArticleSnapshotChanges {
  const prior = new Map((previous?.articles ?? []).map((article) => [String(article.articleId), article]));
  const next = new Map(candidate.articles.map((article) => [String(article.articleId), article]));
  const added = candidate.articles.filter((article) => !prior.has(String(article.articleId))).map(change);
  const updated = candidate.articles.filter((article) => {
    const before = prior.get(String(article.articleId));
    return before !== undefined && articleDigest(before) !== articleDigest(article);
  }).map(change);
  const removed = (previous?.articles ?? []).filter((article) => !next.has(String(article.articleId))).map(change);
  const previousExport = previous ? Date.parse(previous.generatedAt) : Number.NaN;
  const candidateExport = Date.parse(candidate.generatedAt);
  const scheduledDue = added.filter((item) => {
    const article = next.get(item.articleId);
    const published = Date.parse(String(article?.publishedDate));
    return Number.isFinite(previousExport) && published > previousExport && published <= candidateExport;
  });
  return {
    changed: !previous || previous.contentDigest !== candidate.contentDigest,
    ...(previous ? { previousDigest: previous.contentDigest } : {}),
    candidateDigest: candidate.contentDigest,
    added, updated, removed, scheduledDue,
  };
}

export async function readArticleSnapshot(path: string, options: SnapshotValidationOptions = {}): Promise<ArticleSnapshot> {
  const details = await lstat(path);
  if (details.isSymbolicLink() || !details.isFile()) throw new Error(`snapshot path must be a regular file: ${path}`);
  return validateArticleSnapshot(JSON.parse(await readFile(path, "utf8")) as unknown, options);
}

export async function writeArticleSnapshotAtomic(path: string, snapshot: ArticleSnapshot): Promise<void> {
  const validated = validateArticleSnapshot(snapshot);
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(validated, null, 2)}\n`, { flag: "wx", mode: 0o644 });
  await rename(temporaryPath, path);
}
