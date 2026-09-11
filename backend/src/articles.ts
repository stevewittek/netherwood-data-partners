import { convert } from "html-to-text";
import sanitizeHtmlLibrary from "sanitize-html";

export const ARTICLE_STATUSES = ["Draft", "Published", "Archived"] as const;
export type ArticleStatus = typeof ARTICLE_STATUSES[number];

export type ArticleSummary = {
  articleId: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  author: string;
  status: ArticleStatus;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured: boolean;
  publishedDate?: Date;
  createdDate: Date;
  modifiedDate: Date;
  hasUnpublishedChanges?: boolean;
};

export type Article = ArticleSummary & {
  html: string;
  plainText: string;
};

export type ArticleList = {
  articles: ArticleSummary[];
  page: number;
  pageSize: number;
  total: number;
};

export type ArticleInput = {
  title: string;
  slug: string;
  summary: string;
  html: string;
  plainText: string;
  category: string;
  tags: string[];
  author: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured: boolean;
  publishedDate?: Date;
};

export interface ArticleStore {
  listPublishedArticles(input: { category?: string; tag?: string; search?: string; page: number; pageSize: number }): Promise<ArticleList>;
  getPublishedArticle(slug: string): Promise<Article | undefined>;
}

export interface ArticleAdminStore {
  listAdminArticles(): Promise<ArticleSummary[]>;
  getAdminArticle(articleId: string): Promise<Article | undefined>;
  saveArticleDraft(articleId: string, input: ArticleInput, now: Date): Promise<Article>;
  publishArticle(articleId: string, now: Date): Promise<Article | undefined>;
  unpublishArticle(articleId: string, now: Date): Promise<Article | undefined>;
  archiveArticle(articleId: string, now: Date): Promise<Article | undefined>;
  deleteArticle(articleId: string): Promise<boolean>;
  close(): Promise<void>;
}

export class ArticleValidationError extends Error {
  readonly fields: Record<string, string>;

  constructor(fields: Record<string, string>) {
    super("invalid_article");
    this.name = "ArticleValidationError";
    this.fields = fields;
  }
}

const allowedClasses = {
  aside: ["callout", "callout-note", "callout-warning"],
  code: [/^language-[a-z0-9-]+$/],
};

/**
 * Stored article HTML is an allowlist, not trusted browser markup. Scriptable
 * elements, style, forms, inline handlers and unknown attributes are removed.
 */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtmlLibrary(html, {
    allowedTags: [
      "h2", "h3", "p", "ol", "ul", "li", "blockquote", "a", "img",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
      "code", "pre", "hr", "strong", "em", "b", "i", "figure",
      "figcaption", "aside", "br", "sup", "sub", "abbr",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      th: ["scope", "colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      code: ["class"],
      aside: ["class"],
      abbr: ["title"],
    },
    allowedClasses,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    enforceHtmlBoundary: true,
    transformTags: {
      a: (_tagName, attributes) => {
        const external = attributes.target === "_blank";
        return {
          tagName: "a",
          attribs: external ? { ...attributes, rel: "noopener noreferrer" } : attributes,
        };
      },
      img: (_tagName, attributes) => ({
        tagName: "img",
        attribs: { ...attributes, loading: "lazy" },
      }),
    },
  }).trim();
}

export function articlePlainTextFromHtml(html: string): string {
  return convert(html, {
    wordwrap: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
    ],
  }).replace(/\n{3,}/g, "\n\n").trim();
}

export function normalizeArticleSlug(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function requiredString(value: unknown, field: string, maximum: number, errors: Record<string, string>): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors[field] = "Required";
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.length > maximum) errors[field] = `Must be ${maximum} characters or fewer`;
  return trimmed;
}

function optionalString(value: unknown, field: string, maximum: number, errors: Record<string, string>): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    errors[field] = `Must be ${maximum} characters or fewer`;
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > maximum) errors[field] = `Must be ${maximum} characters or fewer`;
  return trimmed;
}

