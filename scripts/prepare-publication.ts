import { resolve } from "node:path";
import { readArticleSnapshot, writeArticleSnapshotAtomic } from "../backend/src/article-snapshot.ts";

// Production imports an explicit SQL export. Local builds validate the tracked baseline.
const source = resolve(process.argv[2] ?? "pages-site/articles-snapshot.json");
const publication = await readArticleSnapshot(source);
if (process.argv[2]) await writeArticleSnapshotAtomic(resolve("pages-site/articles-snapshot.json"), publication);
console.log(JSON.stringify({ event: "publication_validated", contentDigest: publication.contentDigest, articleCount: publication.articleCount, generatedAt: publication.generatedAt }));
