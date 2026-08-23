import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../src/config.ts";

test("loads a complete SQL configuration", () => {
  const config = loadConfig({
    SQL_SERVER_HOST: "db.example",
    SQL_SERVER_PORT: "1433",
    SQL_SERVER_DATABASE: "NDP_Web",
    SQL_SERVER_USER: "ndp_web_app",
    SQL_SERVER_PASSWORD: "test-password",
    SQL_ENCRYPT: "true",
    SQL_TRUST_SERVER_CERTIFICATE: "false",
  });
  assert.equal(config.sql?.server, "db.example");
  assert.equal(config.sql?.trustServerCertificate, false);
});

test("rejects partial or invalid configuration", () => {
  assert.throws(() => loadConfig({ SQL_SERVER_HOST: "db.example" }), /incomplete/);
  assert.throws(() => loadConfig({ RATE_LIMIT: "zero" }), /RATE_LIMIT/);
  assert.throws(() => loadConfig({ ALLOWED_ORIGINS: "https://example.com/path" }), /URL origins/);
  assert.throws(() => loadConfig({ IP_ABUSE_HASH_SECRET: "too-short" }), /at least 32/);
});
