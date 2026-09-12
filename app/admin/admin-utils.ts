export type AdminArticle = {
  articleId: string;
  title: string;
  slug: string;
  summary: string;
  html?: string;
  plainText?: string;
  category: string;
  tags: string[];
  author: string;
  status: "Draft" | "Published" | "Archived";
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured: boolean;
  publishedDate?: string;
  createdDate: string;
  modifiedDate: string;
  hasUnpublishedChanges?: boolean;
};

export type EditorValue = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string;
  author: string;
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
  isFeatured: boolean;
  publishedDate: string;
  html: string;
};

export type NoticeState = {
  type: "info" | "success" | "error" | "warning";
  text: string;
} | null;

export const blankEditor: EditorValue = {
  title: "",
  slug: "",
  summary: "",
  category: "SQL Server",
  tags: "",
  author: "Steven Wittek",
  featuredImage: "",
  seoTitle: "",
  seoDescription: "",
  isFeatured: false,
  publishedDate: "",
  html: "<p></p>",
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

export function toUtcInputString(isoString?: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const pad = (num: number) => String(num).padStart(2, "0");
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
}

export function fromUtcInputString(inputString: string): string | undefined {
  if (!inputString || !inputString.trim()) return undefined;
  const trimmed = inputString.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00.000Z`;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed)) {
    return trimmed.endsWith("Z") ? trimmed : `${trimmed}.000Z`;
  }
  return trimmed;
}

export function editorFromArticle(article: AdminArticle): EditorValue {
  return {
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    category: article.category,
    tags: article.tags.join(", "),
    author: article.author,
    featuredImage: article.featuredImage ?? "",
    seoTitle: article.seoTitle ?? "",
    seoDescription: article.seoDescription ?? "",
    isFeatured: article.isFeatured,
    publishedDate: toUtcInputString(article.publishedDate),
    html: article.html ?? "",
  };
}

export function isoLabel(value?: string): string {
  if (!value) return "—";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "—";
    return (
      new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date) + " UTC"
    );
  } catch {
    return "—";
  }
}

export type DeploymentEvidence = {
  format: string;
  sourceCommit: string;
  contentCommit: string;
  contentDigest: string;
  articleCount: number;
  generatedAt: string;
  builtAt?: string;
  runUrl?: string | null;
  chatEnabled?: boolean;
};

export type PublicArticleVersion = {
  articleId: string;
  title: string;
  slug: string;
  summary: string;
  html: string;
  plainText: string;
  category: string;
  tags: string[];
  author: string;
  status: "Published";
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured: boolean;
  publishedDate: string;
  createdDate: string;
  modifiedDate: string;
  metaTitle: string;
  metaDescription: string;
};

export type WebsitePublicationEvidence =
  | {
      status: "verified";
      manifest: DeploymentEvidence;
      articlesById: ReadonlyMap<string, PublicArticleVersion>;
    }
  | { status: "unavailable"; reason: string };

export type SqlPublicationEvidence =
  | {
      status: "verified";
      articlesById: ReadonlyMap<string, PublicArticleVersion>;
    }
  | { status: "unavailable"; reason: string };

export type PublicationVerification = {
  label: string;
  badgeClass: string;
  details: string;
};

const PUBLIC_ARTICLE_KEYS = new Set([
  "articleId",
  "title",
  "slug",
  "summary",
  "html",
  "plainText",
  "category",
  "tags",
  "author",
  "status",
  "featuredImage",
  "seoTitle",
  "seoDescription",
  "isFeatured",
  "publishedDate",
  "createdDate",
  "modifiedDate",
  "metaTitle",
  "metaDescription",
]);

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value) throw new Error(`${label} must be a non-empty string`);
  return value;
}

function optionalString(value: unknown, label: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !value) throw new Error(`${label} must be a non-empty string when present`);
  return value;
}

function canonicalUtc(value: unknown, label: string): string {
  const text = requiredString(value, label);
  if (Number.isNaN(Date.parse(text)) || new Date(text).toISOString() !== text) {
    throw new Error(`${label} must be a canonical UTC timestamp`);
  }
  return text;
}

function publicArticleVersion(value: unknown, label: string): PublicArticleVersion {
  const article = record(value, label);
  if (Object.keys(article).some((key) => !PUBLIC_ARTICLE_KEYS.has(key))) {
    throw new Error(`${label} contains an unknown or private field`);
  }

  const articleId = requiredString(article.articleId, `${label}.articleId`).toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(articleId)) {
    throw new Error(`${label}.articleId must be a UUID`);
  }
  const slug = requiredString(article.slug, `${label}.slug`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${label}.slug is invalid`);
  if (!Array.isArray(article.tags) || article.tags.some((tag) => typeof tag !== "string" || !tag)) {
    throw new Error(`${label}.tags is invalid`);
  }
  if (article.status !== "Published") throw new Error(`${label}.status must be Published`);
  if (typeof article.isFeatured !== "boolean") throw new Error(`${label}.isFeatured must be boolean`);

  const title = requiredString(article.title, `${label}.title`);
  const summary = requiredString(article.summary, `${label}.summary`);
  const seoTitle = optionalString(article.seoTitle, `${label}.seoTitle`);
  const seoDescription = optionalString(article.seoDescription, `${label}.seoDescription`);
  const metaTitle = requiredString(article.metaTitle, `${label}.metaTitle`);
  const metaDescription = requiredString(article.metaDescription, `${label}.metaDescription`);
  if (metaTitle !== (seoTitle ?? title) || metaDescription !== (seoDescription ?? summary)) {
    throw new Error(`${label} metadata fallbacks are inconsistent`);
  }

  return {
    articleId,
    title,
    slug,
    summary,
    category: requiredString(article.category, `${label}.category`),
    tags: [...article.tags] as string[],
    author: requiredString(article.author, `${label}.author`),
    status: "Published",
    ...(optionalString(article.featuredImage, `${label}.featuredImage`)
      ? { featuredImage: String(article.featuredImage) }
      : {}),
    ...(seoTitle ? { seoTitle } : {}),
    ...(seoDescription ? { seoDescription } : {}),
    isFeatured: article.isFeatured,
    publishedDate: canonicalUtc(article.publishedDate, `${label}.publishedDate`),
    createdDate: canonicalUtc(article.createdDate, `${label}.createdDate`),
    modifiedDate: canonicalUtc(article.modifiedDate, `${label}.modifiedDate`),
    html: requiredString(article.html, `${label}.html`),
    plainText: requiredString(article.plainText, `${label}.plainText`),
    metaTitle,
    metaDescription,
  };
}

