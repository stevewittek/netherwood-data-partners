import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const articleSnapshotFormat = "netherwood.public-articles/v1";

export function articleSnapshotDigest(articles) {
  return createHash("sha256").update(JSON.stringify(articles)).digest("hex");
}

function canonicalDate(value, label) {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw new Error(`${label} must be a canonical ISO 8601 UTC date`);
  }
  return value;
}

function required(value, label, maximum) {
  if (typeof value !== "string" || !value.trim() || value.length > maximum) {
    throw new Error(`${label} must contain 1 to ${maximum} characters`);
  }
  return value;
}

function validateArticle(article, index, generatedAt) {
  if (!article || typeof article !== "object" || Array.isArray(article)) throw new Error(`articles[${index}] must be an object`);
  const prefix = `articles[${index}]`;
  const articleId = required(article.articleId, `${prefix}.articleId`, 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(articleId)) throw new Error(`${prefix}.articleId is invalid`);
  const slug = required(article.slug, `${prefix}.slug`, 200);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${prefix}.slug is invalid`);
  required(article.title, `${prefix}.title`, 300);
  required(article.summary, `${prefix}.summary`, 1_000);
  const html = required(article.html, `${prefix}.html`, 500_000);
  required(article.plainText, `${prefix}.plainText`, 500_000);
  required(article.category, `${prefix}.category`, 100);
  required(article.author, `${prefix}.author`, 200);
  if (article.status !== "Published") throw new Error(`${prefix}.status must be Published`);
  if (!Array.isArray(article.tags) || article.tags.length > 20 || article.tags.some((tag) => typeof tag !== "string" || !tag.trim() || tag.length > 50)) {
    throw new Error(`${prefix}.tags is invalid`);
  }
  if (typeof article.isFeatured !== "boolean") throw new Error(`${prefix}.isFeatured must be boolean`);
  const publishedDate = canonicalDate(article.publishedDate, `${prefix}.publishedDate`);
  canonicalDate(article.createdDate, `${prefix}.createdDate`);
  canonicalDate(article.modifiedDate, `${prefix}.modifiedDate`);
  if (Date.parse(publishedDate) > Date.parse(generatedAt)) throw new Error(`${prefix} is not due`);
  if (/<\/?(?:script|style|iframe|form|object|embed)\b|\son[a-z]+\s*=|(?:javascript|data):/i.test(html)) {
    throw new Error(`${prefix}.html contains unsafe public markup`);
  }
  if (article.hasUnpublishedChanges !== undefined) throw new Error(`${prefix} exposes a private draft marker`);
}

export function validateArticleSnapshot(snapshot, { allowLegacy = true } = {}) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) throw new Error("Article snapshot must be an object");
  const legacy = snapshot.format === undefined && allowLegacy;
  if (!legacy && snapshot.format !== articleSnapshotFormat) throw new Error(`Article snapshot format must be ${articleSnapshotFormat}`);
  const generatedAt = canonicalDate(snapshot.generatedAt, "snapshot.generatedAt");
  if (!Array.isArray(snapshot.articles)) throw new Error("snapshot.articles must be an array");
  snapshot.articles.forEach((article, index) => validateArticle(article, index, generatedAt));
  if (!legacy && (!Number.isInteger(snapshot.articleCount) || snapshot.articleCount !== snapshot.articles.length)) {
    throw new Error("snapshot.articleCount does not match articles");
  }
  const ids = new Set(snapshot.articles.map((article) => String(article.articleId).toLowerCase()));
  const slugs = new Set(snapshot.articles.map((article) => article.slug));
  if (ids.size !== snapshot.articles.length) throw new Error("snapshot has duplicate article IDs");
  if (slugs.size !== snapshot.articles.length) throw new Error("snapshot has duplicate article slugs");
  if (snapshot.articles.filter((article) => article.isFeatured).length > 1) throw new Error("snapshot has multiple featured articles");
  const sorted = [...snapshot.articles].sort((left, right) => Date.parse(right.publishedDate) - Date.parse(left.publishedDate)
    || Date.parse(right.modifiedDate) - Date.parse(left.modifiedDate) || left.slug.localeCompare(right.slug));
  if (JSON.stringify(sorted) !== JSON.stringify(snapshot.articles)) throw new Error("snapshot articles are not in public sort order");
  const digest = articleSnapshotDigest(snapshot.articles);
  if (!legacy && snapshot.contentDigest !== digest) throw new Error("snapshot.contentDigest does not match articles");
  return {
    ...snapshot,
    format: articleSnapshotFormat,
    articleCount: snapshot.articles.length,
    contentDigest: digest,
    legacy,
  };
}

export async function readAndValidateArticleSnapshot(path) {
  return validateArticleSnapshot(JSON.parse(await readFile(path, "utf8")));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const path = resolve(process.argv[2] ?? "pages-site/articles-snapshot.json");
  const snapshot = await readAndValidateArticleSnapshot(path);
  console.log(JSON.stringify({ event: "article_snapshot_valid", path, articleCount: snapshot.articleCount, contentDigest: snapshot.contentDigest, legacy: snapshot.legacy }));
}
