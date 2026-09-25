"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  evaluateReadiness,
  readinessQuestions,
  READINESS_STORAGE_KEY,
  serializeReadinessHandoff,
} from "../lib/migration-readiness";
import type {
  ReadinessAnswer,
  ReadinessAnswers,
  ReadinessResult,
} from "../lib/migration-readiness";

const options: { value: ReadinessAnswer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Not sure" },
];

export default function MigrationReadiness() {
  const [answers, setAnswers] = useState<ReadinessAnswers>({});
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [handoffError, setHandoffError] = useState(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);

  function showResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(evaluateReadiness(answers));
    setHandoffError(false);
    requestAnimationFrame(() => resultHeading.current?.focus());
  }

  function prepareInquiry() {
    try {
      window.sessionStorage.setItem(
        READINESS_STORAGE_KEY,
        serializeReadinessHandoff(answers),
      );
      window.location.assign("/migration-intake/");
    } catch {
      setHandoffError(true);
    }
  }

  return (
    <div className="migration-readiness">
      <form onSubmit={showResult}>
        <div className="migration-tool-progress" role="status">
          {Object.keys(answers).length} of {readinessQuestions.length} answered.
          “Not sure” is a useful answer.
        </div>
        <div className="readiness-question-list">
          {readinessQuestions.map((question, index) => (
            <fieldset
              className="readiness-question"
              key={question.id}
              aria-describedby={`hint-${question.id}`}
            >
              <legend>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {question.label}
              </legend>
              <p id={`hint-${question.id}`}>{question.hint}</p>
              <div className="readiness-options">
                {options.map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      required
                      checked={answers[question.id] === option.value}
                      onChange={() => {
                        setAnswers({ ...answers, [question.id]: option.value });
                        setResult(null);
                        setHandoffError(false);
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="migration-tool-actions">
          <button className="button button-primary" type="submit">
            See my migration readiness
          </button>
          <p>
            No contact details required. Your answers stay in this page unless
            you choose to carry them into an inquiry.
          </p>
        </div>
      </form>

      {result && (
        <section
          className="readiness-result"
          aria-labelledby="readiness-result-heading"
        >
          <p className="eyebrow">Your self-check result</p>
          <h2 id="readiness-result-heading" ref={resultHeading} tabIndex={-1}>
            {result.title}
          </h2>
          <p className="readiness-result-intro">{result.description}</p>
          <div className="readiness-result-columns">
            <div>
              <h3>What drives the result</h3>
              <ul>
                {result.drivers.map((driver) => (
                  <li key={driver}>{driver}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Useful next steps</h3>
              <ol>
                {result.nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
          <details className="readiness-method">
            <summary>How this result is calculated</summary>
            <p>
              This is a transparent planning guide, not a technical inspection,
              cost estimate or decision to retire a system. No industry
              benchmark or predictive model is used.
            </p>
            <p>
              Your answers produced {result.score} planning points and{" "}
              {result.unknownCount} unknowns. Below 6 points suggests a
              straightforward candidate; 6–13 suggests planning; 14 or more
              suggests an assessment. Three unknowns, or an unconfirmed restore
              or continuity plan, always require at least planning. Unknowns add
              no risk points. Age, Access and the absence of an API do not alone
              establish a complex environment.
            </p>
            <ul>
              {readinessQuestions.map((q) => (
                <li key={q.id}>
                  {q.label} “{q.riskAnswer === "yes" ? "Yes" : "No"}”:{" "}
                  {q.points} {q.points === 1 ? "point" : "points"}.
                </li>
              ))}
            </ul>
          </details>
          <div className="readiness-invitation">
            <h3>Want help reviewing it?</h3>
            <p>
              Carry this assessment into a migration inquiry. You can review or
              remove it before sending anything to Netherwood.
            </p>
            <button
              className="button button-primary"
              type="button"
              onClick={prepareInquiry}
            >
              Include this assessment in an inquiry
            </button>
            <p className="migration-small-print">
              This step stores only these answers in this browser tab. They can
              be attached for the next 30 minutes; closing the tab clears them.
              Nothing is sent until you submit the inquiry.
            </p>
            {handoffError && (
              <p role="alert">
                This browser could not carry the answers to the next page. You
                can{" "}
                <button
                  type="button"
                  className="migration-inline-button"
                  onClick={() => window.print()}
                >
                  print or save this result
                </button>{" "}
                and <a href="/migration-intake/">start an inquiry without it</a>
                .
              </p>
            )}
            <button
              type="button"
              className="migration-inline-button"
              onClick={() => window.print()}
            >
              Print or save my result
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
