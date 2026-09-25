import { randomBytes } from 'node:crypto';

export const ATTRIBUTION_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'nwd_campaign'] as const;
export type Attribution = Partial<Record<typeof ATTRIBUTION_FIELDS[number], string>> & { landing_page?: string };
export const CONVERSION_EVENTS = ['inquiry_submitted', 'conversation_booked', 'customer_created'] as const;
export interface AttributionEvent {
  event_id: string; event_name: typeof CONVERSION_EVENTS[number]; campaign_code?: string;
  attribution?: Attribution; source?: string; occurred_at?: string;
}
export const newCampaignCode = (): string => randomBytes(9).toString('hex');
const safeTag = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,99}$/.test(value);
/** Strict allowlist excludes email, names, referrer URLs and advertising identifiers. */
export function parseAttribution(input: URL | URLSearchParams | Record<string, unknown>): Attribution {
  const values: Record<string, unknown> = input instanceof URL ? Object.fromEntries(input.searchParams) : input instanceof URLSearchParams ? Object.fromEntries(input) : input;
  const result: Attribution = {};
  for (const field of ATTRIBUTION_FIELDS) if (safeTag(values[field])) result[field] = values[field];
  const path = input instanceof URL ? input.pathname : values.landing_page;
  if (typeof path === 'string' && /^\/[a-zA-Z0-9_./-]{0,199}$/.test(path) && !path.startsWith('//')) result.landing_page = path;
  return result;
}
export function validateLandingPage(landingPage: string, websiteOrigin: string): URL {
  if (typeof landingPage !== 'string' || !landingPage.trim()) throw new Error('Landing page is required.');
  const origin = new URL(websiteOrigin);
  const url = new URL(landingPage, origin);
  if (origin.protocol !== 'https:' || url.protocol !== 'https:' || url.origin !== origin.origin || url.username || url.password) throw new Error('Landing page must use HTTPS on the configured public website origin.');
  if (!/^\/[A-Za-z0-9_./-]{0,199}$/.test(url.pathname) || url.pathname.startsWith('//')) throw new Error('Use a clean public website path without personal information.');
  if (url.hash && !/^#[A-Za-z][A-Za-z0-9_-]{0,99}$/.test(url.hash)) throw new Error('Use a plain section anchor without personal information.');
  if (url.href.length > 1500) throw new Error('Landing page is too long.');
  for (const key of url.searchParams.keys()) if (!(ATTRIBUTION_FIELDS as readonly string[]).includes(key)) throw new Error('Landing page contains unsupported query parameters. Use a clean website URL.');
  return url;
}
export function campaignUrl(campaign: { landing_page: string; campaign_code: string; utm_source: string; utm_medium: string; utm_campaign: string; utm_content?: string }, websiteOrigin: string): string {
  const url = validateLandingPage(campaign.landing_page, websiteOrigin);
  const tags = { utm_source: campaign.utm_source, utm_medium: campaign.utm_medium, utm_campaign: campaign.utm_campaign, utm_content: campaign.utm_content, nwd_campaign: campaign.campaign_code };
  for (const [key, value] of Object.entries(tags)) {
    if (value) { if (!safeTag(value)) throw new Error(`Invalid campaign field: ${key}`); url.searchParams.set(key, value); }
    else url.searchParams.delete(key);
  }
  return url.href;
}
export function validateAttributionEvent(input: AttributionEvent): AttributionEvent {
  if (!input || !safeTag(input.event_id) || !CONVERSION_EVENTS.includes(input.event_name)) throw new Error('Use a unique opaque event_id and a supported conversion event_name.');
  const attribution = parseAttribution(input.attribution ?? {});
  const campaignCode = input.campaign_code ?? attribution.nwd_campaign;
  if (campaignCode && !safeTag(campaignCode)) throw new Error('Invalid campaign code.');
  if (campaignCode && attribution.nwd_campaign && campaignCode !== attribution.nwd_campaign) throw new Error('Conflicting campaign codes.');
  const source = input.source ?? attribution.utm_source ?? 'unknown';
  if (!safeTag(source)) throw new Error('Invalid source.');
  const occurredAt = input.occurred_at ?? new Date().toISOString();
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(occurredAt) || !Number.isFinite(Date.parse(occurredAt)) || new Date(occurredAt).toISOString() !== (occurredAt.includes('.') ? occurredAt : occurredAt.replace('Z','.000Z')) || Date.parse(occurredAt) > Date.now() + 300_000) throw new Error('occurred_at must be a valid UTC timestamp, not in the future.');
  return { event_id: input.event_id, event_name: input.event_name, campaign_code: campaignCode, attribution, source, occurred_at: occurredAt };
}
