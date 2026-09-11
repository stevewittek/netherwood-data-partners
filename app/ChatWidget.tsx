"use client";

import { useEffect, useId, useState } from "react";
import type { FormEvent } from "react";

const approved = import.meta.env?.VITE_PUBLIC_CHAT_ENABLED === "true";
const endpoint = (import.meta.env?.VITE_VOYAGER_API_URL as string | undefined)?.replace(/\/$/, "");
const apiUrl = approved && endpoint?.startsWith("https://") ? endpoint : undefined;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Identifiers = { visitorId: string; sessionId: string; chatSessionId: string };
type Citation = { title: string; type: "document" | "database"; url?: string };

function safeCitationUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const candidate = value.trim();
  if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

function citations(value: unknown): Citation[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 10).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>;
    const title = typeof candidate.title === "string" ? candidate.title.trim().slice(0, 300) : "";
    const type = candidate.type === "database" ? "database" : candidate.type === "document" ? "document" : undefined;
    if (!title || !type) return [];
    const url = safeCitationUrl(candidate.url);
    return [{ title, type, ...(url ? { url } : {}) }];
  });
}

function storedId(storage: Storage, key: string): string {
  const existing = storage.getItem(key);
  if (existing && uuidPattern.test(existing)) return existing;
  const created = crypto.randomUUID();
  storage.setItem(key, created);
  return created;
}

function createIdentifiers(): Identifiers {
  try {
    return {
      visitorId: storedId(localStorage, "ndp.visitor"),
      sessionId: storedId(sessionStorage, "ndp.session"),
      chatSessionId: storedId(sessionStorage, "ndp.chat"),
    };
  } catch {
    return { visitorId: crypto.randomUUID(), sessionId: crypto.randomUUID(), chatSessionId: crypto.randomUUID() };
  }
}

function safeReferrer(): string | undefined {
  if (!document.referrer) return undefined;
  try {
    const value = new URL(document.referrer);
    return `${value.origin}${value.pathname}`;
  } catch {
    return undefined;
  }
}

export default function ChatWidget() {
  const panelId = useId();
  const [identifiers] = useState<Identifiers | undefined>(() => typeof window === "undefined" || !apiUrl ? undefined : createIdentifiers());
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [sources, setSources] = useState<Citation[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!apiUrl || !identifiers) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5_000);
    void fetch(`${apiUrl}/api/telemetry/page-view`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...identifiers,
        path: `${location.pathname}${location.hash}`.slice(0, 2_048),
        browserLanguage: navigator.language,
        referrer: safeReferrer(),
      }),
      keepalive: true,
      signal: controller.signal,
    }).catch(() => undefined).finally(() => window.clearTimeout(timeout));
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [identifiers]);

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || busy || !identifiers || !apiUrl) return;
    setBusy(true);
    setReply("");
    setSources([]);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 605_000);
    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...identifiers, message: trimmed, browserLanguage: navigator.language }),
        signal: controller.signal,
      });
      const body = await response.json() as { message?: string; sources?: unknown; error?: string };
      if (!response.ok) {
        if (response.status === 503 && body.error === "chat_busy") {
          setReply("The local assistant is helping another visitor. Please try again in about two minutes.");
          return;
        }
        throw new Error("unavailable");
      }
      if (!body.message) throw new Error("empty_response");
      setReply(body.message);
      setSources(citations(body.sources));
      setMessage("");
    } catch {
      setReply("Chat is temporarily unavailable. Please email contact@netherwooddatapartners.com.");
    } finally {
      window.clearTimeout(timeout);
      setBusy(false);
    }
  }

  if (!apiUrl) return null;
  return (
    <aside className="chat-widget" aria-label="Netherwood assistant">
      <button
        className="chat-toggle"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        Ask Netherwood
      </button>
      {open && (
        <div className="chat-panel" id={panelId}>
          <strong>How can we help?</strong>
          <p>Ask about software changes, moving data, practical support or a business project.</p>
          {reply && (
            <div className="chat-reply" role="status" aria-live="polite">
              <div>{reply}</div>
              {sources.length > 0 && (
                <div className="chat-sources">
                  <strong>Sources</strong>
                  <ol>
                    {sources.map((source, index) => (
                      <li key={`${source.type}:${source.title}:${source.url ?? index}`}>
                        {source.url
                          ? <a href={source.url}>{source.title}</a>
                          : source.title}
                        <span>{source.type === "database" ? "Company database" : "Company document"}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
          <form onSubmit={submit}>
            <label htmlFor={`${panelId}-message`}>Your question</label>
            <textarea
              id={`${panelId}-message`}
              maxLength={4_000}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={!identifiers || busy}
              required
            />
            <button className="button button-primary" disabled={!identifiers || busy}>
              {busy ? "Sending…" : "Send"}
            </button>
          </form>
          <p className="chat-notice">Do not share passwords or sensitive data. Chat records are retained for up to 90 days.</p>
        </div>
      )}
    </aside>
  );
}
