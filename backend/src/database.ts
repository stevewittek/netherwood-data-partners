import sql from "mssql";
import type { SqlConfig } from "./config.ts";
import { ARTICLE_PROCEDURES, mapArticle, mapArticleSummary } from "./article-database.ts";
import type { ArticleStore } from "./articles.ts";
import {
  KNOWLEDGE_PROCEDURES,
  type KnowledgeMatch,
  type KnowledgeStore,
  type ReplaceKnowledgeSourceInput,
  type StoredKnowledgeSource,
  type StructuredKnowledgeSource,
} from "./knowledge.ts";

export type RequestContext = {
  visitorId: string;
  visitorSessionId: string;
  now: Date;
  browserLanguage?: string;
  referrer?: string;
  userAgent?: string;
  ipAbuseHash?: Buffer;
  ipAbuseHashExpiresAtUtc?: Date;
};

export type PageViewInput = RequestContext & { path: string };
export type ChatMessageInput = RequestContext & { chatSessionId: string; message: string };
export type ChatReplyInput = { chatSessionId: string; message: string; providerResponseId: string; now: Date };
export type LeadInput = RequestContext & {
  leadId: string;
  contactId: string;
  chatSessionId?: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  project: string;
};

export interface Database extends KnowledgeStore, ArticleStore {
  ping(): Promise<void>;
  recordPageView(input: PageViewInput): Promise<void>;
  recordChatMessage(input: ChatMessageInput): Promise<void>;
  recordChatReply(input: ChatReplyInput): Promise<void>;
  recordLead(input: LeadInput): Promise<void>;
  close(): Promise<void>;
}

function addContext(request: sql.Request, input: RequestContext): void {
  request.input("visitorId", sql.UniqueIdentifier, input.visitorId);
  request.input("visitorSessionId", sql.UniqueIdentifier, input.visitorSessionId);
  request.input("now", sql.DateTime2(3), input.now);
  request.input("browserLanguage", sql.NVarChar(32), input.browserLanguage ?? null);
  request.input("referrer", sql.NVarChar(2048), input.referrer ?? null);
  request.input("userAgent", sql.NVarChar(1024), input.userAgent ?? null);
  request.input("ipAbuseHash", sql.VarBinary(32), input.ipAbuseHash ?? null);
  request.input("ipAbuseHashExpiresAtUtc", sql.DateTime2(3), input.ipAbuseHashExpiresAtUtc ?? null);
}

const UPSERT_VISIT = `
IF EXISTS (SELECT 1 FROM web.Visitors WHERE VisitorId = @visitorId)
  UPDATE web.Visitors
  SET LastSeenUtc = CASE WHEN LastSeenUtc < @now THEN @now ELSE LastSeenUtc END,
      BrowserLanguage = COALESCE(@browserLanguage, BrowserLanguage)
  WHERE VisitorId = @visitorId;
ELSE
  INSERT web.Visitors(VisitorId, FirstSeenUtc, LastSeenUtc, BrowserLanguage)
  VALUES(@visitorId, @now, @now, @browserLanguage);

IF EXISTS
(
  SELECT 1 FROM web.VisitorSessions
  WHERE SessionId = @visitorSessionId AND VisitorId <> @visitorId
)
  THROW 51001, 'Visitor session ownership mismatch.', 1;

IF EXISTS (SELECT 1 FROM web.VisitorSessions WHERE SessionId = @visitorSessionId)
  UPDATE web.VisitorSessions
  SET LastSeenUtc = CASE WHEN LastSeenUtc < @now THEN @now ELSE LastSeenUtc END,
      Referrer = COALESCE(Referrer, @referrer),
      UserAgent = COALESCE(@userAgent, UserAgent),
      IpAbuseHash = COALESCE(@ipAbuseHash, IpAbuseHash),
      IpAbuseHashExpiresAtUtc = COALESCE(@ipAbuseHashExpiresAtUtc, IpAbuseHashExpiresAtUtc)
  WHERE SessionId = @visitorSessionId AND VisitorId = @visitorId;
ELSE
  INSERT web.VisitorSessions
    (SessionId, VisitorId, StartedAtUtc, LastSeenUtc, Referrer, UserAgent, IpAbuseHash, IpAbuseHashExpiresAtUtc)
  VALUES
    (@visitorSessionId, @visitorId, @now, @now, @referrer, @userAgent, @ipAbuseHash, @ipAbuseHashExpiresAtUtc);`;

