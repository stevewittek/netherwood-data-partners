export const CAMPAIGN_ATTRIBUTION_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "nwd_campaign",
] as const;

export const ATTRIBUTION_MODEL = "first_touch_v1";
export const ATTRIBUTION_SESSION_KEY = "nwd.first_touch.v1";

export type CampaignAttribution = Partial<
  Record<(typeof CAMPAIGN_ATTRIBUTION_FIELDS)[number], string>
> & { landing_page?: string };

type SessionStorageLike = Pick<Storage, "getItem" | "setItem">;

const safeTag = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,99}$/.test(value);

export function hasCampaignAttribution(value: CampaignAttribution): boolean {
  return CAMPAIGN_ATTRIBUTION_FIELDS.some((field) => Boolean(value[field]));
}

/**
 * Keep only campaign tags from the shared Voyager 1 contract. Query strings,
 * fragments, referrers, advertising identifiers and personal values are never
 * copied into the landing-page field.
 */
export function parseCampaignAttribution(
  input: URL | URLSearchParams | Record<string, unknown>,
): CampaignAttribution {
  const values: Record<string, unknown> =
    input instanceof URL
      ? Object.fromEntries(input.searchParams)
      : input instanceof URLSearchParams
        ? Object.fromEntries(input)
        : input;
  const result: CampaignAttribution = {};

  for (const field of CAMPAIGN_ATTRIBUTION_FIELDS) {
    if (safeTag(values[field])) result[field] = values[field];
  }

  if (!hasCampaignAttribution(result)) return {};

  const path = input instanceof URL ? input.pathname : values.landing_page;
  if (
    typeof path === "string" &&
    /^\/[a-zA-Z0-9_./-]{0,199}$/.test(path) &&
    !path.startsWith("//")
  ) {
    result.landing_page = path;
  }

  return result;
}

function readStoredAttribution(
  storage: SessionStorageLike | undefined,
): CampaignAttribution {
  if (!storage) return {};

  try {
    const raw = storage.getItem(ATTRIBUTION_SESSION_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parseCampaignAttribution(parsed as Record<string, unknown>);
  } catch {
    return {};
  }
}

/**
 * Preserve one first touch for the current browser tab only. Storage denial is
 * non-fatal and falls back to the current page without cookies or localStorage.
 */
export function captureFirstTouch(
  url: URL,
  storage?: SessionStorageLike,
): CampaignAttribution {
  const stored = readStoredAttribution(storage);
  if (hasCampaignAttribution(stored)) return stored;

  const incoming = parseCampaignAttribution(url);
  if (!hasCampaignAttribution(incoming)) return {};

  try {
    storage?.setItem(ATTRIBUTION_SESSION_KEY, JSON.stringify(incoming));
  } catch {
    // Attribution must never block navigation or inquiry submission.
  }

  return incoming;
}

export function browserSessionStorage(): SessionStorageLike | undefined {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}
