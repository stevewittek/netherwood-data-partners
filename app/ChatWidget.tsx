"use client";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { chatbotTheme as theme } from "./content/chatbot";
import "./chatbot.css";

const configured = (
  import.meta.env?.VITE_ASSISTANT_API_URL as string | undefined
)?.replace(/\/$/, "");
const enabled = import.meta.env?.VITE_PUBLIC_CHAT_ENABLED === "true";
const endpoint =
  configured &&
  (configured.startsWith("https://") ||
    (import.meta.env?.DEV &&
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(configured)))
    ? configured
    : undefined;
type Source = { title: string; url?: string };
type Entry = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
};
const safeSources = (value: unknown): Source[] =>
  !Array.isArray(value)
    ? []
    : value
        .slice(0, 10)
        .flatMap((s) =>
          s && typeof s.title === "string"
            ? [
                {
                  title: s.title.slice(0, 200),
                  url:
                    typeof s.url === "string" &&
                    /^\/(?!\/)[a-zA-Z0-9/#?=_-]*$/.test(s.url)
                      ? s.url
                      : undefined,
                },
              ]
            : [],
        );
function Mark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M8 10h24v18H19l-7 6v-6H8V10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M14 23V15l12 8V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export default function ChatWidget() {
  const panel = useRef<HTMLElement>(null);
  const id = useId();
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [contact, setContact] = useState(false);
  const [saved, setSaved] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const token = useRef("");
  const launcher = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const contactName = useRef<HTMLInputElement>(null);
  const sendLock = useRef(false);
  const inquiryId = useRef("");
  const restored = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    if (!enabled || !endpoint || location.pathname.startsWith("/admin")) return;
    const controller = new AbortController();
    async function check() {
      try {
        const r = await fetch(`${endpoint}/api/assistant/availability`, {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(5000),
          ]),
        });
        const data = await r.json();
        if (!controller.signal.aborted)
          setAvailable(r.ok && data.enabled === true);
      } catch {
        if (!controller.signal.aborted) setAvailable(false);
      }
    }
    try {
      token.current = sessionStorage.getItem("ndp.assistant.token") ?? "";
    } catch {
      /* tab storage is optional */
    }
    void check();
    const timer = window.setInterval(check, 60_000);
    return () => {
      mounted.current = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const check = () =>
      setCanSpeak(
        window.speechSynthesis
          .getVoices()
          .some((v) => v.localService && v.lang.startsWith("en")),
      );
    check();
    window.speechSynthesis.addEventListener("voiceschanged", check);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", check);
      window.speechSynthesis.cancel();
    };
  }, []);
  useEffect(() => {
    if (open) {
      if (contact) contactName.current?.focus();
      else field.current?.focus();
    }
  }, [open, contact]);
  useEffect(() => {
    log.current?.scrollTo({
      top: log.current.scrollHeight,
      behavior: "instant",
    });
  }, [entries, busy]);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        !panel.current?.contains(document.activeElement)
      )
        return;
      event.preventDefault();
      setOpen(false);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setSpeaking(false);
      launcher.current?.focus();
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  async function request(path: string, data: unknown) {
    const r = await fetch(`${endpoint}/api/assistant/${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token.current ? { authorization: `Bearer ${token.current}` } : {}),
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(30_000),
    });
    const result = await r.json();
    if (!r.ok) {
      if (r.status === 503) setAvailable(false);
      if (r.status === 401) token.current = "";
      throw new Error(
        r.status === 429
          ? "Chat is busy or has reached its limit. Please use the contact form."
          : r.status === 401
            ? "This conversation has expired. Start a new chat."
            : "Chat is temporarily unavailable. You can still contact Netherwood Data Partners using the link below.",
      );
    }
    return result;
  }
  async function session() {
    if (!token.current) {
      const result = await request("session", {});
      if (typeof result.token !== "string")
        throw new Error("Unable to start chat.");
      token.current = result.token;
      restored.current = true;
      try {
        sessionStorage.setItem("ndp.assistant.token", result.token);
      } catch {
        /* memory-only fallback */
      }
    }
  }
  async function send(text: string) {
    const value = text.trim();
    if (!value || sendLock.current || !available) return;
    sendLock.current = true;
    setBusy(true);
    setError("");
    setQuestion("");
    const requestId = crypto.randomUUID();
    setEntries((old) => [...old, { id: requestId, role: "user", text: value }]);
    try {
      await session();
      const result = await request("message", {
        id: requestId,
        message: value,
      });
      if (typeof result.answer !== "string")
        throw new Error("No answer was received. Please use the contact form.");
      if (mounted.current)
        setEntries((old) => [
          ...old,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: result.answer,
            sources: safeSources(result.sources),
          },
        ]);
    } catch (e) {
      if (mounted.current) {
        setError(e instanceof Error ? e.message : "Chat is unavailable.");
        setQuestion(value);
      }
    } finally {
      sendLock.current = false;
      if (mounted.current) {
        setBusy(false);
        field.current?.focus();
      }
    }
  }
  async function show() {
    setOpen(true);
    if (restored.current || !token.current) return;
    restored.current = true;
    sendLock.current = true;
    setBusy(true);
    try {
      const result = await request("history", {});
      if (Array.isArray(result.turns))
        setEntries(
          result.turns
            .filter(
              (t: { role: string; content: string }) =>
                (t.role === "user" || t.role === "assistant") &&
                typeof t.content === "string",
            )
            .map((t: { role: "user" | "assistant"; content: string }) => ({
              id: crypto.randomUUID(),
              role: t.role,
              text: t.content,
            })),
        );
    } catch {
      token.current = "";
      try {
        sessionStorage.removeItem("ndp.assistant.token");
      } catch {
        /* optional storage */
      }
    } finally {
      sendLock.current = false;
      setBusy(false);
    }
  }
  function close() {
    setOpen(false);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    launcher.current?.focus();
  }
  function newChat() {
    token.current = "";
    try {
      sessionStorage.removeItem("ndp.assistant.token");
    } catch {
      /* optional storage */
    }
    setEntries([]);
    setQuestion("");
    setError("");
    setContact(false);
    setSaved(false);
    inquiryId.current = "";
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    field.current?.focus();
  }
  function speak(text: string) {
    window.speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.localService && v.lang.startsWith("en"));
    if (!voice) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.onend = utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }
  async function saveInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sendLock.current) return;
    const data = new FormData(event.currentTarget);
    sendLock.current = true;
    setBusy(true);
    setError("");
    try {
      await session();
      inquiryId.current ||= crypto.randomUUID();
      const result = await request("inquiry", {
        id: inquiryId.current,
        name: data.get("name"),
        email: data.get("email"),
        message: data.get("message"),
        consent: data.get("consent") === "on",
      });
      if (result.saved === true) setSaved(true);
      else throw new Error("Unable to save. Please use the contact form.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      sendLock.current = false;
      setBusy(false);
    }
  }
  if (!available && !open) return null;
  return (
    <aside
      className="ndp-chat"
      aria-label="Netherwood AI assistant"
      style={
        {
          "--chat-ink": theme.color,
          "--chat-accent": theme.accent,
          "--chat-paper": theme.paper,
        } as CSSProperties
      }
    >
      {open && (
        <section
          ref={panel}
          className="ndp-chat-panel"
          id={id}
          role="dialog"
          tabIndex={-1}
          aria-modal="false"
          aria-labelledby={`${id}-title`}
        >
          <header className="ndp-chat-header">
            <span className="ndp-chat-mark">
              {theme.portraitUrl ? (
                <img src={theme.portraitUrl} alt="" />
              ) : (
                <Mark />
              )}
            </span>
            <div>
              <h2 id={`${id}-title`}>{theme.name}</h2>
              <p>{theme.subtitle}</p>
            </div>
            <button
              className="ndp-chat-icon"
              type="button"
              aria-label="Close chat"
              onClick={close}
            >
              ×
            </button>
          </header>
          <div className="ndp-chat-toolbar">
            <span>
              <i aria-hidden="true" />
              {available ? "AI assistant" : "Chat unavailable"}
            </span>
            <button onClick={newChat} disabled={busy} type="button">
              New chat
            </button>
          </div>
          {contact ? (
            <div className="ndp-chat-contact">
              {saved ? (
                <div role="status">
                  <h3>Inquiry saved.</h3>
                  <p>
                    Your message is in Steven’s private inquiry inbox. This
                    confirms it was saved; a reply time has not been promised.
                  </p>
                  <button type="button" onClick={() => setContact(false)}>
                    Back to chat
                  </button>
                </div>
              ) : (
                <form onSubmit={saveInquiry}>
                  <button type="button" onClick={() => setContact(false)}>
                    ← Back to chat
                  </button>
                  <h3>Leave a project inquiry</h3>
                  <p>Share only the details you want Steven to review.</p>
                  <label htmlFor={`${id}-name`}>Name</label>
                  <input
                    ref={contactName}
                    id={`${id}-name`}
                    name="name"
                    autoComplete="name"
                    maxLength={120}
                    required
                  />
                  <label htmlFor={`${id}-email`}>Email</label>
                  <input
                    id={`${id}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                  />
                  <label htmlFor={`${id}-inquiry`}>Project or question</label>
                  <textarea
                    id={`${id}-inquiry`}
                    name="message"
                    rows={3}
                    maxLength={4000}
                    required
                  />
                  <label className="ndp-chat-consent">
                    <input name="consent" type="checkbox" required />I agree to
                    save these details for Steven to review and respond.
                    Inquiries are kept for up to 90 days.
                  </label>
                  <button className="ndp-chat-primary" disabled={busy}>
                    {busy ? "Saving…" : "Save inquiry"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              <div
                className="ndp-chat-messages"
                ref={log}
                role="log"
                aria-label="Conversation"
                aria-live="polite"
                aria-relevant="additions text"
              >
                <div className="ndp-chat-welcome">
                  <span className="ndp-chat-eyebrow">LET’S TALK DATA</span>
                  <h3>{theme.welcome}</h3>
                  <p>{theme.description}</p>
                </div>
                {entries.length === 0 && (
                  <div className="ndp-chat-prompts">
                    {theme.prompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          void send(prompt);
                        }}
                        disabled={busy || !available}
                      >
                        {prompt}
                        <span aria-hidden="true">↗</span>
                      </button>
                    ))}
                  </div>
                )}
                {entries.map((entry) => (
                  <div
                    className={`ndp-chat-entry ndp-chat-${entry.role}`}
                    key={entry.id}
                  >
                    <span className="ndp-chat-speaker">
                      {entry.role === "user" ? "You" : "Netherwood AI"}
                    </span>
                    <p>{entry.text}</p>
                    {Boolean(entry.sources?.length) && (
                      <ul className="ndp-chat-sources">
                        {entry.sources?.map((s, i) => (
                          <li key={i}>
                            {s.url ? <a href={s.url}>{s.title}</a> : s.title}
                          </li>
                        ))}
                      </ul>
                    )}
                    {entry.role === "assistant" && canSpeak && (
                      <button
                        className="ndp-chat-read"
                        type="button"
                        onClick={() => speak(entry.text)}
                      >
                        {speaking ? "Stop reading" : "Read aloud"}
                      </button>
                    )}
                  </div>
                ))}
                {busy && (
                  <p className="ndp-chat-thinking" role="status">
                    Considering your question…
                  </p>
                )}
              </div>
              <form
                className="ndp-chat-compose"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(question);
                }}
              >
                <label htmlFor={`${id}-question`}>Your question</label>
                <div>
                  <textarea
                    ref={field}
                    id={`${id}-question`}
                    placeholder="Tell me what you’re working on…"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={2}
                    maxLength={4000}
                    disabled={!available}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        void send(question);
                      }
                    }}
                  />
                  <button
                    className="ndp-chat-send"
                    type="submit"
                    disabled={busy || !available || !question.trim()}
                    aria-label="Send question"
                  >
                    ↑
                  </button>
                </div>
              </form>
            </>
          )}
          {error && (
            <p className="ndp-chat-error" role="alert">
              {error}
            </p>
          )}
          <div className="ndp-chat-footer">
            <div>
              <button
                type="button"
                disabled={busy || saved}
                onClick={() => {
                  setContact(!contact);
                  setError("");
                }}
              >
                Leave an inquiry
              </button>
              <a href={theme.contactUrl} onClick={close}>{theme.contactLabel} ↗</a>
            </div>
            <p>
              AI can make mistakes. Chats are kept privately for up to 30 days
              for owner review and sent to OpenAI to generate replies. Don’t
              share secrets or private records. <a href="/privacy/">Privacy</a>
            </p>
          </div>
        </section>
      )}
      {available && (
        <button
          className="ndp-chat-launcher"
          type="button"
          ref={launcher}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => {
            if (open) close();
            else void show();
          }}
        >
          <Mark />
          <span>
            Ask Netherwood<small>Data & software questions</small>
          </span>
          <span className="ndp-chat-dot" aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}
