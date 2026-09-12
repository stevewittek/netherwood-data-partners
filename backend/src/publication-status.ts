import type { SqlConfig } from "./config.ts";
import { validateArticleSnapshot, type ArticleSnapshot } from "./article-snapshot.ts";
import { exportPublication } from "./publication-export.ts";
import { publicationArticleHash } from "./publication-knowledge.ts";
import type { KnowledgeStore, StoredKnowledgeSource } from "./knowledge.ts";

const websiteOrigin = "https://netherwooddatapartners.com";
const maximumArtifactBytes = 20_000_000;
const maximumSqlCaptureAgeMs = 5 * 60_000;
const maximumSqlFutureSkewMs = 60_000;

export type PublicationStatus = {
  checkedAtUtc: string;
  sqlSaved: {
    state: "available" | "unavailable";
    capturedAtUtc: string | null;
    articleCount: number | null;
    contentDigest: string | null;
  };
  deployedWebsite: {
    state: "current" | "pending" | "available" | "unavailable";
    capturedAtUtc: string | null;
    builtAtUtc: string | null;
    articleCount: number | null;
    contentDigest: string | null;
  };
  aiKnowledge: {
    state: "current" | "waiting_for_website" | "reconciliation_needed" | "unavailable";
    checkedAtUtc: string;
    expectedArticleCount: number | null;
    matchingArticleCount: number | null;
    withheldArticleCount: number | null;
    unexpectedVisibleArticleCount: number | null;
    contentDigest: string | null;
  };
};

export type PublicationStatusReader = (checkedAt?: Date) => Promise<PublicationStatus>;

export type DeployedWebsitePublication = {
  snapshot: ArticleSnapshot;
  capturedAtUtc: string;
  builtAtUtc: string;
  articleCount: number;
  contentDigest: string;
};

export type PublicationStatusSources = {
  readSql: () => Promise<ArticleSnapshot>;
  readWebsite: () => Promise<DeployedWebsitePublication>;
  listKnowledgeSources: () => Promise<StoredKnowledgeSource[]>;
};

type ReleaseManifest = {
  capturedAtUtc: string;
  builtAtUtc: string;
  articleCount: number;
  contentDigest: string;
};

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} is invalid`);
  return value as Record<string, unknown>;
}

function utc(value: unknown, label: string): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw new Error(`${label} is invalid`);
  }
  return value;
}

function releaseManifest(value: unknown): ReleaseManifest {
  const manifest = record(value, "website release");
  if (manifest.format !== "netherwood.website-release/v1") throw new Error("website release format is invalid");
  if (typeof manifest.contentDigest !== "string" || !/^[a-f0-9]{64}$/.test(manifest.contentDigest)) {
    throw new Error("website release digest is invalid");
  }
  if (!Number.isInteger(manifest.articleCount) || Number(manifest.articleCount) < 0 || Number(manifest.articleCount) > 10_000) {
    throw new Error("website release count is invalid");
  }
  return {
    capturedAtUtc: utc(manifest.generatedAt, "website release capture time"),
    builtAtUtc: utc(manifest.builtAt, "website release build time"),
    articleCount: Number(manifest.articleCount),
    contentDigest: manifest.contentDigest,
  };
}

async function publicJson(fetcher: typeof fetch, path: string): Promise<unknown> {
  const response = await fetcher(`${websiteOrigin}/${path}?status=${Date.now()}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok || !response.body) throw new Error("website publication is unavailable");
  let length = 0;
  const parts: Uint8Array[] = [];
  for await (const part of response.body) {
    length += part.length;
    if (length > maximumArtifactBytes) throw new Error("website publication is too large");
    parts.push(part);
  }
  return JSON.parse(Buffer.concat(parts).toString("utf8")) as unknown;
}

function validatedWebsite(value: DeployedWebsitePublication): DeployedWebsitePublication {
  const snapshot = validateArticleSnapshot(value.snapshot);
  const capturedAtUtc = utc(value.capturedAtUtc, "website capture time");
  const builtAtUtc = utc(value.builtAtUtc, "website build time");
  if (capturedAtUtc !== snapshot.generatedAt || value.articleCount !== snapshot.articleCount
    || value.contentDigest !== snapshot.contentDigest) {
    throw new Error("website release and snapshot do not match");
  }
  return { snapshot, capturedAtUtc, builtAtUtc, articleCount: snapshot.articleCount, contentDigest: snapshot.contentDigest };
}

export async function readDeployedWebsitePublication(fetcher: typeof fetch = globalThis.fetch): Promise<DeployedWebsitePublication> {
  const before = releaseManifest(await publicJson(fetcher, "publication.json"));
  const snapshot = validateArticleSnapshot(await publicJson(fetcher, "articles-snapshot.json"));
  const after = releaseManifest(await publicJson(fetcher, "publication.json"));
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error("website publication changed during status check");
  return validatedWebsite({ snapshot, ...after });
}

