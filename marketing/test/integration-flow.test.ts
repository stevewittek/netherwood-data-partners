import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ATTRIBUTION_MODEL,
  parseCampaignAttribution,
} from "../../app/lib/campaign-attribution.ts";
import { CampaignService } from "../src/campaigns.ts";
import type { EmailMessage } from "../src/provider.ts";
import { LocalEmailProvider } from "../src/provider.ts";
import { MarketingStore } from "../src/store.ts";

const mapping = {
  company_name: "Business Name",
  general_public_email: "Email",
  website: "Website",
  industry: "Industry",
  city: "Town",
  state: "State",
} as const;

const csv = [
  "Business Name,Email,Website,Industry,Town,State",
  "Central Machine TEST,hello@central-machine.example.test,central-machine.example.test,Manufacturing,Cranford,NJ",
  "Middlesex Accounting TEST,hello@middlesex-accounting.example.test,middlesex-accounting.example.test,Accounting,Edison,NJ",
  "Suppressed Business TEST,stop@suppressed.example.test,suppressed.example.test,Distribution,Plainfield,NJ",
].join("\n");

function outboxMessages(directory: string): EmailMessage[] {
  return readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .map(
      (file) =>
        (
          JSON.parse(readFileSync(join(directory, file), "utf8")) as {
            message: EmailMessage;
          }
        ).message,
    );
}

test("synthetic campaign flows from import through conversion attribution and unsubscribe", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "ndp-integrated-campaign-"));
  const store = new MarketingStore(":memory:");
  t.after(() => {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  });

  store.suppress(
    "stop@suppressed.example.test",
    "manual",
    "Synthetic acceptance fixture",
  );
  const list = store.createList("Central New Jersey synthetic acceptance");
  assert.deepEqual(
    store.importCsv(
      list.id,
      csv,
      mapping,
      "Synthetic integration fixture",
      "marketing/examples/synthetic-companies.csv",
    ),
    { imported: 3, duplicates: 0, suppressed: 1, skipped: 0, total: 3 },
  );
  assert.equal(store.eligibleCompanies(list.id).length, 2);

  const service = new CampaignService(store, new LocalEmailProvider(directory), {
    publicBaseUrl: "http://127.0.0.1:4310",
    websiteOrigin: "https://netherwooddatapartners.com",
    senderName: "Netherwood Data Partners",
    senderEmail: "sender@example.test",
    postalAddress: "LOCAL SYNTHETIC TEST ONLY",
    testRecipient: "owner@example.test",
  });
  const campaign = service.create({
    name: "Central New Jersey synthetic acceptance",
    channel: "email",
    list_id: list.id,
    landing_page: "/services/data-migration/",
    utm_campaign: "central_nj_synthetic_acceptance",
  });
  const preview = service.preview(campaign.id);
  assert.equal(preview.recipientCount, 2);
  await service.testSend(campaign.id);
  service.ready(campaign.id);
  service.approve(campaign.id, {
    recipientCount: preview.recipientCount,
    confirmation: "APPROVE",
  });
  await service.send(campaign.id, {
    recipientCount: preview.recipientCount,
    confirmation: "SEND",
  });

  const prospectMessage = outboxMessages(directory).find(
    (message) => !message.test,
  );
  assert.ok(prospectMessage);
  const clickToken = /\/r\/([A-Za-z0-9_-]{43})/.exec(prospectMessage.text)?.[1];
  assert.ok(clickToken);
  const destination = service.resolveClick(clickToken);
  assert.ok(destination);
  const attribution = parseCampaignAttribution(new URL(destination));
  assert.deepEqual(attribution, {
    utm_source: "email",
    utm_medium: "outbound",
    utm_campaign: "central_nj_synthetic_acceptance",
    nwd_campaign: campaign.campaign_code,
    landing_page: "/services/data-migration/",
  });
  assert.equal(ATTRIBUTION_MODEL, "first_touch_v1");

  const event = {
    event_id: "synthetic_formspark_inquiry_001",
    event_name: "inquiry_submitted" as const,
    campaign_code: attribution.nwd_campaign,
    source: attribution.utm_source,
    attribution,
  };
  assert.deepEqual(service.recordAttributionEvent(event), {
    accepted: true,
    duplicate: false,
  });
  assert.deepEqual(service.recordAttributionEvent(event), {
    accepted: true,
    duplicate: true,
  });

  const unsubscribeToken = new URL(prospectMessage.unsubscribeUrl).pathname
    .split("/")
    .pop();
  assert.ok(unsubscribeToken);
  assert.equal(service.inspectUnsubscribe(unsubscribeToken), true);
  assert.equal(store.isSuppressed(prospectMessage.to), false);
  assert.equal(service.unsubscribe(unsubscribeToken), true);
  assert.equal(store.isSuppressed(prospectMessage.to), true);

  const reimport = store.createList("Synthetic reimport acceptance");
  store.importCsv(
    reimport.id,
    `Business Name,Email\nReimport TEST,${prospectMessage.to}`,
    { company_name: "Business Name", general_public_email: "Email" },
    "Synthetic reimport fixture",
  );
  assert.equal(store.eligibleCompanies(reimport.id).length, 0);

  const dashboard = service.dashboard().find((row) => row.id === campaign.id);
  assert.ok(dashboard);
  assert.equal(dashboard.simulated, 2);
  assert.equal(dashboard.delivered, 0);
  assert.equal(dashboard.inquiries, 1);
  assert.equal(dashboard.unsubscribed, 1);
});
