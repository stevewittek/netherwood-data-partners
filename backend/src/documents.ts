import { createHash } from "node:crypto";
import { lstat, readFile, readdir, realpath, stat } from "node:fs/promises";
import { basename, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { convert } from "html-to-text";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const SUPPORTED_EXTENSIONS = new Set([".txt", ".md", ".html", ".csv", ".json", ".pdf", ".docx"]);
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export type KnowledgeFile = { absolutePath: string; relativePath: string; modifiedUtc: Date };
export type ExtractedDocument = { title: string; url?: string; text: string; contentHash: Buffer };

function inside(root: string, candidate: string): boolean {
  return candidate === root || candidate.startsWith(`${root}${sep}`);
}

export async function resolveApprovedPath(root: string, requested: string): Promise<string> {
  if (!isAbsolute(root)) throw new Error("knowledge_root_must_be_absolute");
  const approvedRoot = await realpath(root);
  const candidate = await realpath(resolve(approvedRoot, requested));
  if (!inside(approvedRoot, candidate)) throw new Error("path_outside_knowledge_root");
  const info = await lstat(candidate);
  if (info.isSymbolicLink()) throw new Error("knowledge_symlink_not_allowed");
  return candidate;
}

export async function scanKnowledgeFiles(root: string): Promise<KnowledgeFile[]> {
  const approvedRoot = await realpath(root);
  const found: KnowledgeFile[] = [];
  async function walk(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const candidate = resolve(directory, entry.name);
      if (!inside(approvedRoot, candidate) || entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) await walk(candidate);
      if (!entry.isFile() || !SUPPORTED_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;
      const info = await stat(candidate);
      if (info.size <= 0 || info.size > MAX_FILE_BYTES) continue;
      found.push({ absolutePath: candidate, relativePath: relative(approvedRoot, candidate).split(sep).join("/"), modifiedUtc: info.mtime });
    }
  }
  await walk(approvedRoot);
  return found.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const candidate = value.trim();
  if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate.slice(0, 2_048);
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString().slice(0, 2_048) : undefined;
  } catch {
    return undefined;
  }
}

function filenameTitle(path: string): string {
  const value = basename(path, extname(path)).replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return value ? value.replace(/\b\w/g, (letter) => letter.toUpperCase()).slice(0, 300) : "Company document";
}

function frontMatter(value: string): { body: string; title?: string; url?: string } {
  if (!value.startsWith("---\n")) return { body: value };
  const end = value.indexOf("\n---\n", 4);
  if (end < 0 || end > 4_096) return { body: value };
  const metadata = new Map<string, string>();
  for (const line of value.slice(4, end).split("\n")) {
    const separator = line.indexOf(":");
    if (separator > 0) metadata.set(line.slice(0, separator).trim().toLowerCase(), line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, ""));
  }
  return { body: value.slice(end + 5), title: metadata.get("title")?.slice(0, 300), url: safeUrl(metadata.get("url")) };
}

function normalizeText(value: string): string {
  return value.replace(/\0/g, "").replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractDocument(path: string): Promise<ExtractedDocument> {
  const buffer = await readFile(path);
  if (buffer.length === 0 || buffer.length > MAX_FILE_BYTES) throw new Error("unsupported_file_size");
  const contentHash = createHash("sha256").update(buffer).digest();
  const extension = extname(path).toLowerCase();
  let text = "";
  let title = filenameTitle(path);
  let url: string | undefined;

  if (extension === ".pdf") {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try { text = (await parser.getText()).text; } finally { await parser.destroy(); }
  } else if (extension === ".docx") {
    text = (await mammoth.extractRawText({ buffer })).value;
  } else {
    const decoded = buffer.toString("utf8");
    if (decoded.includes("\0")) throw new Error("binary_text_file");
    if (extension === ".html") {
      const htmlTitle = decoded.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
      const canonical = decoded.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
        ?? decoded.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1];
      if (htmlTitle) title = normalizeText(convert(htmlTitle, { wordwrap: false })).slice(0, 300) || title;
      url = safeUrl(canonical);
      text = convert(decoded, { wordwrap: false, selectors: [{ selector: "script", format: "skip" }, { selector: "style", format: "skip" }] });
    } else if (extension === ".json") {
      const parsed: unknown = JSON.parse(decoded);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const record = parsed as Record<string, unknown>;
        if (typeof record.title === "string") title = record.title.trim().slice(0, 300) || title;
        url = safeUrl(record.url);
      }
      text = JSON.stringify(parsed, null, 2);
    } else {
      const parsed = frontMatter(decoded);
      text = parsed.body;
      if (parsed.title) title = parsed.title;
      url = parsed.url;
      if (extension === ".md" && !parsed.title) {
        const heading = text.match(/^#\s+(.+)$/m)?.[1]?.trim();
        if (heading) title = heading.slice(0, 300);
      }
    }
  }

  const normalized = normalizeText(text);
  if (!normalized) throw new Error("document_has_no_text");
  return { title, url, text: normalized.slice(0, 2_000_000), contentHash };
}

export function chunkDocument(text: string, maxChars = 1_200, overlapChars = 180): string[] {
  if (maxChars < 200 || overlapChars < 0 || overlapChars >= maxChars) throw new Error("invalid_chunk_settings");
  const paragraphs = normalizeText(text).split(/\n\n+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  const emit = (): void => {
    const value = current.trim();
    if (value) chunks.push(value);
    current = value.slice(Math.max(0, value.length - overlapChars));
  };
  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChars) {
      if (current) emit();
      for (let start = 0; start < paragraph.length; start += maxChars - overlapChars) {
        chunks.push(paragraph.slice(start, start + maxChars).trim());
      }
      current = "";
      continue;
    }
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > maxChars && current) emit();
    current = current ? `${current}\n\n${paragraph}` : paragraph;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((value, index, values) => value.length >= 40 && value !== values[index - 1]);
}
