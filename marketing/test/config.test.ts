import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.ts";
const base={MARKETING_ADMIN_TOKEN:"a".repeat(64)};
test("configuration fails closed without authentication or with production mode",()=>{
  assert.throws(()=>loadConfig({}),/ADMIN_TOKEN/);
  assert.throws(()=>loadConfig({...base,MARKETING_MODE:"production"}),/Only local/);
  assert.throws(()=>loadConfig({...base,MARKETING_ATTRIBUTION_TOKEN:base.MARKETING_ADMIN_TOKEN}),/separate/);
  assert.throws(()=>loadConfig({...base,MARKETING_PORT:"0"}),/PORT/);
});
test("public origins cannot leak credentials or use insecure remote HTTP",()=>{
  assert.throws(()=>loadConfig({...base,MARKETING_PUBLIC_BASE_URL:"http://marketing.example.test"}),/HTTPS/);
  assert.throws(()=>loadConfig({...base,MARKETING_WEBSITE_ORIGIN:"https://user:secret@example.test"}),/HTTPS/);
  assert.throws(()=>loadConfig({...base,MARKETING_SENDER_NAME:"Sender\nBcc: other@example.test"}),/sender name/);
  const c=loadConfig(base);assert.equal(c.mode,"local");assert.equal(c.origin,"http://127.0.0.1:4310");
});