function unavailableStatus(checkedAtUtc: string): PublicationStatus {
  return {
    checkedAtUtc,
    sqlSaved: { state: "unavailable", capturedAtUtc: null, articleCount: null, contentDigest: null },
    deployedWebsite: {
      state: "unavailable", capturedAtUtc: null, builtAtUtc: null, articleCount: null, contentDigest: null,
    },
    aiKnowledge: {
      state: "unavailable", checkedAtUtc, expectedArticleCount: null, matchingArticleCount: null,
      withheldArticleCount: null, unexpectedVisibleArticleCount: null, contentDigest: null,
    },
  };
}

export async function readPublicationStatus(sources: PublicationStatusSources, checkedAt = new Date()): Promise<PublicationStatus> {
  const checkedAtUtc = checkedAt.toISOString();
  const status = unavailableStatus(checkedAtUtc);
  const [sqlResult, websiteResult] = await Promise.allSettled([
    sources.readSql().then(snapshot => validateArticleSnapshot(snapshot)),
    sources.readWebsite().then(validatedWebsite),
  ]);
  const sqlCandidate = sqlResult.status === "fulfilled" ? sqlResult.value : undefined;
  const sqlCapturedAt = sqlCandidate ? Date.parse(sqlCandidate.generatedAt) : Number.NaN;
  const sql = sqlCandidate
    && sqlCapturedAt <= checkedAt.valueOf() + maximumSqlFutureSkewMs
    && checkedAt.valueOf() - sqlCapturedAt <= maximumSqlCaptureAgeMs
    ? sqlCandidate
    : undefined;
  const website = websiteResult.status === "fulfilled" ? websiteResult.value : undefined;

  if (sql) {
    status.sqlSaved = {
      state: "available", capturedAtUtc: sql.generatedAt, articleCount: sql.articleCount, contentDigest: sql.contentDigest,
    };
  }
  if (website) {
    const matchesSql = sql !== undefined && website.articleCount === sql.articleCount
      && website.contentDigest === sql.contentDigest;
    status.deployedWebsite = {
      state: !sql ? "available" : matchesSql ? "current" : "pending",
      capturedAtUtc: website.capturedAtUtc,
      builtAtUtc: website.builtAtUtc,
      articleCount: website.articleCount,
      contentDigest: website.contentDigest,
    };
  }

  if (!sql || !website) return status;
  let knowledgeSources: StoredKnowledgeSource[];
  try {
    knowledgeSources = await sources.listKnowledgeSources();
  } catch {
    return status;
  }

  const currentHashes = new Map(sql.articles.map(article => [String(article.articleId), publicationArticleHash(article).toString("hex")]));
  const eligible = website.snapshot.articles.filter(article => (
    currentHashes.get(String(article.articleId)) === publicationArticleHash(article).toString("hex")
  ));
  const expected = new Map(eligible.map(article => [
    `sql:article:${String(article.articleId)}`,
    publicationArticleHash(article).toString("hex"),
  ]));
  const matching = new Set<string>();
  let unexpectedVisibleArticleCount = 0;
  for (const source of knowledgeSources) {
    if (!source.chatbotVisible || !source.sourceLocation.startsWith("sql:article:")) continue;
    const expectedHash = expected.get(source.sourceLocation);
    if (expectedHash && expectedHash === source.contentHashHex.toLowerCase() && !matching.has(source.sourceLocation)) {
      matching.add(source.sourceLocation);
    } else {
      unexpectedVisibleArticleCount += 1;
    }
  }
  const exactKnowledge = matching.size === expected.size && unexpectedVisibleArticleCount === 0;
  const websiteCurrent = status.deployedWebsite.state === "current";
  status.aiKnowledge = {
    state: !exactKnowledge ? "reconciliation_needed" : websiteCurrent ? "current" : "waiting_for_website",
    checkedAtUtc,
    expectedArticleCount: expected.size,
    matchingArticleCount: matching.size,
    withheldArticleCount: website.articleCount - eligible.length,
    unexpectedVisibleArticleCount,
    contentDigest: exactKnowledge && websiteCurrent ? website.contentDigest : null,
  };
  return status;
}

export function createPublicationStatusReader(
  config: SqlConfig,
  knowledgeStore: KnowledgeStore,
  fetcher: typeof fetch = globalThis.fetch,
): PublicationStatusReader {
  const sources: PublicationStatusSources = {
    readSql: () => exportPublication(config),
    readWebsite: () => readDeployedWebsitePublication(fetcher),
    listKnowledgeSources: () => knowledgeStore.listKnowledgeSources("database"),
  };
  return (checkedAt = new Date()) => readPublicationStatus(sources, checkedAt);
}
