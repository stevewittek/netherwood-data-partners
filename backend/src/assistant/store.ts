import { constants } from "node:fs";
import { mkdir, open, readFile, rename, unlink, lstat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

export type Turn = { role: "user" | "assistant"; content: string };
export type Session = {
  created: number;
  updated: number;
  turns: Turn[];
  topic: string;
  corpus: string;
  count: number;
  requests: Record<
    string,
    {
      status: "pending" | "done" | "failed";
      answer?: string;
      sources?: { title: string; url?: string }[];
    }
  >;
};
export type Inquiry = {
  id: string;
  session: string;
  submission: string;
  created: number;
  name: string;
  email: string;
  message: string;
  topic: string;
  status: "new" | "reviewed" | "closed";
  notification?: {
    status: "pending" | "sending" | "accepted" | "failed";
    attempts: number;
    nextAttempt: number;
    lastAttempt?: number;
    acceptedAt?: number;
  };
};
export type State = {
  version: 1;
  blocked: boolean;
  budgets: Record<string, number>;
  sessions: Record<string, Session>;
  inquiries: Inquiry[];
};
export const emptyState = (): State => ({
  version: 1,
  blocked: false,
  budgets: {},
  sessions: {},
  inquiries: [],
});
export class AssistantError extends Error {
  status: number;
  constructor(code: string, status = 503) {
    super(code);
    this.status = status;
  }
}
export async function privateWrite(path: string, value: unknown) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  const file = await open(
    temporary,
    constants.O_WRONLY |
      constants.O_CREAT |
      constants.O_EXCL |
      constants.O_NOFOLLOW,
    0o600,
  );
  try {
    await file.writeFile(JSON.stringify(value, null, 2));
    await file.sync();
  } finally {
    await file.close();
  }
  await rename(temporary, path);
}
export class AssistantStore {
  root: string;
  constructor(root: string) {
    this.root = resolve(root);
  }
  async initialize() {
    await mkdir(this.root, { recursive: true, mode: 0o700 });
    if ((await lstat(this.root)).isSymbolicLink())
      throw new AssistantError("unsafe_storage");
    const path = join(this.root, "state.json");
    const file = await open(
      path,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        constants.O_NOFOLLOW,
      0o600,
    );
    try {
      await file.writeFile(JSON.stringify(emptyState()));
      await file.sync();
    } finally {
      await file.close();
    }
  }
  async read(): Promise<State> {
    const path = join(this.root, "state.json");
    if (!(await lstat(path)).isFile() || (await lstat(path)).isSymbolicLink())
      throw new AssistantError("unsafe_storage");
    const bytes = await readFile(path, "utf8");
    if (bytes.length > 32_000_000) throw new AssistantError("storage_full");
    const data = JSON.parse(bytes) as State;
    if (
      data.version !== 1 ||
      !data.sessions ||
      !data.budgets ||
      !Array.isArray(data.inquiries) ||
      typeof data.blocked !== "boolean"
    )
      throw new AssistantError("invalid_storage");
    return data;
  }
  async change<T>(action: (state: State) => T): Promise<T> {
    // Cross-process lock: a crash leaves the lock in place (fail closed), never resets spending.
    let lock;
    try {
      lock = await open(join(this.root, "state.lock"), "wx", 0o600);
    } catch {
      throw new AssistantError("assistant_busy", 429);
    }
    try {
      const state = await this.read();
      const result = action(state);
      await privateWrite(join(this.root, "state.json"), state);
      return result;
    } finally {
      await lock.close();
      await unlink(join(this.root, "state.lock"));
    }
  }
  async purge(now: number) {
    await this.change((state) => {
      for (const [id, session] of Object.entries(state.sessions))
        if (now - session.updated > 30 * 86400_000) delete state.sessions[id];
      state.inquiries = state.inquiries.filter(
        (item) => now - item.created < 90 * 86400_000,
      );
    });
  }
}
