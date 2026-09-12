import assert from "node:assert/strict";
import test from "node:test";
import type { Article } from "../src/articles.ts";
import { createArticleSnapshot, type ArticleSnapshot } from "../src/article-snapshot.ts";
import { publicationArticleHash } from "../src/publication-knowledge.ts";
import {
  readDeployedWebsitePublication,
  readPublicationStatus,
  type DeployedWebsitePublication,
  type PublicationStatusSources,
} from "../src/publication-status.ts";

const checkedAt = new Date("2026-09-12T12:00:00.000Z");
const firstDate = new Date("2026-09-12T09:00:00.000Z");
const article: Article = {
  articleId: "44444444-4444-4444-8444-444444444444",
  title: "Private status fixture",
  slug: "private-status-fixture",
  summary: "An isolated publication-status fixture.",
  html: "<p>Fixture content.</p>",
  plainText: "Fixture content.",
  category: "Test",
  tags: ["fixture"],
  author: "Netherwood test",
  status: "Published",
  isFeatured: false,
  publishedDate: firstDate,
  createdDate: firstDate,
  modifiedDate: firstDate,
};

function snapshot(value = article, generatedAt = new Date("2026-09-12T11:59:30.000Z")): ArticleSnapshot {
  return createArticleSnapshot([value], generatedAt);
}

function website(value: ArticleSnapshot): DeployedWebsitePublication {
  return {
    snapshot: value,
    capturedAtUtc: value.generatedAt,
    builtAtUtc: "2026-09-12T11:59:45.000Z",
    articleCount: value.articleCount,
    contentDigest: value.contentDigest,
  };
}

function sources(overrides: Partial<PublicationStatusSources> = {}): PublicationStatusSources {
  const current = snapshot();
  return {
    readSql: async () => current,
    readWebsite: async () => website(current),
    listKnowledgeSources: async () => [{
      sourceLocation: `sql:article:${article.articleId}`,
      contentHashHex: publicationArticleHash(current.articles[0]).toString("hex"),
      chatbotVisible: true,
    }],
    ...overrides,
  };
}

test("reports matching SQL, website, and article knowledge as current", async () => {
  const status = await readPublicationStatus(sources(), checkedAt);
  assert.equal(status.checkedAtUtc, checkedAt.toISOString());
  assert.deepEqual(status.sqlSaved, {
    state: "available",
    capturedAtUtc: "2026-09-12T11:59:30.000Z",
    articleCount: 1,
    contentDigest: status.sqlSaved.contentDigest,
  });
  assert.equal(status.deployedWebsite.state, "current");
  assert.equal(status.deployedWebsite.contentDigest, status.sqlSaved.contentDigest);
  assert.deepEqual(status.aiKnowledge, {
    state: "current",
    checkedAtUtc: checkedAt.toISOString(),
    expectedArticleCount: 1,
    matchingArticleCount: 1,
    withheldArticleCount: 0,
    unexpectedVisibleArticleCount: 0,
    contentDigest: status.sqlSaved.contentDigest,
  });
});

test("reports a pending website and safe intersection while SQL has a newer article version", async () => {
  const deployed = snapshot();
  const changedDate = new Date("2026-09-12T12:00:00.000Z");
  const current = snapshot({ ...article, title: "Reviewed newer version", modifiedDate: changedDate }, changedDate);
  const status = await readPublicationStatus(sources({
    readSql: async () => current,
    readWebsite: async () => website(deployed),
    listKnowledgeSources: async () => [{
      sourceLocation: `sql:article:${article.articleId}`,
      contentHashHex: publicationArticleHash(deployed.articles[0]).toString("hex"),
      chatbotVisible: false,
    }],
  }), checkedAt);
  assert.equal(status.deployedWebsite.state, "pending");
  assert.deepEqual(status.aiKnowledge, {
    state: "waiting_for_website",
    checkedAtUtc: checkedAt.toISOString(),
    expectedArticleCount: 0,
    matchingArticleCount: 0,
    withheldArticleCount: 1,
    unexpectedVisibleArticleCount: 0,
    contentDigest: null,
  });
});

