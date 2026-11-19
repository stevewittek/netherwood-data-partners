import { createHash, randomBytes, randomUUID } from "node:crypto";
import { readFile, lstat } from "node:fs/promises";
import { join } from "node:path";
import {
  AssistantError,
  AssistantStore,
  type State,
  type Session,
} from "./store.ts";
import { readKnowledge, retrieve } from "./knowledge.ts";
import { scopeReply } from "./scope.ts";
import {
  createAnswerModel,
  INPUT_RATE,
  OUTPUT_RATE,
  requestBody,
  reserveMicroUsd,
  type ModelCall,
} from "./provider.ts";

export type Credit = {
  id: string;
  limitMicroUsd: number;
  dailyMicroUsd: number;
  expiresAt: string;
  verifiedAt: string;
};
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const day = (now: number) => new Date(now).toISOString().slice(0, 10);
const requestId = /^[a-zA-Z0-9-]{8,80}$/;
export class AssistantService {
  store: AssistantStore;
  model: ModelCall;
  keyPresent: boolean;
  clock: () => number;
  constructor(root: string, key: string, model?: ModelCall, clock = Date.now) {
    this.store = new AssistantStore(root);
    this.keyPresent = Boolean(key);
    this.model = model ?? createAnswerModel(key);
    this.clock = clock;
  }
  async credit(): Promise<Credit> {
    const path = join(this.store.root, "credit.json");
    const info = await lstat(path);
    if (!info.isFile() || info.isSymbolicLink() || info.size > 4096)
      throw new AssistantError("credit_unverified");
    const c = JSON.parse(await readFile(path, "utf8")) as Credit;
    const now = this.clock();
    const verified = Date.parse(c.verifiedAt);
    const expiry = Date.parse(c.expiresAt);
    if (
      !/^[a-zA-Z0-9-]{1,80}$/.test(c.id) ||
      !Number.isSafeInteger(c.limitMicroUsd) ||
      c.limitMicroUsd <= 0 ||
      c.limitMicroUsd > 100_000_000 ||
      !Number.isSafeInteger(c.dailyMicroUsd) ||
      c.dailyMicroUsd <= 0 ||
      c.dailyMicroUsd > c.limitMicroUsd ||
      !Number.isFinite(verified) ||
      verified > now ||
      now - verified > 86400_000 ||
      !Number.isFinite(expiry) ||
      expiry <= now
    )
      throw new AssistantError("credit_unverified");
    return c;
  }
  check(state: State, credit: Credit, amount = 1) {
    if (state.blocked || !this.keyPresent)
      throw new AssistantError("chat_unavailable");
    const total = state.budgets[credit.id] ?? 0;
    const daily = state.budgets[`day-${day(this.clock())}`] ?? 0;
    if (
      !Number.isSafeInteger(total) ||
      total < 0 ||
      !Number.isSafeInteger(daily) ||
      daily < 0
    )
      throw new AssistantError("invalid_budget");
    if (
      total + amount > credit.limitMicroUsd ||
      daily + amount > credit.dailyMicroUsd
    )
      throw new AssistantError("budget_exhausted");
  }
  async available() {
    try {
      const c = await this.credit();
      this.check(await this.store.read(), c, 50_000);
      await readKnowledge(this.store.root, this.clock());
      return true;
    } catch {
      return false;
    }
  }
  session(state: State, token: string): Session {
    if (!/^[a-f0-9]{64}$/.test(token))
      throw new AssistantError("session_expired", 401);
    const s = state.sessions[hash(token)];
    if (!s || this.clock() - s.updated > 30 * 86400_000)
      throw new AssistantError("session_expired", 401);
    return s;
  }
  async start() {
    const credit = await this.credit();
    const knowledge = await readKnowledge(this.store.root, this.clock());
    const token = randomBytes(32).toString("hex");
    const now = this.clock();
    await this.store.change((s) => {
      this.check(s, credit, 50_000);
      for (const [id, session] of Object.entries(s.sessions))
        if (now - session.updated > 30 * 86400_000) delete s.sessions[id];
      s.inquiries = s.inquiries.filter(
        (item) => now - item.created < 90 * 86400_000,
      );
      if (Object.keys(s.sessions).length >= 1000)
        throw new AssistantError("capacity_reached");
      s.sessions[hash(token)] = {
        created: now,
        updated: now,
        turns: [],
        topic: "",
        corpus: knowledge.digest,
        count: 0,
        requests: {},
      };
    });
    return { token };
  }
  async history(token: string) {
    const knowledge = await readKnowledge(this.store.root, this.clock());
    return this.store.change((state) => {
      const session = this.session(state, token);
      if (session.corpus !== knowledge.digest) {
        if (Object.values(session.requests).some((r) => r.status === "pending"))
          throw new AssistantError("answer_pending", 409);
        session.turns = [];
        session.requests = {};
        session.corpus = knowledge.digest;
      }
      return { turns: session.turns };
    });
  }
  async message(token: string, id: string, message: string) {
    if (
      !requestId.test(id) ||
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 4000
    )
      throw new AssistantError("invalid_message", 400);
    const credit = await this.credit();
    const now = this.clock();
    const knowledge = await readKnowledge(this.store.root, now);
    const sources = retrieve(knowledge.sources, message);
    const dailyKey = `day-${day(now)}`;
    const prepared = await this.store.change((state) => {
      const session = this.session(state, token);
      if (session.corpus !== knowledge.digest) {
        session.turns = [];
        session.requests = {};
        session.corpus = knowledge.digest;
      }
      const existing = session.requests[id];
      if (existing?.status === "done")
        return {
          cached: { answer: existing.answer!, sources: existing.sources! },
        };
      if (existing)
        throw new AssistantError(
          existing.status === "pending" ? "answer_pending" : "request_failed",
          409,
        );
      if (
        Object.values(session.requests).some(
          (item) => item.status === "pending",
        )
      )
        throw new AssistantError("answer_pending", 409);
      if (session.count >= 20)
        throw new AssistantError("conversation_limit", 429);
      const redirect = scopeReply(message);
      if (redirect) {
        session.count++;
        session.updated = now;
        session.requests[id] = { status: "done", answer: redirect, sources: [] };
        // Do not persist rejected input: it might contain a pasted credential.
        return { cached: { answer: redirect, sources: [] } };
      }
      const turns = [
        ...session.turns.slice(-8),
        { role: "user" as const, content: message.trim() },
      ];
      const reserved = reserveMicroUsd(requestBody(turns, sources));
      this.check(state, credit, reserved);
      state.budgets[credit.id] = (state.budgets[credit.id] ?? 0) + reserved;
      state.budgets[dailyKey] = (state.budgets[dailyKey] ?? 0) + reserved;
      session.requests[id] = { status: "pending" };
      session.count++;
      session.updated = now;
      return { reserved, turns };
    });
    if ("cached" in prepared) return prepared.cached!;
    try {
      const result = await this.model({
        turns: prepared.turns,
        sources,
        safetyId: hash(token),
      });
      if (
        !Number.isSafeInteger(result.inputTokens) ||
        result.inputTokens < 0 ||
        !Number.isSafeInteger(result.outputTokens) ||
        result.outputTokens < 0
      )
        throw new AssistantError("missing_usage");
      const actual = Math.ceil(
        result.inputTokens * INPUT_RATE + result.outputTokens * OUTPUT_RATE,
      );
      const stillCurrent =
        (await readKnowledge(this.store.root, this.clock())).digest ===
        knowledge.digest;
      const citations = sources
        .filter((source) => result.sourceIds.includes(source.id))
        .map(({ title, url }) => ({ title, url }));
      await this.store.change((state) => {
        state.budgets[credit.id] += actual - prepared.reserved;
        state.budgets[dailyKey] += actual - prepared.reserved;
        if (actual > prepared.reserved) state.blocked = true;
        const session = this.session(state, token);
        session.requests[id] =
          stillCurrent && actual <= prepared.reserved
            ? { status: "done", answer: result.answer, sources: citations }
            : { status: "failed" };
        if (stillCurrent && actual <= prepared.reserved) {
          session.turns = [
            ...prepared.turns,
            { role: "assistant" as const, content: result.answer },
          ].slice(-10);
          session.topic = result.topic;
        }
        session.updated = this.clock();
      });
      if (!stillCurrent) throw new AssistantError("knowledge_changed", 409);
      if (actual > prepared.reserved)
        throw new AssistantError("budget_estimate_exceeded");
      return { answer: result.answer, sources: citations };
    } catch (error) {
      // Unknown/failed provider calls keep their full reservation. Never automatically retry spending.
      await this.store.change((state) => {
        const session = this.session(state, token);
        session.requests[id] = { status: "failed" };
        if (
          error instanceof AssistantError &&
          ["credit_exhausted", "model_unavailable", "missing_usage"].includes(
            error.message,
          )
        )
          state.blocked = true;
      });
      throw error;
    }
  }
  async inquiry(token: string, body: Record<string, unknown>) {
    const { id, name, email, message, consent } = body;
    if (
      typeof id !== "string" ||
      !requestId.test(id) ||
      consent !== true ||
      typeof name !== "string" ||
      name.trim().length < 1 ||
      name.length > 120 ||
      typeof email !== "string" ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 4000
    )
      throw new AssistantError("invalid_inquiry", 400);
    return this.store.change((state) => {
      const session = this.session(state, token);
      const found = state.inquiries.find(
        (item) => item.session === hash(token) && item.submission === id,
      );
      if (found) return { saved: true, reference: found.id };
      if (
        state.inquiries.length >= 1000 ||
        state.inquiries.filter((item) => item.session === hash(token)).length >=
          3
      )
        throw new AssistantError("inquiry_limit", 429);
      const reference = randomUUID();
      state.inquiries.push({
        id: reference,
        session: hash(token),
        submission: id,
        created: this.clock(),
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        topic: session.topic,
        status: "new",
      });
      return { saved: true, reference };
    });
  }
}
