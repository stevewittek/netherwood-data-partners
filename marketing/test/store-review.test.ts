import test from 'node:test';
import assert from 'node:assert/strict';
import { MarketingStore } from '../src/store.ts';

const mapping = {
  company_name: 'Name', website: 'Website', general_public_email: 'Email',
} as const;

test('transitive CSV aliases use the same company identity in preview and commit', () => {
  const store = new MarketingStore(':memory:');
  try {
    const list = store.createList('Alias chain TEST');
    const csv = [
      'Name,Website,Email',
      'Alias company TEST,alias.example.test,',
      'Alias company TEST,alias.example.test,hello@example.test',
      'Alias company TEST,,hello@example.test',
    ].join('\n');
    const preview = store.previewImport(csv, mapping, 'Synthetic review fixture');
    assert.equal(preview.invalid_count, 0);
    assert.equal(preview.duplicate_count, 2);
    const result = store.importCsv(list.id, csv, mapping, 'Synthetic review fixture');
    assert.equal(result.imported, preview.valid_count - preview.duplicate_count);
    assert.equal(result.duplicates, preview.duplicate_count);
    assert.equal(store.listCompanies(list.id).length, 1);
  } finally { store.close(); }
});

test('distinct non-Latin company names at one location are not silently merged', () => {
  const store = new MarketingStore(':memory:');
  try {
    const list = store.createList('Unicode identity TEST');
    const first = store.addCompany(list.id, {
      company_name: '\u6771\u4eac', city: 'Edison', state: 'NJ',
    }, 'Synthetic review fixture');
    const second = store.addCompany(list.id, {
      company_name: '\u5927\u962a', city: 'Edison', state: 'NJ',
    }, 'Synthetic review fixture');
    assert.equal(second.duplicate, false);
    assert.notEqual(second.id, first.id);
    assert.equal(store.listCompanies(list.id).length, 2);
  } finally { store.close(); }
});

test('a suppressed incoming address cannot be replaced with an existing sendable address', () => {
  const store = new MarketingStore(':memory:');
  try {
    const existing = store.createList('Existing source TEST');
    const imported = store.createList('Incoming source TEST');
    store.addCompany(existing.id, {
      company_name: 'Same company TEST', website: 'same.example.test',
      general_public_email: 'old@example.test',
    }, 'Synthetic original');
    store.suppress('new@example.test', 'unsubscribe', 'Synthetic opt-out');
    const csv = 'Name,Website,Email\nSame company TEST,same.example.test,new@example.test';
    const preview = store.previewImport(csv, mapping, 'Synthetic incoming');
    assert.equal(preview.invalid_count, 1);
    assert.match(preview.rows[0]!.errors.join(' '), /Conflicting duplicate/);
    assert.throws(() => store.importCsv(imported.id, csv, mapping, 'Synthetic incoming'), /invalid rows/);
    assert.deepEqual(store.eligibleCompanies(imported.id), []);
    assert.equal(store.listCompanies(existing.id)[0]!.general_public_email, 'old@example.test');
    assert.equal(store.isSuppressed('new@example.test'), true);
  } finally { store.close(); }
});

test('suppression audit failure rolls back both a new suppression and changes to an existing record', () => {
  const store = new MarketingStore(':memory:');
  try {
    store.suppress('prior@example.test', 'legal_request', 'Synthetic original evidence');
    store.db.exec("CREATE TRIGGER reject_suppression_audit BEFORE INSERT ON suppression_audit BEGIN SELECT RAISE(ABORT, 'Synthetic audit failure'); END");
    assert.throws(() => store.suppress('new@example.test', 'unsubscribe', 'Synthetic new request'), /Synthetic audit failure/);
    assert.equal(store.isSuppressed('new@example.test'), false);
    assert.throws(() => store.suppress('prior@example.test', 'complaint', 'Synthetic replacement'), /Synthetic audit failure/);
    const prior = store.db.prepare('SELECT reason,source FROM suppression WHERE email=?').get('prior@example.test');
    assert.equal(prior!.reason, 'legal_request');
    assert.equal(prior!.source, 'Synthetic original evidence');
    assert.equal(store.db.prepare('SELECT COUNT(*) n FROM suppression_audit').get()!.n, 1);
  } finally { store.close(); }
});

