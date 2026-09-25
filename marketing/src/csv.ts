/* eslint-disable no-control-regex -- Input validation intentionally rejects control characters. */
export const COMPANY_FIELDS = [
  "company_name", "website", "industry", "city", "county", "state", "zip", "phone",
  "general_public_email", "notes", "do_not_contact",
] as const;
export type CompanyField = typeof COMPANY_FIELDS[number];
export type ColumnMapping = Partial<Record<CompanyField, string>>;
export type NormalizedCompany = {
  company_name: string; website: string; domain: string; industry: string;
  city: string; county: string; state: string; zip: string; phone: string;
  general_public_email: string; notes: string; do_not_contact: number; name_location: string;
};
export const MAX_CSV_BYTES = 2_000_000;
export const MAX_CSV_ROWS = 5_000;

export function parseCsv(input: string): {headers: string[]; rows: string[][]} {
  if (typeof input !== "string" || Buffer.byteLength(input, "utf8") > MAX_CSV_BYTES)
    throw new Error("CSV must be text no larger than 2 MB.");
  if (input.includes("\0")) throw new Error("CSV contains a NUL byte. Save it as UTF-8 CSV.");
  const text = input.replace(/^\uFEFF/, "");
  const records: string[][] = [];
  let record: string[] = [], field = "", quoted = false, afterQuote = false;
  function endField() {
    if (field.length > 8_000) throw new Error("CSV field exceeds 8,000 characters.");
    record.push(field); field = ""; afterQuote = false;
    if (record.length > 60) throw new Error("CSV exceeds 60 columns.");
  }
  function endRecord() {
    endField();
    if (record.some(v => v.trim() !== "")) records.push(record);
    record = [];
    if (records.length > MAX_CSV_ROWS + 1) throw new Error("CSV exceeds 5,000 company rows.");
  }
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {field += '"'; i++;}
        else {quoted = false; afterQuote = true;}
      } else field += c;
    } else if (c === ",") endField();
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      endRecord();
    } else if (afterQuote) throw new Error("Malformed CSV: unexpected text after a closing quote.");
    else if (c === '"') {
      if (field) throw new Error("Malformed CSV: quote inside an unquoted field.");
      quoted = true;
    } else field += c;
    if (field.length > 8_000) throw new Error("CSV field exceeds 8,000 characters.");
  }
  if (quoted) throw new Error("Malformed CSV: unclosed quoted field.");
  if (field || record.length || afterQuote) endRecord();
  if (!records.length) throw new Error("CSV is empty.");
  const headers = records.shift()!.map(v => v.trim());
  if (headers.some(v => !v) || new Set(headers.map(v => v.toLowerCase())).size !== headers.length)
    throw new Error("CSV headers must be nonempty and unique.");
  for (let i = 0; i < records.length; i++)
    if (records[i].length !== headers.length)
      throw new Error("Malformed CSV at row " + (i + 2) + ": column count does not match the header.");
  return {headers, rows: records};
}

