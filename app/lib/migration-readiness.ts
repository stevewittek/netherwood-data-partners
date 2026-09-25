export type ReadinessAnswer = "yes" | "no" | "unknown";

type ReadinessQuestion = {
  id: string;
  group: string;
  label: string;
  hint: string;
  riskAnswer: "yes" | "no";
  points: number;
  driver: string;
  nextStep: string;
  safeguard?: boolean;
};

export const readinessQuestions: readonly ReadinessQuestion[] = [
  {
    id: "replacement",
    group: "The move",
    label: "Have you already selected replacement software?",
    hint: "You can still plan a migration while comparing products.",
    riskAnswer: "no",
    points: 1,
    driver: "The replacement platform is still to be selected.",
    nextStep:
      "Ask shortlisted vendors what records, history and documents they can accept.",
  },
  {
    id: "age",
    group: "What you use today",
    label: "Is your existing software more than 10 years old?",
    hint: "Age alone does not make software unsuitable.",
    riskAnswer: "yes",
    points: 1,
    driver:
      "A long-running application may have accumulated changes and historical formats.",
    nextStep:
      "List the versions, custom changes and years of history that matter to the business.",
  },
  {
    id: "unsupported",
    group: "What you use today",
    label: "Is the current product unsupported?",
    hint: "For example, the vendor no longer provides fixes or help.",
    riskAnswer: "yes",
    points: 3,
    driver:
      "An unsupported product may limit access to vendor help during extraction.",
    nextStep:
      "Confirm how to export and read existing records before changing the old system.",
  },
  {
    id: "access",
    group: "What you use today",
    label: "Is important information stored in Microsoft Access?",
    hint: "Access can work well; the question is how its data and business rules are documented.",
    riskAnswer: "yes",
    points: 2,
    driver:
      "An Access application may contain forms, queries and business rules as well as records.",
    nextStep:
      "Inventory Access files, linked tables, reports and the workflows staff rely on.",
  },
  {
    id: "spreadsheets",
    group: "What you use today",
    label: "Do you rely heavily on spreadsheets?",
    hint: "Think about the spreadsheets needed to run daily work.",
    riskAnswer: "yes",
    points: 2,
    driver:
      "Spreadsheet workflows may contain important data outside the main application.",
    nextStep:
      "Identify the authoritative spreadsheet versions and how they connect to other records.",
  },
  {
    id: "server",
    group: "What you use today",
    label: "Is there an onsite Windows server?",
    hint: "A server can support files, printing or applications that a software move will not automatically replace.",
    riskAnswer: "yes",
    points: 1,
    driver: "An onsite server calls for a dependency check before retirement.",
    nextStep:
      "Check file shares, scheduled jobs, reporting and other users of the server.",
  },
  {
    id: "onePerson",
    group: "People and records",
    label: "Does one person know most of how the current system works?",
    hint: "Include a former employee or outside developer.",
    riskAnswer: "yes",
    points: 3,
    driver: "System knowledge is concentrated in one person.",
    nextStep:
      "Document daily workflows and business rules with the people who know them.",
  },
  {
    id: "duplicates",
    group: "People and records",
    label: "Is data duplicated between systems?",
    hint: "For example, the same customer is entered in accounting and a job-tracking tool.",
    riskAnswer: "yes",
    points: 2,
    driver: "Duplicate records need ownership and matching rules.",
    nextStep:
      "Decide which source wins and how duplicate customers, jobs or accounts will be matched.",
  },
  {
    id: "inconsistent",
    group: "People and records",
    label: "Is historical information inconsistent?",
    hint: "Examples include missing fields, old codes or dates entered in different ways.",
    riskAnswer: "yes",
    points: 3,
    driver:
      "Inconsistent history needs cleanup and agreed rules before importing.",
    nextStep:
      "Profile a sample, record exceptions and agree how to handle missing or conflicting values.",
  },
  {
    id: "documents",
    group: "People and records",
    label: "Are there documents that must also be migrated?",
    hint: "Think about contracts, scans, attachments, job photos or shared folders.",
    riskAnswer: "yes",
    points: 2,
    driver: "Documents add file, permission and record-linking requirements.",
    nextStep:
      "Plan how files, folder structure and links to customers or jobs will move together.",
  },
  {
    id: "api",
    group: "The move",
    label: "Does the new platform provide an API?",
    hint: "An API lets software exchange data. A supported file import may be enough; it is fine not to know.",
    riskAnswer: "no",
    points: 1,
    driver:
      "An API is not available; confirm whether the supported import route covers the required data.",
    nextStep:
      "Ask the vendor which import or integration route fits the migration; an API is not always needed.",
  },
  {
    id: "import",
    group: "The move",
    label: "Does the new vendor provide an import process?",
    hint: "This might be a CSV template, a migration service or another documented way to bring records in.",
    riskAnswer: "no",
    points: 3,
    driver: "A supported way to import records has not been established.",
    nextStep:
      "Agree an import route and obtain sample templates before committing to a cutover date.",
  },
  {
    id: "restore",
    group: "Keeping the business working",
    label: "Have you tested restoring your existing data?",
    hint: "Having a backup is different from proving that it can be recovered.",
    riskAnswer: "no",
    points: 4,
    driver: "Recovery from the existing backup has not been tested.",
    nextStep:
      "Verify a usable backup and a restore in a separate environment before migration work.",
    safeguard: true,
  },
  {
    id: "continuity",
    group: "Keeping the business working",
    label: "Could your business operate if the old system stopped tomorrow?",
    hint: "Consider access to customers, jobs, invoices and other daily records.",
    riskAnswer: "no",
    points: 3,
    driver: "Daily operations depend on continued access to the old system.",
    nextStep:
      "Agree a continuity plan, acceptable downtime and a rollback path before cutover.",
    safeguard: true,
  },
];

