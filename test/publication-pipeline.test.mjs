import assert from 'node:assert/strict';
import test from 'node:test';
import { assertCaptureOrder, deployedPublication, releaseNeedsUpdate } from '../scripts/publication-release.mjs';

test('publication retries until both deployed code and content match', () => {
  const candidate = { contentDigest: 'new-content' };
  assert.equal(releaseNeedsUpdate(undefined, candidate, 'new-source'), true);
  assert.equal(releaseNeedsUpdate({ contentDigest: 'old-content', sourceCommit: 'new-source' }, candidate, 'new-source'), true);
  assert.equal(releaseNeedsUpdate({ contentDigest: 'new-content', sourceCommit: 'old-source' }, candidate, 'new-source'), true);
  assert.equal(releaseNeedsUpdate({ contentDigest: 'new-content', sourceCommit: 'new-source' }, candidate, 'new-source'), false);
});
test('late publisher cannot regress a newer captured export', () => {
  const previous = { generatedAt: '2026-09-11T01:00:00.000Z' };
  assert.throws(() => assertCaptureOrder(previous, { generatedAt: '2026-09-11T00:59:59.000Z' }), /Older export/);
  assert.doesNotThrow(() => assertCaptureOrder(previous, previous));
  assert.doesNotThrow(() => assertCaptureOrder(previous, { generatedAt: '2026-09-11T01:00:01.000Z' }));
});

test('deployed release check permits first publication but fails closed on outages or corrupt manifests', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => new Response('', { status: 404 });
  assert.equal(await deployedPublication(), undefined);
  globalThis.fetch = async () => new Response('', { status: 502 });
  await assert.rejects(deployedPublication(), /Cannot check last successful release/);
  globalThis.fetch = async () => new Response('{');
  await assert.rejects(deployedPublication(), SyntaxError);
  globalThis.fetch = async () => Response.json({ format: 'unknown', contentDigest: 'a'.repeat(64) });
  await assert.rejects(deployedPublication(), /Invalid deployed release manifest/);
  globalThis.fetch = async () => { throw new Error('connection failed'); };
  await assert.rejects(deployedPublication(), /connection failed/);
  const manifest = { format: 'netherwood.website-release/v1', contentDigest: 'a'.repeat(64), sourceCommit: 'b'.repeat(40) };
  globalThis.fetch = async () => Response.json(manifest);
  assert.deepEqual(await deployedPublication(), manifest);
});


test('chat rollout and rollback configuration trigger a release with unchanged source and articles', async () => {
  const { chatbotRelease } = await import('../scripts/chatbot-release.mjs');
  const off = chatbotRelease({});
  const on = chatbotRelease({ VITE_PUBLIC_CHAT_ENABLED: 'true', VITE_ASSISTANT_API_URL: 'https://chat.example.com' });
  const current = { contentDigest: 'same', sourceCommit: 'same', ...off };
  assert.equal(releaseNeedsUpdate(current, current, 'same', off), false);
  assert.equal(releaseNeedsUpdate(current, current, 'same', on), true);
  assert.equal(releaseNeedsUpdate({ ...current, ...on }, current, 'same', off), true);
  for (const value of ['', 'http://localhost:8787', 'https://user:secret@example.com', 'https://example.com/?token=x'])
    assert.throws(() => chatbotRelease({ VITE_PUBLIC_CHAT_ENABLED: 'true', VITE_ASSISTANT_API_URL: value }));
});
