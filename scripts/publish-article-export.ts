import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { readArticleSnapshot, validateArticleSnapshot } from "../backend/src/article-snapshot.ts";
import { deployedPublication, releaseNeedsUpdate, assertCaptureOrder } from "./publication-release.mjs";

const repository = "stevewittek/netherwood-data-partners";
const branch = "ndp-publication-content";
const candidate = await readArticleSnapshot(resolve(process.argv[2] ?? "pages-site/.publication-candidates/articles-snapshot.candidate.json"));
const now = Date.now();
if (Date.parse(candidate.generatedAt) > now + 60_000 || now - Date.parse(candidate.generatedAt) > 300_000) throw new Error("Export must be captured within the last five minutes; rerun the SQL export");
const dryRun = process.argv.includes("--dry-run");
if (dryRun) {
  console.log(JSON.stringify({ event: "publication_dry_run", articleCount: candidate.articleCount, contentDigest: candidate.contentDigest, writes: false }));
} else {
  if (process.env.NDP_PUBLICATION_ENABLED !== "true") throw new Error("Publication activation is disabled; use --dry-run");
  function api(path: string, method = "GET", body?: unknown): Record<string, unknown> {
    const result = spawnSync("gh", ["api", `repos/${repository}/${path}`, "--method", method, ...(body ? ["--input", "-"] : [])], {
      input: body ? JSON.stringify(body) : undefined, encoding: "utf8", maxBuffer: 30_000_000, timeout: 30_000,
    });
    if (result.status !== 0) throw new Error(`GitHub ${method} ${path.split("?")[0]} failed; inspect authentication or concurrent publication. No credentials logged.`);
    return result.stdout.trim() ? JSON.parse(result.stdout) as Record<string, unknown> : {};
  }
  const initialize = process.argv.includes("--initialize");
  // Initialization is a separate owner-approved one-time command, never in the timer.
  const reference = initialize ? undefined : api(`git/ref/heads/${branch}`);
  let contentCommit = reference ? String((reference.object as { sha: string }).sha) : undefined;
  let previous;
  if (contentCommit) {
    const tree = api(`git/trees/${contentCommit}`);
    const entries = tree.tree as { path: string; sha: string; type: string }[];
    if (entries.length !== 1 || entries[0].path !== "articles-snapshot.json" || entries[0].type !== "blob") throw new Error("Content branch must contain exactly the public snapshot");
    const blob = api(`git/blobs/${entries[0].sha}`);
    previous = validateArticleSnapshot(JSON.parse(Buffer.from(String(blob.content), "base64").toString("utf8")));
  }
  assertCaptureOrder(previous, candidate);
  if (!previous || previous.contentDigest !== candidate.contentDigest) {
    const blob = api("git/blobs", "POST", { content: `${JSON.stringify(candidate, null, 2)}\n`, encoding: "utf-8" });
    const tree = api("git/trees", "POST", { tree: [{ path: "articles-snapshot.json", mode: "100644", type: "blob", sha: blob.sha }] });
    const commit = api("git/commits", "POST", { message: `Publish article export ${candidate.contentDigest.slice(0, 12)}`, tree: tree.sha, parents: contentCommit ? [contentCommit] : [] });
    if (initialize) api("git/refs", "POST", { ref: `refs/heads/${branch}`, sha: commit.sha });
    else api(`git/refs/heads/${branch}`, "PATCH", { sha: commit.sha, force: false });
    contentCommit = String(commit.sha);
  }
  if (initialize) {
    console.log(JSON.stringify({ event: "publication_branch_initialized", contentCommit, deploymentRequested: false }));
  } else {
  const main = api("git/ref/heads/main");
  const current = await deployedPublication();
  if (releaseNeedsUpdate(current, candidate, (main.object as { sha: string }).sha)) {
    api("actions/workflows/deploy-pages.yml/dispatches", "POST", { ref: "main", inputs: { content_commit: contentCommit } });
    console.log(JSON.stringify({ event: "publication_requested", contentCommit, contentDigest: candidate.contentDigest }));
  } else {
    console.log(JSON.stringify({ event: "publication_unchanged", contentCommit, contentDigest: candidate.contentDigest }));
  }
  }
  // No success marker here: a subsequent cycle checks the deployed manifest again.
  // Failed dispatch/build/deploy therefore retries even when SQL content is unchanged.
}
