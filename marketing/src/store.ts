/* eslint-disable no-control-regex -- Input validation intentionally rejects control characters. */
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { normalizeCompany, normalizeEmail, parseCsv, validateMapping } from "./csv.ts";
import type { ColumnMapping, NormalizedCompany } from "./csv.ts";
export type Company = NormalizedCompany & {
  id: string; source: string; source_reference: string; imported_at: string;
  active: number; do_not_contact_reason: string; do_not_contact_at: string | null; suppressed?: boolean;
};
export type WorkingList = {id:string;name:string;status:"active"|"archived";created_at:string;company_count?:number};
export type ImportRow = {row:number;company:NormalizedCompany|null;duplicate_id?:string;suppressed:boolean;errors:string[]};
export type ImportPreview = {headers:string[];rows:ImportRow[];valid_count:number;invalid_count:number;duplicate_count:number;suppressed_count:number};
export const SUPPRESSION_REASONS = ["unsubscribe","complaint","hard_bounce","manual","legal_request"] as const;
const FILTER_FIELDS = ["industry","city","county","state","zip","source"] as const;
const now = () => new Date().toISOString();
function required(value: unknown, name: string, max: number): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max || /[\u0000-\u001f]/.test(value))
    throw new Error(name + " is required and must be at most " + max + " characters.");
  return value.trim();
}
export class MarketingStore {
  db: DatabaseSync;
  constructor(path: string) {
    if (path !== ":memory:") mkdirSync(dirname(path), {recursive:true,mode:0o700});
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db.exec([
        "CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY, applied_at TEXT NOT NULL);",
        "CREATE TABLE IF NOT EXISTS companies(",
        "id TEXT PRIMARY KEY, company_name TEXT NOT NULL, website TEXT NOT NULL DEFAULT '',",
        "domain TEXT NOT NULL DEFAULT '', industry TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '',",
        "county TEXT NOT NULL DEFAULT '', state TEXT NOT NULL DEFAULT '', zip TEXT NOT NULL DEFAULT '',",
        "phone TEXT NOT NULL DEFAULT '', general_public_email TEXT NOT NULL COLLATE NOCASE DEFAULT '',",
        "source TEXT NOT NULL, source_reference TEXT NOT NULL DEFAULT '', imported_at TEXT NOT NULL,",
        "active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),",
        "do_not_contact INTEGER NOT NULL DEFAULT 0 CHECK(do_not_contact IN(0,1)),",
        "do_not_contact_reason TEXT NOT NULL DEFAULT '', do_not_contact_at TEXT,",
        "notes TEXT NOT NULL DEFAULT '', name_location TEXT NOT NULL DEFAULT '');",
        "CREATE UNIQUE INDEX IF NOT EXISTS companies_domain ON companies(domain) WHERE domain <> '';",
        "CREATE UNIQUE INDEX IF NOT EXISTS companies_email ON companies(general_public_email) WHERE general_public_email <> '';",
        "CREATE UNIQUE INDEX IF NOT EXISTS companies_name_location ON companies(name_location) WHERE name_location <> '';",
        "CREATE INDEX IF NOT EXISTS companies_segment ON companies(state,county,industry,active);",
        "CREATE TABLE IF NOT EXISTS lists(id TEXT PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active' CHECK(status IN('active','archived')), created_at TEXT NOT NULL);",
        "CREATE TABLE IF NOT EXISTS list_members(list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE, PRIMARY KEY(list_id, company_id));",
        "CREATE INDEX IF NOT EXISTS list_members_company ON list_members(company_id);",
        "CREATE TABLE IF NOT EXISTS company_sources(id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE, source TEXT NOT NULL, source_reference TEXT NOT NULL, imported_at TEXT NOT NULL);",
        "CREATE TABLE IF NOT EXISTS suppression(email TEXT PRIMARY KEY COLLATE NOCASE CHECK(email=lower(trim(email))), reason TEXT NOT NULL CHECK(reason IN('unsubscribe','complaint','hard_bounce','manual','legal_request')), source TEXT NOT NULL, created_at TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1 CHECK(active IN(0,1)), reinstated_at TEXT, reinstatement_evidence TEXT);",
        "CREATE TABLE IF NOT EXISTS suppression_audit(id TEXT PRIMARY KEY, email TEXT NOT NULL COLLATE NOCASE, action TEXT NOT NULL, reason TEXT NOT NULL, evidence TEXT NOT NULL, created_at TEXT NOT NULL);",
        "CREATE INDEX IF NOT EXISTS suppression_audit_email ON suppression_audit(email,created_at);",
        "CREATE TABLE IF NOT EXISTS import_history(id TEXT PRIMARY KEY, list_id TEXT, source TEXT NOT NULL, source_reference TEXT NOT NULL, imported_at TEXT NOT NULL, imported_count INTEGER NOT NULL, duplicate_count INTEGER NOT NULL, suppressed_count INTEGER NOT NULL, skipped_count INTEGER NOT NULL);"
      ].join("\n"));
      this.db.prepare("INSERT OR IGNORE INTO schema_migrations VALUES('001-companies-lists-suppression',?)").run(now());
      this.db.exec("COMMIT");
    } catch (error) {this.db.exec("ROLLBACK"); this.db.close(); throw error;}
  }
  close() {this.db.close();}
  transaction<T>(action:()=>T):T {
    this.db.exec("BEGIN IMMEDIATE");
    try {const result=action();this.db.exec("COMMIT");return result;}
    catch(error){this.db.exec("ROLLBACK");throw error;}
  }
  createList(name:string):WorkingList {
    const row:WorkingList={id:randomUUID(),name:required(name,"List name",160),status:"active",created_at:now()};
    this.db.prepare("INSERT INTO lists(id,name,status,created_at) VALUES(?,?,?,?)").run(row.id,row.name,row.status,row.created_at);
    return row;
  }
  listLists():WorkingList[] {
    return this.db.prepare("SELECT l.*,COUNT(m.company_id) company_count FROM lists l LEFT JOIN list_members m ON m.list_id=l.id GROUP BY l.id ORDER BY l.created_at DESC").all() as WorkingList[];
  }
  private requireList(id:string, active=false) {
    const list=this.db.prepare("SELECT * FROM lists WHERE id=?").get(id) as WorkingList|undefined;
    if(!list) throw new Error("List not found.");
    if(active && list.status!=="active") throw new Error("Archived lists cannot be modified or used for a new campaign.");
    return list;
  }
  listCompanies(listId?:string,filters:Record<string,string>={}):Company[] {
    const params:string[]=[];
    let sql="SELECT c.* FROM companies c";
    if(listId){this.requireList(listId);sql+=" JOIN list_members m ON m.company_id=c.id AND m.list_id=?";params.push(listId);}
    const conditions:string[]=[];
    for(const [key,value] of Object.entries(filters)){
      if(!FILTER_FIELDS.includes(key as typeof FILTER_FIELDS[number]) || typeof value!=="string" || value.length>100)
        throw new Error("Unsupported company filter.");
      if(value.trim()){conditions.push("lower(c."+key+")=lower(?)");params.push(key==="county"?value.trim().replace(/\s+county$/i,""):value.trim());}
    }
    if(conditions.length)sql+=" WHERE "+conditions.join(" AND ");
    sql+=" ORDER BY c.company_name";
    return (this.db.prepare(sql).all(...params) as unknown as Company[]).map(c=>({...c,suppressed:!!c.general_public_email&&this.isSuppressed(c.general_public_email)}));
  }
  eligibleCompanies(listId:string,filters:Record<string,string>={}):Company[] {
    this.requireList(listId,true);
    return this.listCompanies(listId,filters).filter(c=>c.active===1 && c.do_not_contact===0 && !!c.general_public_email && !c.suppressed);
  }
  archiveList(id:string) {this.requireList(id);this.db.prepare("UPDATE lists SET status='archived' WHERE id=?").run(id);}
  deleteList(id:string) {
    this.requireList(id);
    this.transaction(()=>{
      this.db.prepare("DELETE FROM lists WHERE id=?").run(id);
      this.db.exec("DELETE FROM companies WHERE NOT EXISTS(SELECT 1 FROM list_members m WHERE m.company_id=companies.id)");
    });
  }
  removeMember(listId:string,companyId:string) {
    this.requireList(listId,true);
    this.transaction(()=>{
      this.db.prepare("DELETE FROM list_members WHERE list_id=? AND company_id=?").run(listId,companyId);
      this.db.prepare("DELETE FROM companies WHERE id=? AND NOT EXISTS(SELECT 1 FROM list_members WHERE company_id=?)").run(companyId,companyId);
    });
  }
  private match(company:NormalizedCompany):string[] {
    return (this.db.prepare("SELECT id FROM companies WHERE (?<>'' AND domain=?) OR (?<>'' AND general_public_email=?) OR (?<>'' AND name_location=?)")
      .all(company.domain,company.domain,company.general_public_email,company.general_public_email,company.name_location,company.name_location) as {id:string}[]).map(r=>r.id);
  }
  previewImport(csv:string,mapping:ColumnMapping,source:string,sourceReference=""):ImportPreview {
    required(source,"Source provenance",200);
    if(typeof sourceReference!=="string" || sourceReference.length>1000)throw new Error("Source reference must be at most 1,000 characters.");
    const parsed=parseCsv(csv);validateMapping(parsed.headers,mapping);
    const seen=new Map<string,string>();
    const canonical=new Map<string,NormalizedCompany>();
    const rows:ImportRow[]=parsed.rows.map((values,i)=>{
      const row:ImportRow={row:i+2,company:null,suppressed:false,errors:[]};
      try{
        const input:Record<string,string>={};
        for(const [key,header] of Object.entries(mapping))input[key]=values[parsed.headers.indexOf(header!)];
        const company=normalizeCompany(input);row.company=company;
        row.suppressed=!!company.general_public_email&&(this.isSuppressed(company.general_public_email)||!!company.do_not_contact);
        const matches=this.match(company);
        const keys=[company.domain&&"domain:"+company.domain,company.general_public_email&&"email:"+company.general_public_email,company.name_location&&"name:"+company.name_location].filter(Boolean);
        const identities=new Set([...matches,...keys.flatMap(key=>seen.has(key)?[seen.get(key)!]:[])]);
        if(identities.size>1)throw new Error("Conflicting duplicate identifiers. Review domain, email and company/location before importing.");
        row.duplicate_id=[...identities][0];
        const identity=row.duplicate_id||"csv-row-"+row.row;
        const stored=canonical.get(identity) ?? (matches[0] ? this.db.prepare("SELECT * FROM companies WHERE id=?").get(matches[0]) as unknown as NormalizedCompany : undefined);
        const merged=stored ? this.mergeDuplicate(stored,company) : company;
        const mergedKeys=[merged.domain&&"domain:"+merged.domain,merged.general_public_email&&"email:"+merged.general_public_email,merged.name_location&&"name:"+merged.name_location].filter(Boolean);
        if(this.match(merged).some(id=>id!==identity) || mergedKeys.some(key=>seen.has(key)&&seen.get(key)!==identity))
          throw new Error("Merged identifiers conflict with another company. Review before importing.");
        canonical.set(identity,merged);
        for(const [key,value] of seen) if(value===identity && !mergedKeys.includes(key)) seen.delete(key);
        row.suppressed=!!merged.general_public_email&&(this.isSuppressed(merged.general_public_email)||!!merged.do_not_contact);
        for(const key of mergedKeys)seen.set(key,identity);
      }catch(error){row.errors.push(error instanceof Error?error.message:"Invalid company.");}
      return row;
    });
    return {
      headers:parsed.headers,rows,valid_count:rows.filter(r=>!r.errors.length).length,
      invalid_count:rows.filter(r=>r.errors.length).length,
      duplicate_count:rows.filter(r=>!r.errors.length&&r.duplicate_id).length,
      suppressed_count:rows.filter(r=>!r.errors.length&&r.suppressed).length,
    };
  }
  importCsv(listId:string,csv:string,mapping:ColumnMapping,source:string,sourceReference="",options:{skipInvalid?:boolean}={}) {
    this.requireList(listId,true);
    if(options.skipInvalid!==undefined&&typeof options.skipInvalid!=="boolean")throw new Error("skipInvalid must be true or false.");
    return this.transaction(()=>{
      const preview=this.previewImport(csv,mapping,source,sourceReference);
      if(preview.invalid_count&&!options.skipInvalid)throw new Error("Import has "+preview.invalid_count+" invalid rows. Review the preview and explicitly exclude invalid rows.");
      let imported=0,duplicates=0,suppressed=0;
      for(const row of preview.rows){
        if(row.errors.length||!row.company)continue;
        const result=this.insertCompany(listId,row.company,source.trim(),sourceReference);
        if(result.duplicate)duplicates++;else imported++;
        if(result.suppressed)suppressed++;
      }
      this.db.prepare("INSERT INTO import_history VALUES(?,?,?,?,?,?,?,?,?)")
        .run(randomUUID(),listId,source.trim(),sourceReference,now(),imported,duplicates,suppressed,preview.invalid_count);
      return {imported,duplicates,suppressed,skipped:preview.invalid_count,total:preview.rows.length};
    });
  }
  addCompany(listId:string,input:Record<string,unknown>,source:string,sourceReference="") {
    this.requireList(listId,true);required(source,"Source provenance",200);
    if(typeof sourceReference!=="string"||sourceReference.length>1000)throw new Error("Source reference too long.");
    return this.transaction(()=>this.insertCompany(listId,normalizeCompany(input),source.trim(),sourceReference));
  }
  private mergeDuplicate(stored:NormalizedCompany,incoming:NormalizedCompany):NormalizedCompany {
    for(const key of ["domain","general_public_email"] as const)
      if(stored[key] && incoming[key] && stored[key]!==incoming[key])
        throw new Error("Conflicting duplicate "+key+". Review this company's identifiers before importing; no address will be substituted.");
    const merged:Record<string,unknown>={...incoming};
    for(const [key,value] of Object.entries(stored)) if(value!=="" && value!==null && value!==undefined) merged[key]=value;
    merged.do_not_contact=stored.do_not_contact||incoming.do_not_contact;
    return normalizeCompany(merged);
  }
  private insertCompany(listId:string,company:NormalizedCompany,source:string,sourceReference:string) {
    const matches=this.match(company);
    if(matches.length>1)throw new Error("Conflicting duplicate company identifiers.");
    const duplicate=matches.length>0, id=matches[0]||randomUUID(), timestamp=now();
    if(!duplicate){
      const columns=Object.keys(company);
      this.db.prepare("INSERT INTO companies(id,"+columns.join(",")+",source,source_reference,imported_at,do_not_contact_reason,do_not_contact_at) VALUES("+Array(columns.length+6).fill("?").join(",")+")")
        .run(id,...Object.values(company),source,sourceReference,timestamp,company.do_not_contact?"Imported do-not-contact":"",company.do_not_contact?timestamp:null);
    }else {
      const stored=this.db.prepare("SELECT * FROM companies WHERE id=?").get(id) as unknown as NormalizedCompany;
      const merged=this.mergeDuplicate(stored,company);
      const columns=Object.keys(merged);
      this.db.prepare("UPDATE companies SET "+columns.map(k=>k+"=?").join(",")+" WHERE id=?").run(...Object.values(merged),id);
      company=merged;
    }
    if(duplicate && company.do_not_contact){
      this.db.prepare("UPDATE companies SET do_not_contact=1,do_not_contact_reason='Imported do-not-contact',do_not_contact_at=? WHERE id=?").run(timestamp,id);
      const stored=this.db.prepare("SELECT general_public_email FROM companies WHERE id=?").get(id) as {general_public_email:string};
      if(stored.general_public_email)this.suppress(stored.general_public_email,"manual","Imported do-not-contact: "+source);
    }
    if(company.do_not_contact&&company.general_public_email)this.suppress(company.general_public_email,"manual","Imported do-not-contact: "+source);
    this.db.prepare("INSERT OR IGNORE INTO list_members VALUES(?,?)").run(listId,id);
    this.db.prepare("INSERT INTO company_sources VALUES(?,?,?,?,?)").run(randomUUID(),id,source,sourceReference,timestamp);
    return {id,duplicate,suppressed:!!company.general_public_email&&this.isSuppressed(company.general_public_email)};
  }
  isSuppressed(value:string):boolean {
    const email=normalizeEmail(value);
    return !!email&&!!this.db.prepare("SELECT 1 FROM suppression WHERE email=? AND active=1").get(email);
  }
  suppress(value:string,reason:string,source:string):void {
    const email=normalizeEmail(value);
    if(!email)throw new Error("Suppression requires an email.");
    if(!SUPPRESSION_REASONS.includes(reason as typeof SUPPRESSION_REASONS[number]))throw new Error("Invalid suppression reason.");
    required(source,"Suppression source",500);
    const timestamp=now();
    this.db.exec("SAVEPOINT suppression_change");
    try {
    this.db.prepare("INSERT INTO suppression(email,reason,source,created_at,active) VALUES(?,?,?,?,1) ON CONFLICT(email) DO UPDATE SET reason=excluded.reason,source=excluded.source,created_at=excluded.created_at,active=1,reinstated_at=NULL,reinstatement_evidence=NULL")
      .run(email,reason,source,timestamp);
    this.db.prepare("INSERT INTO suppression_audit VALUES(?,?,?,?,?,?)").run(randomUUID(),email,"suppress",reason,source,timestamp);
    this.db.exec("RELEASE suppression_change");
    } catch(error) { this.db.exec("ROLLBACK TO suppression_change; RELEASE suppression_change"); throw error; }
  }
  listSuppression() {return this.db.prepare("SELECT * FROM suppression ORDER BY created_at DESC").all();}
  reinstate(value:string,evidence:string) {
    const email=normalizeEmail(value);
    if(typeof evidence!=="string"||evidence.trim().length<20||evidence.length>2000)
      throw new Error("Document at least 20 characters of verified permission and its source/date before reinstating this individual address.");
    this.transaction(()=>{
      const found=this.db.prepare("SELECT reason FROM suppression WHERE email=? AND active=1").get(email) as {reason:string}|undefined;
      if(!found)throw new Error("Active suppression not found.");
      this.db.prepare("UPDATE suppression SET active=0,reinstated_at=?,reinstatement_evidence=? WHERE email=?").run(now(),evidence.trim(),email);
      this.db.prepare("INSERT INTO suppression_audit VALUES(?,?,?,?,?,?)").run(randomUUID(),email,"reinstate",found.reason,evidence.trim(),now());
    });
  }
}
