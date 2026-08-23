import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { isAllowlistedKnowledgeProcedure, KNOWLEDGE_PROCEDURES } from "../src/knowledge.ts";

test("knowledge SQL access is restricted to fixed stored procedures", () => {
  assert.deepEqual(Object.values(KNOWLEDGE_PROCEDURES).sort(), [
    "web.GetApprovedStructuredContent",
    "web.HideKnowledgeSource",
    "web.ListIndexedKnowledgeSources",
    "web.ReplaceKnowledgeSource",
    "web.SearchChatbotKnowledge",
  ]);
  assert.equal(isAllowlistedKnowledgeProcedure("web.SearchChatbotKnowledge"), true);
  assert.equal(isAllowlistedKnowledgeProcedure("SELECT * FROM sys.tables"), false);
});

test("exact vector retrieval filters ChatbotVisible sources without preview vector search", async () => {
  const migration = await readFile(new URL("../sql/migrations/003_chatbot_knowledge.sql", import.meta.url), "utf8");
  assert.match(migration, /Embedding vector\(768\) NOT NULL/i);
  assert.match(migration, /VECTOR_DISTANCE\('cosine'/);
  assert.match(migration, /source\.ChatbotVisible = 1/);
  assert.doesNotMatch(migration, /VECTOR_SEARCH\s*\(/i);
  assert.doesNotMatch(migration, /PREVIEW_FEATURES/i);
});
