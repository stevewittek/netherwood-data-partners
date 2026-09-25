import assert from "node:assert/strict";
import test from "node:test";
import { evaluateReadiness, isCompleteReadinessAnswers, parseReadinessHandoff, readinessQuestions, readinessSummary, READINESS_HANDOFF_MAX_AGE_MS, serializeReadinessHandoff } from "../app/lib/migration-readiness.ts";
import type { ReadinessAnswers } from "../app/lib/migration-readiness.ts";

function lowRiskAnswers(): ReadinessAnswers {
  return Object.fromEntries(readinessQuestions.map((q) => [q.id, q.riskAnswer === "yes" ? "no" : "yes"]));
}

test("complete low-risk answers produce a cautious straightforward result", () => {
  const result = evaluateReadiness(lowRiskAnswers());
  assert.equal(result.level, "straightforward");
  assert.equal(result.score, 0);
  assert.match(result.description, /not a guarantee/);
  assert(result.nextSteps.some((step) => step.includes("trial migration")));
});

test("risk thresholds are 6 for planning and 14 for complex", () => {
  const base = lowRiskAnswers();
  const five = { ...base, unsupported: "yes", access: "yes" } as ReadinessAnswers;
  assert.equal(evaluateReadiness(five).score, 5);
  assert.equal(evaluateReadiness(five).level, "straightforward");
  const six = { ...five, age: "yes" } as ReadinessAnswers;
  assert.equal(evaluateReadiness(six).score, 6);
  assert.equal(evaluateReadiness(six).level, "planning");
  const thirteen = { ...six, onePerson: "yes", duplicates: "yes", documents: "yes" } as ReadinessAnswers;
  assert.equal(evaluateReadiness(thirteen).score, 13);
  assert.equal(evaluateReadiness(thirteen).level, "planning");
  const fourteen = { ...thirteen, server: "yes" } as ReadinessAnswers;
  assert.equal(evaluateReadiness(fourteen).score, 14);
  assert.equal(evaluateReadiness(fourteen).level, "complex");
});

test("unknowns are not counted as proven risks and three unknowns require planning", () => {
  const answers = lowRiskAnswers();
  answers.api = "unknown";
  answers.age = "unknown";
  assert.equal(evaluateReadiness(answers).level, "straightforward");
  answers.documents = "unknown";
  assert.equal(evaluateReadiness(answers).level, "planning");
  const allUnknown = Object.fromEntries(readinessQuestions.map((q) => [q.id, "unknown"])) as ReadinessAnswers;
  const result = evaluateReadiness(allUnknown);
  assert.equal(result.level, "planning");
  assert.equal(result.score, 0);
  assert.equal(result.unknownCount, readinessQuestions.length);
  assert(result.nextSteps.some((step) => step.includes("Unknown does not mean something is wrong")));
});

test("untested or unknown recovery and continuity require planning even below six points", () => {
  for (const id of ["restore", "continuity"]) {
    for (const answer of ["no", "unknown"] as const) {
      const result = evaluateReadiness({ ...lowRiskAnswers(), [id]: answer });
      assert.equal(result.level, "planning");
    }
  }
});

test("age, Access and no API alone do not establish an unsafe or complex system", () => {
  const result = evaluateReadiness({ ...lowRiskAnswers(), age: "yes", access: "yes", api: "no" });
  assert.equal(result.level, "straightforward");
  assert(result.nextSteps.some((step) => step.includes("API is not always needed")));
});

test("incomplete or invalid answers are rejected rather than silently scored", () => {
  for (const value of [null, [], {}, { ...lowRiskAnswers(), api: "maybe" }, { ...lowRiskAnswers(), restore: undefined }]) assert.equal(isCompleteReadinessAnswers(value), false);
  assert.throws(() => evaluateReadiness({}), /Answer every question/);
});

test("summary and handoff contain only the known self-reported answers", () => {
  const answers = { ...lowRiskAnswers(), email: "unknown" } as ReadinessAnswers;
  const handoff = serializeReadinessHandoff(answers, 1000);
  assert.doesNotMatch(handoff, /email/);
  assert.deepEqual(parseReadinessHandoff(handoff, 1001), lowRiskAnswers());
  assert.match(readinessSummary(answers), /Self-reported, not a technical assessment/);
});

test("handoff accepts the expiry boundary and rejects stale, future, malformed, oversized or wrong-version data", () => {
  const handoff = serializeReadinessHandoff(lowRiskAnswers(), 1000);
  assert(parseReadinessHandoff(handoff, 1000 + READINESS_HANDOFF_MAX_AGE_MS));
  assert.equal(parseReadinessHandoff(handoff, 1001 + READINESS_HANDOFF_MAX_AGE_MS), null);
  assert.equal(parseReadinessHandoff(handoff, 999), null);
  for (const raw of [null, "broken", "x".repeat(4097), "null", JSON.stringify({ version: 2, createdAt: 1000, answers: lowRiskAnswers() }), JSON.stringify({ version: 1, createdAt: 1000, answers: {} })]) assert.equal(parseReadinessHandoff(raw, 1001), null);
});