export function createDatabase(config: SqlConfig): Database {
  let poolPromise: Promise<sql.ConnectionPool> | undefined;

  async function pool(): Promise<sql.ConnectionPool> {
    if (!poolPromise) {
      const candidate = new sql.ConnectionPool({
        server: config.server,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        pool: { max: 5, min: 0, idleTimeoutMillis: 30_000 },
        connectionTimeout: 5_000,
        requestTimeout: 8_000,
        options: {
          encrypt: config.encrypt,
          trustServerCertificate: config.trustServerCertificate,
          enableArithAbort: true,
        },
      });
      candidate.on("error", () => undefined);
      poolPromise = candidate.connect().catch((error) => {
        poolPromise = undefined;
        throw error;
      });
    }
    return poolPromise;
  }

  async function transaction(work: (transaction: sql.Transaction) => Promise<void>): Promise<void> {
    const tx = new sql.Transaction(await pool());
    await tx.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);
    try {
      await work(tx);
      await tx.commit();
    } catch (error) {
      try { await tx.rollback(); } catch { /* preserve the original error */ }
      throw error;
    }
  }

  return {
    async ping() {
      await (await pool()).request().query("SELECT 1 AS ready;");
    },
    async recordPageView(input) {
      await transaction(async (tx) => {
        const request = new sql.Request(tx);
        addContext(request, input);
        request.input("path", sql.NVarChar(2048), input.path);
        await request.query(`${UPSERT_VISIT}\nINSERT web.PageViews(SessionId, Path, ViewedAtUtc) VALUES(@visitorSessionId, @path, @now);`);
      });
    },
    async recordChatMessage(input) {
      await transaction(async (tx) => {
        const request = new sql.Request(tx);
        addContext(request, input);
        request.input("chatSessionId", sql.UniqueIdentifier, input.chatSessionId);
        request.input("message", sql.NVarChar(sql.MAX), input.message);
        await request.query(`${UPSERT_VISIT}
IF EXISTS
(
  SELECT 1 FROM web.ChatSessions
  WHERE ChatSessionId = @chatSessionId
    AND (VisitorSessionId IS NULL OR VisitorSessionId <> @visitorSessionId)
)
  THROW 51002, 'Chat session ownership mismatch.', 1;
IF EXISTS (SELECT 1 FROM web.ChatSessions WHERE ChatSessionId = @chatSessionId)
  UPDATE web.ChatSessions SET LastMessageAtUtc = @now WHERE ChatSessionId = @chatSessionId;
ELSE
  INSERT web.ChatSessions(ChatSessionId, VisitorSessionId, StartedAtUtc, LastMessageAtUtc, Status)
  VALUES(@chatSessionId, @visitorSessionId, @now, @now, 'active');
INSERT web.ChatMessages(ChatSessionId, Role, Content, CreatedAtUtc)
VALUES(@chatSessionId, 'user', @message, @now);`);
      });
    },
    async recordChatReply(input) {
      await transaction(async (tx) => {
        const request = new sql.Request(tx);
        request.input("chatSessionId", sql.UniqueIdentifier, input.chatSessionId);
        request.input("message", sql.NVarChar(sql.MAX), input.message);
        request.input("providerResponseId", sql.NVarChar(200), input.providerResponseId);
        request.input("now", sql.DateTime2(3), input.now);
        await request.query(`
UPDATE web.ChatSessions SET LastMessageAtUtc = @now WHERE ChatSessionId = @chatSessionId;
INSERT web.ChatMessages(ChatSessionId, Role, Content, ProviderResponseId, CreatedAtUtc)
VALUES(@chatSessionId, 'assistant', @message, @providerResponseId, @now);`);
      });
    },
    async recordLead(input) {
      await transaction(async (tx) => {
        const request = new sql.Request(tx);
        addContext(request, input);
        request.input("leadId", sql.UniqueIdentifier, input.leadId);
        request.input("contactId", sql.UniqueIdentifier, input.contactId);
        request.input("chatSessionId", sql.UniqueIdentifier, input.chatSessionId ?? null);
        request.input("name", sql.NVarChar(200), input.name);
        request.input("email", sql.NVarChar(320), input.email);
        request.input("company", sql.NVarChar(200), input.company ?? null);
        request.input("phone", sql.NVarChar(50), input.phone ?? null);
        request.input("project", sql.NVarChar(sql.MAX), input.project);
        await request.query(`${UPSERT_VISIT}
IF @chatSessionId IS NOT NULL AND NOT EXISTS
(
  SELECT 1 FROM web.ChatSessions
  WHERE ChatSessionId = @chatSessionId AND VisitorSessionId = @visitorSessionId
)
  THROW 51003, 'Lead chat session ownership mismatch.', 1;
INSERT web.Contacts(ContactId, Name, Email, Company, Phone, CreatedAtUtc, ModifiedAtUtc)
VALUES(@contactId, @name, @email, @company, @phone, @now, @now);
INSERT web.Leads(LeadId, ContactId, ChatSessionId, ProjectInformation, Status, CreatedAtUtc, ModifiedAtUtc)
VALUES(@leadId, @contactId, @chatSessionId, @project, 'new', @now, @now);`);
      });
    },
    async listPublishedArticles(input) {
      const request = (await pool()).request();
      request.input("Category", sql.NVarChar(100), input.category ?? null);
      request.input("Tag", sql.NVarChar(50), input.tag ?? null);
      request.input("Search", sql.NVarChar(200), input.search ?? null);
      request.input("Page", sql.Int, input.page);
      request.input("PageSize", sql.Int, input.pageSize);
      const result = await request.execute(ARTICLE_PROCEDURES.listPublished);
      const articles = result.recordset.map((row: Record<string, unknown>) => mapArticleSummary(row));
      const recordsets = result.recordsets as unknown as Array<Array<Record<string, unknown>>>;
      return {
        articles,
        page: input.page,
        pageSize: input.pageSize,
        total: Number(recordsets[1]?.[0]?.TotalCount ?? result.recordset[0]?.TotalCount ?? 0),
      };
    },
    async getPublishedArticle(slug) {
      const request = (await pool()).request();
      request.input("Slug", sql.NVarChar(200), slug);
      const result = await request.execute(ARTICLE_PROCEDURES.getPublished);
      const row = result.recordset[0] as Record<string, unknown> | undefined;
      return row ? mapArticle(row) : undefined;
    },
    async searchKnowledge(embedding, limit, maxDistance) {
      const request = (await pool()).request();
      request.input("QueryEmbedding", sql.NVarChar(sql.MAX), JSON.stringify(embedding));
      request.input("ResultLimit", sql.Int, limit);
      request.input("MaxDistance", sql.Float, maxDistance);
      const result = await request.execute(KNOWLEDGE_PROCEDURES.search);
      return result.recordset.map((row: Record<string, unknown>): KnowledgeMatch => ({
        sourceId: String(row.SourceId),
        sourceType: row.SourceType === "database" ? "database" : "document",
        displayName: String(row.DisplayName),
        sourceUrl: typeof row.SourceUrl === "string" ? row.SourceUrl : undefined,
        content: String(row.Content),
        distance: Number(row.Distance),
      }));
    },
    async listKnowledgeSources(sourceType) {
      const request = (await pool()).request();
      request.input("SourceType", sql.VarChar(20), sourceType);
      const result = await request.execute(KNOWLEDGE_PROCEDURES.listSources);
      return result.recordset.map((row: Record<string, unknown>): StoredKnowledgeSource => ({
        sourceLocation: String(row.SourceLocation),
        contentHashHex: Buffer.isBuffer(row.ContentHash) ? row.ContentHash.toString("hex") : "",
        chatbotVisible: Boolean(row.ChatbotVisible),
      }));
    },
    async listStructuredKnowledgeSources() {
      const result = await (await pool()).request().execute(KNOWLEDGE_PROCEDURES.listStructured);
      return result.recordset.map((row: Record<string, unknown>): StructuredKnowledgeSource => ({
        sourceLocation: `sql:${String(row.ContentKey)}`,
        displayName: String(row.DisplayName),
        sourceUrl: typeof row.SourceUrl === "string" ? row.SourceUrl : undefined,
        content: String(row.Content),
        lastModifiedUtc: row.UpdatedUtc instanceof Date ? row.UpdatedUtc : new Date(String(row.UpdatedUtc)),
      }));
    },
    async replaceKnowledgeSource(input: ReplaceKnowledgeSourceInput) {
      const chunksJson = JSON.stringify(input.chunks.map((chunk) => ({
        chunkNumber: chunk.chunkNumber,
        content: chunk.content,
        embedding: chunk.embedding,
      })));
      const request = (await pool()).request();
      request.input("SourceType", sql.VarChar(20), input.sourceType);
      request.input("DisplayName", sql.NVarChar(300), input.displayName);
      request.input("SourceLocation", sql.NVarChar(800), input.sourceLocation);
      request.input("SourceUrl", sql.NVarChar(2048), input.sourceUrl ?? null);
      request.input("LastModifiedUtc", sql.DateTime2(3), input.lastModifiedUtc);
      request.input("ContentHash", sql.VarBinary(32), input.contentHash);
      request.input("ChunksJson", sql.NVarChar(sql.MAX), chunksJson);
      const result = await request.execute(KNOWLEDGE_PROCEDURES.replace);
      return Number(result.recordset[0]?.Changed ?? 0) === 1;
    },
    async hideKnowledgeSource(sourceType, sourceLocation) {
      const request = (await pool()).request();
      request.input("SourceType", sql.VarChar(20), sourceType);
      request.input("SourceLocation", sql.NVarChar(800), sourceLocation);
      await request.execute(KNOWLEDGE_PROCEDURES.hide);
    },
    async close() {
      if (!poolPromise) return;
      try { await (await poolPromise).close(); } finally { poolPromise = undefined; }
    },
  };
}
