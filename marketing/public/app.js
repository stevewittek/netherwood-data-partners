'use strict';
const $ = selector => document.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const state = { token: '', tab: 'results', lists: [], templates: [], campaigns: [], session: null, list: null, importCsv: '', importHeaders: [], importPreview: null, campaign: null, preview: null };
const fields = [
  ['company_name', 'Company name'], ['website', 'Website'], ['industry', 'Industry'], ['city', 'Town / city'],
  ['county', 'County'], ['state', 'State'], ['zip', 'Postal code'], ['phone', 'Public phone'],
  ['general_public_email', 'General public email'], ['do_not_contact', 'Do not contact (true / false)'], ['notes', 'Notes'],
];
let busy = false;
let sessionVersion = 0;
function setBusy(value) { busy = value; $('#desk').inert = value; $('#workspace').setAttribute('aria-busy', String(value)); }
const channels = [['email','Email'],['google_ads','Google Ads'],['referral','Referral'],['direct','Direct'],['organic_search','Organic Search'],['other','Other']];
function notify(message, error = false) { $('#status').textContent = message; $('#status').classList.toggle('error', error); }
function option(value, label, selected = false) { return '<option value="' + escape(value) + '"' + (selected ? ' selected' : '') + '>' + escape(label) + '</option>'; }
function input(name, label, options = {}) {
  return '<div class="field' + (options.full ? ' full' : '') + '"><label for="' + escape(name) + '">' + escape(label) + '</label><input id="' + escape(name) + '" name="' + escape(name) + '" type="' + (options.type || 'text') + '" maxlength="' + (options.max || 500) + '" value="' + escape(options.value || '') + '"' + (options.required ? ' required' : '') + (options.min !== undefined ? ' min="' + options.min + '"' : '') + '></div>';
}
function select(name, label, items, value = '') { return '<div class="field"><label for="' + name + '">' + escape(label) + '</label><select id="' + name + '" name="' + name + '">' + items.map(([id, text]) => option(id, text, id === value)).join('') + '</select></div>'; }
function table(headers, rows) { return '<div class="table-wrap"><table><thead><tr>' + headers.map(header => '<th scope="col">' + escape(header) + '</th>').join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>'; }
function empty(title, body) { return '<div class="empty"><h3>' + escape(title) + '</h3><p>' + escape(body) + '</p></div>'; }
function formData(form) { return Object.fromEntries(new FormData(form)); }
function labelChannel(value) { return channels.find(([id]) => id === value)?.[1] || value; }
function statusLabel(value) { return ({ draft: 'Draft', preview: 'Previewed', previewed: 'Previewed', test_send: 'Test created', ready: 'Ready for approval', approved: 'Approved', local_sent: 'Simulated', sending: 'Sending' })[value] || value; }
async function api(path, options = {}) {
  const token = state.token; const version = sessionVersion;
  const response = await fetch('/api' + path, {
    method: options.method || 'GET',
    headers: { Authorization: 'Bearer ' + token, ...(options.body !== undefined ? { 'Content-Type': 'application/json', 'X-Marketing-Request': '1' } : {}) },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    credentials: 'omit', cache: 'no-store', redirect: 'error',
  });
  if (token !== state.token || version !== sessionVersion) throw new Error('The desk was locked. Unlock to continue.');
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) lock();
    throw new Error(data.error || 'The request could not be completed.');
  }
  return options.csv ? response.text() : response.json();
}
function lock() {
  sessionVersion++; setBusy(false);
  state.token = ''; state.session = null; state.lists = []; state.campaigns = []; state.templates = []; state.list = null;
  state.campaign = null; state.preview = null; state.importCsv = ''; state.importHeaders = []; state.importPreview = null;
  $('#workspace').replaceChildren(); $('#desk').hidden = true; $('#login').hidden = false; $('#lock').hidden = true; $('#token').value = '';
}
async function refreshShared() { [state.lists, state.templates, state.campaigns] = await Promise.all([api('/lists'), api('/templates'), api('/campaigns')]); }
async function showTab(tab) {
  state.tab = tab;
  document.querySelectorAll('[data-tab]').forEach(button => { if (button.dataset.tab === tab) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); });
  if (tab === 'results') await renderResults();
  if (tab === 'lists') await renderLists();
  if (tab === 'campaigns') await renderCampaigns();
  if (tab === 'suppression') await renderSuppression();
}
async function renderResults() {
  const [rows, sources] = await Promise.all([api('/results'), api('/attribution/summary')]);
  const total = key => [...rows, ...sources].reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
  const metrics = [['delivered','Delivered emails'],['clicked','Campaign clicks'],['inquiries','Inquiries'],['customers','Customers']];
  $('#workspace').innerHTML = '<div class="section-head"><div><h2>What is leading to work?</h2><p>Track introductions, inquiries, and customers. Local test files do not count as delivered email.</p></div><button data-action="refresh" class="quiet">Refresh results</button></div>' +
    '<div class="metrics">' + metrics.map(([key, label]) => '<div class="metric"><span>' + label + '</span><strong>' + total(key) + '</strong></div>').join('') + '</div>' +
    (rows.length ? table(['Campaign / channel','Recipients / traffic','Delivered','Clicks','Inquiries','Booked','Customers','Rates','Results'], rows.map(row => '<tr><td><button class="link-button" data-action="open-campaign" data-id="' + escape(row.id) + '">' + escape(row.name) + '</button><small>' + escape(labelChannel(row.channel)) + ' · ' + escape(statusLabel(row.status)) + '</small></td><td>' + escape(row.channel === 'email' ? row.recipients : (row.traffic || 0)) + '<small>' + (row.simulated ? escape(row.simulated) + ' simulated' : '') + '</small></td><td>' + escape(row.delivered || 0) + '</td><td>' + escape(row.clicked || 0) + '</td><td>' + escape(row.inquiries || 0) + '</td><td>' + escape(row.booked_conversations || 0) + '</td><td>' + escape(row.customers || 0) + '</td><td><small>Click: ' + formatRate(row.click_through_rate) + '</small><small>Inquiry: ' + formatRate(row.inquiry_conversion_rate) + '</small><small>Customer: ' + formatRate(row.customer_conversion_rate) + '</small></td><td><button class="quiet small" data-action="export" data-id="' + escape(row.id) + '">Export CSV</button></td></tr>')) : empty('Your first campaign starts here.', 'Create a company list, then prepare a campaign. Results will appear as activity is recorded.')) +
    '<p class="hint">Clicks are campaign link events, not proof of a human visit. Record verified business outcomes once. Simulation totals are separate from delivery. Click rate = clicks / delivered; inquiry rate = inquiries / email clicks or other channel traffic; customer rate = customers / inquiries.</p>' +
    (sources.length ? '<hr class="divider"><h3>Inquiries without a campaign code</h3><p class="hint">These source totals come from explicit attribution. Missing sources remain unknown.</p>' + table(['Source / medium','Channel','Inquiries','Booked','Customers'], sources.map(row => '<tr><td>' + escape(row.source || 'unknown') + '<small>' + escape(row.medium || 'unknown') + '</small></td><td>' + escape(labelChannel(row.channel)) + '</td><td>' + escape(row.inquiries) + '</td><td>' + escape(row.booked_conversations) + '</td><td>' + escape(row.customers) + '</td></tr>')) : '');
}
function formatRate(value) { return value === null || value === undefined ? '—' : (Number(value) * 100).toFixed(1) + '%'; }
async function renderLists() {
  state.lists = await api('/lists'); state.list = null; state.importCsv = ''; state.importPreview = null;
  $('#workspace').innerHTML = '<div class="section-head"><div><h2>Company lists</h2><p>Keep a focused list and its source. Suppressed addresses remain excluded across imports and list deletion.</p></div></div><div class="split"><div><h3>Working lists</h3>' +
    (state.lists.length ? state.lists.map(list => '<div class="row"><div><h3>' + escape(list.name) + '</h3><p>' + escape(list.company_count || 0) + ' companies · ' + escape(list.status) + '</p></div><button class="quiet small" data-action="open-list" data-id="' + escape(list.id) + '">Open list ↗</button></div>').join('') : empty('No lists yet.', 'Create a list for a defined audience and a permitted source.')) +
    '</div><form data-form="create-list" class="form-panel"><h3>Create a list</h3><p class="hint">Examples: Union County manufacturers; Middlesex professional services.</p><div class="form-grid">' + input('name','List name',{required:true,max:160,full:true}) + '</div><div class="form-actions"><button>Create list</button></div></form></div>';
}
async function openList(id) {
  state.list = state.lists.find(list => list.id === id) || (await api('/lists')).find(list => list.id === id);
  if (!state.list) throw new Error('List not found.');
  state.importCsv = ''; state.importPreview = null; state.importHeaders = [];
  const rows = await api('/lists/' + encodeURIComponent(id) + '/companies');
  const active = state.list.status === 'active';
  $('#workspace').innerHTML = '<button class="quiet small back" data-action="back-lists">← All lists</button><div class="section-head"><div><h2>' + escape(state.list.name) + '</h2><p>' + rows.length + ' companies · ' + escape(state.list.status) + '</p></div><div class="actions">' + (active ? '<button class="quiet" data-action="archive-list">Archive list</button>' : '') + '<button class="danger" data-action="delete-list">Delete working list</button></div></div>' +
    (rows.length ? table(['Company','Location / industry','Public email','Source','Status',''], rows.map(row => '<tr><td>' + escape(row.company_name) + '<small>' + escape(row.website) + '</small></td><td>' + escape([row.city,row.state].filter(Boolean).join(', ')) + '<small>' + escape(row.industry) + '</small></td><td>' + escape(row.general_public_email || '—') + '</td><td>' + escape(row.source) + '<small>' + escape(row.source_reference) + '</small></td><td>' + (row.do_not_contact || row.suppressed ? '<span class="badge error">Suppressed</span>' : '<span class="badge">Working record</span>') + '</td><td><button class="quiet small" data-action="remove-company" data-id="' + escape(row.id || row.company_id) + '">Remove</button></td></tr>')) : empty('This list is empty.', 'Import a CSV or add a business from a permitted source.')) +
    (active ? '<hr class="divider"><div class="split"><section><h3>Import a CSV</h3><p class="hint">Choose columns, review validation and duplicates, then import. Maximum file size: 1.5 MB.</p><div class="field"><label for="csv-file">CSV file</label><input id="csv-file" type="file" accept=".csv,text/csv"></div><div id="import-wizard"></div></section><details><summary>Add one company manually</summary><form data-form="add-company" class="form-panel"><div class="form-grid">' + fields.map(([name,label]) => input('manual_' + name,label,{required:name === 'company_name',max:name === 'notes' ? 2000 : 500})).join('') + input('manual_source','Source',{required:true}) + input('manual_source_reference','Source reference') + '</div><div class="form-actions"><button>Add company</button></div></form></details></div>' : '<p class="hint">This list is archived. Existing records can be reviewed or removed.</p>');
}
function csvHeaders(csv) {
  const input = csv.replace(/^\uFEFF/, ''); const result = []; let cell = ''; let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"') { if (quoted && input[i+1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (char === ',' && !quoted) { result.push(cell.trim()); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) { result.push(cell.trim()); return result; }
    else cell += char;
  }
  if (quoted) throw new Error('CSV header has an unclosed quoted field.');
  result.push(cell.trim()); return result;
}
function suggestedHeader(field) {
  const synonyms = { company_name:['companyname','businessname','name','company','business'],general_public_email:['generalpublicemail','email','emailaddress','publicemail'],city:['city','town'],zip:['zip','zipcode','postalcode'],website:['website','url','domain'],state:['state','region'] };
  return state.importHeaders.find(header => (synonyms[field] || [field.replaceAll('_','')]).includes(header.toLowerCase().replace(/[^a-z0-9]/g,''))) || '';
}
function renderImportWizard() {
  $('#import-wizard').innerHTML = '<form data-form="preview-import" class="form-panel"><h3>Map your columns</h3><div class="form-grid">' +
    fields.map(([name,label]) => select('map_' + name,label,[['','Do not import'],...state.importHeaders.map(header => [header,header])],suggestedHeader(name))).join('') +
    input('source','Source / permission basis',{required:true,full:true,max:300}) + input('sourceReference','Source reference (file, directory, or license)',{full:true,max:1000}) +
    '</div><div class="form-actions"><button>Preview import</button></div></form><div id="import-preview"></div>';
}
function renderImportPreview(preview) {
  $('#import-preview').innerHTML = '<p class="count-line"><strong>' + preview.valid_count + ' valid</strong> · ' + preview.invalid_count + ' invalid · ' + preview.duplicate_count + ' duplicate · ' + preview.suppressed_count + ' suppressed</p>' +
    table(['CSV row','Company / email','Review'],preview.rows.slice(0,100).map(row => '<tr><td>' + escape(row.row) + '</td><td>' + escape(row.company?.company_name || '—') + '<small>' + escape(row.company?.general_public_email || '') + '</small></td><td>' + escape(row.errors?.join('; ') || (row.duplicate_id ? 'Duplicate: merges with an existing company' : 'Valid')) + (row.suppressed ? '<small class="error-text">Suppressed: excluded from email</small>' : '') + '</td></tr>')) +
    (preview.rows.length > 100 ? '<p class="hint">Showing the first 100 rows. Totals include the whole file.</p>' : '') +
    '<form data-form="confirm-import">' + (preview.invalid_count ? '<label class="check"><input type="checkbox" name="skipInvalid" required><span>Exclude the ' + preview.invalid_count + ' invalid rows. Import only valid rows.</span></label>' : '') + '<div class="form-actions"><button>Import previewed rows</button></div></form>';
}


