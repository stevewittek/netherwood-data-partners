/** Fast, deterministic handling for obvious off-topic requests and pasted secrets.
 * The model still handles nuanced business questions under its business instructions.
 */
export function scopeReply(message: string): string | undefined {
  if (/sk-(?:proj-)?[A-Za-z0-9_-]{30,}|(?:password|pwd)\s*=\s*\S+/i.test(message)) {
    return "Please leave credentials and connection strings out of chat. Describe the database or software issue without those details.";
  }
  if (/(?:reveal|show|print|repeat|ignore|override)[\s\S]{0,100}(?:private instructions|hidden instructions|system prompt|system instructions|developer instructions|business rules)/i.test(message)
      || /(?:write|compose|tell|generate)[\s\S]{0,60}(?:fantasy|poem|lyrics|bedtime story|dragon|song)/i.test(message)) {
    return "I’m here to help with Netherwood Data Partners’ services and documented experience, and database or business software questions. I can help you explore a migration, troubleshoot a SQL Server issue, or find the right contact route.";
  }
}

/** Enforce company-only wording even for older cached answers or model drift. */
export function companyVoice(text: string): string {
  return text.replace(/\b(?:Steven|Steve)(?:\s+Wittek)?\b|\bWittek\b/gi, "Netherwood Data Partners");
}
