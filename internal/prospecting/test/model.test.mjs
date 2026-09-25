import assert from "node:assert/strict";
import test from "node:test";
import { approveOutreach, draftOutreach, publicUrl, restoreLead, saveOutreach, scoreEvidence, STATUSES, validateLead } from "../model.mjs";

const date = new Date().toISOString().slice(0, 10);
const base = () => ({ company_name: "Synthetic test business", industry: "Manufacturing", public_email: "research@example.com", lead_status: "Qualified", source_urls: ["https://example.com/company"] });
const fact = (signal = "planned_replacement") => ({ kind: "FACT", statement: "Synthetic fixture describing an announced replacement project.", source_urls: ["https://example.com/announcement"], research_date: date, signal, rationale: "The public announcement explicitly describes this project." });

test("creates all requested fields without inferring internal systems", () => {
  const lead = validateLead({ ...base(), year_founded: "1984", number_of_locations: 2, technology_clues: "Old-looking website; internal systems unknown" });
  assert.equal(lead.legacy_likelihood_score, 0);
  assert.equal(lead.migration_opportunity_score, 0);
  assert.equal(lead.potential_project_value_score, 0);
  assert.equal(lead.confidence, "Not established");
  assert.equal(lead.year_founded, 1984);
  for (const field of ["company_id", "company_name", "website", "industry", "address", "city", "county", "state", "zip", "phone", "public_email", "public_contact_name", "year_founded", "estimated_employee_count", "number_of_locations", "description", "research_notes", "technology_clues", "legacy_system_clues", "migration_clues", "potential_platform_category", "likely_project_type", "legacy_likelihood_score", "migration_opportunity_score", "potential_project_value_score", "confidence", "source_urls", "research_date", "lead_status", "last_contacted", "next_action", "do_not_contact", "notes"]) assert.ok(Object.hasOwn(lead, field), field);
  assert.equal(STATUSES.length, 13);
});
test("bounded validation rejects malformed fields, fabricated status, invalid dates and unsourced facts", () => {
  for (const change of [{ company_name: "" }, { company_name: "a".repeat(501) }, { public_email: "bad" }, { year_founded: 9999 }, { research_date: "2025-02-31" }, { source_urls: "https://example.com" }, { do_not_contact: "false" }, { evidence: [fact(), { ...fact(), source_urls: [] }] }, { evidence: [{ ...fact(), rationale: "" }] }, { lead_status: "Approved for Outreach" }]) assert.throws(() => validateLead({ ...base(), ...change }));
});
test("only sourced facts score, each signal once, and reasons reference evidence", () => {
  const lead = validateLead({ ...base(), evidence: [fact(), fact(), { ...fact("legacy_platform"), kind: "INFERENCE" }, { ...fact("unsupported_product"), kind: "OPPORTUNITY" }] });
  assert.equal(lead.migration_opportunity_score, 65);
  assert.equal(lead.legacy_likelihood_score, 0);
  assert.equal(lead.score_reasons.length, 1);
  assert.equal(lead.score_reasons[0].evidence_id, lead.evidence[0].evidence_id);
  assert.deepEqual(scoreEvidence([]).score_reasons, []);
});
test("public URL references reject credential, local, IP, protocol and port targets", () => {
  for (const url of ["javascript:alert(1)", "file:///etc/passwd", "http://localhost/a", "http://127.0.0.1/a", "http://2130706433", "http://[::1]", "https://user:password@example.com", "https://intranet.local", "https://example.com:1234", "https://example.com."]) assert.throws(() => publicUrl(url), url);
  assert.equal(publicUrl("https://example.com/public.pdf"), "https://example.com/public.pdf");
});
test("suppression is sticky, clears drafts, and blocks future drafting and approval", () => {
  const lead = draftOutreach(validateLead(base()));
  const suppressed = validateLead({ ...lead, do_not_contact: true }, lead);
  assert.equal(suppressed.lead_status, "Do Not Contact");
  assert.equal(suppressed.outreach, null);
  assert.throws(() => validateLead({ ...suppressed, do_not_contact: false, lead_status: "Qualified" }, suppressed), /Suppression/);
  assert.throws(() => draftOutreach(suppressed), /suppressed/);
  assert.throws(() => saveOutreach(suppressed, { subject: "Hello", body: "Hello" }), /suppressed/);
  assert.throws(() => approveOutreach(suppressed, { reviewer: "Test Reviewer", confirm_reviewed: true }), /suppressed/);
});
test("contact-history retention cannot be cleared by changing the status or contact date", () => {
  const contacted = validateLead({ ...base(), lead_status: "Contacted" });
  const edited = validateLead({ ...contacted, lead_status: "Unresearched", last_contacted: "", has_contact_history: false }, contacted);
  assert.equal(edited.has_contact_history, true);
});
test("drafts require qualification and don't invent company problems", () => {
  assert.throws(() => draftOutreach(validateLead({ ...base(), lead_status: "Unresearched" })), /Qualify/);
  const lead = draftOutreach(validateLead(base()));
  assert.match(lead.outreach.body, /Synthetic test business is considering/);
  assert.doesNotMatch(lead.outreach.body, /your technology is outdated|you use legacy|your legacy system/i);
  assert.equal(lead.lead_status, "Outreach Drafted");
});
test("approval needs an explicit human, recipient and exact saved draft; edits invalidate approval", () => {
  const lead = draftOutreach(validateLead(base()));
  assert.throws(() => approveOutreach(lead, { reviewer: "Test Reviewer" }), /Explicit human/);
  assert.throws(() => approveOutreach(lead, { reviewer: "", confirm_reviewed: true }), /reviewer/);
  assert.throws(() => approveOutreach({ ...lead, public_email: "" }, { reviewer: "Test Reviewer", confirm_reviewed: true }), /email/);
  const approved = approveOutreach(lead, { reviewer: "Test Reviewer", confirm_reviewed: true });
  assert.equal(approved.lead_status, "Approved for Outreach");
  assert.equal(approved.outreach.approval.draft_sha256.length, 64);
  assert.equal(saveOutreach(approved, { subject: "Revised subject", body: "Revised draft" }).outreach.approval, null);
  const edited = validateLead({ ...approved, notes: "New research" }, approved);
  assert.equal(edited.outreach.approval, null);
  assert.equal(edited.lead_status, "Outreach Drafted");
});
test("disk reload validates evidence, contact flags, timestamps and the exact approved draft", () => {
  const approved = approveOutreach(draftOutreach(validateLead(base())), { reviewer: "Test Reviewer", confirm_reviewed: true });
  assert.deepEqual(restoreLead(approved), approved);
  assert.throws(() => restoreLead({ ...approved, public_email: "different@example.com" }), /does not match/);
  assert.throws(() => restoreLead({ ...approved, updated_at: "yesterday" }), /timestamp/);
  assert.throws(() => restoreLead({ ...approved, has_contact_history: "false" }), /contact-history/);
  assert.throws(() => restoreLead({ ...approved, evidence: [{ ...fact(), source_urls: ["javascript:alert(1)"] }] }));
});