test("reports a valid website as available when SQL cannot be checked", async () => {
  const deployed = snapshot();
  let knowledgeRead = false;
  const status = await readPublicationStatus(sources({
    readSql: async () => { throw new Error("password=do-not-return /private/database/path"); },
    readWebsite: async () => website(deployed),
    listKnowledgeSources: async () => { knowledgeRead = true; return []; },
  }), checkedAt);
  assert.equal(status.sqlSaved.state, "unavailable");
  assert.equal(status.deployedWebsite.state, "available");
  assert.equal(status.aiKnowledge.state, "unavailable");
  assert.equal(knowledgeRead, false);
  assert.doesNotMatch(JSON.stringify(status), /password|private\/database|path/i);
});

test("treats stale and excessively future SQL captures as unavailable", async (t) => {
  for (const [name, generatedAt] of [
    ["maintenance clock is stale", "2026-09-12T00:34:00.000Z"],
    ["database clock is too far ahead", "2026-09-12T12:01:00.001Z"],
  ] as const) {
    await t.test(name, async () => {
      let knowledgeRead = false;
      const status = await readPublicationStatus(sources({
        readSql: async () => snapshot(article, new Date(generatedAt)),
        listKnowledgeSources: async () => { knowledgeRead = true; return []; },
      }), checkedAt);
      assert.deepEqual(status.sqlSaved, {
        state: "unavailable", capturedAtUtc: null, articleCount: null, contentDigest: null,
      });
      assert.equal(status.deployedWebsite.state, "available");
      assert.equal(status.aiKnowledge.state, "unavailable");
      assert.equal(knowledgeRead, false);
    });
  }
});

test("reports unexpected or wrong visible article knowledge without exposing source details", async () => {
  const status = await readPublicationStatus(sources({
    listKnowledgeSources: async () => [
      { sourceLocation: `sql:article:${article.articleId}`, contentHashHex: "f".repeat(64), chatbotVisible: true },
      { sourceLocation: "sql:article:55555555-5555-4555-8555-555555555555", contentHashHex: "e".repeat(64), chatbotVisible: true },
      { sourceLocation: "/home/nasa/private-file", contentHashHex: "d".repeat(64), chatbotVisible: true },
    ],
  }), checkedAt);
  assert.equal(status.aiKnowledge.state, "reconciliation_needed");
  assert.equal(status.aiKnowledge.expectedArticleCount, 1);
  assert.equal(status.aiKnowledge.matchingArticleCount, 0);
  assert.equal(status.aiKnowledge.unexpectedVisibleArticleCount, 2);
  const serialized = JSON.stringify(status);
  assert.doesNotMatch(serialized, /sql:article|55555555|home\/nasa|Private status fixture|Fixture content/);
});

test("reports website and knowledge outages without returning dependency errors", async () => {
  let knowledgeRead = false;
  const status = await readPublicationStatus(sources({
    readWebsite: async () => { throw new Error("https://internal.invalid token=do-not-return"); },
    listKnowledgeSources: async () => { knowledgeRead = true; throw new Error("secret source failure"); },
  }), checkedAt);
  assert.equal(status.sqlSaved.state, "available");
  assert.equal(status.deployedWebsite.state, "unavailable");
  assert.equal(status.aiKnowledge.state, "unavailable");
  assert.equal(knowledgeRead, false);
  assert.doesNotMatch(JSON.stringify(status), /internal\.invalid|token|secret source failure/);
});

test("validates the public manifest and snapshot across a double manifest read", async () => {
  const deployed = snapshot();
  const manifest = {
    format: "netherwood.website-release/v1",
    generatedAt: deployed.generatedAt,
    builtAt: "2026-09-12T11:59:45.000Z",
    articleCount: deployed.articleCount,
    contentDigest: deployed.contentDigest,
    sourceCommit: "not-returned",
    contentCommit: "not-returned",
  };
  const queue: unknown[] = [manifest, deployed, manifest];
  const fetcher = async () => new Response(JSON.stringify(queue.shift()), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
  const result = await readDeployedWebsitePublication(fetcher);
  assert.equal(result.contentDigest, deployed.contentDigest);
  assert.equal(result.articleCount, 1);

  const invalid = structuredClone(deployed) as ArticleSnapshot & { privateDraft?: string };
  invalid.privateDraft = "must fail";
  const invalidQueue: unknown[] = [manifest, invalid, manifest];
  const invalidFetcher = async () => new Response(JSON.stringify(invalidQueue.shift()), { status: 200 });
  await assert.rejects(() => readDeployedWebsitePublication(invalidFetcher), /unknown field/);
});