export function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") throw new Error("Email must be text.");
  const email = value.trim().toLowerCase();
  if (!email) return "";
  if (email.length > 254 || /[\s\u0000-\u001f\u007f]/.test(email)) throw new Error("Invalid email address.");
  const parts = email.split("@");
  if (parts.length !== 2 || parts[0].length > 64 || !parts[0] ||
      parts[0].startsWith(".") || parts[0].endsWith(".") || parts[0].includes("..") ||
      !/^[a-z0-9.!#$%&'*+/=?^_{}|~-]+$/.test(parts[0]) ||
      !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(parts[1]))
    throw new Error("Invalid email address.");
  return email;
}
const stateNames = ("Alabama:AL|Alaska:AK|Arizona:AZ|Arkansas:AR|California:CA|Colorado:CO|Connecticut:CT|Delaware:DE|District of Columbia:DC|Florida:FL|Georgia:GA|Hawaii:HI|Idaho:ID|Illinois:IL|Indiana:IN|Iowa:IA|Kansas:KS|Kentucky:KY|Louisiana:LA|Maine:ME|Maryland:MD|Massachusetts:MA|Michigan:MI|Minnesota:MN|Mississippi:MS|Missouri:MO|Montana:MT|Nebraska:NE|Nevada:NV|New Hampshire:NH|New Jersey:NJ|New Mexico:NM|New York:NY|North Carolina:NC|North Dakota:ND|Ohio:OH|Oklahoma:OK|Oregon:OR|Pennsylvania:PA|Rhode Island:RI|South Carolina:SC|South Dakota:SD|Tennessee:TN|Texas:TX|Utah:UT|Vermont:VT|Virginia:VA|Washington:WA|West Virginia:WV|Wisconsin:WI|Wyoming:WY|Puerto Rico:PR|Guam:GU|US Virgin Islands:VI|American Samoa:AS|Northern Mariana Islands:MP").split("|").map(v => v.split(":"));
function clean(value: unknown, max: number, name: string): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw new Error(name + " must be text.");
  const result = value.trim().normalize("NFKC");
  if (result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(result))
    throw new Error(name + " is too long or contains control characters.");
  return result;
}
export function normalizeCompany(input: Record<string, unknown>): NormalizedCompany {
  const company_name = clean(input.company_name, 200, "Company name");
  if (!company_name) throw new Error("Company name is required.");
  let website = clean(input.website, 2048, "Website"), domain = "";
  if (website) {
    let url: URL;
    try {url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(website) ? website : "https://" + website);}
    catch {throw new Error("Invalid website URL.");}
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password ||
        !url.hostname.includes(".") || url.hostname.endsWith("."))
      throw new Error("Website must be a public HTTP or HTTPS URL without credentials.");
    domain = url.hostname.toLowerCase().replace(/^www\./, "");
    website = url.origin + url.pathname.replace(/\/$/, ""); // discard query strings and fragments
  }
  const city = clean(input.city, 100, "City"), county = clean(input.county, 100, "County").replace(/\s+county$/i, "");
  let state = clean(input.state, 40, "State");
  if (state) {
    state = stateNames.find(([name, code]) => name.toLowerCase() === state.toLowerCase() || code === state.toUpperCase())?.[1] ?? "";
    if (!state) throw new Error("State must be a US state name or two-letter code.");
  }
  let zip = clean(input.zip, 12, "ZIP").replace(/\s/g, "");
  if (/^\d{4}$/.test(zip)) zip = "0" + zip;
  if (/^\d{9}$/.test(zip)) zip = zip.slice(0, 5) + "-" + zip.slice(5);
  if (zip && !/^\d{5}(?:-\d{4})?$/.test(zip)) throw new Error("ZIP must contain five digits or ZIP+4.");
  const dnc = input.do_not_contact;
  if (dnc !== undefined && dnc !== "" && ![true,false,0,1,"0","1","yes","no","true","false"].includes(typeof dnc === "string" ? dnc.toLowerCase().trim() : dnc as boolean))
    throw new Error("Do not contact must be yes/no or true/false.");
  const do_not_contact = [true,1,"1","yes","true"].includes(typeof dnc === "string" ? dnc.toLowerCase().trim() : dnc as boolean) ? 1 : 0;
  const key = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const location = [city,county,state,zip.slice(0,5)].map(key).join("|");
  const name_location = (city || county || zip) ? key(company_name) + "|" + location : "";
  return {
    company_name,website,domain,city,county,state,zip,name_location,do_not_contact,
    industry: clean(input.industry, 100, "Industry"),
    phone: clean(input.phone, 40, "Phone").replace(/[^\d+x() -]/g, ""),
    general_public_email: normalizeEmail(clean(input.general_public_email, 254, "Email")),
    notes: clean(input.notes, 2000, "Notes"),
  };
}
export function validateMapping(headers: string[], mapping: ColumnMapping): void {
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) throw new Error("Column mapping is required.");
  for (const [target, header] of Object.entries(mapping))
    if (!COMPANY_FIELDS.includes(target as CompanyField) || typeof header !== "string" || !headers.includes(header))
      throw new Error("Mapping contains an unknown company field or CSV header.");
  if (!mapping.company_name) throw new Error("Map a CSV column to company_name.");
  const selected = Object.values(mapping);
  if (new Set(selected).size !== selected.length) throw new Error("Map each CSV column only once.");
}
export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  // Spreadsheet formula injection protection, including leading whitespace/control characters.
  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
