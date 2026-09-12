import { readFile } from "node:fs/promises";

export function assertCaptureOrder(previous, candidate) {
  if (previous && Date.parse(candidate.generatedAt) < Date.parse(previous.generatedAt)) throw new Error('Older export cannot replace a newer publication capture');
}

export function releaseNeedsUpdate(current, candidate, sourceCommit) {
  return current?.contentDigest !== candidate.contentDigest || current?.sourceCommit !== sourceCommit;
}

export async function deployedPublication(url = "https://netherwooddatapartners.com/publication.json") {
  const response = await fetch(`${url}?check=${Date.now()}`, { cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (response.status === 404) return undefined; // first version predates manifests
  if (!response.ok) throw new Error("Cannot check last successful release");
  const data = await response.json();
  if (data.format !== "netherwood.website-release/v1" || !/^[a-f0-9]{64}$/.test(data.contentDigest)) throw new Error("Invalid deployed release manifest");
  return data;
}

if (process.argv[2] === "check") {
  const snapshot = JSON.parse(await readFile("pages-site/articles-snapshot.json", "utf8"));
  const current = await deployedPublication();
  console.log(releaseNeedsUpdate(current, snapshot, process.env.GITHUB_SHA) ? "true" : "false");
}