async function renderCampaigns() {
  await refreshShared(); state.campaign = null; state.preview = null;
  $('#workspace').innerHTML = '<div class="section-head"><div><h2>Campaigns with a clear purpose</h2><p>Prepare your message, inspect the recipients, create a test, and deliberately approve the next step.</p></div></div>' +
    (state.campaigns.length ? table(['Campaign','Channel','Stage','Recipients',''],state.campaigns.map(campaign => '<tr><td>' + escape(campaign.name) + '<small>' + escape(campaign.description) + '</small></td><td>' + escape(labelChannel(campaign.channel)) + '</td><td><span class="badge">' + escape(statusLabel(campaign.status)) + '</span></td><td>' + escape(campaign.recipient_count || 0) + '</td><td><button class="quiet small" data-action="open-campaign" data-id="' + escape(campaign.id) + '">Open ↗</button></td></tr>')) : empty('Prepare your first message.', 'Choose a permitted company list and a short, factual template.')) +
    '<details id="new-campaign"><summary>Create a campaign</summary><form data-form="create-campaign" class="form-panel"><div class="form-grid">' +
    input('campaign_name','Campaign name',{required:true,max:160}) + select('channel','Channel',channels,'email') +
    input('description','Purpose / description',{max:2000,full:true}) +
    select('list_id','Company list',[['','Select a working list'],...state.lists.filter(list => list.status === 'active').map(list => [list.id,list.name])]) +
    select('template','Reusable message',state.templates.map(template => [template.id,template.name]),state.templates[0]?.id) +
    input('landing_page','Landing page URL or path',{value:'/',required:true,full:true,max:2000}) +
    input('subject','Email subject',{value:state.templates[0]?.subject,max:200,full:true}) +
    '<div class="field full"><label for="body">Email message</label><textarea id="body" name="body" rows="9" maxlength="10000">' + escape(state.templates[0]?.body || '') + '</textarea><p class="hint">Supported fields: {{company_name}}, {{industry}}, {{city}}, {{campaign_url}}. Sender identity and unsubscribe are added automatically.</p></div>' +
    input('utm_source','UTM source (optional)') + input('utm_medium','UTM medium (optional)') + input('utm_campaign','UTM campaign (optional)') + input('utm_content','UTM content (optional)') +
    '<div class="field full"><h3>Audience filters</h3><p class="hint">Leave blank to include the whole selected list. Filters use the stored business fields.</p><div class="filter-grid">' + ['industry','city','county','state','zip','source'].map(name => input('filter_' + name,name === 'zip' ? 'Postal code' : name[0].toUpperCase()+name.slice(1))).join('') + '</div></div></div><div class="form-actions"><button>Create draft campaign</button></div></form></details>';
}
async function openCampaign(id, keepPreview = false) {
  state.campaign = await api('/campaigns/' + encodeURIComponent(id));
  if (!keepPreview) state.preview = null;
  const c = state.campaign; const isEmail = c.channel === 'email';
  const stages = [['draft','Draft'],['preview','Preview'],['test_send','Test send'],['ready','Ready'],['approved','Approve'],['local_sent','Simulate']];
  let workflow = '';
  if (isEmail) {
    const previewButton = ['draft','preview','previewed','test_send','ready','approved'].includes(c.status) ? '<button data-action="preview-campaign"' + (c.status !== 'draft' ? ' class="quiet"' : '') + '>' + (c.status === 'draft' ? 'Preview recipients & message' : 'View frozen preview') + '</button>' : '';
    workflow = '<div class="workflow" aria-label="Campaign workflow">' + stages.map(([stage,label],i) => '<span' + (stage === c.status || (stage === 'preview' && c.status === 'previewed') ? ' class="current"' : '') + '>' + (i+1) + ' ' + label + '</span>').join('') + '<div class="actions">' + previewButton +
      (['preview','previewed'].includes(c.status) ? '<button data-action="test-campaign">Create local test email</button>' : '') +
      (c.status === 'test_send' ? '<button data-action="ready-campaign">Mark ready for approval</button>' : '') + '</div>' +
      (previewButton && c.status !== 'draft' ? '<p class="hint">The preview is frozen for this campaign. Create a new campaign to change the audience or message.</p>' : '') +
      (c.status === 'test_send' ? '<p class="hint">Test file created for ' + escape(state.session.testRecipient) + '. Inspect the local outbox file before marking ready.</p>' : '') +
      (c.status === 'ready' ? '<form data-form="approve-campaign" class="approval"><h3>Review ' + escape(c.recipient_count) + ' recipients.</h3><p>This approval applies to the exact previewed recipient list. Suppression is checked again when sending.</p><label for="approve">Type APPROVE to approve this campaign</label><input id="approve" name="confirmation" autocomplete="off" required pattern="APPROVE"><div class="form-actions"><button>Approve ' + escape(c.recipient_count) + ' recipients</button></div></form>' : '') +
      (c.status === 'approved' ? '<form data-form="send-campaign" class="approval"><h3>This will simulate a send to ' + escape(c.recipient_count) + ' recipients.</h3><p>Local email files will be created. No email is delivered to these addresses.</p><label for="send">Type SEND to run this local simulation</label><input id="send" name="confirmation" autocomplete="off" required pattern="SEND"><div class="form-actions"><button>Simulate campaign send</button></div></form>' : '') +
      (c.status === 'local_sent' ? '<div class="notice"><strong>Simulation complete</strong><span>Email files were saved locally. No production email was delivered.</span></div>' : '');
  }
  const preview = state.preview;
  $('#workspace').innerHTML = '<button class="quiet small back" data-action="back-campaigns">← All campaigns</button><div class="section-head"><div><h2>' + escape(c.name) + '</h2><p>' + escape(labelChannel(c.channel)) + ' · ' + escape(statusLabel(c.status)) + '</p></div><button class="quiet" data-action="export" data-id="' + escape(c.id) + '">Export results</button></div>' + (!isEmail ? '<h3>Campaign link</h3><p class="url-box">' + escape(c.tracked_url || c.landing_page) + '</p><p class="hint">Use this tagged link in your campaign to preserve its source and campaign code.</p>' : '') + workflow +
    (isEmail ? '<div class="preview"><div class="preview-subject">' + escape(preview?.sample?.subject || c.subject) + '</div>' + escape(preview?.sample?.text || c.body) + '</div><p class="hint">Sender: ' + escape(c.sender_name) + ' &lt;' + escape(c.sender_email) + '&gt; · ' + escape(c.postal_address) + '</p>' : '') +
    (preview ? '<p class="count-line"><strong>' + preview.recipientCount + ' eligible recipients</strong> · ' + preview.excludedCount + ' excluded</p>' + table(['Company','Email','Town','Industry'],preview.recipients.slice(0,100).map(row => '<tr><td>' + escape(row.company_name) + '</td><td>' + escape(row.email) + '</td><td>' + escape(row.city) + '</td><td>' + escape(row.industry) + '</td></tr>')) + (preview.recipients.length > 100 ? '<p class="hint">Showing the first 100 recipients.</p>' : '') : '') +
    '<hr class="divider"><div class="split"><form data-form="record-outcome"><h3>Record a verified outcome</h3><p class="hint">Use actual inquiries and customer decisions. Reuse the same record reference to prevent duplicates; include no names or email addresses.</p><div class="form-grid">' +
    select('outcome_type','Outcome',[['inquiry','Inquiry'],['booked_conversation','Booked conversation'],['customer','Customer'],['reply','Reply']]) +
    input('outcome_reference','Record reference (e.g. inquiry_102)',{required:true,max:100}) + '</div><div class="form-actions"><button class="quiet">Record outcome</button></div></form>' +
    (!isEmail ? '<form data-form="record-traffic"><h3>Record aggregate traffic</h3><p class="hint">Enter a verified daily total. Saving again replaces the total for the same source and date.</p><div class="form-grid">' + input('visits','Visits',{type:'number',required:true,min:1,max:10}) + input('traffic_source','Report source (letters, numbers, dots or dashes)',{required:true,max:100,value:'manual'}) + input('traffic_date','Report date',{type:'date',required:true,value:new Date().toISOString().slice(0,10)}) + '</div><div class="form-actions"><button class="quiet">Save daily total</button></div></form>' : '<div><h3>Campaign link</h3><p class="hint">UTM tags identify the campaign without putting email addresses in the URL. Public click recording requires the integration deployment.</p><p id="campaign-link" class="url-box">' + escape(preview?.sample?.trackedUrl || c.tracked_url || c.landing_page) + '</p></div>') + '</div>';
}
async function renderSuppression() {
  const rows = await api('/suppression');
  $('#workspace').innerHTML = '<div class="section-head"><div><h2>Honor every opt-out.</h2><p>Suppression is kept separately from working lists. Deleting a list or importing an address again does not remove its opt-out.</p></div></div><div class="split"><section><h3>Suppression history</h3>' +
    (rows.length ? table(['Email','Reason / source','Status'],rows.map(row => '<tr><td>' + escape(row.email) + '</td><td>' + escape(row.reason) + '<small>' + escape(row.source) + '</small></td><td><span class="badge' + (row.active ? ' error' : '') + '">' + (row.active ? 'Suppressed' : 'Reinstated') + '</span></td></tr>')) : empty('No suppression records.', 'Opt-outs and documented exclusions will appear here.')) +
    '</section><div><form data-form="suppress" class="form-panel"><h3>Suppress one address</h3><div class="form-grid">' + input('email','Email address',{type:'email',required:true,full:true,max:254}) + select('reason','Reason',[['manual','Manual exclusion'],['unsubscribe','Unsubscribe'],['complaint','Complaint'],['hard_bounce','Hard bounce'],['legal_request','Legal request']]) + input('source','Source / evidence',{required:true,max:300}) + '</div><div class="form-actions"><button>Suppress address</button></div></form><details class="reinstatement"><summary>Document an individual reinstatement</summary><p class="hint">Only reinstate when you have a valid, documented basis. The original suppression history is retained.</p><form data-form="reinstate"><div class="form-grid">' + input('reinstate_email','Exact email address',{type:'email',required:true,full:true,max:254}) + '<div class="field full"><label for="evidence">Documented permission / reason</label><textarea id="evidence" name="evidence" required minlength="20" maxlength="2000"></textarea></div>' + input('reinstate_confirmation','Type REINSTATE',{required:true,full:true}) + '</div><div class="form-actions"><button class="quiet">Reinstate this one address</button></div></form></details></div></div>';
}


