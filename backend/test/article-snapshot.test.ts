import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  ARTICLE_SNAPSHOT_FORMAT,
  compareArticleSnapshots,
  createArticleSnapshot,
  readArticleSnapshot,
  writeArticleSnapshotAtomic,
} from "../src/article-snapshot.ts";
import { articlePlainTextFromHtml, type Article } from "../src/articles.ts";

function article(overrides: Partial<Article> = {}): Article {
  const html = overrides.html ?? "<h2>Evidence first</h2><p>Inspect waits, plans, blocking, and workload shape.</p>";
  return {
    articleId: "11111111-1111-4111-8111-111111111111",
    title: "SQL Server performance evidence",
    slug: "sql-server-performance-evidence",
    summary: "A public, sanitized article summary.",
    html,
    plainText: overrides.plainText ?? articlePlainTextFromHtml(html),
    category: "SQL Server Performance",
    tags: ["SQL Server", "performance"],
    author: "Steven Wittek",
    status: "Published",
    seoDescription: "How to gather SQL Server performance evidence.",
    isFeatured: false,
    publishedDate: new Date("2026-09-10T12:00:00.000Z"),
    createdDate: new Date("2026-09-10T11:00:00.000Z"),
    modifiedDate: new Date("2026-09-10T12:00:00.000Z"),
    ...overrides,
  };
}

test("versioned article snapshots validate due, sanitized, canonical public content", () => {
  const snapshot = createArticleSnapshot([article()], new Date("2026-09-11T00:00:00.000Z"));
  assert.equal(snapshot.format, ARTICLE_SNAPSHOT_FORMAT);
  assert.equal(snapshot.articleCount, 1);
  assert.match(snapshot.contentDigest, /^[0-9a-f]{64}$/);
  assert.equal(snapshot.articles[0].metaDescription, "How to gather SQL Server performance evidence.");
  assert.throws(() => createArticleSnapshot([
    article({ publishedDate: new Date("2026-09-12T00:00:00.000Z") }),
  ], new Date("2026-09-11T00:00:00.000Z")), /not due/);
  assert.throws(() => createArticleSnapshot([
    article({ html: "<p>Safe</p><script>bad()</script>", plainText: "Safe" }),
  ], new Date("2026-09-11T00:00:00.000Z")), /sanitizer-canonical/);
});

test("snapshot comparison detects additions, edits, removals, and scheduled content becoming due", () => {
  const first = createArticleSnapshot([article()], new Date("2026-09-11T00:00:00.000Z"));
  const scheduled = article({
    articleId: "22222222-2222-4222-8222-222222222222",
    title: "Scheduled article",
    slug: "scheduled-article",
    publishedDate: new Date("2026-09-11T00:05:00.000Z"),
    createdDate: new Date("2026-09-10T20:00:00.000Z"),
    modifiedDate: new Date("2026-09-10T20:00:00.000Z"),
  });
  const second = createArticleSnapshot([
    scheduled,
    article({ title: "Edited SQL Server performance evidence", modifiedDate: new Date("2026-09-11T00:04:00.000Z") }),
  ], new Date("2026-09-11T00:10:00.000Z"));
  const changes = compareArticleSnapshots(first, second);
  assert.equal(changes.changed, true);
  assert.deepEqual(changes.added.map((item) => item.slug), ["scheduled-article"]);
  assert.deepEqual(changes.updated.map((item) => item.slug), ["sql-server-performance-evidence"]);
  assert.deepEqual(changes.scheduledDue.map((item) => item.slug), ["scheduled-article"]);

  const third = createArticleSnapshot([scheduled], new Date("2026-09-11T00:20:00.000Z"));
  assert.deepEqual(compareArticleSnapshots(second, third).removed.map((item) => item.slug), ["sql-server-performance-evidence"]);
});

test("invalid candidate writes cannot replace the last good snapshot", async () => {
  const root = await mkdtemp(join(tmpdir(), "ndp-article-snapshot-"));
  const target = join(root, "articles-snapshot.json");
  const good = createArticleSnapshot([article()], new Date("2026-09-11T00:00:00.000Z"));
  try {
    await writeArticleSnapshotAtomic(target, good);
    const before = await readFile(target, "utf8");
    await assert.rejects(
      writeArticleSnapshotAtomic(target, { ...good, contentDigest: "0".repeat(64) }),
      /contentDigest/,
    );
    assert.equal(await readFile(target, "utf8"), before);
    assert.equal((await readArticleSnapshot(target)).contentDigest, good.contentDigest);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
