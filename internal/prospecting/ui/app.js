const $ = (id) => document.getElementById(id);
let session;
let leads = [];
let selected = null;
let dirty = false;
let leadDirty = false;
let draftDirty = false;
let busy = false;
const fieldDefinitions = [
  ["company_name", "Company name", "text", true], ["website", "Public website", "url"],
  ["industry", "Industry", "industry"], ["public_contact_name", "Public business contact name", "text"],
  ["public_email", "Public business email", "email"], ["phone", "Public phone", "tel"],
  ["address", "Business address", "text"], ["city", "City", "text"],
  ["county", "County", "text"], ["state", "State", "text"], ["zip", "ZIP code", "text"],
  ["year_founded", "Year founded (if sourced)", "number"], ["estimated_employee_count", "Estimated employees (label evidence as estimate)", "number"], ["number_of_locations", "Number of locations (if sourced)", "number"],
  ["description", "Business description", "textarea"],
  ["lead_status", "Lead status", "status"], ["research_date", "Research date", "date"],
  ["last_contacted", "Last contacted (manual historical record)", "date"], ["next_action", "Next action", "text"],
  ["potential_platform_category", "Potential platform category (opportunity, not a confirmed need)", "text"],
  ["likely_project_type", "Potential project type (opportunity)", "text"],
  ["source_urls", "Public source URLs (one per line)", "textarea"],
  ["technology_clues", "Technology clues — label unknowns and cite evidence below", "textarea"],
  ["legacy_system_clues", "Legacy-system clues — no claim without direct evidence", "textarea"],
  ["migration_clues", "Migration clues", "textarea"], ["research_notes", "Research notes", "textarea"], ["notes", "Internal notes", "textarea"],
];
function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}
function option(value, label = value) { const element = node("option", label); element.value = value; return element; }
function status(message) { $("status").textContent = message; }
async function api(path, method = "GET", body) {
  const response = await fetch(path, { method, headers: body ? { "Content-Type": "application/json", "X-CSRF-Token": session.csrf } : {}, ...(body ? { body: JSON.stringify(body) } : {}) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The local request failed.");
  return result;
}
async function action(operation) {
  if (busy) return;
  busy = true;
  document.body.setAttribute("aria-busy", "true");
  try { await operation(); } catch (error) { status(error.message); }
  finally { busy = false; document.body.removeAttribute("aria-busy"); }
}
function buildFields() {
  for (const [name, label, type, required] of fieldDefinitions) {
    const wrapper = node("div", undefined, type === "textarea" ? "wide field" : "field");
    const labelElement = node("label", label);
    labelElement.htmlFor = name;
    const control = node(type === "textarea" ? "textarea" : ["industry", "status"].includes(type) ? "select" : "input");
    control.id = name;
    control.name = name;
    if (control.tagName === "INPUT") control.type = type;
    if (["text", "email", "tel"].includes(type)) control.maxLength = 500;
    if (type === "url") control.maxLength = 2000;
    if (type === "textarea") control.maxLength = name === "source_urls" ? 30000 : 4000;
    if (required) control.required = true;
    if (type === "number") { control.min = name === "year_founded" ? "1000" : "1"; control.max = name === "year_founded" ? String(new Date().getFullYear()) : "10000000"; }
    if (type === "date") control.max = new Date().toISOString().slice(0, 10);
    if (type === "industry") { control.append(option("", "Not recorded"), ...session.industries.map((item) => option(item))); }
    if (type === "status") {
      control.append(...session.statuses.map((item) => { const itemOption = option(item); itemOption.disabled = ["Outreach Drafted", "Approved for Outreach"].includes(item); return itemOption; }));
    }
    wrapper.append(labelElement, control);
    $(fieldDefinitions.findIndex((item) => item[0] === name) < 15 ? "identity-fields" : "research-fields").append(wrapper);
  }
  $("industry-filter").append(...session.industries.map((item) => option(item)));
  $("status-filter").append(...session.statuses.map((item) => option(item)));
}
function confirmNavigation() { return !dirty || window.confirm("Discard your unsaved changes?"); }
function showCompanies() {
  const query = $("search").value.toLowerCase().trim();
  const county = $("county-filter").value;
  const industry = $("industry-filter").value;
  const state = $("status-filter").value;
  const filtered = leads.filter((lead) => (!query || [lead.company_name, lead.city, lead.description, lead.notes, lead.research_notes].some((value) => value.toLowerCase().includes(query))) && (!county || (county === "other" ? !["Union", "Somerset", "Middlesex"].includes(lead.county) : lead.county.toLowerCase() === county.toLowerCase())) && (!industry || lead.industry === industry) && (!state || lead.lead_status === state));
  filtered.sort((a, b) => b.migration_opportunity_score - a.migration_opportunity_score || a.company_name.localeCompare(b.company_name));
  $("company-count").textContent = `${filtered.length} of ${leads.length} companies`;
  $("companies").replaceChildren(...filtered.map((lead) => {
    const item = node("li");
    const button = node("button", lead.company_name);
    button.type = "button";
    button.setAttribute("aria-pressed", String(lead.company_id === selected?.company_id));
    button.append(node("small", `${lead.county || "County unknown"} · ${lead.lead_status}`));
    button.addEventListener("click", () => { if (confirmNavigation()) { openLead(lead); $("editor").focus(); } });
    item.append(button); return item;
  }));
  if (!filtered.length) $("companies").append(node("li", leads.length ? "No matching companies." : "Start with a company you have researched. No data is collected automatically."));
}
function evidenceControl(row, key, label, value, choices) {
  const wrapper = node("div", undefined, "field");
  const labelElement = node("label", label);
  const control = node(choices ? "select" : ["statement", "rationale", "source_urls"].includes(key) ? "textarea" : "input");
  control.id = `evidence-${crypto.randomUUID()}`;
  labelElement.htmlFor = control.id;
  control.dataset.field = key;
  if (choices) control.append(...choices.map(([id, caption]) => option(id, caption)));
  if (key === "research_date") { control.type = "date"; control.required = true; control.max = new Date().toISOString().slice(0, 10); }
  if (["statement", "rationale"].includes(key)) control.maxLength = 2000;
  if (key === "statement") control.required = true;
  control.value = value || "";
  wrapper.append(labelElement, control); row.append(wrapper);
}
function addEvidence(item = {}) {
  const row = node("div", undefined, "evidence");
  row.dataset.evidenceId = item.evidence_id || "";
  row.append(node("h3", "Evidence record"));
  evidenceControl(row, "kind", "Type", item.kind || "FACT", ["FACT", "INFERENCE", "OPPORTUNITY"].map((kind) => [kind, kind]));
  evidenceControl(row, "statement", "Observation or interpretation", item.statement);
  evidenceControl(row, "source_urls", "Public source URLs (required for FACT; one per line)", item.source_urls?.join("\n"));
  evidenceControl(row, "research_date", "Date researched", item.research_date || new Date().toISOString().slice(0, 10));
  evidenceControl(row, "signal", "Scoring signal (only explicit sourced FACTS count)", item.signal || "context", Object.entries(session.signals).map(([id, signal]) => [id, signal.label]));
  evidenceControl(row, "rationale", "Why this evidence supports the signal (required for scoring facts)", item.rationale);
  const remove = node("button", "Remove this evidence record", "secondary"); remove.type = "button";
  remove.addEventListener("click", () => { row.remove(); dirty = true; leadDirty = true; });
  row.append(remove); $("evidence-list").append(row);
}
function showScores(lead) {
  $("scores").replaceChildren();
  if (!lead) { $("scores").append(node("p", "Save research to see its evidence-based indicators.")); return; }
  const scores = node("div", undefined, "scores");
  for (const [key, caption] of [["legacy_likelihood_score", "Legacy-system signal"], ["migration_opportunity_score", "Migration opportunity"], ["potential_project_value_score", "Potential project complexity / value"]]) {
    const metric = node("p", caption); metric.append(node("strong", `${lead[key]} / 100`)); scores.append(metric);
  }
  $("scores").append(scores, node("p", `Confidence: ${lead.confidence}. Scoring model v${lead.score_version}.`));
  const reasons = node("ul");
  for (const reason of lead.score_reasons) {
    const evidence = lead.evidence.find((item) => item.evidence_id === reason.evidence_id);
    const item = node("li", `${reason.label}: legacy +${reason.legacy}, migration +${reason.migration}, value +${reason.value}. ${evidence?.rationale || ""}`, "score-reason");
    item.append(node("div", `FACT: ${evidence?.statement || ""}`));
    for (const url of evidence?.source_urls || []) { const link = node("a", new URL(url).hostname); link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer"; item.append(link, document.createTextNode(" ")); }
    reasons.append(item);
  }
  $("scores").append(reasons);
}
function showOutreach() {
  const outreach = selected?.outreach;
  const suppressed = selected?.do_not_contact;
  $("generate-draft").disabled = !selected || suppressed;
  $("draft-form").hidden = !outreach || suppressed;
  $("approval-form").hidden = !outreach || suppressed;
  $("draft-subject").value = outreach?.subject || "";
  $("draft-body").value = outreach?.body || "";
  $("reviewed").checked = false;
  $("reviewer").value = "";
  $("outreach-state").textContent = suppressed ? "Do Not Contact: drafting and approval are blocked." : outreach?.approval ? `Reviewed by ${outreach.approval.reviewer} at ${outreach.approval.approved_at}. No message has been sent.` : outreach ? "Draft requires human review. No message has been sent." : "Save a company, qualify the fit, then prepare a draft. Review its industry and wording before approval.";
}
function openLead(lead) {
  selected = lead ? structuredClone(lead) : null;
  $("lead-form").reset();
  for (const [name] of fieldDefinitions) $(name).value = name === "source_urls" ? lead?.source_urls.join("\n") || "" : lead?.[name] ?? (name === "lead_status" ? "Unresearched" : name === "state" ? "NJ" : "");
  $("do_not_contact").checked = Boolean(lead?.do_not_contact);
  $("do_not_contact").disabled = Boolean(lead?.do_not_contact);
  $("delete-lead").disabled = !lead || lead.do_not_contact;
  $("editor-heading").textContent = lead ? lead.company_name : "Add a company";
  $("evidence-list").replaceChildren();
  for (const evidence of lead?.evidence || []) addEvidence(evidence);
  showScores(lead); showOutreach(); showCompanies(); dirty = false; leadDirty = false; draftDirty = false;
}
function collectLead() {
  const data = Object.fromEntries(fieldDefinitions.map(([name]) => [name, $(name).value]));
  data.source_urls = data.source_urls.split("\n").map((value) => value.trim()).filter(Boolean);
  data.do_not_contact = $("do_not_contact").checked;
  data.revision = selected?.revision;
  data.evidence = [...$("evidence-list").children].map((row) => {
    const item = Object.fromEntries([...row.querySelectorAll("[data-field]")].map((control) => [control.dataset.field, control.value]));
    item.source_urls = item.source_urls.split("\n").map((value) => value.trim()).filter(Boolean);
    if (row.dataset.evidenceId) item.evidence_id = row.dataset.evidenceId;
    return item;
  });
  return data;
}
async function reloadSelected(id) { leads = (await api("/api/leads")).leads; openLead(leads.find((lead) => lead.company_id === id)); }
function requireSaved() { if (dirty) throw new Error("Save or discard company and draft changes before this action."); }
$("lead-form").addEventListener("input", () => { dirty = true; leadDirty = true; });
$("draft-form").addEventListener("input", () => { dirty = true; draftDirty = true; });
$("lead-form").addEventListener("submit", (event) => { event.preventDefault(); action(async () => {
  const unsavedDraft = draftDirty ? { subject: $("draft-subject").value, body: $("draft-body").value } : null;
  const result = await api(selected ? `/api/leads/${selected.company_id}` : "/api/leads", selected ? "PUT" : "POST", collectLead());
  await reloadSelected(result.lead.company_id);
  if (unsavedDraft && !result.lead.do_not_contact) { $("draft-subject").value = unsavedDraft.subject; $("draft-body").value = unsavedDraft.body; dirty = true; draftDirty = true; }
  status(`Company and evidence saved. Previous outreach approval, if any, has been cleared.${unsavedDraft && !result.lead.do_not_contact ? " Your draft edits are retained; save the draft separately." : ""}`);
}); });
$("new-lead").addEventListener("click", () => { if (confirmNavigation()) { openLead(null); $("company_name").focus(); } });
$("add-evidence").addEventListener("click", () => { addEvidence(); dirty = true; leadDirty = true; });
for (const id of ["search", "county-filter", "industry-filter", "status-filter"]) $(id).addEventListener("input", showCompanies);
$("delete-lead").addEventListener("click", () => action(async () => {
  if (!selected || !window.confirm(`Delete ${selected.company_name}? This cannot be undone. Export first if you need a copy.`)) return;
  await api(`/api/leads/${selected.company_id}`, "DELETE", { revision: selected.revision });
  await reloadSelected(null); status("The uncontacted record was deleted. It can only be recovered from a prior export or backup.");
}));
$("generate-draft").addEventListener("click", () => action(async () => {
  requireSaved();
  if (selected.outreach && !window.confirm("Replace the existing outreach draft and clear its approval?")) return;
  const result = await api(`/api/leads/${selected.company_id}/draft`, "POST", { revision: selected.revision });
  await reloadSelected(result.lead.company_id); status("Introduction prepared locally. Review and edit it before approval. Nothing was sent.");
}));
$("draft-form").addEventListener("submit", (event) => { event.preventDefault(); action(async () => {
  if (leadDirty) throw new Error("Save company changes first. Your draft edits will be retained so you can then save the draft.");
  const result = await api(`/api/leads/${selected.company_id}/draft`, "PUT", { revision: selected.revision, subject: $("draft-subject").value, body: $("draft-body").value });
  await reloadSelected(result.lead.company_id); status("Draft saved; approval cleared. Nothing was sent.");
}); });
$("approval-form").addEventListener("submit", (event) => { event.preventDefault(); action(async () => {
  requireSaved();
  const result = await api(`/api/leads/${selected.company_id}/approve`, "POST", { revision: selected.revision, reviewer: $("reviewer").value, confirm_reviewed: $("reviewed").checked });
  await reloadSelected(result.lead.company_id); status("Human review recorded for this exact saved draft. Nothing was sent.");
}); });
window.addEventListener("beforeunload", (event) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } });
await action(async () => { session = await api("/api/session"); buildFields(); await reloadSelected(null); status("Private local desk ready. Research is manual; no outreach is sent."); });
