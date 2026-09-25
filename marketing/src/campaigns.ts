import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { campaignUrl, newCampaignCode, validateAttributionEvent } from './attribution.ts';
import type { AttributionEvent } from './attribution.ts';
import type { EmailMessage, EmailProvider } from './provider.ts';

export interface CampaignCompany {
  id: string; company_name: string; general_public_email: string; industry: string; city: string;
  active: boolean | number; do_not_contact: boolean | number;
}
export interface CampaignStore {
  db: DatabaseSync;
  eligibleCompanies(listId: string, filters?: Record<string, string>): CampaignCompany[];
  isSuppressed(email: string): boolean;
  suppress(email: string, reason: string, source: string): void;
}
export interface CampaignConfig {
  publicBaseUrl: string; websiteOrigin: string; senderName: string; senderEmail: string;
  postalAddress: string; testRecipient: string;
}
export const EMAIL_TEMPLATES = [
  { id: 'data_migration', name: 'Data migration', subject: 'Moving from older business software?', body: "Hi,\n\nNetherwood Data Partners helps established businesses move data out of older applications, databases and spreadsheets and into modern platforms.\n\nIf {{company_name}} is replacing a business system, Netherwood can work with you and the new software vendor to extract, clean, map, migrate and validate the historical data.\n\nLearn about data migration: {{campaign_url}}" },
  { id: 'legacy_system', name: 'Legacy systems assessment', subject: 'Still relying on an older business system?', body: "Hi,\n\nMany established businesses have an application, database or server that has worked for years but has become difficult to replace.\n\nNetherwood Data Partners helps document those environments, preserve the important information and plan a safe path into modern systems.\n\nIf a software change is on the horizon for {{company_name}}, a scoped assessment can clarify the next steps.\n\nLegacy systems assessment: {{campaign_url}}" },
  { id: 'database', name: 'SQL Server and database help', subject: 'Need occasional SQL Server help without hiring a DBA?', body: "Hi,\n\nNetherwood Data Partners provides project-based and fractional SQL Server support for businesses that need database expertise without adding a full-time DBA.\n\nWork can include database health reviews, troubleshooting, backup and recovery reviews, and migration planning.\n\nDatabase services: {{campaign_url}}" },
] as const;
export const CHANNELS = ['email', 'google_ads', 'referral', 'direct', 'organic_search', 'other'] as const;
export type CampaignStatus = 'draft' | 'preview' | 'test_send' | 'ready' | 'approved' | 'sending' | 'sent' | 'local_sent' | 'failed';
export interface CampaignInput {
  name: string; description?: string; channel: typeof CHANNELS[number]; list_id?: string;
  filters?: Record<string, string>; landing_page: string; template?: string; subject?: string; body?: string;
  utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string;
}
export interface Campaign {
  id: string; name: string; description: string; channel: typeof CHANNELS[number]; status: CampaignStatus;
  list_id: string; filters_json: string; landing_page: string; campaign_code: string; utm_source: string;
  utm_medium: string; utm_campaign: string; utm_content: string; template: string; subject: string; body: string;
  sender_name: string; sender_email: string; postal_address: string; recipient_count: number;
  created_at: string; previewed_at: string | null; test_sent_at: string | null; approved_at: string | null; sent_at: string | null;
}
interface Recipient { id: string; campaign_id: string; company_id: string; company_name: string; email: string; city: string; industry: string; }
export interface DashboardRow {
  id: string; name: string; channel: string; status: string; recipients: number; traffic: number; simulated: number;
  accepted: number; delivered: number; clicked: number; inquiries: number; booked_conversations: number; customers: number;
  replies: number; bounced: number; unsubscribed: number; skipped: number; needs_review: number;
  click_through_rate: number | null; inquiry_conversion_rate: number | null; customer_conversion_rate: number | null; tracked_url: string;
}
const now = (): string => new Date().toISOString();
const hash = (value: string): string => createHash('sha256').update(value).digest('hex');
const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const validEmail = (value: string): boolean => value.length <= 254 && /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,63}$/.test(value);
const textField = (value: unknown, label: string, maximum: number, optional = false): string => {
  // eslint-disable-next-line no-control-regex -- Reject control bytes in operator-supplied email content.
  if (typeof value !== 'string' || value.length > maximum || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value) || (!optional && !value.trim())) throw new Error(`${label} is required and must be at most ${maximum} characters.`);
  return value.trim();
};
const csvCell = (value: unknown): string => {
  let valueText = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(valueText)) valueText = `'${valueText}`;
  return `"${valueText.replace(/"/g, '""')}"`;
};

