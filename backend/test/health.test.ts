import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../src/app.ts";

async function withServer(check: (base: string) => Promise<void>): Promise<void> {
  const server = createApp();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    assert(address && typeof address === "object");
    await check("http://127.0.0.1:" + address.port);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("GET /health", () => withServer(async (base) => {
  const response = await fetch(base + "/health");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { status: "ok" });
}));

test("unknown route", () => withServer(async (base) => {
  const response = await fetch(base + "/missing");
  assert.equal(response.status, 404);
  const body = await response.json() as { error: string; requestId: string };
  assert.equal(body.error, "not_found");
  assert.match(body.requestId, /^[0-9a-f-]{36}$/);
}));