function articleMap(values: unknown[], label: string): Map<string, PublicArticleVersion> {
  const articles = values.map((value, index) => publicArticleVersion(value, `${label}[${index}]`));
  const result = new Map<string, PublicArticleVersion>();
  const slugs = new Set<string>();
  for (const article of articles) {
    if (result.has(article.articleId)) throw new Error(`${label} contains a duplicate article ID`);
    if (slugs.has(article.slug)) throw new Error(`${label} contains a duplicate slug`);
    result.set(article.articleId, article);
    slugs.add(article.slug);
  }
  return result;
}

async function sha256(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error("SHA-256 verification is unavailable");
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyWebsitePublicationEvidence(
  manifestValue: unknown,
  snapshotValue: unknown,
): Promise<WebsitePublicationEvidence> {
  try {
    const manifest = record(manifestValue, "manifest");
    const snapshot = record(snapshotValue, "snapshot");
    if (manifest.format !== "netherwood.website-release/v1") throw new Error("manifest format is invalid");
    if (snapshot.format !== "netherwood.public-articles/v1") throw new Error("snapshot format is invalid");
    if (!Array.isArray(snapshot.articles)) throw new Error("snapshot articles are invalid");

    const articlesById = articleMap(snapshot.articles, "snapshot.articles");
    const normalizedArticles = Array.from(articlesById.values());
    const contentDigest = requiredString(snapshot.contentDigest, "snapshot.contentDigest");
    if (!/^[a-f0-9]{64}$/.test(contentDigest)) throw new Error("snapshot digest is invalid");
    if (await sha256(JSON.stringify(normalizedArticles)) !== contentDigest) {
      throw new Error("snapshot digest does not match its article content");
    }
    if (!Number.isInteger(snapshot.articleCount) || snapshot.articleCount !== normalizedArticles.length) {
      throw new Error("snapshot article count is inconsistent");
    }

    const manifestDigest = requiredString(manifest.contentDigest, "manifest.contentDigest");
    if (
      manifestDigest !== contentDigest ||
      manifest.articleCount !== snapshot.articleCount ||
      manifest.generatedAt !== snapshot.generatedAt
    ) {
      throw new Error("manifest and snapshot are inconsistent");
    }

    const deployment: DeploymentEvidence = {
      format: "netherwood.website-release/v1",
      sourceCommit: requiredString(manifest.sourceCommit, "manifest.sourceCommit"),
      contentCommit: requiredString(manifest.contentCommit, "manifest.contentCommit"),
      contentDigest: manifestDigest,
      articleCount: snapshot.articleCount,
      generatedAt: canonicalUtc(manifest.generatedAt, "manifest.generatedAt"),
      ...(manifest.builtAt === undefined ? {} : { builtAt: canonicalUtc(manifest.builtAt, "manifest.builtAt") }),
      ...(manifest.runUrl === undefined || manifest.runUrl === null
        ? { runUrl: manifest.runUrl as null | undefined }
        : { runUrl: requiredString(manifest.runUrl, "manifest.runUrl") }),
      ...(manifest.chatEnabled === undefined
        ? {}
        : typeof manifest.chatEnabled === "boolean"
        ? { chatEnabled: manifest.chatEnabled }
        : (() => {
            throw new Error("manifest.chatEnabled must be boolean");
          })()),
    };
    canonicalUtc(snapshot.generatedAt, "snapshot.generatedAt");
    return { status: "verified", manifest: deployment, articlesById };
  } catch {
    return {
      status: "unavailable",
      reason: "Website deployment evidence is missing or inconsistent; the current version is not verified.",
    };
  }
}

export function verifySqlPublicationEvidence(articleValues: unknown[]): SqlPublicationEvidence {
  try {
    return { status: "verified", articlesById: articleMap(articleValues, "sqlArticles") };
  } catch {
    return {
      status: "unavailable",
      reason: "Current SQL-published content/version evidence is missing or inconsistent.",
    };
  }
}

function samePublicVersion(left: PublicArticleVersion, right: PublicArticleVersion): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function getPublicVerification(
  article: Pick<AdminArticle, "articleId" | "status" | "hasUnpublishedChanges">,
  isScheduled: boolean,
  websiteEvidence: WebsitePublicationEvidence,
  sqlEvidence: SqlPublicationEvidence,
): PublicationVerification {
  const deployedArticle =
    websiteEvidence.status === "verified" ? websiteEvidence.articlesById.get(article.articleId) : undefined;

  if (article.status !== "Published" || isScheduled) {
    const sqlLabel =
      article.status === "Draft" ? "Draft in SQL" : article.status === "Archived" ? "Archived in SQL" : "Scheduled in SQL";
    const baseClass =
      article.status === "Draft" ? "status-draft" : article.status === "Archived" ? "status-archived" : "status-scheduled";

    if (websiteEvidence.status !== "verified") {
      return {
        label: `${sqlLabel} (Website not verified)`,
        badgeClass: "status-unverified",
        details: `${sqlLabel}. ${websiteEvidence.reason}`,
      };
    }
    if (deployedArticle) {
      return {
        label: "Withdrawal pending on website",
        badgeClass: "status-pending-sync",
        details: `${sqlLabel}, but the validated deployed snapshot still contains this article ID. Withdrawal remains pending until a later deployment removes it.`,
      };
    }
    return {
      label: `${sqlLabel}; not on website`,
      badgeClass: baseClass,
      details: `${sqlLabel}. The validated deployed snapshot does not contain this article ID.`,
    };
  }

  if (websiteEvidence.status !== "verified") {
    return {
      label: "Published in SQL (Current version not verified)",
      badgeClass: "status-unverified",
      details: `Published and due in SQL. ${websiteEvidence.reason}`,
    };
  }

  if (sqlEvidence.status !== "verified") {
    return {
      label: "Published in SQL (Current version not verified)",
      badgeClass: "status-unverified",
      details: `Published and due in SQL. ${sqlEvidence.reason}`,
    };
  }

  const sqlPublishedArticle = sqlEvidence.articlesById.get(article.articleId);
  if (!sqlPublishedArticle) {
    return {
      label: "Published in SQL (Current version not verified)",
      badgeClass: "status-unverified",
      details: "The admin record is published and due, but matching current SQL public-version evidence is missing.",
    };
  }

  if (deployedArticle && samePublicVersion(deployedArticle, sqlPublishedArticle)) {
    const stagedDraft = article.hasUnpublishedChanges
      ? " A separate unpublished draft is staged in SQL and is not part of this comparison."
      : "";
    return {
      label: "Current version verified on website",
      badgeClass: "status-live",
      details: `Every public field, including article content, matches the current SQL-published version and validated deployed snapshot (release digest ${websiteEvidence.manifest.contentDigest.slice(0, 8)}…).${stagedDraft}`,
    };
  }

  return {
    label: "Published in SQL; website update pending",
    badgeClass: "status-pending-sync",
    details: deployedArticle
      ? "The deployed snapshot contains this article ID, but its complete public content/version does not match the current SQL-published version. Slug presence and timestamps alone do not verify equality."
      : "The validated deployed snapshot does not contain the current SQL-published article ID.",
  };
}

export function isFutureDate(isoString?: string, currentTimestamp = Date.now()): boolean {
  if (!isoString) return false;
  try {
    return new Date(isoString).getTime() > currentTimestamp;
  } catch {
    return false;
  }
}