export function migrateCampaigns(db: DatabaseSync): void {
  db.exec("BEGIN IMMEDIATE");
  try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, channel TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft', list_id TEXT NOT NULL DEFAULT '', filters_json TEXT NOT NULL DEFAULT '{}',
      landing_page TEXT NOT NULL, campaign_code TEXT UNIQUE NOT NULL, utm_source TEXT NOT NULL, utm_medium TEXT NOT NULL,
      utm_campaign TEXT NOT NULL, utm_content TEXT NOT NULL DEFAULT '', template TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL,
      sender_name TEXT NOT NULL, sender_email TEXT NOT NULL, postal_address TEXT NOT NULL, recipient_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL, previewed_at TEXT, test_sent_at TEXT, approved_at TEXT, sent_at TEXT
    );
    CREATE TABLE IF NOT EXISTS campaign_recipients (
      id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL REFERENCES campaigns(id), company_id TEXT NOT NULL,
      company_name TEXT NOT NULL, email TEXT NOT NULL COLLATE NOCASE, city TEXT NOT NULL, industry TEXT NOT NULL,
      created_at TEXT NOT NULL, UNIQUE(campaign_id,email)
    );
    CREATE INDEX IF NOT EXISTS campaign_recipients_campaign ON campaign_recipients(campaign_id);
    CREATE TABLE IF NOT EXISTS campaign_sends (
      id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL REFERENCES campaigns(id), recipient_id TEXT NOT NULL UNIQUE REFERENCES campaign_recipients(id),
      idempotency_key TEXT NOT NULL UNIQUE, provider TEXT NOT NULL, provider_message_id TEXT UNIQUE,
      status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, error TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS campaign_sends_campaign ON campaign_sends(campaign_id,status);
    CREATE TABLE IF NOT EXISTS campaign_tokens (
      token_hash TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('unsubscribe','click')), campaign_id TEXT NOT NULL REFERENCES campaigns(id),
      recipient_id TEXT, email TEXT NOT NULL, target_url TEXT NOT NULL DEFAULT '', is_test INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL, used_at TEXT
    );
    CREATE INDEX IF NOT EXISTS campaign_tokens_campaign ON campaign_tokens(campaign_id,kind);
    CREATE TABLE IF NOT EXISTS campaign_clicks (
      recipient_id TEXT PRIMARY KEY REFERENCES campaign_recipients(id), campaign_id TEXT NOT NULL REFERENCES campaigns(id), first_clicked_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS campaign_events (
      event_id TEXT PRIMARY KEY, campaign_id TEXT REFERENCES campaigns(id), event_name TEXT NOT NULL,
      source TEXT NOT NULL, attribution_json TEXT NOT NULL, occurred_at TEXT NOT NULL, received_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS campaign_events_campaign ON campaign_events(campaign_id,event_name);
    CREATE TABLE IF NOT EXISTS campaign_provider_events (
      event_id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL REFERENCES campaigns(id), recipient_id TEXT NOT NULL,
      event_type TEXT NOT NULL, occurred_at TEXT NOT NULL, received_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS campaign_traffic (
      id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL REFERENCES campaigns(id), visits INTEGER NOT NULL CHECK(visits>=0),
      source TEXT NOT NULL, date TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(campaign_id,source,date)
    );
    CREATE TABLE IF NOT EXISTS campaign_audit (
      id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL REFERENCES campaigns(id), action TEXT NOT NULL, created_at TEXT NOT NULL
    );
  `);
  db.exec("CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
  db.prepare("INSERT OR IGNORE INTO schema_migrations VALUES('002-campaigns-attribution',?)").run(now());
  db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
}

export class CampaignService {
  readonly store: CampaignStore;
  readonly provider: EmailProvider;
  readonly config: CampaignConfig;
  constructor(store: CampaignStore, provider: EmailProvider, config: CampaignConfig) {
    this.store = store; this.provider = provider; this.config = { ...config };
    const base = new URL(config.publicBaseUrl);
    if (base.username || base.password || base.search || base.hash || base.pathname !== '/' || (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)))) throw new Error('Public base URL must be an HTTPS origin or a loopback HTTP origin.');
    if (!validEmail(config.testRecipient)) throw new Error('Configure a valid local test recipient.');
    migrateCampaigns(store.db);
  }
  private audit(id: string, action: string): void { this.store.db.prepare('INSERT INTO campaign_audit VALUES(?,?,?,?)').run(randomUUID(), id, action, now()); }
  list(): Campaign[] { return this.store.db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all() as unknown as Campaign[]; }
  get(id: string): Campaign {
    const campaign = this.store.db.prepare('SELECT * FROM campaigns WHERE id=?').get(id) as unknown as Campaign | undefined;
    if (!campaign) throw new Error('Campaign not found.');
    return campaign;
  }
  create(input: CampaignInput): Campaign {
    const name = textField(input.name, 'Campaign name', 150);
    if (!CHANNELS.includes(input.channel)) throw new Error('Choose a supported campaign channel.');
    if (input.channel === 'email' && !input.list_id) throw new Error('Choose an email recipient list.');
    const template = EMAIL_TEMPLATES.find(item => item.id === (input.template || 'data_migration'));
    if (!template) throw new Error('Choose a valid email template.');
    const subject = textField(input.subject || template.subject, 'Subject', 180);
    if (/[\r\n]/.test(subject)) throw new Error('Subject must be one line.');
    const body = textField(input.body || template.body, 'Body', 8000);
    const unknown = [...`${subject}\n${body}`.matchAll(/{{(.*?)}}/g)].some(match => !['company_name','industry','city','campaign_url'].includes(match[1]!));
    if (unknown) throw new Error('Only company_name, industry, city and campaign_url placeholders are supported.');
    const filters = input.filters || {};
    if (!filters || typeof filters !== 'object' || Array.isArray(filters) || Object.entries(filters).some(([key,value]) => !['industry','city','county','state','zip','source'].includes(key) || typeof value !== 'string' || value.length > 150)) throw new Error('Invalid campaign filters.');
    const defaults: Record<string, [string,string]> = { email:['email','outbound'], google_ads:['google','cpc'], referral:['referral','referral'], direct:['direct','none'], organic_search:['google','organic'], other:['other','other'] };
    const [source,medium] = defaults[input.channel]!;
    const id = randomUUID();
    const campaign: Campaign = {
      id, name, description: textField(input.description ?? '', 'Description', 1000, true), channel:input.channel, status:'draft',
      list_id:input.list_id || '', filters_json:JSON.stringify(filters), landing_page:input.landing_page, campaign_code:newCampaignCode(),
      utm_source:input.utm_source || source, utm_medium:input.utm_medium || medium,
      utm_campaign:input.utm_campaign || name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,80) || id,
      utm_content:input.utm_content || '', template:template.id, subject, body,
      sender_name:textField(this.config.senderName, 'Sender name', 150), sender_email:this.config.senderEmail.trim().toLowerCase(),
      postal_address:textField(this.config.postalAddress || '', 'Postal address', 500, true), recipient_count:0,
      created_at:now(), previewed_at:null, test_sent_at:null, approved_at:null, sent_at:null,
    };
    if (/[\r\n]/.test(campaign.sender_name) || !validEmail(campaign.sender_email)) throw new Error('Configure a valid sender name and email.');
    campaignUrl(campaign, this.config.websiteOrigin);
    const keys = Object.keys(campaign);
    this.store.db.prepare(`INSERT INTO campaigns(${keys.join(',')}) VALUES(${keys.map(()=>'?').join(',')})`).run(...Object.values(campaign));
    this.audit(id,'created');
    return this.get(id);
  }
  private recipients(id: string): Recipient[] { return this.store.db.prepare('SELECT * FROM campaign_recipients WHERE campaign_id=? ORDER BY company_name,email').all(id) as unknown as Recipient[]; }
  private render(campaign: Campaign, recipient: Pick<Recipient,'company_name'|'industry'|'city'>, trackedUrl: string, unsubscribeUrl: string) {
    const values: Record<string,string> = { company_name:recipient.company_name, industry:recipient.industry, city:recipient.city, campaign_url:trackedUrl };
    const personalize = (value: string): string => value.replace(/{{(company_name|industry|city|campaign_url)}}/g, (_match,key:string)=>values[key] || 'your business');
    const subject = personalize(campaign.subject).replace(/[\r\n]/g,' ').slice(0,250);
    let body = personalize(campaign.body);
    if (!campaign.body.includes('{{campaign_url}}')) body += `\n\nLearn more: ${trackedUrl}`;
    const footer = `${campaign.sender_name}\n${campaign.sender_email}\n${campaign.postal_address || '[BUSINESS MAILING ADDRESS REQUIRED BEFORE PRODUCTION]'}\n\nThis is a business marketing message from Netherwood Data Partners.\nUnsubscribe: ${unsubscribeUrl}`;
    const text = `${body}\n\n${footer}`;
    const html = `<!doctype html><html><body><div style="white-space:pre-wrap;font-family:Arial,sans-serif;line-height:1.5">${escapeHtml(body)}</div><p><a href="${escapeHtml(trackedUrl)}">Learn more</a></p><hr><div style="white-space:pre-wrap">${escapeHtml(footer.split('\nUnsubscribe:')[0]!)}</div><p><a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a></p></body></html>`;
    return { subject,text,html,trackedUrl,unsubscribeUrl };
  }
  preview(id: string) {
    let campaign = this.get(id);
    if (campaign.channel !== 'email') return { campaign, recipientCount:0, excludedCount:0, sample:this.render(campaign,{company_name:'Example Company TEST',industry:'',city:''},campaignUrl(campaign,this.config.websiteOrigin),`${this.config.publicBaseUrl}/unsubscribe/PREVIEW-NOT-ACTIVE`), recipients:[] };
    if (campaign.status === 'draft') {
      const companies = this.store.eligibleCompanies(campaign.list_id, JSON.parse(campaign.filters_json) as Record<string,string>);
      this.store.db.exec('BEGIN IMMEDIATE');
      try {
        const insert = this.store.db.prepare('INSERT OR IGNORE INTO campaign_recipients(id,campaign_id,company_id,company_name,email,city,industry,created_at) VALUES(?,?,?,?,?,?,?,?)');
        for (const company of companies) {
          const email = company.general_public_email.trim().toLowerCase();
          if (!validEmail(email) || !company.active || company.do_not_contact || this.store.isSuppressed(email)) continue;
          insert.run(randomUUID(),id,company.id,company.company_name,email,company.city || '',company.industry || '',now());
        }
        const count = this.recipients(id).length;
        this.store.db.prepare("UPDATE campaigns SET status='preview',recipient_count=?,previewed_at=? WHERE id=? AND status='draft'").run(count,now(),id);
        this.audit(id,'preview_snapshot_frozen');
        this.store.db.exec('COMMIT');
      } catch (error) { this.store.db.exec('ROLLBACK'); throw error; }
      campaign = this.get(id);
    }
    const recipients = this.recipients(id);
    const sampleRecipient = recipients[0] || { company_name:'Example Company TEST',industry:'',city:'' };
    return { campaign,recipientCount:recipients.length,excludedCount:recipients.filter(r=>this.store.isSuppressed(r.email)).length,
      sample:this.render(campaign,sampleRecipient,campaignUrl(campaign,this.config.websiteOrigin),`${this.config.publicBaseUrl}/unsubscribe/PREVIEW-NOT-ACTIVE`),
      recipients:recipients.map(({company_name,email,city,industry})=>({company_name,email,city,industry})) };
  }
  private token(kind: 'unsubscribe'|'click', campaign: Campaign, recipient: Recipient | null, email: string, target = '', test = false): string {
    const token = randomBytes(32).toString('base64url');
    this.store.db.prepare('INSERT INTO campaign_tokens(token_hash,kind,campaign_id,recipient_id,email,target_url,is_test,created_at) VALUES(?,?,?,?,?,?,?,?)').run(hash(token),kind,campaign.id,recipient?.id || null,email,target,test?1:0,now());
    return `${this.config.publicBaseUrl.replace(/\/$/,'')}/${kind==='click'?'r':'unsubscribe'}/${token}`;
  }
  async testSend(id: string) {
    const campaign = this.get(id);
    if (!['preview','test_send'].includes(campaign.status) || campaign.recipient_count === 0) throw new Error('Preview a nonempty recipient snapshot before sending a test.');
    const configuration = this.provider.validateConfiguration();
    if (!configuration.valid) throw new Error(configuration.errors.join(' '));
    const recipient = this.recipients(id)[0]!;
    const unsub = this.token('unsubscribe',campaign,null,this.config.testRecipient,'',true);
    const rendered = this.render(campaign,recipient,campaignUrl(campaign,this.config.websiteOrigin),unsub);
    const receipt = await this.provider.sendMessage({ idempotencyKey:`test:${id}:${randomUUID()}`,to:this.config.testRecipient,fromEmail:campaign.sender_email,fromName:campaign.sender_name,subject:`[TEST] ${rendered.subject}`,text:rendered.text,html:rendered.html,unsubscribeUrl:unsub,campaignId:id,test:true });
    this.store.db.prepare("UPDATE campaigns SET status='test_send',test_sent_at=? WHERE id=? AND status IN ('preview','test_send')").run(now(),id);
    this.audit(id,`test_send:${this.provider.mode}`);
    return {campaign:this.get(id),messageId:receipt.messageId,mode:this.provider.mode};
  }
  ready(id: string): Campaign {
    const campaign = this.get(id);
    if (campaign.status !== 'test_send') throw new Error('Complete a test send before marking ready for approval.');
    this.store.db.prepare("UPDATE campaigns SET status='ready' WHERE id=?").run(id);
    this.audit(id,'ready_for_approval'); return this.get(id);
  }
  approve(id: string, input: { recipientCount: number; confirmation: string }): Campaign {
    const campaign = this.get(id);
    if (campaign.status !== 'ready' || input.confirmation !== 'APPROVE' || input.recipientCount !== campaign.recipient_count) throw new Error('Explicit approval and the exact previewed recipient count are required.');
    this.store.db.prepare("UPDATE campaigns SET status='approved',approved_at=? WHERE id=? AND status='ready'").run(now(),id);
    this.audit(id,`approved:${campaign.recipient_count}`); return this.get(id);
  }
  async send(id: string, input: { recipientCount: number; confirmation: string; production?: boolean }): Promise<Campaign> {
    const campaign = this.get(id);
    if (input.confirmation !== 'SEND' || input.recipientCount !== campaign.recipient_count) throw new Error('Confirm SEND and the exact approved recipient count.');
    if (input.production && this.provider.mode !== 'production') throw new Error('Production sending is unavailable. Only the local outbox provider is installed.');
    if (['sent','local_sent'].includes(campaign.status)) return campaign;
    if (campaign.status !== 'approved') throw new Error('Campaign must be explicitly approved before send.');
    const configuration = this.provider.validateConfiguration();
    if (!configuration.valid) throw new Error(configuration.errors.join(' '));
    if (input.production && (this.provider.mode !== 'production' || !configuration.production)) throw new Error('Production sending is unavailable. Only the local outbox provider is installed.');
    if (this.provider.mode === 'production' && !input.production) throw new Error('A production provider requires the explicit production send action.');
    if (input.production && (!this.config.publicBaseUrl.startsWith('https:') || !campaign.postal_address || /REQUIRED|PLACEHOLDER|TEST/i.test(campaign.postal_address) || /\.(test|invalid|example)$/.test(campaign.sender_email))) throw new Error('Production sending requires a verified sender, business postal address, and public HTTPS unsubscribe service.');
    const claimed = this.store.db.prepare("UPDATE campaigns SET status='sending' WHERE id=? AND status='approved'").run(id);
    if (Number(claimed.changes) !== 1) throw new Error('A send is already in progress.');
    this.audit(id,`send_started:${this.provider.mode}`);
    try {
      for (const recipient of this.recipients(id)) {
        const company = this.store.db.prepare('SELECT active,do_not_contact FROM companies WHERE id=?').get(recipient.company_id) as { active:number;do_not_contact:number } | undefined;
        const skipped = this.store.isSuppressed(recipient.email) || !company || !company.active || Boolean(company.do_not_contact);
        const key = `campaign:${id}:recipient:${recipient.id}`;
        const inserted = this.store.db.prepare('INSERT OR IGNORE INTO campaign_sends(id,campaign_id,recipient_id,idempotency_key,provider,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run(randomUUID(),id,recipient.id,key,this.provider.name,skipped?'skipped':'pending',now(),now());
        if (Number(inserted.changes) === 0 || skipped) continue;
        const unsub = this.token('unsubscribe',campaign,recipient,recipient.email);
        const tracked = this.token('click',campaign,recipient,recipient.email,campaignUrl(campaign,this.config.websiteOrigin));
        const rendered = this.render(campaign,recipient,tracked,unsub);
        const message: EmailMessage = { idempotencyKey:key,to:recipient.email,fromEmail:campaign.sender_email,fromName:campaign.sender_name,subject:rendered.subject,text:rendered.text,html:rendered.html,unsubscribeUrl:unsub,campaignId:id,test:false };
        try {
          // No await between the final suppression check and handing the message to the adapter.
          if (this.store.isSuppressed(recipient.email)) { this.store.db.prepare("UPDATE campaign_sends SET status='skipped',updated_at=? WHERE recipient_id=?").run(now(),recipient.id); continue; }
          const receipt = await this.provider.sendMessage(message);
          if (this.provider.mode === 'local' && receipt.status !== 'simulated') throw new Error('Local provider returned an invalid delivery status.');
          this.store.db.prepare('UPDATE campaign_sends SET status=?,provider_message_id=?,updated_at=? WHERE recipient_id=?').run(receipt.status,receipt.messageId,now(),recipient.id);
        } catch (error) {
          this.store.db.prepare("UPDATE campaign_sends SET status='needs_review',error='Provider outcome uncertain; reconcile before any retry.',updated_at=? WHERE recipient_id=?").run(now(),recipient.id);
          throw error;
        }
      }
      this.store.db.prepare('UPDATE campaigns SET status=?,sent_at=? WHERE id=?').run(this.provider.mode==='local'?'local_sent':'sent',now(),id);
      this.audit(id,`send_completed:${this.provider.mode}`); return this.get(id);
    } catch (error) {
      this.store.db.prepare("UPDATE campaigns SET status='failed' WHERE id=?").run(id);
      this.audit(id,'send_failed_no_automatic_retry'); throw error;
    }
  }
  private findToken(token: string, kind: 'unsubscribe'|'click') {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return undefined;
    return this.store.db.prepare('SELECT * FROM campaign_tokens WHERE token_hash=? AND kind=?').get(hash(token),kind) as { token_hash:string;campaign_id:string;recipient_id:string|null;email:string;target_url:string;is_test:number;used_at:string|null } | undefined;
  }
  inspectUnsubscribe(token: string): boolean { return Boolean(this.findToken(token,'unsubscribe')); }
  unsubscribe(token: string): boolean {
    const item = this.findToken(token,'unsubscribe');
    if (!item) return false;
    this.store.suppress(item.email,'unsubscribe',`campaign:${item.campaign_id}${item.is_test?':test':''}`);
    this.store.db.prepare('UPDATE campaign_tokens SET used_at=COALESCE(used_at,?) WHERE token_hash=?').run(now(),item.token_hash);
    return true;
  }
  resolveClick(token: string): string | null {
    const item = this.findToken(token,'click');
    if (!item) return null;
    const target = new URL(item.target_url);
    if (target.origin !== new URL(this.config.websiteOrigin).origin || target.protocol !== 'https:') return null;
    // Local simulations never contribute to real click totals.
    if (item.recipient_id && this.store.db.prepare("SELECT id FROM campaign_sends WHERE recipient_id=? AND status='accepted'").get(item.recipient_id)) this.store.db.prepare('INSERT OR IGNORE INTO campaign_clicks VALUES(?,?,?)').run(item.recipient_id,item.campaign_id,now());
    return target.href;
  }
  recordAttributionEvent(input: AttributionEvent): {accepted:boolean;duplicate:boolean} {
    const event = validateAttributionEvent(input);
    const campaign = event.campaign_code ? this.store.db.prepare('SELECT id FROM campaigns WHERE campaign_code=?').get(event.campaign_code) as {id:string}|undefined : undefined;
    if (event.campaign_code && !campaign) throw new Error('Unknown campaign code.');
    const existing = this.store.db.prepare('SELECT campaign_id,event_name FROM campaign_events WHERE event_id=?').get(event.event_id) as {campaign_id:string|null;event_name:string}|undefined;
    if (existing) {
      if (existing.campaign_id !== (campaign?.id ?? null) || existing.event_name !== event.event_name) throw new Error('Event identifier already belongs to a different event.');
      return {accepted:true,duplicate:true};
    }
    this.store.db.prepare('INSERT INTO campaign_events VALUES(?,?,?,?,?,?,?)').run(event.event_id,campaign?.id??null,event.event_name,event.source!,JSON.stringify(event.attribution),event.occurred_at!,now());
    return {accepted:true,duplicate:false};
  }
  recordOutcome(id: string, input: {type:string;companyId?:string;notes?:string;reference?:string}) {
    const campaign = this.get(id);
    const names: Record<string,string> = {inquiry:'inquiry_submitted',booked_conversation:'conversation_booked',customer:'customer_created',reply:'reply_received'};
    const eventName = names[input.type];
    if (!eventName) throw new Error('Choose inquiry, booked_conversation, customer, or reply.');
    if (input.notes && input.notes.length>500) throw new Error('Keep notes to 500 characters.');
    if (input.companyId && !this.store.db.prepare('SELECT id FROM companies WHERE id=?').get(input.companyId)) throw new Error('Company not found.');
    if (input.reference && !/^[A-Za-z0-9_.-]{1,100}$/.test(input.reference)) throw new Error('Use an opaque reference ID, without names or contact information.');
    const eventId = input.reference ? hash(`${id}:${input.type}:${input.reference}`) : randomUUID();
    if (this.store.db.prepare('SELECT event_id FROM campaign_events WHERE event_id=?').get(eventId)) return {event_id:eventId,campaign_id:id,event_name:eventName,duplicate:true};
    this.store.db.prepare('INSERT INTO campaign_events VALUES(?,?,?,?,?,?,?)').run(eventId,id,eventName,'manual','{}',now(),now());
    this.audit(id,`manual_outcome:${input.type}`);
    return {event_id:eventId,campaign_id:campaign.id,event_name:eventName,duplicate:false};
  }
  recordTraffic(id: string, input: {visits:number;source?:string;date?:string;notes?:string}) {
    this.get(id);
    if (!Number.isInteger(input.visits) || input.visits<0 || input.visits>10_000_000) throw new Error('Visits must be an integer between 0 and 10000000.');
    const source = input.source || 'manual'; const date = input.date || now().slice(0,10);
    if (!/^[a-zA-Z0-9_.-]{1,100}$/.test(source) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date || date>now().slice(0,10)) throw new Error('Use a short source label and a valid past or current date.');
    this.store.db.prepare('INSERT INTO campaign_traffic VALUES(?,?,?,?,?,?) ON CONFLICT(campaign_id,source,date) DO UPDATE SET visits=excluded.visits').run(randomUUID(),id,input.visits,source,date,now());
    this.audit(id,'traffic_aggregate_updated'); return {campaign_id:id,visits:input.visits,source,date};
  }
  async handleWebhook(rawBody: string, headers: Record<string,string>) {
    const events = await this.provider.handleWebhook(rawBody,headers);
    let accepted = 0;
    for (const event of events) {
      if (!event.id || event.id.length>200 || !['delivered','hard_bounce','complaint'].includes(event.type) || !Number.isFinite(Date.parse(event.occurredAt))) throw new Error('Invalid authenticated provider event.');
      const send = this.store.db.prepare('SELECT s.campaign_id,s.recipient_id,r.email FROM campaign_sends s JOIN campaign_recipients r ON r.id=s.recipient_id WHERE s.provider_message_id=? AND s.provider=?').get(event.messageId,this.provider.name) as {campaign_id:string;recipient_id:string;email:string}|undefined;
      if (!send) continue;
      const result = this.store.db.prepare('INSERT OR IGNORE INTO campaign_provider_events VALUES(?,?,?,?,?,?)').run(`${this.provider.name}:${event.id}`,send.campaign_id,send.recipient_id,event.type,event.occurredAt,now());
      if (event.type === 'hard_bounce' || event.type === 'complaint') this.store.suppress(send.email,event.type,`provider:${this.provider.name}`);
      accepted += Number(result.changes);
    }
    return {accepted};
  }
  sourceSummary(): {source:string;medium:string;channel:string;inquiries:number;booked_conversations:number;customers:number}[] {
    const rows = this.store.db.prepare(`SELECT source, COALESCE(json_extract(attribution_json,'$.utm_medium'),'unknown') medium,
      SUM(CASE WHEN event_name='inquiry_submitted' THEN 1 ELSE 0 END) inquiries,
      SUM(CASE WHEN event_name='conversation_booked' THEN 1 ELSE 0 END) booked_conversations,
      SUM(CASE WHEN event_name='customer_created' THEN 1 ELSE 0 END) customers
      FROM campaign_events WHERE campaign_id IS NULL GROUP BY source,medium ORDER BY source,medium`).all() as {source:string;medium:string;inquiries:number;booked_conversations:number;customers:number}[];
    return rows.map(row=>({...row,channel:row.medium==='organic'?'organic_search':row.source==='google'&&row.medium==='cpc'?'google_ads':row.source==='direct'?'direct':row.medium==='referral'||row.source==='referral'?'referral':'other'}));
  }
  dashboard(): DashboardRow[] {
    const count = (sql:string,...params:string[]):number => Number((this.store.db.prepare(sql).get(...params) as {n:number}).n);
    return this.list().map(campaign => {
      const id = campaign.id;
      const delivered = count("SELECT COUNT(DISTINCT recipient_id) n FROM campaign_provider_events WHERE campaign_id=? AND event_type='delivered'",id);
      const clicked = count('SELECT COUNT(*) n FROM campaign_clicks WHERE campaign_id=?',id);
      const inquiries = count("SELECT COUNT(*) n FROM campaign_events WHERE campaign_id=? AND event_name='inquiry_submitted'",id);
      const customers = count("SELECT COUNT(*) n FROM campaign_events WHERE campaign_id=? AND event_name='customer_created'",id);
      const traffic = count('SELECT COALESCE(SUM(visits),0) n FROM campaign_traffic WHERE campaign_id=?',id);
      const accepted = count("SELECT COUNT(*) n FROM campaign_sends WHERE campaign_id=? AND status='accepted'",id);
      return { id,name:campaign.name,channel:campaign.channel,status:campaign.status,recipients:campaign.recipient_count,traffic,
        simulated:count("SELECT COUNT(*) n FROM campaign_sends WHERE campaign_id=? AND status='simulated'",id),accepted,delivered,clicked,inquiries,
        booked_conversations:count("SELECT COUNT(*) n FROM campaign_events WHERE campaign_id=? AND event_name='conversation_booked'",id),customers,
        replies:count("SELECT COUNT(*) n FROM campaign_events WHERE campaign_id=? AND event_name='reply_received'",id),
        bounced:count("SELECT COUNT(DISTINCT recipient_id) n FROM campaign_provider_events WHERE campaign_id=? AND event_type='hard_bounce'",id),
        unsubscribed:count("SELECT COUNT(DISTINCT email) n FROM campaign_tokens WHERE campaign_id=? AND kind='unsubscribe' AND is_test=0 AND used_at IS NOT NULL",id),
        skipped:count("SELECT COUNT(*) n FROM campaign_sends WHERE campaign_id=? AND status='skipped'",id),
        needs_review:count("SELECT COUNT(*) n FROM campaign_sends WHERE campaign_id=? AND status IN ('pending','needs_review')",id),
        click_through_rate:delivered ? clicked/delivered : null,
        inquiry_conversion_rate:(campaign.channel==='email'?clicked:traffic) ? inquiries/(campaign.channel==='email'?clicked:traffic) : null,
        customer_conversion_rate:inquiries ? customers/inquiries : null,tracked_url:campaignUrl(campaign,this.config.websiteOrigin) };
    });
  }
  exportResults(id: string): string {
    const summary = this.dashboard().find(row=>row.id===id);
    if (!summary) throw new Error('Campaign not found.');
    const recipients = this.store.db.prepare('SELECT r.company_name,r.email,s.status,s.provider_message_id,s.updated_at FROM campaign_recipients r LEFT JOIN campaign_sends s ON s.recipient_id=r.id WHERE r.campaign_id=? ORDER BY r.company_name').all(id);
    const columns = ['row_type','id','name','channel','status','recipients','traffic','simulated','accepted','delivered','clicked','inquiries','booked_conversations','customers','replies','bounced','unsubscribed','skipped','needs_review','click_through_rate','inquiry_conversion_rate','customer_conversion_rate','tracked_url','company_name','email','provider_message_id','updated_at'];
    const rows: Record<string,unknown>[] = [{row_type:'summary',...summary},...recipients.map(recipient=>({row_type:'recipient',id,name:summary.name,channel:summary.channel,...recipient}))];
    return [columns.map(csvCell).join(','),...rows.map(row=>columns.map(column=>csvCell(row[column])).join(','))].join('\r\n')+'\r\n';
  }
}
