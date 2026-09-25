import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const root=fileURLToPath(new URL("../",import.meta.url));
const pkg=JSON.parse(readFileSync(resolve(root,"node_modules/vinext/package.json"),"utf8"));
const bin=typeof pkg.bin==="string"?pkg.bin:pkg.bin.vinext;
const child=spawn(process.execPath,[resolve(root,"node_modules/vinext",bin),...process.argv.slice(2)],{
  cwd:root,stdio:"inherit",env:{...process.env,WRANGLER_LOG_PATH:process.env.WRANGLER_LOG_PATH||".wrangler/wrangler.log"}
});
child.on("error",error=>{console.error(error.message);process.exitCode=1;});
child.on("exit",(code)=>{process.exitCode=code??1;});