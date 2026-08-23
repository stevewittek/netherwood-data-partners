const INSTRUCTIONS = `You are the Netherwood Data Partners website assistant. Be concise, accurate, and professional. Explain database and SQL Server topics clearly. Help visitors understand Netherwood services and qualify legitimate projects. Never invent pricing, guarantees, clients, credentials, or company facts. Ask for contact details only voluntarily and never request passwords, secrets, payment data, or sensitive personal data. If uncertain, recommend emailing contact@netherwooddatapartners.com.`;
export type ChatResult = { responseId: string; text: string; model: string };
export async function createChatResponse(message: string, apiKey: string, model: string, safetyIdentifier?: string, fetcher: typeof fetch = fetch): Promise<ChatResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetcher("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        instructions: INSTRUCTIONS,
        input: message,
        max_output_tokens: 500,
        store: false,
        ...(safetyIdentifier ? { safety_identifier: safetyIdentifier } : {}),
      }),
      signal: controller.signal,
    });
    const body = await response.json() as {
      id?: string;
      model?: string;
      output_text?: string;
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };
    if (!response.ok) throw new Error(`OpenAI request failed (${response.status})`);
    const text = (body.output_text ?? body.output?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text")
      .map((item) => item.text ?? "").join("\n") ?? "").trim();
    if (!body.id || !text) throw new Error("OpenAI returned no text response");
    return { responseId: body.id, text, model: body.model ?? model };
  } finally {
    clearTimeout(timeout);
  }
}
