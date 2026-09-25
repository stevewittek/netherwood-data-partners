import { createHash, randomUUID } from "node:crypto";
import { isIP } from "node:net";

export const STATUSES = ["Unresearched", "Researching", "Qualified", "High Priority", "Outreach Drafted", "Approved for Outreach", "Contacted", "Responded", "Discovery Scheduled", "Opportunity", "Customer", "Not a Fit", "Do Not Contact"];
export const INDUSTRIES = ["Manufacturing", "Machine shops", "Wholesale / distribution", "Law firms", "CPA / accounting", "Dental", "Veterinary", "Medical groups", "HVAC", "Plumbing", "Electrical", "Roofing", "Construction", "Property management", "Print / sign", "Auto service", "Other established business"];
export const SIGNALS = {
  context: { label: "Company context / no scoring", legacy: 0, migration: 0, value: 0 },
  legacy_platform: { label: "Explicit reference to a legacy application", legacy: 35, migration: 10, value: 0 },
  unsupported_product: { label: "Explicit product discontinuation / support ending", legacy: 65, migration: 35, value: 0 },
  planned_replacement: { label: "Explicit software replacement / migration plan", legacy: 0, migration: 65, value: 15 },
  import_requirement: { label: "Explicit data import / conversion requirement", legacy: 0, migration: 30, value: 10 },
  duplicate_entry: { label: "Documented duplicate-entry / manual workflow", legacy: 0, migration: 20, value: 10 },
  multiple_systems: { label: "Documented data in multiple business systems", legacy: 0, migration: 20, value: 20 },
  document_volume: { label: "Documented substantial document migration", legacy: 0, migration: 15, value: 25 },
  multiple_locations: { label: "Documented multiple operating locations", legacy: 0, migration: 0, value: 20 },
};
export const TEXT_FIELDS = ["company_name", "website", "industry", "address", "city", "county", "state", "zip", "phone", "public_email", "public_contact_name", "description", "research_notes", "technology_clues", "legacy_system_clues", "migration_clues", "potential_platform_category", "likely_project_type", "next_action", "notes"];
export const NUMBER_FIELDS = ["year_founded", "estimated_employee_count", "number_of_locations"];
const MANAGED_STATUSES = new Set(["Outreach Drafted", "Approved for Outreach"]);

