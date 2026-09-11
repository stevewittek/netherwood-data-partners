import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile, access } from 'node:fs/promises';
import { createArticleSnapshot, writeArticleSnapshotAtomic } from '../backend/src/article-snapshot.ts';
const { chromium } = await import(process.env.NDP_PLAYWRIGHT_MODULE || 'playwright');
const path = 'pages-site/articles-snapshot.json';
const saved = await readFile(path);
const original = JSON.parse(saved);
const initialHtml = await readFile('pages-dist/index.html');
const build = () => spawnSync('pnpm', ['build:pages'], {encoding:'utf8',timeout:120000});
let browser;
try {
  await writeFile(path, '{truncated');
  assert.notEqual(build().status, 0, 'Truncated export must reject before Vite clears output');
  assert.deepEqual(await readFile('pages-dist/index.html'), initialHtml);
  await writeArticleSnapshotAtomic(path, createArticleSnapshot([], new Date()));
  const result = build(); assert.equal(result.status,0,result.stderr);
  await assert.rejects(access(`pages-dist/articles/${original.articles[0].slug}/index.html`));
  assert.ok(!(await readFile('pages-dist/sitemap.xml','utf8')).includes(original.articles[0].slug));
  browser = await chromium.launch({channel:'chrome',headless:true});
  const context = await browser.newContext();
  await context.route('**/*',route => route.request().url().startsWith('http://127.0.0.1:4175/') ? route.continue() : route.abort());
  await context.addInitScript(({ article }) => {
    localStorage.setItem('ndp.articles.published.v1',JSON.stringify({savedAt:'2099-01-01T00:00:00Z',articles:[article]}));
    localStorage.setItem(`ndp.article.${article.slug}.v1`,JSON.stringify({savedAt:'2099-01-01T00:00:00Z',articles:[article]}));
  },{article:original.articles[0]});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4175/articles/');
  await page.getByRole('heading',{name:'Field notes are being prepared.'}).waitFor();
  assert.equal(await page.locator('.article-preview').count(),0);
  const response = await page.goto(`http://127.0.0.1:4175/articles/${original.articles[0].slug}/`);
  assert.equal(response.status(),404);
  await page.getByRole('heading',{name:'This field note is not available.'}).waitFor();
  await page.reload(); await page.getByRole('heading',{name:'This field note is not available.'}).waitFor();
  assert.match(await page.locator('meta[name=robots]').getAttribute('content'),/noindex/);
  await writeFile('outputs/publication-qa/removal-results.json', JSON.stringify({passed:true,scenarios:['Truncated input failed before modifying last good local build','Complete empty export removed all native article routes and sitemap entries','Returning browser with legacy cached article observed authoritative empty index and HTTP404 detail across reload'], restoredDigest: original.contentDigest},null,2));
} finally {
  if (browser) await browser.close();
  await writeFile(path,saved);
  const result = build(); assert.equal(result.status,0,`Restoring candidate failed: ${result.stderr}`);
}
console.log('Malformed and authoritative-empty publication browser tests passed; original snapshot restored.');
