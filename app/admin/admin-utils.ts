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

export type PublicVerification = {
  verified: boolean;
  publishedCount: number;
  contentDigest?: string;
  generatedAt?: string;
  error?: string;
};

export function getPublicVerification(
  manifest: DeploymentEvidence | null,
  articleSlug: string,
  articleStatus: "Draft" | "Published" | "Archived",
  isScheduled: boolean,
  snapshotSlugs?: Set<string>,
): { label: string; badgeClass: string; details: string } {
  if (articleStatus === "Draft") {
    return {
      label: "Draft in SQL",
      badgeClass: "status-draft",
      details: "Stored in SQL as draft. Not published to website.",
    };
  }

  if (articleStatus === "Archived") {
    return {
      label: "Archived in SQL",
      badgeClass: "status-archived",
      details: "Archived in SQL. Hidden from website and sitemaps.",
    };
  }

  if (isScheduled) {
    return {
      label: "Scheduled in SQL",
      badgeClass: "status-scheduled",
      details: "Scheduled in SQL with a future UTC publication date. Will export automatically once due.",
    };
  }

  // Article status is "Published" and due
  if (!manifest) {
    return {
      label: "Published in SQL (Not verified on website)",
      badgeClass: "status-unverified",
      details: "Published in SQL. Website deployment evidence not yet verified or manifest unavailable.",
    };
  }

  if (snapshotSlugs && snapshotSlugs.has(articleSlug)) {
    return {
      label: "Live on Website",
      badgeClass: "status-live",
      details: `Live on public website (digest ${manifest.contentDigest.slice(0, 8)}…, ${manifest.articleCount} articles).`,
    };
  }

  return {
    label: "Published in SQL; awaiting website update",
    badgeClass: "status-pending-sync",
    details: "Saved as Published in SQL. Awaiting next 15-minute export and deployment cycle to go live on website.",
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