export class ValidationError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
function assert(condition, message, status) { if (!condition) throw new ValidationError(message, status); }
function plainObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function text(value, label, max = 4000) {
  assert(value === undefined || typeof value === "string", `${label} must be text.`);
  const result = (value ?? "").trim();
  assert(result.length <= max && ![...result].some((character) => character.codePointAt(0) < 32 && !["\t", "\n", "\r"].includes(character)), `${label} is too long or contains invalid characters.`);
  return result;
}
export function publicUrl(value) {
  const source = text(value, "URL", 2000);
  if (!source) return "";
  let url;
  try { url = new URL(source); } catch { throw new ValidationError("Use a complete public https:// or http:// URL."); }
  const host = url.hostname.toLowerCase();
  assert(["https:", "http:"].includes(url.protocol) && !url.username && !url.password && !url.port && host.includes(".") && !isIP(host) && !host.includes(":") && !host.endsWith(".") && !/(^|\.)(localhost|local|internal|test|invalid|onion)$/u.test(host), "Use a public website hostname, without credentials, IP addresses, or custom ports.");
  // This validates stored research references only. This application never fetches URLs.
  return url.href;
}
function urls(value, label) {
  assert(value === undefined || Array.isArray(value), `${label} must be a list.`);
  assert((value ?? []).length <= 30, `${label} allows at most 30 references.`);
  return [...new Set((value ?? []).map(publicUrl).filter(Boolean))];
}
function date(value, label) {
  const result = text(value, label, 10);
  assert(!result || (/^\d{4}-\d{2}-\d{2}$/u.test(result) && !Number.isNaN(Date.parse(result)) && new Date(result).toISOString().slice(0, 10) === result && result <= new Date().toISOString().slice(0, 10)), `${label} must be a valid date, no later than today.`);
  return result;
}
function validateEvidence(input) {
  assert(input === undefined || Array.isArray(input), "Evidence must be a list.");
  assert((input ?? []).length <= 100, "At most 100 evidence records per company.");
  const seen = new Set();
  return (input ?? []).map((item) => {
    assert(plainObject(item), "Invalid evidence record.");
    const evidence_id = item.evidence_id || randomUUID();
    assert(typeof evidence_id === "string" && /^[a-f0-9-]{36}$/u.test(evidence_id) && !seen.has(evidence_id), "Invalid or duplicate evidence identifier.");
    seen.add(evidence_id);
    const kind = item.kind;
    assert(["FACT", "INFERENCE", "OPPORTUNITY"].includes(kind), "Evidence must distinguish FACT, INFERENCE, and OPPORTUNITY.");
    const statement = text(item.statement, "Evidence statement", 2000);
    assert(statement.length > 0, "Evidence needs a statement.");
    const source_urls = urls(item.source_urls, "Evidence sources");
    assert(kind !== "FACT" || source_urls.length > 0, "A FACT needs at least one public source URL.");
    const research_date = date(item.research_date, "Evidence research date");
    assert(research_date, "Evidence needs a research date.");
    const signal = item.signal || "context";
    assert(Object.hasOwn(SIGNALS, signal), "Unknown evidence signal.");
    const rationale = text(item.rationale, "Evidence rationale", 2000);
    assert(kind !== "FACT" || signal === "context" || rationale.length >= 10, "Explain how the cited fact supports this scoring signal.");
    return { evidence_id, kind, statement, source_urls, research_date, signal, rationale };
  });
}
export function scoreEvidence(evidence) {
  const scores = { legacy_likelihood_score: 0, migration_opportunity_score: 0, potential_project_value_score: 0 };
  const reasons = [];
  const seen = new Set();
  for (const item of evidence) {
    if (item.kind !== "FACT" || !item.source_urls.length || seen.has(item.signal) || item.signal === "context") continue;
    seen.add(item.signal);
    const signal = SIGNALS[item.signal];
    scores.legacy_likelihood_score += signal.legacy;
    scores.migration_opportunity_score += signal.migration;
    scores.potential_project_value_score += signal.value;
    reasons.push({ evidence_id: item.evidence_id, signal: item.signal, label: signal.label, legacy: signal.legacy, migration: signal.migration, value: signal.value });
  }
  for (const key of Object.keys(scores)) scores[key] = Math.min(scores[key], 100);
  return { ...scores, confidence: reasons.length >= 3 ? "Several sourced signals" : reasons.length ? "Limited sourced signals" : "Not established", score_reasons: reasons, score_version: 1 };
}
export function validateLead(input, previous = null) {
  assert(plainObject(input), "Lead must be an object.");
  const now = new Date().toISOString();
  const lead = { company_id: previous?.company_id || randomUUID() };
  for (const field of TEXT_FIELDS) lead[field] = text(input[field], field, field.endsWith("notes") || field.endsWith("clues") || field === "description" ? 4000 : 500);
  assert(lead.company_name.length > 0, "Company name is required.");
  lead.website = publicUrl(input.website);
  assert(!lead.public_email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(lead.public_email), "Enter a valid public business email.");
  for (const field of NUMBER_FIELDS) {
    const value = input[field];
    assert(value === undefined || value === null || typeof value === "string" || typeof value === "number", `Invalid ${field}.`);
    lead[field] = value === "" || value === undefined || value === null ? null : Number(value);
    assert(lead[field] === null || (Number.isInteger(lead[field]) && lead[field] >= (field === "year_founded" ? 1000 : 1) && lead[field] <= (field === "year_founded" ? new Date().getFullYear() : 10000000)), `Invalid ${field}.`);
  }
  lead.source_urls = urls(input.source_urls, "Source URLs");
  lead.research_date = date(input.research_date, "Research date");
  lead.last_contacted = date(input.last_contacted, "Last contacted");
  lead.lead_status = input.lead_status ?? "Unresearched";
  assert(STATUSES.includes(lead.lead_status), "Unknown lead status.");
  assert(!MANAGED_STATUSES.has(lead.lead_status) || previous?.lead_status === lead.lead_status, "Use the draft and approval actions to set this status.");
  assert(input.do_not_contact === undefined || typeof input.do_not_contact === "boolean", "Do not contact must be true or false.");
  lead.do_not_contact = Boolean(input.do_not_contact) || lead.lead_status === "Do Not Contact";
  // Suppression cannot be undone by routine edits. Keep the record instead of deleting its history.
  assert(!previous?.do_not_contact || lead.do_not_contact, "Suppression is retained. Removing it requires a separately reviewed future workflow.");
  if (lead.do_not_contact) lead.lead_status = "Do Not Contact";
  lead.has_contact_history = Boolean(previous?.has_contact_history || previous?.last_contacted || lead.last_contacted || ["Contacted", "Responded", "Discovery Scheduled", "Opportunity", "Customer"].includes(lead.lead_status) || ["Contacted", "Responded", "Discovery Scheduled", "Opportunity", "Customer"].includes(previous?.lead_status));
  lead.evidence = validateEvidence(input.evidence);
  Object.assign(lead, scoreEvidence(lead.evidence));
  lead.outreach = previous?.outreach ? { ...previous.outreach, approval: null } : null;
  if (lead.do_not_contact) lead.outreach = null;
  if (lead.lead_status === "Approved for Outreach") lead.lead_status = "Outreach Drafted";
  lead.created_at = previous?.created_at || now;
  lead.updated_at = now;
  lead.revision = (previous?.revision || 0) + 1;
  return lead;
}
function outreachAllowed(lead) {
  assert(!lead.do_not_contact && lead.lead_status !== "Do Not Contact", "This company is suppressed; outreach is disabled.", 409);
  assert(!["Unresearched", "Researching", "Not a Fit"].includes(lead.lead_status), "Qualify the company's fit before preparing outreach.", 409);
}
export function draftOutreach(lead) {
  outreachAllowed(lead);
  const industry = lead.industry.toLowerCase();
  const focus = industry.includes("manufact") || industry.includes("machine")
    ? "operational, inventory and historical data into modern ERP and cloud platforms"
    : industry.includes("law") || industry.includes("account")
      ? "historical client, document and operational data into modern practice-management and document platforms"
      : "historical data from databases, spreadsheets and business systems into their chosen modern platform";
  const body = `Hello,\n\nI'm Steven at Netherwood Data Partners. We help established businesses move ${focus}.\n\nIf ${lead.company_name} is considering replacing business software, we can work with your chosen provider to extract, clean, map and validate the information you need to carry forward.\n\nWould a conversation about any planned system changes be useful?\n\nSteven Wittek\nNetherwood Data Partners`;
  return saveOutreach(lead, { subject: "Support for a future business software migration", body, reviewer: "" });
}
export function saveOutreach(lead, input) {
  outreachAllowed(lead);
  assert(plainObject(input), "Invalid draft.");
  const subject = text(input.subject, "Subject", 200);
  const body = text(input.body, "Draft body", 8000);
  assert(subject && body, "Subject and draft text are required.");
  assert(!/[\r\n]/u.test(subject), "Subject must be one line.");
  return { ...lead, lead_status: "Outreach Drafted", revision: lead.revision + 1, updated_at: new Date().toISOString(), outreach: { subject, body, generated_at: lead.outreach?.generated_at || new Date().toISOString(), approval: null } };
}
function draftDigest(lead) {
  return createHash("sha256").update(JSON.stringify({ company_id: lead.company_id, recipient: lead.public_email, subject: lead.outreach.subject, body: lead.outreach.body })).digest("hex");
}
export function approveOutreach(lead, input) {
  outreachAllowed(lead);
  assert(lead.outreach, "Create and review a draft before approving it.");
  assert(lead.public_email, "Record the intended public business email before approving this draft.");
  assert(input?.confirm_reviewed === true, "Explicit human review confirmation is required.");
  const reviewer = text(input.reviewer, "Reviewer", 100);
  assert(reviewer.length >= 2, "Record the human reviewer's name.");
  const digest = draftDigest(lead);
  return { ...lead, lead_status: "Approved for Outreach", revision: lead.revision + 1, updated_at: new Date().toISOString(), outreach: { ...lead.outreach, approval: { reviewer, approved_at: new Date().toISOString(), draft_sha256: digest } } };
}

