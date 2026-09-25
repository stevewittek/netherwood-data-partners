import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MarketingStore } from "../src/store.ts";
import { normalizeCompany, parseCsv, csvCell } from "../src/csv.ts";
const mapping={company_name:"Business Name",general_public_email:"Email",website:"Website",city:"Town",state:"State"} as const;
const fixture="Business Name,Email,Website,Town,State\nGarden State TEST,HELLO@example.test,www.example.test,Westfield,New Jersey\nGarden State TEST,hello@example.test,https://example.test,Westfield,NJ\n";
test("mapping normalizes and deduplicates within a transactional import",()=>{
  const s=new MarketingStore(":memory:");try{
    const l=s.createList("Synthetic list");
    const p=s.previewImport(fixture,mapping,"Synthetic");assert.equal(p.duplicate_count,1);
    assert.deepEqual(s.importCsv(l.id,fixture,mapping,"Synthetic"),{imported:1,duplicates:1,suppressed:0,skipped:0,total:2});
    const [c]=s.listCompanies(l.id);assert.equal(c.state,"NJ");assert.equal(c.domain,"example.test");assert.equal(c.general_public_email,"hello@example.test");
    assert.equal(s.db.prepare("SELECT count(*) n FROM company_sources").get()!.n,2);
  }finally{s.close();}
});
test("unsubscribe survives deleting list, restart and mixed-case re-import",()=>{
  const dir=mkdtempSync(join(tmpdir(),"ndp-suppression-"));const path=join(dir,"test.sqlite");
  let s=new MarketingStore(path);
  try{
    const l=s.createList("First");s.importCsv(l.id,fixture,mapping,"Synthetic");
    s.suppress("HELLO@EXAMPLE.TEST","unsubscribe","test");
    s.deleteList(l.id);assert.equal(s.listCompanies().length,0);s.close();
    s=new MarketingStore(path);const next=s.createList("Reimport");
    s.importCsv(next.id,fixture,mapping,"Synthetic");
    assert.equal(s.eligibleCompanies(next.id).length,0);assert.equal(s.isSuppressed("hello@example.test"),true);
    assert.equal(s.listSuppression().length,1);
  }finally{s.close();rmSync(dir,{recursive:true,force:true});}
});
test("malformed CSV and invalid records cannot partially corrupt an import",()=>{
  const s=new MarketingStore(":memory:");try{
    const l=s.createList("Test");
    assert.throws(()=>s.importCsv(l.id,fixture+'"unfinished',mapping,"Synthetic"),/unclosed/);assert.equal(s.listCompanies().length,0);
    const bad=fixture+"Other TEST,not-an-email,other.test,Edison,NJ\n";
    assert.throws(()=>s.importCsv(l.id,bad,mapping,"Synthetic"),/invalid rows/);assert.equal(s.listCompanies().length,0);
    const result=s.importCsv(l.id,bad,mapping,"Synthetic","",{skipInvalid:true});
    assert.equal(result.skipped,1);assert.equal(result.imported,1);
  }finally{s.close();}
});
test("safe parser handles BOM, embedded commas/newlines/escaped quotes and limits",()=>{
  assert.deepEqual(parseCsv('\uFEFFA,B\r\n"one,\ntwo","He said ""yes"""\r\n').rows,[["one,\ntwo",'He said "yes"']]);
  for(const csv of ["a,a\n1,2","a,b\n1", 'a,b\n"x"z,y', "a,b\nx\0,y"])assert.throws(()=>parseCsv(csv));
  assert.throws(()=>parseCsv("a\n"+"x".repeat(8001)),/8,000/);
  assert.throws(()=>parseCsv("a\n"+"x\n".repeat(5001)),/5,000/);
  assert.equal(csvCell(" =cmd()"),'"\' =cmd()"');
});
test("domain, email and name/location conflicts are flagged rather than merged",()=>{
  const s=new MarketingStore(":memory:");try{
    const l=s.createList("Test");
    s.addCompany(l.id,{company_name:"One TEST",website:"one.test",general_public_email:"one@example.test"},"Synthetic");
    s.addCompany(l.id,{company_name:"Two TEST",website:"two.test",general_public_email:"two@example.test"},"Synthetic");
    const csv="Business Name,Email,Website,Town,State\nConflict TEST,two@example.test,one.test,Edison,NJ";
    assert.equal(s.previewImport(csv,mapping,"Synthetic").invalid_count,1);
    assert.throws(()=>s.importCsv(l.id,csv,mapping,"Synthetic"),/invalid rows/);assert.equal(s.listCompanies().length,2);
  }finally{s.close();}
});
test("archiving blocks modification; deletion preserves other memberships",()=>{
  const s=new MarketingStore(":memory:");try{
    const a=s.createList("A"),b=s.createList("B");s.importCsv(a.id,fixture,mapping,"Synthetic");s.importCsv(b.id,fixture,mapping,"Synthetic");
    s.deleteList(a.id);assert.equal(s.listCompanies(b.id).length,1);
    s.archiveList(b.id);assert.throws(()=>s.importCsv(b.id,fixture,mapping,"Synthetic"),/Archived/);assert.throws(()=>s.eligibleCompanies(b.id),/Archived/);
  }finally{s.close();}
});
test("imported do-not-contact and evidence audit cannot be silently cleared",()=>{
  const s=new MarketingStore(":memory:");try{
    const l=s.createList("Test");s.addCompany(l.id,{company_name:"DNC TEST",general_public_email:"stop@example.test",do_not_contact:true},"Synthetic");
    assert.equal(s.eligibleCompanies(l.id).length,0);assert.equal(s.isSuppressed("STOP@example.test"),true);
    assert.throws(()=>s.reinstate("stop@example.test","yes"),/20 characters/);
    s.reinstate("stop@example.test","Owner verified written permission on 2026-09-25, evidence ABC.");
    assert.equal(s.isSuppressed("stop@example.test"),false);assert.equal(s.eligibleCompanies(l.id).length,0);
    assert.equal(s.db.prepare("SELECT COUNT(*) n FROM suppression_audit").get()!.n,2);
  }finally{s.close();}
});
test("normalization validates risky URLs and keeps leading NJ ZIP zeros",()=>{
  const company=normalizeCompany({company_name:"NJ TEST",zip:"7016",state:"new jersey",website:"WWW.EXAMPLE.TEST/path?email=x#y"});
  assert.equal(company.zip,"07016");assert.equal(company.website,"https://www.example.test/path");
  assert.throws(()=>normalizeCompany({company_name:"Bad",website:"javascript:alert(1)"}),/public HTTP/);
  assert.throws(()=>normalizeCompany({company_name:"Bad",website:"https://user:password@example.test"}),/credentials/);
});
