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
