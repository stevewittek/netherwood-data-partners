import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const { chromium } = await import(
  process.env.NDP_PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.NDP_QA_URL || "http://127.0.0.1:4175";
const baseline = process.argv.includes("--baseline");
const output = resolve("outputs/migration-qa", baseline ? "before" : "after");
await mkdir(output, { recursive: true });
const snapshot = JSON.parse(
  await readFile("pages-site/articles-snapshot.json", "utf8"),
);
const extra = baseline
  ? []
  : [
      "/services/",
      "/migration-intake/",
      "/migration-readiness/",
      ...[
        "data-migration",
        "legacy-application-modernization",
        "business-software-migration",
        "legacy-systems-assessment",
        "database-engineering",
        "workflow-automation",
        "practical-ai",
      ].map((slug) => `/services/${slug}/`),
    ];
const routes = [
  "/",
  "/about/",
  "/articles/",
  ...extra,
  ...snapshot.articles.map((a) => `/articles/${a.slug}/`),
];
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
  executablePath: process.env.NDP_BROWSER_EXECUTABLE || undefined,
});
const report = {
  baseline,
  routes: [],
  errors: [],
  externalRequests: [],
  checks: [],
};
try {
  for (const width of [1440, 768, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    await context.route("**/*", (route) => {
      if (route.request().url().startsWith(`${base}/`)) return route.continue();
      report.externalRequests.push(route.request().url());
      return route.abort();
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") report.errors.push(message.text());
    });
    for (const path of routes) {
      await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
      await page.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      const metrics = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        h1: document.querySelectorAll("h1").length,
        canonical: document
          .querySelector('link[rel="canonical"]')
          ?.getAttribute("href"),
        brokenImages: [...document.images]
          .filter((img) => !img.complete || !img.naturalWidth)
          .map((img) => img.src),
        runningAnimations: document
          .getAnimations()
          .filter((a) => a.playState === "running").length,
        links: [...document.querySelectorAll("a[href]")].map((a) =>
          a.getAttribute("href"),
        ),
      }));
      assert.equal(metrics.h1, 1, `${path} h1`);
      assert.ok(
        metrics.scrollWidth <= width,
        `${path} overflows at ${width}: ${metrics.scrollWidth}`,
      );
      assert.deepEqual(metrics.brokenImages, [], `${path} images`);
      assert.equal(metrics.runningAnimations, 0, "Reduced motion");
      assert.equal(
        metrics.canonical,
        `https://netherwooddatapartners.com${path}`,
      );
      if (path === "/") {
        for (const id of [
          "services",
          "business-systems",
          "database-services",
          "engagements",
          "when-to-call-us",
          "approach",
          "about",
          "insights",
          "contact",
        ]) {
          assert.equal(
            await page.locator(`[id="${id}"]`).count(),
            1,
            `Preserve #${id}`,
          );
        }
      }
      if (
        ["/", "/about/", "/articles/", ...extra].includes(path) ||
        path === routes.at(-1)
      ) {
        await page.screenshot({
          path: resolve(
            output,
            `${width}-${path === "/" ? "home" : path.slice(1).replaceAll("/", "-")}.png`,
          ),
          fullPage: true,
        });
      }
      if (path === "/") {
        await page.screenshot({ path: resolve(output, `${width}-hero.png`) });
        await page
          .locator("#approach")
          .screenshot({ path: resolve(output, `${width}-process.png`) });
      }
      report.routes.push({ path, width, ...metrics });
    }
    await page.goto(`${base}/#contact`, { waitUntil: "networkidle" });
    await page.locator("#contact-name").waitFor();
    await page.screenshot({ path: resolve(output, `${width}-contact.png`) });
    await context.close();
  }
  if (!baseline) {
    const context = await browser.newContext({
      viewport: { width: 320, height: 844 },
      reducedMotion: "reduce",
    });
    await context.route("**/*", (route) =>
      route.request().url().startsWith(`${base}/`)
        ? route.continue()
        : route.abort(),
    );
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        !message.text().includes("status of 404")
      )
        report.errors.push(message.text());
    });
    for (const path of [
      "/",
      "/services/",
      "/migration-intake/",
      "/migration-readiness/",
    ]) {
      await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${path} 320px overflow`,
      );
      await page.keyboard.press("Tab");
      assert.equal(
        await page.evaluate(() => document.activeElement.textContent),
        "Skip to content",
      );
      const outline = await page.evaluate(
        () => getComputedStyle(document.activeElement).outlineStyle,
      );
      assert.notEqual(outline, "none", "Visible keyboard focus");
      await page.keyboard.press("Enter");
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "main-content",
      );
      report.checks.push(`${path}: 320px layout and keyboard skip/focus`);
    }
    await page.goto(`${base}/articles/`, { waitUntil: "networkidle" });
    const search = page.locator('input[type="search"]');
    await search.fill("NOLOCK");
    assert.ok(await page.getByRole("link", { name: /Why NOLOCK/ }).count());
    await search.fill("deliberately-no-matching-article");
    assert.equal(await page.locator(".article-preview").count(), 0);
    report.checks.push("Preserved article search/filter behavior");
    await page.goto(`${base}/does-not-exist/`, { waitUntil: "networkidle" });
    assert.ok(
      (
        await page.locator('meta[name="robots"]').getAttribute("content")
      ).includes("noindex"),
    );
    assert.ok(
      (await page.locator("h1").textContent()).includes(
        "nothing at this address",
      ),
    );
    report.checks.push("Unknown route retains noindex 404");
    for (const path of [
      "/articles/withdrawn-review-fixture/",
      "/services/unknown-review-fixture/",
    ]) {
      const response = await page.goto(`${base}${path}`, {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 404);
      assert.ok(
        (
          await page.locator('meta[name="robots"]').getAttribute("content")
        ).includes("noindex"),
      );
      assert.equal(await page.locator("h1").count(), 1);
    }
    for (const path of [
      "/index.html",
      "/services/index.html",
      "/articles/index.html",
      "/migration-intake/index.html",
      "/migration-readiness/index.html",
      "/about/index.html",
    ]) {
      await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute("href"),
        `https://netherwooddatapartners.com${path.replace(/index\.html$/, "")}`,
      );
      assert.equal(await page.locator(".article-not-found").count(), 0);
    }
    report.checks.push(
      "Missing articles/services and explicit index.html paths render without hydration errors",
    );
    await page.clock.install({ time: new Date("2027-01-01T12:00:00Z") });
    await page.goto(`${base}/services/`, { waitUntil: "networkidle" });
    assert.equal(await page.locator("h1").count(), 1);
    report.checks.push("Footer year rollover hydrates without error");
    await context.close();
    const staticContext = await browser.newContext({
      javaScriptEnabled: false,
    });
    const staticPage = await staticContext.newPage();
    for (const path of routes) {
      await staticPage.goto(`${base}${path}`);
      assert.equal(
        await staticPage.locator("h1").count(),
        1,
        `No-JavaScript content ${path}`,
      );
      assert.ok(
        await staticPage
          .locator(
            'a[href="mailto:contact@netherwooddatapartners.com"], a[href="/migration-intake/"]',
          )
          .count(),
        `Static contact path ${path}`,
      );
    }
    report.checks.push(
      `All ${routes.length} public routes readable with JavaScript disabled`,
    );
    await staticContext.close();
  }
  assert.deepEqual(report.errors, []);
} finally {
  await browser.close();
  await writeFile(
    resolve(output, "browser-results.json"),
    JSON.stringify(report, null, 2),
  );
}
console.log(
  JSON.stringify({
    renders: report.routes.length,
    errors: report.errors,
    output,
  }),
);
