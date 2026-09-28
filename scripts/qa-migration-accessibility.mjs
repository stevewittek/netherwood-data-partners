import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// QA-only dependencies are supplied by the existing browser container or an
// ignored outputs/qa-tools installation. They do not enter the site bundle.
const { chromium } = await import(process.env.NDP_PLAYWRIGHT_MODULE || "playwright");
const axeModule = process.env.NDP_AXE_MODULE || pathToFileURL(resolve("outputs/qa-tools/node_modules/@axe-core/playwright/dist/index.mjs")).href;
const { default: AxeBuilder } = await import(axeModule);
const base = (process.env.NDP_QA_URL || "http://127.0.0.1:4175").replace(/\/$/, "");
const output = resolve("outputs/migration-qa/accessibility");
await mkdir(output, { recursive: true });
const snapshot = JSON.parse(await readFile("pages-site/articles-snapshot.json", "utf8"));
const serviceSlugs = ["software-systems-support", "data-migration", "legacy-application-modernization", "business-software-migration", "legacy-systems-assessment", "database-engineering", "workflow-automation", "practical-ai"];
const mobileRoutes = ["/", "/about/", "/articles/", "/services/", "/migration-intake/", "/migration-readiness/", ...serviceSlugs.map((slug) => `/services/${slug}/`), ...snapshot.articles.map((article) => `/articles/${article.slug}/`)];
const desktopRoutes = ["/", "/about/", "/services/", "/services/data-migration/", "/services/legacy-systems-assessment/", "/services/database-engineering/", "/migration-intake/", "/migration-readiness/"];
const report = {
  base,
  generatedAt: new Date().toISOString(),
  standard: "axe automated WCAG 2 A/AA, WCAG 2.1 A/AA, WCAG 2.2 AA and best-practice checks; not a complete accessibility certification",
  scans: [],
  errors: [],
  blockedExternalRequests: [],
};
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
  executablePath: process.env.NDP_BROWSER_EXECUTABLE || undefined,
});

function summarizeRules(rules) {
  return rules.map(({ id, impact, help, helpUrl, nodes }) => ({
    id, impact, help, helpUrl,
    nodes: nodes.map(({ target, failureSummary, html }) => ({ target, failureSummary, html })),
  }));
}

async function scan(page, path, width, state = "default") {
  await page.evaluate(() => document.fonts.ready);
  const structure = await page.evaluate(() => ({
    h1Count: document.querySelectorAll("h1").length,
    headings: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((heading) => ({ level: Number(heading.tagName[1]), text: heading.textContent.trim() })),
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: innerWidth,
  }));
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  report.scans.push({ path, width, state, ...structure, violations: summarizeRules(result.violations), incomplete: summarizeRules(result.incomplete), passedRules: result.passes.length });
  if (structure.h1Count !== 1) report.errors.push(`${path} (${width}, ${state}): expected one h1, got ${structure.h1Count}`);
  if (structure.documentWidth > structure.viewportWidth) report.errors.push(`${path} (${width}, ${state}): horizontal overflow ${structure.documentWidth}`);
  console.log(JSON.stringify({ path, width, state, violations: result.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })) }));
}

try {
  for (const [width, routes] of [[390, mobileRoutes], [1440, desktopRoutes]]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    await context.route("**/*", (route) => {
      const url = route.request().url();
      if (url.startsWith(`${base}/`)) return route.continue();
      report.blockedExternalRequests.push(url);
      return route.abort();
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    for (const path of routes) {
      try {
        const response = await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
        assert.ok(response?.ok(), `${path}: HTTP ${response?.status()}`);
        await page.locator("h1").waitFor();
        await scan(page, path, width);
      } catch (error) {
        report.errors.push(`${path} (${width}): ${error.message}`);
      }
    }

    // Exercise dynamically revealed content without submitting an inquiry or
    // allowing any request to the external form provider.
    try {
      await page.goto(`${base}/migration-readiness/`, { waitUntil: "networkidle" });
      for (const input of await page.locator('input[type="radio"][value="unknown"]').all()) await input.check();
      await page.getByRole("button", { name: "See my migration readiness", exact: true }).click();
      await page.locator("#readiness-result-heading").waitFor();
      await page.locator(".readiness-method summary").click();
      await scan(page, "/migration-readiness/", width, "result-and-method-expanded");
      await page.getByRole("button", { name: "Include this assessment in an inquiry", exact: true }).click();
      await page.waitForURL(`${base}/migration-intake/`);
      await page.locator(".migration-attached-assessment").waitFor();
      await page.locator(".migration-attached-assessment summary").click();
      await page.locator("#migration-platform-choice").selectOption("Yes");
      await page.locator("#migration-platform").waitFor();
      await scan(page, "/migration-intake/", width, "attached-assessment-and-platform-expanded");
    } catch (error) {
      report.errors.push(`Dynamic content (${width}): ${error.message}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(resolve(output, "axe-results.json"), `${JSON.stringify(report, null, 2)}\n`);
}

const violations = report.scans.flatMap(({ path, width, state, violations: rules }) => rules.map(({ id, impact }) => ({ path, width, state, id, impact })));
console.log(JSON.stringify({ scans: report.scans.length, violations: violations.length, errors: report.errors, output }));
assert.deepEqual(report.errors, [], "Page, structure or interaction errors require review");
assert.deepEqual(violations, [], "Automated accessibility violations require correction; see axe-results.json");