test('suppression failure within import rolls back preceding company writes without breaking the outer transaction', () => {
  const store = new MarketingStore(':memory:');
  try {
    const list = store.createList('Atomic import TEST');
    store.db.exec("CREATE TRIGGER reject_suppression_audit BEFORE INSERT ON suppression_audit BEGIN SELECT RAISE(ABORT, 'Synthetic audit failure'); END");
    const csv = 'Name,Email,DNC\nFirst company TEST,first@example.test,no\nStop company TEST,stop@example.test,yes';
    const columns = { company_name: 'Name', general_public_email: 'Email', do_not_contact: 'DNC' } as const;
    assert.throws(() => store.importCsv(list.id, csv, columns, 'Synthetic import'), /Synthetic audit failure/);
    assert.equal(store.listCompanies(list.id).length, 0);
    assert.equal(store.listSuppression().length, 0);
    assert.equal(store.db.prepare('SELECT COUNT(*) n FROM company_sources').get()!.n, 0);
    assert.equal(store.db.prepare('SELECT COUNT(*) n FROM import_history').get()!.n, 0);
    store.db.exec('DROP TRIGGER reject_suppression_audit');
    assert.equal(store.importCsv(list.id, csv, columns, 'Synthetic retry').imported, 2);
    assert.equal(store.isSuppressed('stop@example.test'), true);
  } finally { store.close(); }
});

test('adding an email to an existing do-not-contact company preserves suppression after list deletion', () => {
  const store = new MarketingStore(':memory:');
  try {
    const initial = store.createList('Do not contact TEST');
    store.addCompany(initial.id, {
      company_name: 'Do not contact company TEST', website: 'dnc.example.test', do_not_contact: true,
    }, 'Synthetic initial restriction');
    store.addCompany(initial.id, {
      company_name: 'Do not contact company TEST', website: 'dnc.example.test',
      general_public_email: 'stop@example.test',
    }, 'Synthetic contact enrichment');
    assert.equal(store.isSuppressed('stop@example.test'), true);
    assert.equal(store.eligibleCompanies(initial.id).length, 0);
    store.deleteList(initial.id);
    const next = store.createList('Reimport TEST');
    store.addCompany(next.id, {
      company_name: 'Do not contact company TEST', website: 'dnc.example.test',
      general_public_email: 'stop@example.test',
    }, 'Synthetic reimport');
    assert.equal(store.isSuppressed('stop@example.test'), true);
    assert.equal(store.eligibleCompanies(next.id).length, 0);
  } finally { store.close(); }
});

test('preview recognizes company-location identities created by safe blank-field enrichment', () => {
  const store = new MarketingStore(':memory:');
  try {
    const list = store.createList('Derived identity TEST');
    const csv = [
      'Name,Website,City,State',
      'Original TEST,original.example.test,,NJ',
      'Alias TEST,original.example.test,Edison,NJ',
      'Original TEST,,Edison,NJ',
    ].join('\n');
    const columns = { company_name: 'Name', website: 'Website', city: 'City', state: 'State' } as const;
    const preview = store.previewImport(csv, columns, 'Synthetic identity enrichment');
    assert.equal(preview.invalid_count, 0);
    assert.equal(preview.duplicate_count, 2);
    const result = store.importCsv(list.id, csv, columns, 'Synthetic identity enrichment');
    assert.equal(result.imported, preview.valid_count - preview.duplicate_count);
    assert.equal(result.duplicates, preview.duplicate_count);
    assert.equal(store.listCompanies(list.id).length, 1);
  } finally { store.close(); }
});
