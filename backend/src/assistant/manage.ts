import { resolve, join, basename } from "node:path";
import { readFile, mkdir, lstat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { AssistantStore, privateWrite } from "./store.ts";
import { readKnowledge, type Source } from "./knowledge.ts";
import { services } from "../../../app/content/services.ts";
import { extractDocument } from "../documents.ts";
const root = resolve(process.env.NDP_ASSISTANT_DATA_DIR ?? ".private-chatbot");
const store = new AssistantStore(root);
const [command, ...args] = process.argv.slice(2);
if (command === "setup") {
  try {
    await store.initialize();
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
  }
  const knowledge: Source[] = [
    {
      id: "business-profile",
      title: "About Netherwood Data Partners",
      approved: true,
      url: "/about/",
      text: "Netherwood Data Partners LLC is Steven Wittek’s independent software and data engineering business. SQL Server is a specialty. Services include database engineering, migration planning and execution, business software troubleshooting, software conversions, reporting, integrations and workflow automation. Steven is the point of contact. Scope, access, availability and fees must be agreed before work begins. Do not offer guarantees, unverified prices or current availability. The business is not hiring staff or seeking vendors, recruiters or additional team members. Genuine project inquiries are welcome through the website contact form. This is an AI assistant, not Steven speaking live.",
    },
    {
      id: "steven-wittek",
      title: "Steven Wittek",
      approved: true,
      url: "/about/",
      text: "Steven Wittek is a SQL Server engineer, database developer and software consultant based in New Jersey, with technology experience since 2009. Visitors work directly with Steven. Capabilities include Access, FileMaker and SQL Server conversions, extracting and mapping legacy records, trial imports, T-SQL, SSRS, Query Store, execution plan analysis and restore testing. He coordinates with software providers and checks results with the people who use the system. Meetings are by appointment. No staffing, employer history or customer outcomes are asserted by this source.",
    },
    ...services.map((s) => ({
      id: s.slug,
      title: s.title,
      approved: true as const,
      url: `/services/${s.slug}/`,
      text: [
        s.description,
        s.intro,
        ...s.situations,
        ...s.approach.map((a) => `${a.title}: ${a.detail}`),
        ...s.deliverables,
        s.technical,
        s.boundary,
        ...s.questions.map((q) => `${q.question} ${q.answer}`),
      ].join("\n\n"),
    })),
  ];
  try {
    await lstat(join(root, "knowledge.json"));
    console.log("Existing knowledge preserved.");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    await privateWrite(join(root, "knowledge.json"), knowledge);
  }
  console.log(
    "Private assistant storage ready. Credit verification is required before paid calls.",
  );
} else if (command === "credit") {
  // Owner-only operation. Pass SAME grant ID when renewing verification; never reset the ledger.
  const [id, dollars, daily, expiry] = args;
  const limitMicroUsd = Math.round(Number(dollars) * 1e6),
    dailyMicroUsd = Math.round(Number(daily) * 1e6);
  if (
    !id ||
    !/^[a-zA-Z0-9-]{1,80}$/.test(id) ||
    !(limitMicroUsd > 0 && limitMicroUsd <= 100e6) ||
    !(dailyMicroUsd > 0 && dailyMicroUsd <= limitMicroUsd) ||
    !(Date.parse(expiry) > Date.now())
  )
    throw new Error(
      "Usage: credit GRANT-ID VERIFIED-ALLOCATION-USD DAILY-USD EXPIRY-ISO",
    );
  await privateWrite(join(root, "credit.json"), {
    id,
    limitMicroUsd,
    dailyMicroUsd,
    expiresAt: expiry,
    verifiedAt: new Date().toISOString(),
  });
  console.log(
    "Credit verification saved for at most 24 hours. Spending ledger preserved.",
  );
} else if (command === "inbox") {
  await store.purge(Date.now());
  const state = await store.read();
  console.log(
    JSON.stringify(
      {
        inquiries: state.inquiries,
        conversations: Object.entries(state.sessions).map(([id, s]) => ({
          id,
          topic: s.topic,
          updated: new Date(s.updated).toISOString(),
          turns: s.turns,
        })),
        budgetsMicroUsd: state.budgets,
        blocked: state.blocked,
      },
      null,
      2,
    ),
  );
} else if (command === "reviewed") {
  await store.change((s) => {
    const inquiry = s.inquiries.find((i) => i.id === args[0]);
    if (!inquiry) throw new Error("Unknown inquiry");
    inquiry.status = "reviewed";
  });
  console.log("Inquiry marked reviewed.");
} else if (command === "draft") {
  const path = resolve(args[0] ?? "");
  if ((await lstat(path)).isSymbolicLink())
    throw new Error("Document symlinks not allowed");
  const document = await extractDocument(path);
  if (document.text.length > 50000)
    throw new Error(
      "Split this document into sections under 50000 characters.",
    );
  const id = basename(path)
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 80);
  const draft = {
    id,
    title: document.title.slice(0, 200),
    text: document.text,
    approved: false,
  };
  const bytes = JSON.stringify(draft);
  const digest = createHash("sha256").update(bytes).digest("hex");
  await mkdir(join(root, "drafts"), { recursive: true, mode: 0o700 });
  await privateWrite(join(root, "drafts", `${digest}.json`), draft);
  console.log(
    `Draft saved privately: ${join(root, "drafts", `${digest}.json`)}\nReview every statement for public-answer use before approving. Approval hash: ${digest}`,
  );
} else if (command === "approve") {
  const digest = args[0];
  if (!/^[a-f0-9]{64}$/.test(digest ?? ""))
    throw new Error("Invalid draft hash");
  const draft = JSON.parse(
    await readFile(join(root, "drafts", `${digest}.json`), "utf8"),
  );
  if (
    createHash("sha256").update(JSON.stringify(draft)).digest("hex") !== digest
  )
    throw new Error("Draft changed; generate a new review hash");
  if (draft.id === "business-profile")
    throw new Error("Business profile is managed separately");
  const corpus = await readKnowledge(root, Date.now());
  const next = [
    ...corpus.sources.filter((s) => s.id !== draft.id),
    { ...draft, approved: true },
  ];
  if (next.length > 100 || Buffer.byteLength(JSON.stringify(next)) > 500000)
    throw new Error("Knowledge capacity reached");
  await privateWrite(join(root, "knowledge.json"), next);
  console.log(
    "Reviewed document is available for public answers. Raw file is not served.",
  );
} else if (command === "resume") {
  // Explicit owner recovery after checking credits/key/provider settings.
  await store.change((s) => {
    s.blocked = false;
  });
  console.log("Provider shutdown cleared; credit checks still apply.");
} else {
  throw new Error(
    "Commands: setup | credit ID USD DAILY-USD EXPIRY | draft FILE | approve HASH | inbox | reviewed ID | resume",
  );
}