export type ReadinessAnswers = Record<string, ReadinessAnswer>;
export type ReadinessLevel = "straightforward" | "planning" | "complex";
export type ReadinessResult = {
  level: ReadinessLevel;
  title: string;
  description: string;
  score: number;
  unknownCount: number;
  drivers: string[];
  nextSteps: string[];
};

export function isCompleteReadinessAnswers(
  value: unknown,
): value is ReadinessAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const answers = value as Record<string, unknown>;
  return readinessQuestions.every(
    ({ id }) =>
      answers[id] === "yes" ||
      answers[id] === "no" ||
      answers[id] === "unknown",
  );
}

export function evaluateReadiness(answers: ReadinessAnswers): ReadinessResult {
  if (!isCompleteReadinessAnswers(answers))
    throw new Error("Answer every question, or choose Not sure.");
  const risks = readinessQuestions.filter(
    (q) => answers[q.id] === q.riskAnswer,
  );
  const unknowns = readinessQuestions.filter(
    (q) => answers[q.id] === "unknown",
  );
  const score = risks.reduce((total, q) => total + q.points, 0);
  const needsSafeguard = readinessQuestions.some(
    (q) => q.safeguard && answers[q.id] !== "yes",
  );
  const level: ReadinessLevel =
    score >= 14
      ? "complex"
      : score >= 6 || unknowns.length >= 3 || needsSafeguard
        ? "planning"
        : "straightforward";
  const descriptions = {
    straightforward: {
      title: "Straightforward migration candidate",
      description:
        "Your answers suggest fewer planning complications. Confirm the scope, test an import and reconcile the results before moving live work. This is a starting point, not a guarantee of effort or readiness.",
    },
    planning: {
      title: "Migration planning recommended",
      description:
        "There are details to resolve before you set a move date. A source inventory, recovery check and trial import can turn those unknowns into a workable plan.",
    },
    complex: {
      title: "Complex legacy environment worth assessing",
      description:
        "Your answers point to several connected migration requirements. A focused assessment can separate the data, workflow and recovery work and establish a sensible sequence.",
    },
  };
  const drivers = risks.map((q) => q.driver);
  if (unknowns.length)
    drivers.push(
      `${unknowns.length} ${unknowns.length === 1 ? "answer needs" : "answers need"} confirmation: ${unknowns.map((q) => q.label).join(" ")}`,
    );
  if (!drivers.length)
    drivers.push(
      "You reported a selected platform, a supported import route, tested recovery and no additional complications covered by these questions.",
    );
  const nextSteps = risks.map((q) => q.nextStep);
  if (unknowns.length)
    nextSteps.unshift(
      "Review the unanswered details with your staff and software provider. Unknown does not mean something is wrong.",
    );
  nextSteps.push(
    "Run a trial migration and compare relationships, sample records, record counts and relevant business totals.",
    "Agree who signs off the results, the final cutover steps and how historical records will remain accessible.",
  );
  return {
    level,
    ...descriptions[level],
    score,
    unknownCount: unknowns.length,
    drivers,
    nextSteps,
  };
}

export function readinessSummary(answers: ReadinessAnswers): string {
  const result = evaluateReadiness(answers);
  const labels = { yes: "Yes", no: "No", unknown: "Not sure" };
  return [
    `Migration readiness self-check: ${result.title}`,
    `Planning points: ${result.score}; unknowns: ${result.unknownCount}. Self-reported, not a technical assessment.`,
    ...readinessQuestions.map((q) => `${q.label} ${labels[answers[q.id]]}`),
  ].join("\n");
}

export const READINESS_STORAGE_KEY = "netherwood.migration-readiness.v1";
export const READINESS_HANDOFF_MAX_AGE_MS = 30 * 60 * 1000;
const MAX_HANDOFF_LENGTH = 4096;

export function serializeReadinessHandoff(
  answers: ReadinessAnswers,
  now = Date.now(),
): string {
  if (!isCompleteReadinessAnswers(answers))
    throw new Error("Incomplete assessment");
  return JSON.stringify({
    version: 1,
    createdAt: now,
    answers: Object.fromEntries(
      readinessQuestions.map((q) => [q.id, answers[q.id]]),
    ),
  });
}

export function parseReadinessHandoff(
  raw: string | null,
  now = Date.now(),
): ReadinessAnswers | null {
  if (!raw || raw.length > MAX_HANDOFF_LENGTH) return null;
  try {
    const value = JSON.parse(raw);
    if (
      !value ||
      value.version !== 1 ||
      typeof value.createdAt !== "number" ||
      !Number.isFinite(value.createdAt) ||
      value.createdAt > now ||
      now - value.createdAt > READINESS_HANDOFF_MAX_AGE_MS ||
      !isCompleteReadinessAnswers(value.answers)
    )
      return null;
    return Object.fromEntries(
      readinessQuestions.map((q) => [q.id, value.answers[q.id]]),
    );
  } catch {
    return null;
  }
}
