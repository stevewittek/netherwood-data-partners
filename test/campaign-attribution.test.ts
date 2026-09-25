import test from "node:test";
import assert from "node:assert/strict";
import {
  ATTRIBUTION_SESSION_KEY,
  captureFirstTouch,
  parseCampaignAttribution,
} from "../app/lib/campaign-attribution.ts";
import { parseAttribution as parseMarketingAttribution } from "../marketing/src/attribution.ts";

class MemoryStorage {
  values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

test("website parser matches the marketing contract and excludes personal query data", () => {
  const url = new URL(
    "https://netherwooddatapartners.com/services/data-migration/?utm_source=email&utm_medium=outbound&utm_campaign=central_nj_test&utm_content=plain_a&nwd_campaign=abc123&email=person@example.test&gclid=private#contact",
  );
  const expected = {
    utm_source: "email",
    utm_medium: "outbound",
    utm_campaign: "central_nj_test",
    utm_content: "plain_a",
    nwd_campaign: "abc123",
    landing_page: "/services/data-migration/",
  };

  assert.deepEqual(parseCampaignAttribution(url), expected);
  assert.deepEqual(parseCampaignAttribution(url), parseMarketingAttribution(url));
  assert.equal(JSON.stringify(expected).includes("person@example.test"), false);
  assert.equal(JSON.stringify(expected).includes("gclid"), false);
});

test("first valid campaign touch remains fixed for the browser session", () => {
  const storage = new MemoryStorage();
  const first = captureFirstTouch(
    new URL(
      "https://netherwooddatapartners.com/services/data-migration/?utm_source=email&utm_campaign=central_nj_test&nwd_campaign=abc123",
    ),
    storage,
  );
  const later = captureFirstTouch(
    new URL(
      "https://netherwooddatapartners.com/migration-intake/?utm_source=google&utm_medium=cpc&utm_campaign=paid_test&nwd_campaign=xyz789",
    ),
    storage,
  );

  assert.deepEqual(later, first);
  assert.deepEqual(
    JSON.parse(storage.getItem(ATTRIBUTION_SESSION_KEY) ?? "{}"),
    first,
  );
});

test("direct, malformed and storage-denied visits never block or invent attribution", () => {
  const storage = new MemoryStorage();
  assert.deepEqual(
    captureFirstTouch(
      new URL("https://netherwooddatapartners.com/migration-intake/"),
      storage,
    ),
    {},
  );
  assert.equal(storage.getItem(ATTRIBUTION_SESSION_KEY), null);
  assert.deepEqual(
    parseCampaignAttribution({
      utm_source: "person@example.test",
      utm_medium: "a".repeat(101),
      landing_page: "/migration-intake/?email=private",
    }),
    {},
  );

  const denied = {
    getItem() {
      throw new Error("storage denied");
    },
    setItem() {
      throw new Error("storage denied");
    },
  };
  assert.deepEqual(
    captureFirstTouch(
      new URL(
        "https://netherwooddatapartners.com/?utm_source=referral&utm_campaign=partner_test",
      ),
      denied,
    ),
    {
      utm_source: "referral",
      utm_campaign: "partner_test",
      landing_page: "/",
    },
  );
});
