import { resolve } from "node:path";
import { compareArticleSnapshots, readArticleSnapshot, writeArticleSnapshotAtomic } from "./article-snapshot.ts";

const candidatePath = resolve(process.argv[2] ?? "../pages-site/.publication-candidates/articles-snapshot.candidate.json");
const targetPath = resolve(process.argv[3] ?? "../pages-site/articles-snapshot.json");
const approval = process.argv.find((argument) => argument.startsWith("--approve="))?.slice("--approve=".length);
const maxAgeArgument = process.argv.find((argument) => argument.startsWith("--max-age-minutes="))?.slice("--max-age-minutes=".length);
const maxAgeMinutes = Number(maxAgeArgument ?? "30");
if (!Number.isFinite(maxAgeMinutes) || maxAgeMinutes < 1 || maxAgeMinutes > 1_440) {
  throw new Error("--max-age-minutes must be from 1 through 1440");
}

const candidate = await readArticleSnapshot(candidatePath);
let previous;
try {
  previous = await readArticleSnapshot(targetPath, { allowLegacy: true });
} catch (error) {
  if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error;
}
const changes = compareArticleSnapshots(previous, candidate);
const ageMs = Date.now() - Date.parse(candidate.generatedAt);
const report = {
  event: approval ? "article_snapshot_promotion_review" : "article_snapshot_dry_run",
  candidatePath,
  targetPath,
  generatedAt: candidate.generatedAt,
  articleCount: candidate.articleCount,
  contentDigest: candidate.contentDigest,
  ageSeconds: Math.max(0, Math.round(ageMs / 1_000)),
  changes,
};
console.log(JSON.stringify(report, null, 2));

if (approval) {
  if (approval !== candidate.contentDigest) throw new Error("Approval digest does not match the validated candidate");
  if (ageMs < -60_000 || ageMs > maxAgeMinutes * 60_000) throw new Error("Candidate is stale or future-dated; refresh and review it again");
  await writeArticleSnapshotAtomic(targetPath, candidate);
  console.log(JSON.stringify({ event: "article_snapshot_promoted", targetPath, contentDigest: candidate.contentDigest }));
}
