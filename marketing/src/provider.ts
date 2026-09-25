import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface EmailMessage {
  idempotencyKey: string; to: string; fromEmail: string; fromName: string;
  subject: string; text: string; html: string; unsubscribeUrl: string;
  campaignId: string; test: boolean;
}
export interface SendReceipt { messageId: string; status: 'simulated' | 'accepted'; }
export interface ProviderEvent { id: string; messageId: string; type: 'delivered' | 'hard_bounce' | 'complaint'; occurredAt: string; }
export interface ProviderConfiguration { valid: boolean; production: boolean; errors: string[]; }
export interface EmailProvider {
  readonly name: string;
  readonly mode: 'local' | 'production';
  validateConfiguration(): ProviderConfiguration;
  sendMessage(message: EmailMessage): Promise<SendReceipt>;
  sendCampaign(messages: EmailMessage[]): Promise<SendReceipt[]>;
  /** Authenticate the exact raw body before parsing. Throw on absent/invalid signatures. */
  handleWebhook(rawBody: string, headers: Record<string, string>): Promise<ProviderEvent[]>;
}
const header = (value: string): string => {
  // eslint-disable-next-line no-control-regex -- Prevent header injection in local message fixtures.
  if (/[\r\n\u0000]/.test(value)) throw new Error('Email headers may not contain control characters.');
  return value;
};

/** Disk only: no network client, SMTP transport, or production credential is used. */
export class LocalEmailProvider implements EmailProvider {
  readonly name = 'local-outbox';
  readonly mode = 'local' as const;
  readonly outboxDir: string;
  constructor(outboxDir: string) { this.outboxDir = outboxDir; }
  validateConfiguration(): ProviderConfiguration {
    return { valid: Boolean(this.outboxDir), production: false, errors: this.outboxDir ? [] : ['Set the local outbox directory.'] };
  }
  async sendMessage(message: EmailMessage): Promise<SendReceipt> {
    if (!this.validateConfiguration().valid) throw new Error('Local outbox is not configured.');
    for (const value of [message.to, message.fromEmail, message.fromName, message.subject, message.unsubscribeUrl]) header(value);
    const messageId = `local-${createHash('sha256').update(message.idempotencyKey).digest('hex')}`;
    mkdirSync(this.outboxDir, { recursive: true, mode: 0o700 });
    const jsonPath = join(this.outboxDir, `${messageId}.json`);
    const receipt: SendReceipt = { messageId, status: 'simulated' };
    try {
      writeFileSync(jsonPath, `${JSON.stringify({ mode: 'local', delivery: 'NOT SENT TO ANY MAIL SERVER', message, receipt }, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      const prior = JSON.parse(readFileSync(jsonPath, 'utf8')) as { message: EmailMessage };
      if (JSON.stringify(prior.message) !== JSON.stringify(message)) throw new Error('Outbox idempotency conflict.');
    }
    const boundary = `ndp-${messageId}`;
    const lines = [
      `From: =?UTF-8?B?${Buffer.from(header(message.fromName)).toString('base64')}?= <${header(message.fromEmail)}>`, `To: ${header(message.to)}`,
      `Subject: =?UTF-8?B?${Buffer.from(`[LOCAL ONLY] ${message.subject}`).toString('base64')}?=`,
      `Message-ID: <${messageId}@local.invalid>`, 'MIME-Version: 1.0',
      `List-Unsubscribe: <${header(message.unsubscribeUrl)}>`, 'List-Unsubscribe-Post: List-Unsubscribe=One-Click',
      'X-Netherwood-Mode: local-no-network', `Content-Type: multipart/alternative; boundary="${boundary}"`, '',
      `--${boundary}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', Buffer.from(message.text).toString('base64'),
      `--${boundary}`, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', Buffer.from(message.html).toString('base64'), `--${boundary}--`, '',
    ];
    try { writeFileSync(join(this.outboxDir, `${messageId}.eml`), lines.join('\r\n'), { flag: 'wx', mode: 0o600 }); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
    return receipt;
  }
  async sendCampaign(messages: EmailMessage[]): Promise<SendReceipt[]> {
    const receipts: SendReceipt[] = [];
    for (const message of messages) receipts.push(await this.sendMessage(message));
    return receipts;
  }
  async handleWebhook(_rawBody: string, _headers: Record<string, string>): Promise<ProviderEvent[]> {
    void _rawBody; void _headers;
    throw new Error('The local provider does not accept webhooks.');
  }
}
/** Example signature primitive, NOT a vendor adapter. A vetted adapter must use its provider's specification. */
export function verifySignedWebhook(rawBody: string, signature: string, timestamp: string, secret: string, now = Date.now()): boolean {
  if (Buffer.byteLength(secret, 'utf8') < 32 || !/^\d{10}$/.test(timestamp) || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  if (Math.abs(now - Number(timestamp) * 1000) > 5 * 60 * 1000) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