async function downloadResults(id) {
  const csv = await api('/campaigns/' + encodeURIComponent(id) + '/results.csv', { csv: true });
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'netherwood-campaign-results.csv'; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}
async function performAction(button) {
  const action = button.dataset.action; const id = button.dataset.id;
  if (action === 'refresh') return showTab(state.tab);
  if (action === 'open-list') return openList(id);
  if (action === 'back-lists') return showTab('lists');
  if (action === 'archive-list') { await api('/lists/' + state.list.id + '/archive',{method:'POST',body:{}}); notify('List archived. Suppression history is preserved.'); return showTab('lists'); }
  if (action === 'delete-list') {
    const confirmation = window.prompt('Delete this working list? Suppression and campaign history will remain. Type DELETE.');
    if (confirmation !== 'DELETE') return;
    await api('/lists/' + state.list.id,{method:'DELETE',body:{confirmation}}); notify('Working list deleted. Suppression history is preserved.'); return showTab('lists');
  }
  if (action === 'remove-company') { await api('/lists/' + state.list.id + '/companies/' + id,{method:'DELETE',body:{}}); notify('Company removed from this list.'); return openList(state.list.id); }
  if (action === 'open-campaign') { state.tab = 'campaigns'; document.querySelectorAll('[data-tab]').forEach(tab => { if (tab.dataset.tab === 'campaigns') tab.setAttribute('aria-current','page'); else tab.removeAttribute('aria-current'); }); return openCampaign(id); }
  if (action === 'back-campaigns') return showTab('campaigns');
  if (action === 'preview-campaign') {
    state.preview = await api('/campaigns/' + state.campaign.id + '/preview',{method:'POST',body:{}});
    notify('Preview prepared. Review the recipients and message, then create a local test.');
    return openCampaign(state.campaign.id,true);
  }
  if (action === 'test-campaign') {
    await api('/campaigns/' + state.campaign.id + '/test',{method:'POST',body:{}});
    notify('Local test file created. No email was sent. Inspect the configured local outbox before approval.');
    return openCampaign(state.campaign.id,true);
  }
  if (action === 'ready-campaign') { await api('/campaigns/' + state.campaign.id + '/ready',{method:'POST',body:{}}); notify('Campaign ready for deliberate approval.'); return openCampaign(state.campaign.id,true); }
  if (action === 'export') return downloadResults(id);
}
async function submitForm(form) {
  const data = formData(form); const action = form.dataset.form;
  if (form.id === 'login-form') {
    state.token = String(data.token || $('#token').value).trim();
    state.session = await api('/session'); $('#token').value = ''; $('#login').hidden = true; $('#desk').hidden = false; $('#lock').hidden = false;
    await refreshShared(); await showTab('results'); notify('Desk unlocked. Local simulation only.'); return;
  }
  if (action === 'create-list') { const result = await api('/lists',{method:'POST',body:{name:data.name}}); state.lists = await api('/lists'); notify('List created.'); return openList(result.id); }
  if (action === 'add-company') {
    const company = Object.fromEntries(fields.map(([name]) => [name,data['manual_' + name]]));
    await api('/lists/' + state.list.id + '/companies',{method:'POST',body:{company,source:data.manual_source,sourceReference:data.manual_source_reference}});
    notify('Company added with source provenance.'); return openList(state.list.id);
  }
  if (action === 'preview-import') {
    const mapping = Object.fromEntries(fields.filter(([name]) => data['map_' + name]).map(([name]) => [name,data['map_' + name]]));
    const request = { csv:state.importCsv,mapping,source:data.source,sourceReference:data.sourceReference };
    const preview = await api('/import/preview',{method:'POST',body:request});
    state.importPreview = { request,preview }; renderImportPreview(preview); notify('Import preview ready. No records have been imported yet.'); return;
  }
  if (action === 'confirm-import') {
    if (!state.importPreview) throw new Error('Preview the import again before continuing.');
    const result = await api('/lists/' + state.list.id + '/import',{method:'POST',body:{...state.importPreview.request,skipInvalid:data.skipInvalid === 'on'}});
    notify('Imported ' + result.imported + '; duplicates ' + result.duplicates + '; suppressed ' + result.suppressed + '; skipped ' + result.skipped + '.');
    return openList(state.list.id);
  }
  if (action === 'create-campaign') {
    const body = {name:data.campaign_name,description:data.description,channel:data.channel,landing_page:data.landing_page,filters:Object.fromEntries(['industry','city','county','state','zip','source'].filter(key => data['filter_' + key]).map(key => [key,data['filter_' + key]]))};
    for (const key of ['list_id','template','subject','body','utm_source','utm_medium','utm_campaign','utm_content']) if (data[key]) body[key] = data[key];
    const result = await api('/campaigns',{method:'POST',body}); notify('Draft campaign created.'); return openCampaign(result.id);
  }
  if (action === 'approve-campaign' || action === 'send-campaign') {
    const endpoint = action === 'approve-campaign' ? 'approve' : 'send';
    await api('/campaigns/' + state.campaign.id + '/' + endpoint,{method:'POST',body:{recipientCount:state.campaign.recipient_count,confirmation:data.confirmation}});
    notify(endpoint === 'approve' ? 'Campaign approved for the displayed recipient list.' : 'Local simulation complete. No production email was sent.');
    return openCampaign(state.campaign.id,true);
  }
  if (action === 'suppress') { await api('/suppression',{method:'POST',body:data}); notify('Address suppressed across every list.'); return renderSuppression(); }
  if (action === 'reinstate') { await api('/suppression/reinstate',{method:'POST',body:{email:data.reinstate_email,evidence:data.evidence,confirmation:data.reinstate_confirmation}}); notify('Individual reinstatement recorded. History is retained.'); return renderSuppression(); }
  if (action === 'record-outcome') {
    await api('/campaigns/' + state.campaign.id + '/outcomes',{method:'POST',body:{type:data.outcome_type,reference:data.outcome_reference}});
    form.reset(); notify('Verified outcome recorded. View Results to see the updated totals.'); return;
  }
  if (action === 'record-traffic') {
    await api('/campaigns/' + state.campaign.id + '/traffic',{method:'POST',body:{visits:Number(data.visits),source:data.traffic_source,date:data.traffic_date}});
    form.reset(); notify('Aggregate traffic recorded.'); return;
  }
}
document.addEventListener('click', async event => {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.id === 'lock') { lock(); notify('Desk locked. The access token has been cleared.'); $('#token').focus(); return; }
  if (busy || (!target.dataset.tab && !target.dataset.action)) return;
  setBusy(true);
  target.disabled = true;
  try { if (target.dataset.tab) await showTab(target.dataset.tab); else await performAction(target); }
  catch (error) { notify(error.message || 'The request failed.',true); }
  finally { target.disabled = false; setBusy(false); }
});
document.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy) return;
  setBusy(true);
  const form = event.target; const buttons = [...form.querySelectorAll('button')]; buttons.forEach(button => button.disabled = true);
  try { await submitForm(form); } catch (error) { notify(error.message || 'The request failed.',true); }
  finally { buttons.forEach(button => button.disabled = false); setBusy(false); }
});
document.addEventListener('change', async event => {
  if (event.target.id === 'csv-file') {
    try {
      const file = event.target.files[0];
      state.importPreview = null; state.importCsv = ''; state.importHeaders = [];
      $('#import-wizard').replaceChildren();
      if (!file) return;
      if (file.size > 1.5 * 1024 * 1024) throw new Error('Choose a CSV smaller than 1.5 MB.');
      state.importCsv = await file.text(); state.importHeaders = csvHeaders(state.importCsv); state.importPreview = null;
      if (!state.importHeaders.length || state.importHeaders.length > 80) throw new Error('CSV must have between 1 and 80 columns.');
      renderImportWizard(); notify('Columns loaded. Map the company fields and add the source.');
    } catch (error) { notify(error.message,true); }
  }
  if (event.target.id === 'template') {
    const template = state.templates.find(item => item.id === event.target.value);
    if (template) { $('#subject').value = template.subject; $('#body').value = template.body; }
  }
});
document.addEventListener('input', event => {
  if (event.target.closest('[data-form="preview-import"]') && state.importPreview) {
    state.importPreview = null; $('#import-preview').replaceChildren(); notify('Import settings changed. Preview again before importing.');
  }
});
window.addEventListener('pagehide', lock);
