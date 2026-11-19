export function chatbotRelease(env = process.env) {
  if (env.VITE_PUBLIC_CHAT_ENABLED !== "true") return { chatEnabled: false, assistantApiUrl: null };
  const url = new URL(env.VITE_ASSISTANT_API_URL || "");
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/")
    throw new Error("Public chat requires a credential-free HTTPS origin");
  return { chatEnabled: true, assistantApiUrl: url.origin };
}
