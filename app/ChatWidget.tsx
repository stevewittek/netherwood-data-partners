"use client";

import { useEffect, useId, useState } from "react";
import type { FormEvent } from "react";

const apiUrl = (import.meta.env?.VITE_VOYAGER_API_URL as string | undefined)?.replace(/\/$/, "");
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Identifiers = { visitorId: string; sessionId: string; chatSessionId: string };

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
  const [identifiers] = useState<Identifiers | undefined>(() => typeof window === "undefined" ? undefined : createIdentifiers());
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
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
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 605_000);
    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...identifiers, message: trimmed, browserLanguage: navigator.language }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("unavailable");
      const body = await response.json() as { message?: string };
      if (!body.message) throw new Error("empty_response");
      setReply(body.message);
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
          <p>Ask about SQL Server, database performance, migrations, or a project.</p>
          {reply && <div className="chat-reply" role="status" aria-live="polite">{reply}</div>}
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
