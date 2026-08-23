const chatApiBaseUrl = process.env.NEXT_PUBLIC_CHAT_API_URL ?? process.env.PUBLIC_CHAT_API_URL ?? "";

export function ChatWidget() {
  const enabled = Boolean(chatApiBaseUrl);

  if (!enabled) {
    return null;
  }

  return (
    <aside className="chat-widget" aria-live="polite">
      <div className="chat-widget__header">
        <strong>Database questions</strong>
        <span>Optional</span>
      </div>
      <p>Connect to the backend chat when the public API is available.</p>
    </aside>
  );
}