function optionalUtcDate(value: unknown, errors: Record<string, string>): Date | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const match = typeof value === "string" && value.length <= 35
    ? /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?Z$/.exec(value)
    : null;
  if (!match) {
    errors.publishedDate = "Must be an ISO 8601 UTC date";
    return undefined;
  }
  const parsed = new Date(match[0]);
  const canonical = `${match[1]}T${match[2]}:${match[3] ?? "00"}.${(match[4] ?? "").padEnd(3, "0")}Z`;
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== canonical
    || parsed.getUTCFullYear() < 2000 || parsed.getUTCFullYear() > 2100) {
    errors.publishedDate = "Must be a valid UTC date from 2000 through 2100";
    return undefined;
  }
  return parsed;
}

function optionalSafeUrl(value: unknown, errors: Record<string, string>): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || value.length > 2_048) {
    errors.featuredImage = "Must be a relative path or an HTTPS URL of 2,048 characters or fewer";
    return undefined;
  }
  const candidate = value.trim();
  if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
  try {
    const url = new URL(candidate);
    if (url.protocol === "https:") return url.href;
  } catch { /* handled below */ }
  errors.featuredImage = "Must be a relative path or an HTTPS URL";
  return undefined;
}

export function parseArticleInput(value: Record<string, unknown>): ArticleInput {
  const errors: Record<string, string> = {};
  const title = requiredString(value.title, "title", 300, errors);
  const slugSource = requiredString(value.slug, "slug", 300, errors);
  const slug = normalizeArticleSlug(slugSource);
  if (slugSource && (!slug || slug.length > 200)) errors.slug = "Must produce a slug of 1 to 200 letters, numbers, or hyphens";
  const summary = requiredString(value.summary, "summary", 1_000, errors);
  const category = requiredString(value.category, "category", 100, errors);
  const author = requiredString(value.author, "author", 200, errors);
  const seoTitle = optionalString(value.seoTitle, "seoTitle", 300, errors);
  const seoDescription = optionalString(value.seoDescription, "seoDescription", 500, errors);
  const publishedDate = optionalUtcDate(value.publishedDate, errors);
  const isFeatured = value.isFeatured === undefined ? false : value.isFeatured;
  if (typeof isFeatured !== "boolean") errors.isFeatured = "Must be true or false";
  const sourceHtml = requiredString(value.html, "html", 500_000, errors);
  const html = sourceHtml ? sanitizeArticleHtml(sourceHtml) : "";
  if (sourceHtml && !html) errors.html = "Article content must contain supported formatting";

  const rawTags = value.tags;
  const tags: string[] = [];
  if (!Array.isArray(rawTags) || rawTags.length > 20) {
    errors.tags = "Provide no more than 20 tags";
  } else {
    for (const rawTag of rawTags) {
      if (typeof rawTag !== "string" || rawTag.trim().length === 0 || rawTag.trim().length > 50) {
        errors.tags = "Each tag must contain 1 to 50 characters";
        break;
      }
      const tag = rawTag.trim();
      if (!tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) tags.push(tag);
    }
  }
  const featuredImage = optionalSafeUrl(value.featuredImage, errors);
  const plainText = articlePlainTextFromHtml(html);
  if (sourceHtml && html && !plainText) errors.html = "Article content must contain readable text";
  if (Object.keys(errors).length > 0) throw new ArticleValidationError(errors);

  return {
    title,
    slug,
    summary,
    html,
    plainText,
    category,
    tags,
    author,
    featuredImage,
    seoTitle,
    seoDescription,
    isFeatured: typeof isFeatured === "boolean" ? isFeatured : false,
    publishedDate,
  };
}

export function articleJson(article: ArticleSummary | Article): Record<string, unknown> {
  return {
    articleId: article.articleId,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    category: article.category,
    tags: article.tags,
    author: article.author,
    status: article.status,
    featuredImage: article.featuredImage,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    isFeatured: article.isFeatured,
    publishedDate: article.publishedDate?.toISOString(),
    createdDate: article.createdDate.toISOString(),
    modifiedDate: article.modifiedDate.toISOString(),
    ...(article.hasUnpublishedChanges === undefined ? {} : { hasUnpublishedChanges: article.hasUnpublishedChanges }),
    ...("html" in article ? {
      html: article.html,
      plainText: article.plainText,
      metaTitle: article.seoTitle ?? article.title,
      metaDescription: article.seoDescription ?? article.summary,
    } : {}),
  };
}

export function articleSummaryJson(article: ArticleSummary): Record<string, unknown> {
  const value = articleJson(article);
  delete value.html;
  delete value.plainText;
  return value;
}
