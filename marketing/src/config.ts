import { resolve } from "node:path";
import { normalizeEmail } from "./csv.ts";
export type MarketingConfig = {
  adminToken: string; attributionToken?: string; dbPath: string; outboxDir: string;
  origin: string; publicBaseUrl: string; websiteOrigin: string;
  senderName: string; senderEmail: string; postalAddress: string; testRecipient: string;
  port: number; mode: "local";
};
export function loadConfig(env: NodeJS.ProcessEnv = process.env): MarketingConfig {
  const adminToken = env.MARKETING_ADMIN_TOKEN?.trim() ?? "";
  if (adminToken.length < 32) throw new Error("Set MARKETING_ADMIN_TOKEN to a unique random value of at least 32 characters.");
  const attributionToken = env.MARKETING_ATTRIBUTION_TOKEN?.trim() || undefined;
  if (attributionToken && (attributionToken.length < 32 || attributionToken === adminToken))
    throw new Error("MARKETING_ATTRIBUTION_TOKEN must be a separate random secret of at least 32 characters.");
  if (env.MARKETING_MODE && env.MARKETING_MODE !== "local")
    throw new Error("Only local mode is implemented. No production email provider is configured.");
  const port = Number(env.MARKETING_PORT ?? 4310);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("MARKETING_PORT must be 1024–65535.");
  const origin = "http://127.0.0.1:" + port;
  function url(value: string, name: string, local: boolean) {
    const parsed = new URL(value);
    if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== "/" ||
        (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:" && ["127.0.0.1","localhost"].includes(parsed.hostname))))
      throw new Error(name + " must be an HTTPS origin (loopback HTTP allowed for local tests).");
    return parsed.origin;
  }
  const senderName = env.MARKETING_SENDER_NAME?.trim() || "Netherwood Data Partners";
  if (senderName.length > 150 || /[\r\n]/.test(senderName)) throw new Error("Invalid sender name.");
  const senderEmail = normalizeEmail(env.MARKETING_SENDER_EMAIL || "marketing@example.test");
  const testRecipient = normalizeEmail(env.MARKETING_TEST_RECIPIENT || "owner@example.test");
  if (!senderEmail || !testRecipient) throw new Error("Sender and test recipient email must not be empty.");
  const postalAddress = env.MARKETING_POSTAL_ADDRESS?.trim() || "LOCAL TEST ONLY — configure a valid business postal address before production";
  if (postalAddress.length > 500) throw new Error("Business address is too long.");
  return {
    adminToken,attributionToken,port,origin,mode:"local",
    dbPath:resolve(env.MARKETING_DB_PATH || "data/marketing.sqlite"),
    outboxDir:resolve(env.MARKETING_OUTBOX_DIR || "data/outbox"),
    publicBaseUrl:url(env.MARKETING_PUBLIC_BASE_URL || origin,"MARKETING_PUBLIC_BASE_URL",true),
    websiteOrigin:url(env.MARKETING_WEBSITE_ORIGIN || "https://netherwooddatapartners.com","MARKETING_WEBSITE_ORIGIN",false),
    senderName,senderEmail,postalAddress,testRecipient,
  };
}
