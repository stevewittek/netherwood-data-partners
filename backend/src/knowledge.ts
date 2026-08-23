export type KnowledgeSourceType = "document" | "database";

export type KnowledgeMatch = {
  sourceId: string;
  sourceType: KnowledgeSourceType;
  displayName: string;
  sourceUrl?: string;
  content: string;
  distance: number;
};

export type StoredKnowledgeSource = {
  sourceLocation: string;
  contentHashHex: string;
  chatbotVisible: boolean;
};

export type StructuredKnowledgeSource = {
  sourceLocation: string;
  displayName: string;
  sourceUrl?: string;
  content: string;
  lastModifiedUtc: Date;
};

export type KnowledgeChunkInput = {
  chunkNumber: number;
  content: string;
  embedding: number[];
};

export type ReplaceKnowledgeSourceInput = {
  sourceType: KnowledgeSourceType;
  displayName: string;
  sourceLocation: string;
  sourceUrl?: string;
  lastModifiedUtc: Date;
  contentHash: Buffer;
  chunks: KnowledgeChunkInput[];
};

export interface KnowledgeStore {
  searchKnowledge(embedding: number[], limit: number, maxDistance: number): Promise<KnowledgeMatch[]>;
  listKnowledgeSources(sourceType: KnowledgeSourceType): Promise<StoredKnowledgeSource[]>;
  listStructuredKnowledgeSources(): Promise<StructuredKnowledgeSource[]>;
  replaceKnowledgeSource(input: ReplaceKnowledgeSourceInput): Promise<boolean>;
  hideKnowledgeSource(sourceType: KnowledgeSourceType, sourceLocation: string): Promise<void>;
}

export const KNOWLEDGE_PROCEDURES = Object.freeze({
  search: "web.SearchChatbotKnowledge",
  listSources: "web.ListIndexedKnowledgeSources",
  listStructured: "web.GetApprovedStructuredContent",
  replace: "web.ReplaceKnowledgeSource",
  hide: "web.HideKnowledgeSource",
} as const);

export function isAllowlistedKnowledgeProcedure(value: string): boolean {
  return Object.values(KNOWLEDGE_PROCEDURES).includes(value as (typeof KNOWLEDGE_PROCEDURES)[keyof typeof KNOWLEDGE_PROCEDURES]);
}
