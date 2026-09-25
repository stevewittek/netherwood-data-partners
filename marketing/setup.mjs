import { randomBytes } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";


await mkdir(new URL("data/", import.meta.url), {recursive:true,mode:0o700});
let env = (await readFile(new URL(".env.example", import.meta.url), "utf8")).replace(/\r\n/g, "\n");
env = env.replace("MARKETING_ADMIN_TOKEN=\n", "MARKETING_ADMIN_TOKEN=" + randomBytes(32).toString("hex") + "\n");
try {
  await writeFile(new URL(".env", import.meta.url), env, {flag:"wx",mode:0o600});
  console.log("Created local-only configuration. Read MARKETING_ADMIN_TOKEN in marketing/.env to unlock the desk. Keep that file private.");
} catch (error) {
  if (error.code !== "EEXIST") throw error;
  console.log("Existing marketing/.env preserved.");
}
console.log("From the repository root, start with: pnpm marketing");
