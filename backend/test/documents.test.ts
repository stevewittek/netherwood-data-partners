import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { chunkDocument, extractDocument, resolveApprovedPath, scanKnowledgeFiles } from "../src/documents.ts";

test("scans only supported non-hidden files beneath the approved root", async () => {
  const parent = await mkdtemp(join(tmpdir(), "ndp-knowledge-"));
  const root = join(parent, "public");
  await mkdir(join(root, "nested"), { recursive: true });
  await writeFile(join(root, "services.md"), "# Services\n\nSQL Server performance tuning and troubleshooting.");
  await writeFile(join(root, "nested", "faq.json"), JSON.stringify({ title: "FAQ", url: "/faq", answer: "Approved" }));
  await writeFile(join(root, ".env.local"), "SECRET=do-not-read");
  await writeFile(join(root, "binary.exe"), Buffer.from([0, 1, 2]));
  await writeFile(join(parent, "outside.txt"), "private");
  await symlink(join(parent, "outside.txt"), join(root, "outside-link.txt"));
  try {
    const files = await scanKnowledgeFiles(root);
    assert.deepEqual(files.map((file) => file.relativePath), ["nested/faq.json", "services.md"]);
    await assert.rejects(() => resolveApprovedPath(root, "../outside.txt"), /outside_knowledge_root/);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test("extracts metadata, hashes content, and makes bounded chunks", async () => {
  const root = await mkdtemp(join(tmpdir(), "ndp-document-"));
  const path = join(root, "performance.md");
  await writeFile(path, "---\ntitle: Performance Tuning\nurl: /services/performance\n---\n# Performance\n\n" + "Evidence-based tuning. ".repeat(150));
  try {
    const first = await extractDocument(path);
    const second = await extractDocument(path);
    assert.equal(first.title, "Performance Tuning");
    assert.equal(first.url, "/services/performance");
    assert.equal(first.contentHash.toString("hex"), second.contentHash.toString("hex"));
    const chunks = chunkDocument(first.text, 400, 50);
    assert(chunks.length > 1);
    assert(chunks.every((chunk) => chunk.length <= 400));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
