import { createHash } from "node:crypto";
import { readFile, lstat } from "node:fs/promises";
import { join } from "node:path";
import { AssistantError } from "./store.ts";
export type Source = {
  id: string;
  title: string;
  text: string;
  approved: true;
  url?: string;
  expiresAt?: string;
};
export function publicUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  // Only same-site public citations. No raw/private document download URLs.
  return /^\/(?!\/)[a-zA-Z0-9/#?=_-]*$/.test(value) &&
    !value.startsWith("/admin")
    ? value
    : undefined;
}
export async function readKnowledge(root: string, now: number) {
  const path = join(root, "knowledge.json");
  const info = await lstat(path);
  if (info.isSymbolicLink() || !info.isFile() || info.size > 500_000)
    throw new AssistantError("invalid_knowledge");
  const raw = await readFile(path, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length > 100)
    throw new AssistantError("invalid_knowledge");
  const ids = new Set<string>();
  const sources: Source[] = [];
  for (const value of parsed) {
    if (!value || typeof value !== "object" || value.approved !== true)
      continue;
    if (
      typeof value.id !== "string" ||
      !/^[a-z0-9-]{1,80}$/.test(value.id) ||
      ids.has(value.id) ||
      typeof value.title !== "string" ||
      value.title.length > 200 ||
      typeof value.text !== "string" ||
      !value.text.trim() ||
      value.text.length > 50_000
    )
      throw new AssistantError("invalid_knowledge");
    ids.add(value.id);
    if (
      value.expiresAt &&
      (!Number.isFinite(Date.parse(value.expiresAt)) ||
        Date.parse(value.expiresAt) <= now)
    )
      continue;
    sources.push({
      id: value.id,
      title: value.title,
      text: value.text,
      approved: true,
      url: publicUrl(value.url),
      ...(value.expiresAt ? { expiresAt: value.expiresAt } : {}),
    });
  }
  if (!sources.some((source) => source.id === "business-profile"))
    throw new AssistantError("missing_business_profile");
  return {
    sources,
    digest: createHash("sha256").update(JSON.stringify(sources)).digest("hex"),
  };
}
export function retrieve(sources: Source[], question: string): Source[] {
  const words = [
    ...new Set(question.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []),
  ].slice(0, 80);
  const ranked = sources
    .filter((source) => source.id !== "business-profile")
    .map((source) => ({
      source,
      score: words.reduce(
        (n, word) =>
          n +
          (source.text.toLowerCase().includes(word) ? 1 : 0) +
          (source.title.toLowerCase().includes(word) ? 3 : 0),
        0,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.source);
  return [
    sources.find((source) => source.id === "business-profile")!,
    ...ranked,
  ].map((source) => ({ ...source, text: source.text.slice(0, 4500) }));
}
