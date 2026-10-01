import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { motionRelayDownloads } from "../app/content/motion-relay.ts";

const { chromium } = await import(process.env.NDP_PLAYWRIGHT_MODULE || "playwright");
const base = process.env.NDP_QA_URL || "http://127.0.0.1:4175";
const output = resolve("outputs/motion-connect-qa");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const width of [1440, 768, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const [route, name] of [
      ["/", "home"], ["/products/", "products"],
      ["/products/garmin-ai-connector/", "motion-connect"],
      ["/motionrelay/setup/", "setup"], ["/about/", "about"],
      ["/articles/", "articles"],
    ]) {
      const response = await page.goto(base + route, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200, route);
      await page.locator("img").evaluateAll((images) => images.forEach((img) => { img.loading = "eager"; }));
      await page.evaluate(async () => Promise.all([...document.images].map((image) => image.decode().catch(() => {}))));
      const metrics = await page.evaluate(() => ({
        viewport: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        headings: document.querySelectorAll("h1").length,
        brokenImages: [...document.images].filter((image) => !image.naturalWidth).map((image) => image.src),
      }));
      assert.ok(metrics.scrollWidth <= width, `${route} overflows at ${width}px`);
      assert.equal(metrics.headings, 1, `${route} h1`);
      assert.deepEqual(metrics.brokenImages, [], `${route} images`);
      await page.screenshot({ path: resolve(output, `${name}-${width}.png`), fullPage: true });
      results.push({ route, width, ...metrics });
    }
    assert.deepEqual(errors, [], `Browser errors at ${width}px`);
    await context.close();
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(base + "/products/garmin-ai-connector/", { waitUntil: "networkidle" });
  assert.equal(await page.getByRole("link", { name: "Get the Garmin watch app" }).getAttribute("href"), motionRelayDownloads.garmin.url);
  const unavailable = page.getByRole("button", { name: "Coming soon" });
  assert.equal(await unavailable.count(), [motionRelayDownloads.iphone, motionRelayDownloads.android].filter((entry) => !entry.available || !entry.url).length);
  for (const button of await unavailable.all()) assert.equal(await button.isEnabled(), false);
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").innerText(), "Skip to content");
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(":focus").getAttribute("id"), "main-content");
  await page.close();
  const noJs = await browser.newPage({ javaScriptEnabled: false });
  for (const route of ["/products/garmin-ai-connector/", "/motionrelay/setup/"]) {
    await noJs.goto(base + route);
    assert.equal(await noJs.locator("h1").count(), 1);
  }
  await noJs.close();
  await writeFile(resolve(output, "results.json"), JSON.stringify({ renders: results, controls: "passed", keyboard: "passed", noJavaScript: "passed" }, null, 2));
  console.log(`PASS ${results.length} responsive renders, download states, keyboard, and no-JavaScript routes`);
} finally {
  await browser.close();
}
