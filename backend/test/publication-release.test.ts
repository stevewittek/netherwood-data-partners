import assert from 'node:assert/strict';
import test from 'node:test';
import { createArticleSnapshot, validateArticleSnapshot, compareArticleSnapshots } from '../src/article-snapshot.ts';
import { retryExport } from '../src/publication-export.ts';
import { ingestPublicationKnowledge } from '../src/publication-knowledge.ts';
import type { Article } from '../src/articles.ts';
import type { KnowledgeStore, StoredKnowledgeSource } from '../src/knowledge.ts';

const article: Article = {
  articleId: '11111111-1111-4111-8111-111111111111', title: 'Evidence first', slug: 'evidence-first',
  summary: 'Inspect the public workload.', html: '<p>Inspect the public workload.</p>', plainText: 'Inspect the public workload.',
  category: 'Performance', tags: ['SQL'], author: 'Steven Wittek', status: 'Published', isFeatured: false,
  publishedDate: new Date('2026-08-01T00:00:00.000Z'), createdDate: new Date('2026-08-01T00:00:00.000Z'), modifiedDate: new Date('2026-08-01T00:00:00.000Z'),
};
const at = new Date('2026-09-11T00:00:00.000Z');
const full = () => createArticleSnapshot([article], at);

test('empty export is an authoritative removal; timestamps alone never determine a change', () => {
  const before = full();
  const after = createArticleSnapshot([], at);
  assert.equal(validateArticleSnapshot(after).articleCount, 0);
  assert.equal(compareArticleSnapshots(before, after).removed.length, 1);
  const edited = createArticleSnapshot([{ ...article, title: 'Edited without a timestamp change' }], at);
  assert.notEqual(before.contentDigest, edited.contentDigest);
  assert.equal(compareArticleSnapshots(before, edited).updated.length, 1);
  assert.equal(createArticleSnapshot([article], new Date(at.valueOf() + 60000)).contentDigest, before.contentDigest);
});

test('corrupt, private, duplicate, unsafe and truncated exports fail closed', () => {
  const snapshot = full();
  for (const broken of [
    { ...snapshot, articles: null }, { ...snapshot, articleCount: 2 }, { ...snapshot, contentDigest: 'bad' },
    { ...snapshot, secret: 'must not pass' },
    { ...snapshot, articles: [{ ...snapshot.articles[0], internalNotes: 'private' }] },
    { ...snapshot, articles: [{ ...snapshot.articles[0], status: 'Draft' }] },
    { ...snapshot, articles: [{ ...snapshot.articles[0], html: '<img src=x onerror=alert(1)>' }] },
    { ...snapshot, articles: [snapshot.articles[0], snapshot.articles[0]], articleCount: 2 },
  ]) assert.throws(() => validateArticleSnapshot(broken));
});

test('transient export failure retries boundedly and exhaustion reports failure', async () => {
  let attempts = 0; const delays: number[] = [];
  const result = await retryExport(async () => { attempts++; if (attempts < 3) throw new Error('transient'); return full(); }, async ms => { delays.push(ms); });
  assert.equal(result.articleCount, 1); assert.deepEqual(delays, [1000, 4000]);
  attempts = 0;
  await assert.rejects(retryExport(async () => { attempts++; throw new Error('outage'); }, async () => {}), /3 attempts/);
  assert.equal(attempts, 3);
});

function fakeStore(existing: StoredKnowledgeSource[]) {
  const hidden: string[] = []; const replaced: string[] = [];
  const store: KnowledgeStore = {
    searchKnowledge: async () => [], listKnowledgeSources: async () => existing,
    listStructuredKnowledgeSources: async () => [],
    hideKnowledgeSource: async (_type, location) => { hidden.push(location); },
    replaceKnowledgeSource: async input => { replaced.push(input.sourceLocation); return true; },
  };
  return { store, hidden, replaced };
}

test('knowledge hides removals and stale versions before a failed embedding; preserves business sources', async () => {
  const fixture = fakeStore([
    { sourceLocation: `sql:article:${article.articleId}`, chatbotVisible: true, contentHashHex: 'old' },
    { sourceLocation: 'sql:article:removed', chatbotVisible: true, contentHashHex: 'old' },
    { sourceLocation: 'sql:services', chatbotVisible: true, contentHashHex: 'company' },
  ]);
  const result = await ingestPublicationKnowledge(full(), full(), fixture.store, async () => {
    assert.deepEqual(fixture.hidden, [`sql:article:${article.articleId}`, 'sql:article:removed']);
    throw new Error('model down');
  });
  assert.equal(result.failed, 1); assert.equal(result.indexed, 0); assert.equal(result.hidden, 2);
  assert.deepEqual(fixture.replaced, []);
});

test('SQL withdrawal excludes still-deployed content; upcoming website-only content is not indexed', async () => {
  const fixture = fakeStore([{ sourceLocation: `sql:article:${article.articleId}`, chatbotVisible: true, contentHashHex: 'old' }]);
  const result = await ingestPublicationKnowledge(full(), createArticleSnapshot([], at), fixture.store, async () => { throw new Error('must not embed'); });
  assert.equal(result.scanned, 0); assert.equal(result.hidden, 1);
  const changed = createArticleSnapshot([{ ...article, title: 'Pending publication' }], at);
  assert.equal((await ingestPublicationKnowledge(full(), changed, fixture.store, async () => [])).scanned, 0);
});