// The disk format is a boundary too: reject damaged/manual imports without overwriting them.
export function restoreLead(input) {
  assert(plainObject(input) && typeof input.company_id === "string" && /^[a-f0-9-]{36}$/u.test(input.company_id) && Number.isSafeInteger(input.revision) && input.revision > 0, "Invalid stored company identity or revision.");
  assert(typeof input.has_contact_history === "boolean", "Invalid stored contact-history marker.");
  const restored = validateLead(input, input);
  restored.revision = input.revision;
  restored.lead_status = input.do_not_contact ? "Do Not Contact" : input.lead_status;
  const timestamp = (value) => {
    assert(typeof value === "string" && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value, "Invalid stored timestamp.");
    return value;
  };
  restored.created_at = timestamp(input.created_at);
  restored.updated_at = timestamp(input.updated_at);
  restored.outreach = null;
  if (input.outreach !== null && input.outreach !== undefined) {
    assert(plainObject(input.outreach) && !restored.do_not_contact, "Invalid stored outreach or suppressed draft.");
    const subject = text(input.outreach.subject, "Stored subject", 200);
    const body = text(input.outreach.body, "Stored draft", 8000);
    assert(subject && body && !/[\r\n]/u.test(subject), "Invalid stored outreach text.");
    restored.outreach = { subject, body, generated_at: timestamp(input.outreach.generated_at), approval: null };
    if (input.outreach.approval) {
      const approval = input.outreach.approval;
      assert(plainObject(approval), "Invalid stored approval.");
      const reviewer = text(approval.reviewer, "Stored reviewer", 100);
      assert(reviewer.length >= 2 && restored.public_email && restored.lead_status === "Approved for Outreach" && approval.draft_sha256 === draftDigest(restored), "Stored approval does not match the reviewed draft and recipient.");
      restored.outreach.approval = { reviewer, approved_at: timestamp(approval.approved_at), draft_sha256: approval.draft_sha256 };
    }
  }
  assert(!MANAGED_STATUSES.has(restored.lead_status) || restored.outreach, "Stored outreach status is missing its draft.");
  assert(restored.lead_status !== "Approved for Outreach" || restored.outreach?.approval, "Stored approval status is missing human review.");
  return restored;
}
