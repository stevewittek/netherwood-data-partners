// Optional browser acceptance; uses the repository's existing external QA browser installation.
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startProspecting } from "../server.mjs";

const { chromium } = await import(process.env.NDP_PLAYWRIGHT_MODULE || "playwright");
const dataDirectory = await mkdtemp(join(tmpdir(), "ndp-prospecting-browser-"));
const application = await startProspecting({ port: 0, dataDirectory });
let browser;
const errors = [];
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(application.origin);
  await page.getByRole("status").filter({ hasText: "Private local desk ready" }).waitFor();
  await page.getByLabel("Company name", { exact: true }).fill("Synthetic browser fixture");
  await page.getByLabel("Public business email", { exact: true }).fill("research@example.com");
  await page.getByLabel("Industry", { exact: true }).last().selectOption("Manufacturing");
  await page.getByLabel("County", { exact: true }).last().fill("Union");
  await page.getByLabel("Lead status", { exact: true }).selectOption("Qualified");
  await page.getByRole("button", { name: "Add evidence record", exact: true }).click();
  await page.getByLabel("Observation or interpretation", { exact: true }).fill("Synthetic test announcement: the business plans to replace its ERP.");
  await page.getByLabel("Public source URLs (required for FACT; one per line)", { exact: true }).fill("https://example.com/announcement");
  await page.getByLabel("Scoring signal (only explicit sourced FACTS count)", { exact: true }).selectOption("planned_replacement");
  await page.getByLabel("Why this evidence supports the signal (required for scoring facts)", { exact: true }).fill("The fixture announcement explicitly describes a replacement.");
  await page.getByRole("button", { name: "Save company and research", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Company and evidence saved" }).waitFor();
  assert.match(await page.locator("#scores").textContent(), /65 \/ 100/);
  await page.getByRole("button", { name: "Prepare an introduction for review", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Introduction prepared locally" }).waitFor();
  await page.getByLabel("Draft", { exact: true }).fill("Synthetic locally reviewed draft. No message should be sent.");
  await page.getByRole("button", { name: "Save draft and clear prior approval", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved; approval cleared" }).waitFor();
  await page.getByLabel("Human reviewer's name", { exact: true }).fill("Synthetic Reviewer");
  await page.locator("#reviewed").check();
  await page.getByRole("button", { name: "Record approval — no message is sent", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Human review recorded" }).waitFor();
  assert.match(await page.locator("#outreach-state").textContent(), /Reviewed by Synthetic Reviewer/);
  await page.getByLabel("Do not contact this company", { exact: true }).check();
  await page.getByRole("button", { name: "Save company and research", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Company and evidence saved" }).waitFor();
  assert.equal(await page.locator("#generate-draft").isDisabled(), true);
  assert.equal(await page.locator("#do_not_contact").isDisabled(), true);
  assert.equal(await page.locator("#draft-form").isVisible(), false);
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `Overflow at ${width}`);
    if (process.env.PROSPECTING_QA_OUTPUT) {
      await mkdir(process.env.PROSPECTING_QA_OUTPUT, { recursive: true });
      await page.screenshot({ path: join(process.env.PROSPECTING_QA_OUTPUT, `prospecting-${width}.png`), fullPage: true });
    }
  }
  assert.deepEqual(errors, []);
  console.log("PASS: local browser CRUD, evidence scoring, draft edit, explicit approval, suppression, 1440/768/390 layout, no console errors.");
} finally {
  await browser?.close();
  await application.close();
  await rm(dataDirectory, { recursive: true, force: true });
}
