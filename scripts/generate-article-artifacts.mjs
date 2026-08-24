import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "backend/sql/seeds/articles.seed.json");
const migrationPath = resolve(root, "backend/sql/migrations/007_starter_articles.sql");
const snapshotPath = resolve(root, "pages-site/articles-snapshot.json");
const requiredTitles = [
  "Why SQL Server Databases Slow Down Over Time",
  "SQL Server Indexing Mistakes That Hurt Performance",
  "Query Store: Finding the Queries That Are Breaking Your Database",
  "Why NOLOCK Does Not Fix Blocking Problems",
  "When Small Businesses Need a Database Consultant",
  "Moving Legacy Applications to Modern SQL Server Platforms",
  "Database Backups: What Companies Get Wrong",
  "Azure SQL Migration Lessons",
  "Performance Tuning Before Buying More Hardware",
  "Database Health Checks Explained",
];

const articles = JSON.parse(await readFile(sourcePath, "utf8"));
if (!Array.isArray(articles) || articles.length !== requiredTitles.length) {
  throw new Error(`Expected exactly ${requiredTitles.length} starter articles`);
}

const slugs = new Set();
const ids = new Set();
for (const [index, article] of articles.entries()) {
  if (!article || typeof article !== "object") throw new Error(`Article ${index + 1} must be an object`);
  if (article.title !== requiredTitles[index]) throw new Error(`Unexpected title or order at article ${index + 1}`);
  if (typeof article.articleId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(article.articleId)) {
    throw new Error(`Invalid articleId for ${article.title}`);
  }
  if (ids.has(article.articleId)) throw new Error(`Duplicate articleId for ${article.title}`);
  ids.add(article.articleId);
  if (typeof article.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug) || article.slug.length > 200) {
    throw new Error(`Invalid slug for ${article.title}`);
  }
  if (slugs.has(article.slug)) throw new Error(`Duplicate slug for ${article.title}`);
  slugs.add(article.slug);
  for (const [field, maximum] of [["summary", 1_000], ["category", 100], ["author", 200], ["seoDescription", 500], ["contentHTML", 500_000]]) {
    if (typeof article[field] !== "string" || !article[field].trim() || article[field].length > maximum) {
      throw new Error(`Invalid ${field} for ${article.title}`);
    }
  }
  if (!Array.isArray(article.tags) || article.tags.length > 20 || article.tags.some((tag) => typeof tag !== "string" || !tag.trim() || tag.length > 50)) {
    throw new Error(`Invalid tags for ${article.title}`);
  }
  if (typeof article.isFeatured !== "boolean") throw new Error(`Invalid isFeatured for ${article.title}`);
  if (article.featuredImage !== null && article.featuredImage !== undefined && typeof article.featuredImage !== "string") {
    throw new Error(`Invalid featuredImage for ${article.title}`);
  }
  if (Number.isNaN(Date.parse(article.publishedDate))) throw new Error(`Invalid publishedDate for ${article.title}`);
  if (/<\/?(?:script|style|iframe|form|object|embed)\b|\son[a-z]+\s*=|(?:javascript|data):/i.test(article.contentHTML)) {
    throw new Error(`Unsafe starter HTML for ${article.title}`);
  }
}
if (articles.filter((article) => article.isFeatured).length !== 1) {
  throw new Error("Exactly one starter article must be featured");
}

function decodeEntities(value) {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function plainText(html) {
  return decodeEntities(html
    .replace(/<\/(?:p|h2|h3|li|blockquote|pre|tr|aside)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " "))
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sqlString(value) {
  return `N'${String(value).replaceAll("'", "''")}'`;
}

function sqlMax(value) {
  const source = String(value);
  const chunks = [];
  for (let offset = 0; offset < source.length; offset += 3_500) {
    chunks.push(source.slice(offset, offset + 3_500).replaceAll("'", "''"));
  }
  return chunks.map((chunk, index) => `${index === 0 ? "CONVERT(nvarchar(max), " : ""}N'${chunk}'${index === 0 ? ")" : ""}`).join("\n            + ");
}

function sqlDate(value) {
  return `CONVERT(datetime2(3), '${new Date(value).toISOString().replace(/Z$/, "")}', 126)`;
}

const inserts = articles.map((article) => {
  const image = article.featuredImage ? sqlString(article.featuredImage) : "NULL";
  return `    IF NOT EXISTS
    (
        SELECT 1 FROM web.BlogPosts
        WHERE BlogPostId = CONVERT(uniqueidentifier, '${article.articleId}')
           OR (Slug = ${sqlString(article.slug)} AND ContentType = 'article')
    )
    BEGIN
        INSERT web.BlogPosts
        (
            BlogPostId, Slug, Title, Summary, Markdown, SanitizedHtml,
            SeoTitle, SeoDescription, Status, CreatedAtUtc, ModifiedAtUtc,
            PublishedAtUtc, Category, TagsJson, Author, FeaturedImage,
            PlainText, ContentType, IsFeatured
        )
        VALUES
        (
            CONVERT(uniqueidentifier, '${article.articleId}'),
            ${sqlString(article.slug)},
            ${sqlString(article.title)},
            ${sqlString(article.summary)},
            NULL,
            ${sqlMax(article.contentHTML)},
            NULL,
            ${sqlString(article.seoDescription)},
            'published',
            ${sqlDate(article.publishedDate)},
            ${sqlDate(article.publishedDate)},
            ${sqlDate(article.publishedDate)},
            ${sqlString(article.category)},
            ${sqlString(JSON.stringify(article.tags))},
            ${sqlString(article.author)},
            ${image},
            ${sqlMax(plainText(article.contentHTML))},
            'article',
            CONVERT(bit, CASE
                WHEN ${article.isFeatured ? 1 : 0} = 1
                 AND NOT EXISTS
                 (
                     SELECT 1 FROM web.BlogPosts
                     WHERE Status = 'published' AND ContentType = 'article' AND IsFeatured = 1
                 )
                THEN 1 ELSE 0 END)
        );
    END;`;
}).join("\n\n");

const migration = `:on error exit

USE NDP_Web;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '006_articles_content_workflow')
    THROW 51000, 'Migration 006_articles_content_workflow must be applied first.', 1;
GO

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '007_starter_articles')
BEGIN
    BEGIN TRANSACTION;

${inserts}

    INSERT web.SchemaMigrations(MigrationId) VALUES ('007_starter_articles');
    COMMIT TRANSACTION;
END;
GO
`;

const sorted = [...articles].sort((left, right) => Date.parse(right.publishedDate) - Date.parse(left.publishedDate));
const snapshotArticles = sorted.map((article) => ({
  articleId: article.articleId,
  title: article.title,
  slug: article.slug,
  summary: article.summary,
  html: article.contentHTML,
  plainText: plainText(article.contentHTML),
  category: article.category,
  tags: article.tags,
  author: article.author,
  status: "Published",
  ...(article.featuredImage ? { featuredImage: article.featuredImage } : {}),
  seoDescription: article.seoDescription,
  isFeatured: article.isFeatured,
  publishedDate: new Date(article.publishedDate).toISOString(),
  createdDate: new Date(article.publishedDate).toISOString(),
  modifiedDate: new Date(article.publishedDate).toISOString(),
}));
const generatedAt = snapshotArticles[0]?.publishedDate ?? null;

await writeFile(migrationPath, migration);
await writeFile(snapshotPath, `${JSON.stringify({ generatedAt, articles: snapshotArticles }, null, 2)}\n`);
console.log(JSON.stringify({ event: "article_artifacts_generated", articleCount: articles.length, migrationPath, snapshotPath }));
