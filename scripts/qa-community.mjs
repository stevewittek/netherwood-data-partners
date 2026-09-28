import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const { chromium } = await import(
  process.env.NDP_PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.NDP_QA_URL || "http://127.0.0.1:4176";
const phase = process.argv.includes("--baseline") ? "before" : "after";
const output = resolve("outputs/community-qa", phase);
await mkdir(output, { recursive: true });
const snapshot = JSON.parse(
  await readFile("pages-site/articles-snapshot.json", "utf8"),
);
const paths = [
  "/",
  "/about/",
  "/services/",
  "/articles/",
  `/articles/${snapshot.articles[0].slug}/`,
  "/migration-intake/",
];
if (phase === "after") paths.push("/services/software-systems-support/");
const browser = await chromium.launch({ channel: "msedge", headless: true });
const report = { routes: [], errors: [], checks: [] };
try {
  for (const width of [1440, 768, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (error) => report.errors.push(error.message));
    await page.route("**/*", (route) =>
      route.request().method() === "GET" ? route.continue() : route.abort(),
    );
    for (const path of paths) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.locator("img").evaluateAll(images => images.forEach(img => { img.loading = "eager"; }));
      // Load below-fold images before recording layout and full-page evidence.
      await page.locator("footer").scrollIntoViewIfNeeded();
      await page.evaluate(async () => {
        await Promise.all(
          [...document.images].map((i) => i.decode().catch(() => {})),
        );
        window.scrollTo(0, 0);
      });
      const metrics = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        h1: document.querySelectorAll("h1").length,
        brokenImages: [...document.images]
          .filter((i) => !i.naturalWidth)
          .map((i) => i.src),
        animations: document
          .getAnimations()
          .filter((a) => a.playState === "running").length,
      }));
      assert.ok(
        metrics.scrollWidth <= width,
        `${path} overflow ${width}: ${metrics.scrollWidth}`,
      );
      assert.equal(metrics.h1, 1, `${path} heading`);
      assert.deepEqual(metrics.brokenImages, [], `${path} images`);
      assert.equal(metrics.animations, 0, "Reduced motion");
      const name =
        path === "/" ? "home" : path.replaceAll("/", "_").replace(/^_|_$/g, "");
      await page.screenshot({
        path: resolve(output, `${name}-${width}.png`),
        fullPage: true,
      });
      if (path === "/") {
        await page.screenshot({ path: resolve(output, `hero-${width}.png`) });
        await page
          .locator("#contact")
          .screenshot({ path: resolve(output, `contact-${width}.png`) });
      }
      report.routes.push({ path, width, ...metrics });
    }
    await page.close();
  }
  const page = await browser.newPage({
    viewport: { width: 320, height: 900 },
    reducedMotion: "reduce",
  });
  await page.goto(base + "/");
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "320px overflow",
  );
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").innerText(), "Skip to content");
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(":focus").getAttribute("id"), "main-content");
  report.checks.push("320px overflow", "keyboard skip link", "reduced motion");
  await page.close();
  const noJs = await browser.newPage({ javaScriptEnabled: false });
  await noJs.goto(base + "/");
  assert.equal(await noJs.locator("h1").count(), 1);
  assert.ok(
    await noJs
      .locator('a[href="mailto:contact@netherwooddatapartners.com"]')
      .count(),
  );
  assert.equal(
    await noJs.locator('form[action^="https://submit-form.com/"]').count(),
    1,
  );
  report.checks.push("no-JavaScript content, contact and native form");
  await noJs.close();
  assert.deepEqual(report.errors, []);
} finally {
  await writeFile(
    resolve(output, "results.json"),
    JSON.stringify(report, null, 2),
  );
  await browser.close();
}
console.log(
  JSON.stringify({
    phase,
    renders: report.routes.length,
    checks: report.checks,
    errors: report.errors,
  }),
);
