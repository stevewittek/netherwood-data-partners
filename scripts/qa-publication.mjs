import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const { chromium } = await import(process.env.NDP_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NDP_QA_URL || 'http://127.0.0.1:4175';
const output = resolve(process.env.NDP_QA_OUTPUT || 'outputs/publication-qa');
await mkdir(output, { recursive: true });
const snapshot = JSON.parse(await readFile('pages-site/articles-snapshot.json', 'utf8'));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = { contentDigest: snapshot.contentDigest, routes: [], browserErrors: [], externalRequests: [], keyboard: [], scenarios: [] };
const paths = ['/', '/about', '/articles', ...snapshot.articles.map(a => `/articles/${a.slug}`)];
async function context(options = {}) {
  const value = await browser.newContext(options);
  await value.route('**/*', route => {
    if (route.request().url().startsWith(`${base}/`)) return route.continue();
    results.externalRequests.push(route.request().url());
    return route.abort();
  });
  return value;
}
try {
  for (const width of [1440, 768, 390]) {
    const ctx = await context({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', error => results.browserErrors.push(error.message));
    for (const path of paths) {
      await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
      await page.locator('h1').waitFor(); await page.evaluate(() => document.fonts.ready);
      const metrics = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        h1: [...document.querySelectorAll('h1')].map(e => e.textContent),
        images: [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src),
        font: getComputedStyle(document.body).fontFamily,
        canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href'),
        robots: document.querySelector('meta[name=robots]')?.getAttribute('content'),
        chat: document.querySelectorAll('.chat-widget').length,
        activeAnimations: document.getAnimations().filter(animation => animation.playState === 'running').length,
        lists: [...document.querySelectorAll('.article-content ul, .article-content ol')].map(e => ({tag:e.tagName,style:getComputedStyle(e).listStyleType})),
        articleTables: [...document.querySelectorAll('.article-content table, .article-content pre')].map(e => ({tag:e.tagName, width:e.getBoundingClientRect().width, scrollWidth:e.scrollWidth})),
        links: [...document.querySelectorAll('a[href]')].map(e => e.getAttribute('href')),
      }));
      assert.equal(metrics.h1.length, 1, `${width} ${path}: h1`);
      assert.ok(metrics.scrollWidth <= width, `${width} ${path}: overflow`);
      assert.deepEqual(metrics.images, [], `${width} ${path}: images`);
      assert.equal(metrics.chat, 0);
      assert.equal(metrics.activeAnimations, 0, "Reduced motion leaves no running animation");
      for (const list of metrics.lists) assert.equal(list.style, list.tag === "OL" ? "decimal" : "disc");
      assert.equal(metrics.canonical, `https://netherwooddatapartners.com${path}`);
      for (const href of metrics.links) {
        if (href.startsWith('/articles/')) assert.ok(paths.includes(href), `Related link outside export: ${href}`);
        if (href.startsWith('/#') && path === '/') assert.ok(await page.locator(`[id="${href.slice(2)}"]`).count(), `Missing anchor ${href}`);
      }
      const name = `${width}-${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}`;
      await page.screenshot({ path: resolve(output, `${name}.png`), fullPage: true });
      results.routes.push({ width, path, ...metrics, screenshot: `${name}.png` });
    }
    await page.goto(`${base}/#contact`, { waitUntil: 'domcontentloaded' });
    await page.locator('#contact-name').waitFor();
    await page.waitForFunction(() => document.getElementById('contact').getBoundingClientRect().top < innerHeight);
    await page.screenshot({ path: resolve(output, `${width}-contact.png`), fullPage: false });
    await page.locator('.contact-form-actions').scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(output, `${width}-contact-submit.png`), fullPage: false });
    await ctx.close();
  }
  const ctx = await context({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/articles`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('searchbox').fill('no matching fixture zzzz');
  await page.getByText('Try a broader search.').waitFor();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  assert.match(await page.locator('.articles-results-summary').innerText(), /10 articles/);
  const category = String(snapshot.articles[0].category);
  await page.locator('#article-category').selectOption(category);
  assert.equal(await page.locator('.article-preview').count(), snapshot.articles.filter(a => a.category === category).length);
  results.scenarios.push('Search, empty-result clear and category filtering passed');
  await page.goto(`${base}/about/`, {waitUntil:'domcontentloaded'});
  const contactLink = page.locator('nav a[href="/#contact"]');
  await contactLink.focus(); await page.keyboard.press('Enter');
  await page.waitForURL('**/#contact');
  await page.waitForFunction(() => document.getElementById('contact')?.getBoundingClientRect().top < innerHeight);
  results.scenarios.push('Keyboard activation of cross-page contact CTA reaches the form');
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 45; i++) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const e = document.activeElement; const style = getComputedStyle(e); const rect = e.getBoundingClientRect();
      return { tag: e.tagName, text: (e.textContent || '').trim().slice(0, 80), id: e.id, outline: style.outlineStyle, outlineWidth: style.outlineWidth, visible: rect.width > 0 && rect.height > 0 };
    });
    if (focused.tag !== 'BODY') { assert.ok(focused.visible); assert.notEqual(focused.outline, 'none', `Invisible focus ${focused.text}`); }
    results.keyboard.push(focused);
    if (focused.tag === 'A' && focused.text.includes('contact@') && results.keyboard.some(e => e.id === 'contact-message')) break;
  }
  assert.ok(results.keyboard.some(e => e.id === 'contact-message'));
  results.scenarios.push('Keyboard-only homepage flow reached required form controls with visible focus');
  // Local response simulation only. The network route guard prevents all external requests.
  await page.evaluate(() => { window.fetch = async () => new Response('{}', {status: 503}); });
  await page.getByLabel('Name', { exact: true }).fill('Local fixture');
  await page.getByLabel('Email', { exact: true }).fill('local@example.invalid');
  await page.getByLabel('How can we help?', { exact: true }).fill('This local fixture never leaves the browser.');
  await page.getByRole('button', { name: 'Send inquiry' }).click();
  await page.getByRole('alert').waitFor();
  assert.match(await page.getByRole('alert').innerText(), /contact@netherwooddatapartners.com/);
  results.scenarios.push('Formspark-down error and mail fallback passed with browser-local response; no submission sent');
  await page.evaluate(() => { window.fetch = async () => new Response('{}', {status: 200}); });
  await page.getByRole('button', { name: 'Send inquiry' }).click();
  await page.getByText('Thank you. Your message has been sent, and we will get back to you soon.').waitFor();
  assert.equal(await page.getByLabel('Name', { exact: true }).inputValue(), '');
  results.scenarios.push('Form success/reset passed with browser-local response; no submission sent');
  await ctx.close();
  // A returning browser carries a newer legacy cache with a removed article and old title.
  const returning = await context({ viewport: { width: 390, height: 844 } });
  await returning.addInitScript(({ article }) => {
    const stale = { ...article, title: 'STALE CACHED TITLE', slug: 'withdrawn-fixture' };
    localStorage.setItem('ndp.articles.published.v1', JSON.stringify({ savedAt: '2099-01-01T00:00:00Z', articles: [stale] }));
    localStorage.setItem('ndp.article.withdrawn-fixture.v1', JSON.stringify({ savedAt: '2099-01-01T00:00:00Z', articles: [stale] }));
    localStorage.setItem(`ndp.article.${article.slug}.v1`, JSON.stringify({ savedAt: '2099-01-01T00:00:00Z', articles: [{...article, title:'STALE CACHED TITLE'}] }));
  }, {article: snapshot.articles[0]});
  const rp = await returning.newPage();
  await rp.goto(`${base}/articles/withdrawn-fixture`, { waitUntil: 'domcontentloaded' });
  await rp.getByRole('heading', {name:'This field note is not available.'}).waitFor();
  assert.match(await rp.locator('meta[name=robots]').getAttribute('content'), /noindex/);
  await rp.goto(`${base}/articles/${snapshot.articles[0].slug}`, { waitUntil: 'domcontentloaded' });
  assert.equal(await rp.locator('h1').innerText(), snapshot.articles[0].title);
  await rp.goto(`${base}/articles`, {waitUntil: 'domcontentloaded'});
  assert.equal(await rp.getByText('STALE CACHED TITLE').count(), 0);
  assert.match(await rp.locator('.articles-results-summary').innerText(), /10 articles/);
  results.scenarios.push('Returning browser ignores newer legacy index/detail caches, including authoritative removal');
  await returning.close();
  const blocked = await context();
  await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage denied'); } }); });
  const bp = await blocked.newPage(); await bp.goto(`${base}/articles/${snapshot.articles[0].slug}`, {waitUntil:'domcontentloaded'});
  assert.equal(await bp.locator('h1').innerText(), snapshot.articles[0].title);
  results.scenarios.push('Articles render with storage denied and no backend'); await blocked.close();
  const nojs = await context({javaScriptEnabled:false}); const np = await nojs.newPage();
  await np.goto(`${base}/`); assert.ok(await np.locator('noscript a[href="mailto:contact@netherwooddatapartners.com"]').isVisible());
  results.scenarios.push('No-JavaScript email fallback visible; full site remains JavaScript-rendered'); await nojs.close();
  const narrow = await context({viewport:{width:320,height:844}}); const narrowPage = await narrow.newPage();
  for (const route of ['/', '/about', '/articles', `/articles/${snapshot.articles[0].slug}`]) {
    await narrowPage.goto(`${base}${route}`, {waitUntil:'domcontentloaded'}); await narrowPage.locator('h1').waitFor();
    assert.ok(await narrowPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `320px overflow ${route}`);
  }
  await narrow.close(); results.scenarios.push('320px overflow spot checks passed');
  assert.deepEqual(results.externalRequests, [], 'Unexpected external traffic'); assert.deepEqual(results.browserErrors, []);
} finally {
  await writeFile(resolve(output, 'browser-results.json'), JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ event: 'browser_qa_passed', routes: results.routes.length, scenarios: results.scenarios, output }));
