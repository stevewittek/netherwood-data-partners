import { access, chmod, copyFile, mkdir, readdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, "..");
const templateRoot = path.join(repositoryRoot, "ops", "business", "templates");
const templateNames = [
  "inquiry-register.csv",
  "owner-decisions.md",
  "engagement-checklist.md",
];

function fail(message) {
  console.error(`business-ops: ${message}`);
  process.exitCode = 1;
}

function usage() {
  console.log(`Usage:
  node scripts/prepare-business-ops.mjs --check
  node scripts/prepare-business-ops.mjs --destination /approved/private/path

The destination is required, must be outside this repository, and must not
already contain any starter-kit filename.`);
}

function parseArguments(argv) {
  if (argv.includes("--help")) return { help: true };
  if (argv.includes("--check")) return { check: true };
  const destinationIndex = argv.indexOf("--destination");
  if (destinationIndex === -1 || !argv[destinationIndex + 1]) return {};
  if (destinationIndex + 2 !== argv.length) return {};
  return { destination: argv[destinationIndex + 1] };
}

function isInsideRepository(candidate) {
  const relative = path.relative(repositoryRoot, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== "..");
}

async function validateTemplates() {
  const found = (await readdir(templateRoot)).sort();
  const expected = [...templateNames].sort();
  if (JSON.stringify(found) !== JSON.stringify(expected)) {
    throw new Error(`expected only ${expected.join(", ")} in ${templateRoot}`);
  }

  const register = await readFile(path.join(templateRoot, "inquiry-register.csv"), "utf8");
  const lines = register.trimEnd().split(/\r?\n/);
  if (lines.length !== 1 || !lines[0].startsWith("inquiry_id,received_utc,")) {
    throw new Error("inquiry-register.csv must contain only the approved header");
  }

  for (const name of templateNames.slice(1)) {
    const contents = await readFile(path.join(templateRoot, name), "utf8");
    if (!contents.includes("Do not commit") && !contents.includes("Do not populate")) {
      throw new Error(`${name} must retain its repository privacy warning`);
    }
  }
}

async function pathExists(candidate) {
  try {
    await access(candidate, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function prepare(destinationArgument) {
  const destination = path.resolve(destinationArgument);
  if (isInsideRepository(destination)) {
    throw new Error("destination must be outside the repository");
  }

  await validateTemplates();
  await mkdir(destination, { recursive: true, mode: 0o700 });
  await chmod(destination, 0o700);

  for (const name of templateNames) {
    const target = path.join(destination, name);
    if (await pathExists(target)) {
      throw new Error(`refusing to overwrite existing file: ${target}`);
    }
  }

  for (const name of templateNames) {
    const target = path.join(destination, name);
    await copyFile(path.join(templateRoot, name), target, constants.COPYFILE_EXCL);
    await chmod(target, 0o600);
  }

  console.log(`Prepared private business-operations templates at ${destination}`);
}

const options = parseArguments(process.argv.slice(2));

try {
  if (options.help) {
    usage();
  } else if (options.check) {
    await validateTemplates();
    console.log("Business-operations starter kit is valid.");
  } else if (options.destination) {
    await prepare(options.destination);
  } else {
    usage();
    fail("choose --check or provide --destination");
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
