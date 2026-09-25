import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Run against the built Pages preview. Every off-origin request is intercepted;
// Formspark responses below are local fixtures, never real inquiries.
const { chromium } = await import(process.env.NDP_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NDP_QA_URL || 'http://127.0.0.1:4175';
const origin = new URL(base).origin;
const output = resolve('outputs/migration-qa/after');
const storageKey = 'netherwood.migration-readiness.v1';
const ids = ['replacement', 'age', 'unsupported', 'access', 'spreadsheets', 'server', 'onePerson', 'duplicates', 'inconsistent', 'documents', 'api', 'import', 'restore', 'continuity'];
const lowRisk = Object.fromEntries(ids.map(id => [id, ['replacement', 'api', 'import', 'restore', 'continuity'].includes(id) ? 'yes' : 'no']));
const allUnknown = Object.fromEntries(ids.map(id => [id, 'unknown']));
const highRisk = Object.fromEntries(ids.map(id => [id, lowRisk[id] === 'yes' ? 'no' : 'yes']));
const corsHeaders = { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'Content-Type, Accept', 'content-type': 'application/json' };
const report = { base, cases: [], pageErrors: [], blockedRequests: [], interceptedSubmissions: [], failures: [] };
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

async function runCase(name, test, options = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce', ...options });
  const fixture = { mode: 'success', posts: [], pending: [] };
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin) return route.continue();
    if (url.origin === 'https://submit-form.com' && request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: corsHeaders });
    if (url.origin === 'https://submit-form.com' && request.method() === 'POST') {
      const submission = { test: name, url: request.url(), body: request.postData(), contentType: request.headers()['content-type'] };
      fixture.posts.push(submission);
      report.interceptedSubmissions.push(submission);
      if (fixture.mode === 'pending') { fixture.pending.push(route); return; }
      return route.fulfill({ status: fixture.mode === 'error' ? 500 : 200, headers: corsHeaders, body: JSON.stringify(fixture.mode === 'error' ? { error: 'Local QA failure' } : { success: true }) });
    }
    report.blockedRequests.push({ test: name, url: request.url(), method: request.method() });
    return route.abort('blockedbyclient');
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); report.pageErrors.push({ test: name, message: error.message }); });
  try {
    await test({ page, context, fixture });
    assert.deepEqual(errors, [], `${name}: browser exceptions`);
    report.cases.push({ name, passed: true, interceptedPosts: fixture.posts.length });
    console.log(`PASS ${name}`);
  } catch (error) {
    report.cases.push({ name, passed: false });
    report.failures.push({ name, error: error.stack || String(error) });
    console.error(`FAIL ${name}: ${error.message}`);
    await page.screenshot({ path: resolve(output, `tools-failed-${name.replaceAll(/[^a-z0-9]+/gi, '-')}.png`), fullPage: true }).catch(() => {});
  } finally {
    await context.close();
  }
}

async function visit(page, path) {
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.locator('h1').waitFor();
}
async function answer(page, values) {
  for (const [id, value] of Object.entries(values)) await page.locator(`input[name="${id}"][value="${value}"]`).check();
}
async function showReadiness(page, values) {
  await visit(page, '/migration-readiness/');
  await answer(page, values);
  await page.getByRole('button', { name: 'See my migration readiness', exact: true }).click();
  await page.locator('#readiness-result-heading').waitFor();
}
async function fillIntake(page) {
  await page.locator('#migration-name').fill('Local QA Visitor');
  await page.locator('#migration-business').fill('Local QA Business');
  await page.locator('#migration-email').fill('qa@example.invalid');
}
async function sendIntake(page) {
  await page.getByRole('button', { name: 'Send migration inquiry', exact: true }).click();
}
async function settle(page) { await page.waitForTimeout(80); }
function payload(fixture) { return JSON.parse(fixture.posts.at(-1).body); }
async function attachStoredAnswers(page, values, timestamp = Date.now()) {
  await page.addInitScript(({ key, answers, createdAt }) => sessionStorage.setItem(key, JSON.stringify({ version: 1, createdAt, answers })), { key: storageKey, answers: values, createdAt: timestamp });
}

try {
  for (const [label, values, expected] of [
    ['straightforward', lowRisk, 'Straightforward migration candidate'],
    ['planning', { ...lowRisk, unsupported: 'yes', access: 'yes', age: 'yes' }, 'Migration planning recommended'],
    ['complex', highRisk, 'Complex legacy environment worth assessing'],
    ['unknown answers', allUnknown, 'Migration planning recommended'],
  ]) {
    await runCase(`readiness ${label}`, async ({ page, fixture }) => {
      await showReadiness(page, values);
      assert.equal(await page.locator('#readiness-result-heading').textContent(), expected);
      assert.equal(await page.evaluate(() => document.activeElement?.id), 'readiness-result-heading');
      assert.equal(await page.locator('input[type="email"]').count(), 0);
      assert.equal(fixture.posts.length, 0);
      await page.getByText('How this result is calculated', { exact: true }).click();
      assert.match(await page.locator('.readiness-method').textContent(), /Unknowns add no risk points/);
      assert(await page.locator('.readiness-result li').count() > 1);
      await page.screenshot({ path: resolve(output, `tools-readiness-${label.replaceAll(' ', '-')}-390.png`), fullPage: true });
    });
  }

  await runCase('readiness missing answers and stale result', async ({ page, fixture }) => {
    await visit(page, '/migration-readiness/');
    await page.getByRole('button', { name: 'See my migration readiness', exact: true }).click();
    assert.equal(await page.locator('#readiness-result-heading').count(), 0);
    assert.equal(await page.locator('form').evaluate(form => form.checkValidity()), false);
    await answer(page, lowRisk);
    await page.getByRole('button', { name: 'See my migration readiness', exact: true }).click();
    await page.locator('#readiness-result-heading').waitFor();
    await page.locator('input[name="restore"][value="unknown"]').check();
    assert.equal(await page.locator('#readiness-result-heading').count(), 0, 'Changing an answer removes the stale result and CTA');
    await page.getByRole('button', { name: 'See my migration readiness', exact: true }).click();
    assert.equal(await page.locator('#readiness-result-heading').textContent(), 'Migration planning recommended');
    assert.equal(fixture.posts.length, 0);
  });

  await runCase('intake required fields and invalid email stay local', async ({ page, fixture }) => {
    await visit(page, '/migration-intake/');
    const required = await page.locator('input[required]').evaluateAll(inputs => inputs.map(input => input.name));
    assert.deepEqual(required, ['name', 'company', 'email']);
    await sendIntake(page);
    assert.equal(await page.locator('form').evaluate(form => form.checkValidity()), false);
    await fillIntake(page);
    await page.locator('#migration-email').fill('not-an-email');
    await sendIntake(page);
    await settle(page);
    assert.equal(await page.locator('#migration-email').evaluate(input => input.validity.typeMismatch), true);
    assert.equal(fixture.posts.length, 0);
    assert.equal(await page.locator('input[type="file"]').count(), 0);
  });

  await runCase('conditional platform and assessment intent', async ({ page, fixture }) => {
    await visit(page, '/migration-intake/?intent=assessment');
    assert.equal(await page.locator('#migration-goal').inputValue(), 'Request a systems assessment');
    assert.equal(await page.locator('#migration-platform').count(), 0);
    await page.locator('#migration-platform-choice').selectOption('Yes');
    await page.locator('#migration-platform').fill('Chosen business platform');
    await page.locator('#migration-platform-choice').selectOption('No');
    assert.equal(await page.locator('#migration-platform').count(), 0);
    await page.locator('#migration-platform-choice').selectOption('Evaluating options');
    assert.equal(await page.locator('#migration-platform').inputValue(), '');
    await page.locator('#migration-platform').fill('Option A and Option B');
    await fillIntake(page);
    await sendIntake(page);
    await page.locator('.contact-form-status--success').waitFor();
    assert.equal(payload(fixture).goal, 'Request a systems assessment');
    assert.equal(payload(fixture).replacement_platform, 'Option A and Option B');
    assert.equal(await page.locator('#migration-goal').inputValue(), '');
    assert.equal(await page.locator('#migration-platform').count(), 0);
  });

  await runCase('readiness handoff explicit review and successful submit', async ({ page, fixture }) => {
    await showReadiness(page, lowRisk);
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), storageKey), null);
    await page.getByRole('button', { name: 'Include this assessment in an inquiry', exact: true }).click();
    await page.waitForURL(`${base}/migration-intake/`);
    await page.locator('#attached-assessment-title').waitFor();
    assert.equal(fixture.posts.length, 0, 'The CTA must not submit anything');
    assert.equal(new URL(page.url()).search, '', 'No assessment or personal information is in the URL');
    await page.getByText('Review the assessment', { exact: true }).click();
    assert.match(await page.locator('.migration-attached-assessment pre').textContent(), /Straightforward migration candidate/);
    await fillIntake(page);
    await sendIntake(page);
    await page.locator('.contact-form-status--success').waitFor();
    assert.match(payload(fixture).readiness_assessment, /Self-reported, not a technical assessment/);
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), storageKey), null);
    assert.equal(await page.locator('#attached-assessment-title').count(), 0);
  });

  await runCase('readiness attachment can be removed before sending', async ({ page, fixture }) => {
    await attachStoredAnswers(page, lowRisk);
    await visit(page, '/migration-intake/');
    await page.locator('#attached-assessment-title').waitFor();
    await page.getByRole('button', { name: 'Remove assessment from inquiry', exact: true }).click();
    assert.equal(await page.locator('[name="readiness_assessment"]').count(), 0);
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), storageKey), null);
    await fillIntake(page);
    await sendIntake(page);
    await page.locator('.contact-form-status--success').waitFor();
    assert.equal(payload(fixture).readiness_assessment, undefined);
  });

  for (const [label, raw] of [
    ['expired', JSON.stringify({ version: 1, createdAt: Date.now() - 31 * 60 * 1000, answers: lowRisk })],
    ['malformed', '{broken'],
    ['oversized', 'x'.repeat(4097)],
  ]) {
    await runCase(`${label} handoff is discarded`, async ({ page, fixture }) => {
      await page.addInitScript(({ key, value }) => sessionStorage.setItem(key, value), { key: storageKey, value: raw });
      await visit(page, '/migration-intake/');
      assert.equal(await page.locator('[name="readiness_assessment"]').count(), 0);
      assert.equal(await page.evaluate(key => sessionStorage.getItem(key), storageKey), null);
      assert.equal(fixture.posts.length, 0);
    });
  }

  await runCase('storage denied keeps readiness and intake usable', async ({ page, fixture }) => {
    await page.addInitScript(() => Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Local QA storage denial', 'SecurityError'); } }));
    await showReadiness(page, lowRisk);
    await page.getByRole('button', { name: 'Include this assessment in an inquiry', exact: true }).click();
    await page.getByRole('alert').waitFor();
    assert.match(await page.getByRole('alert').textContent(), /could not carry the answers/);
    await page.getByRole('link', { name: 'start an inquiry without it', exact: true }).click();
    await fillIntake(page);
    await sendIntake(page);
    await page.locator('.contact-form-status--success').waitFor();
    assert.equal(payload(fixture).readiness_assessment, undefined);
  });

  await runCase('intake success includes optional fields and resets', async ({ page, fixture }) => {
    await visit(page, '/migration-intake/');
    await fillIntake(page);
    await page.locator('#migration-current').fill('An old application, Excel and shared documents');
    await page.locator('input[name="uses_sql_server"]').check();
    await page.locator('input[name="uses_excel"]').check();
    await page.locator('#migration-worries').fill('Keeping invoice history linked to customers.');
    await sendIntake(page);
    await page.locator('.contact-form-status--success').waitFor();
    assert.equal(fixture.posts.length, 1);
    assert.equal(payload(fixture).source, 'Netherwood migration intake');
    assert.equal(payload(fixture).uses_sql_server, 'SQL Server');
    assert.equal(payload(fixture).uses_excel, 'Excel');
    assert.match(payload(fixture).migration_concerns, /invoice history/);
    assert.equal(await page.locator('#migration-name').inputValue(), '');
    assert.equal(await page.locator('input[name="uses_excel"]').isChecked(), false);
    assert.equal(await page.locator('input[name="_honeypot"]').count(), 1);
  });

  await runCase('intake server failure preserves entries and permits retry', async ({ page, fixture }) => {
    fixture.mode = 'error';
    await visit(page, '/migration-intake/');
    await fillIntake(page);
    await sendIntake(page);
    await page.locator('.contact-form-status--error').waitFor();
    assert.equal(await page.locator('#migration-name').inputValue(), 'Local QA Visitor');
    assert.equal(await page.locator('.contact-form-status--error a').getAttribute('href'), 'mailto:contact@netherwooddatapartners.com');
    fixture.mode = 'success';
    await sendIntake(page);
    await page.locator('.contact-form-status--success').waitFor();
    assert.equal(fixture.posts.length, 2);
  });

  await runCase('intake in-flight guard prevents duplicate requests', async ({ page, fixture }) => {
    fixture.mode = 'pending';
    await visit(page, '/migration-intake/');
    await fillIntake(page);
    await sendIntake(page);
    await page.waitForFunction(() => document.querySelector('form')?.getAttribute('aria-busy') === 'true');
    assert.equal(await page.getByRole('button', { name: 'Sending…', exact: true }).isDisabled(), true);
    await page.locator('form').evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
    await settle(page);
    assert.equal(fixture.posts.length, 1);
    await fixture.pending[0].fulfill({ status: 200, headers: corsHeaders, body: '{"success":true}' });
    await page.locator('.contact-form-status--success').waitFor();
  });

  await runCase('intake 15-second timeout preserves entries', async ({ page, fixture }) => {
    fixture.mode = 'pending';
    await visit(page, '/migration-intake/');
    await page.clock.install();
    await fillIntake(page);
    await sendIntake(page);
    await page.waitForFunction(() => document.querySelector('form')?.getAttribute('aria-busy') === 'true');
    await page.clock.fastForward(15_100);
    await page.locator('.contact-form-status--error').waitFor();
    assert.equal(await page.locator('#migration-email').inputValue(), 'qa@example.invalid');
    assert.equal(await page.getByRole('button', { name: 'Send migration inquiry', exact: true }).isEnabled(), true);
    assert.equal(fixture.posts.length, 1);
  });

  await runCase('existing contact form validation and success regression', async ({ page, fixture }) => {
    await visit(page, '/#contact');
    const form = page.locator('form.contact-form');
    assert.equal(await form.getAttribute('action'), 'https://submit-form.com/5bzGZaPs6');
    assert.equal(await form.getAttribute('method'), 'POST');
    await page.locator('#contact-name').fill('Local QA Visitor');
    await page.locator('#contact-email').fill('qa@example.invalid');
    await page.locator('#contact-message').fill('   Too short   ');
    await form.evaluate(element => element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    await settle(page);
    assert.equal(fixture.posts.length, 0);
    assert.match(await page.locator('#contact-message').evaluate(input => input.validationMessage), /20|lengthen/);
    await page.locator('#contact-message').fill('This is a locally intercepted QA inquiry; no real message is sent.');
    await page.getByRole('button', { name: 'Send inquiry', exact: true }).click();
    await page.locator('.contact-form-status--success').waitFor();
    assert.equal(payload(fixture).source, 'Netherwood Data Partners website');
    assert.equal(await page.locator('#contact-message').inputValue(), '');
  });

  await runCase('existing contact form failure and fallback regression', async ({ page, fixture }) => {
    fixture.mode = 'error';
    await visit(page, '/#contact');
    await page.locator('#contact-name').fill('Local QA Visitor');
    await page.locator('#contact-email').fill('qa@example.invalid');
    await page.locator('#contact-message').fill('This is a locally intercepted QA inquiry; no real message is sent.');
    await page.getByRole('button', { name: 'Send inquiry', exact: true }).click();
    await page.locator('.contact-form-status--error').waitFor();
    assert.match(await page.locator('#contact-message').inputValue(), /locally intercepted/);
    assert.equal(await page.locator('.contact-form-status--error a').getAttribute('href'), 'mailto:contact@netherwooddatapartners.com');
    assert.equal(fixture.posts.length, 1);
  });

  for (const noJavaScript of [false, true]) {
    await runCase(`native intake POST with ${noJavaScript ? 'JavaScript disabled' : 'fetch unavailable'}`, async ({ page, fixture }) => {
      if (!noJavaScript) await page.addInitScript(() => { window.fetch = undefined; });
      await visit(page, '/migration-intake/');
      assert.equal(await page.locator('form').getAttribute('action'), 'https://submit-form.com/5bzGZaPs6');
      await fillIntake(page);
      await sendIntake(page);
      await page.waitForURL('https://submit-form.com/5bzGZaPs6');
      assert.equal(fixture.posts.length, 1);
      assert.match(fixture.posts[0].contentType, /application\/x-www-form-urlencoded/);
      const nativeData = new URLSearchParams(fixture.posts[0].body);
      assert.equal(nativeData.get('source'), 'Netherwood migration intake');
      assert.equal(nativeData.get('company'), 'Local QA Business');
    }, { javaScriptEnabled: !noJavaScript });
  }
} finally {
  await browser.close();
  await writeFile(resolve(output, 'migration-tools-results.json'), `${JSON.stringify(report, null, 2)}\n`);
}
console.log(JSON.stringify({ passed: report.cases.filter(test => test.passed).length, failed: report.failures.length, interceptedSubmissions: report.interceptedSubmissions.length, unexpectedExternalRequests: report.blockedRequests.length, output }));
if (report.failures.length || report.pageErrors.length || report.blockedRequests.length) process.exitCode = 1;
