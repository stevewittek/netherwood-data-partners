"use client";

import { useEffect, useState } from "react";
import { InquiryForm } from "./ContactForm";
import {
  parseReadinessHandoff,
  readinessSummary,
  READINESS_STORAGE_KEY,
} from "../lib/migration-readiness";

const goals = [
  "Replace old software",
  "Move into a new SaaS/cloud platform",
  "Migrate a database",
  "Replace an old server",
  "Move documents/files",
  "Replace Microsoft Access",
  "Consolidate spreadsheets",
  "Integrate two systems",
  "Improve a manual workflow",
  "Add automation",
  "Explore AI",
  "Request a systems assessment",
  "Not sure",
];
const currentSystems = [
  "SQL Server",
  "Microsoft Access",
  "Excel",
  "Old Windows application",
  "File server",
  "SharePoint",
  "Vendor application",
  "QuickBooks",
  "ERP",
  "CRM",
  "Unknown",
  "Other",
];
const industries = [
  "Law / professional services",
  "Accounting / CPA",
  "Manufacturing / machine shop",
  "Wholesale / distribution",
  "Contracting / construction",
  "HVAC / plumbing / electrical / roofing",
  "Property management",
  "Dental / veterinary / medical practice",
  "Print / sign business",
  "Automotive",
  "Other established business",
];

export default function MigrationIntake() {
  const [platformChoice, setPlatformChoice] = useState("");
  const [goal, setGoal] = useState("");
  const [assessment, setAssessment] = useState<string | null>(null);

  useEffect(() => {
    // Read only in the browser after hydration. Storage is optional; contact is not.
    const frame = requestAnimationFrame(() => {
      if (
        new URLSearchParams(window.location.search).get("intent") ===
        "assessment"
      )
        setGoal("Request a systems assessment");
      try {
        const answers = parseReadinessHandoff(
          window.sessionStorage.getItem(READINESS_STORAGE_KEY),
        );
        if (answers) setAssessment(readinessSummary(answers));
        else window.sessionStorage.removeItem(READINESS_STORAGE_KEY);
      } catch {
        // Privacy modes can disable storage. The ordinary inquiry remains usable.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function clearAssessment() {
    setAssessment(null);
    try {
      window.sessionStorage.removeItem(READINESS_STORAGE_KEY);
    } catch {
      /* Storage is optional. */
    }
  }

  return (
    <InquiryForm
      source="Netherwood migration intake"
      submitLabel="Send migration inquiry"
      onSuccess={() => {
        setPlatformChoice("");
        setGoal("");
        clearAssessment();
      }}
    >
      {assessment && (
        <section
          className="migration-attached-assessment"
          aria-labelledby="attached-assessment-title"
        >
          <h2 id="attached-assessment-title">
            Your readiness self-check is attached
          </h2>
          <p>
            These answers will be sent only when you submit this inquiry. Review
            them below, or remove them.
          </p>
          <details>
            <summary>Review the assessment</summary>
            <pre>{assessment}</pre>
          </details>
          <input type="hidden" name="readiness_assessment" value={assessment} />
          <button
            className="migration-inline-button"
            type="button"
            onClick={clearAssessment}
          >
            Remove assessment from inquiry
          </button>
        </section>
      )}
      <fieldset className="migration-intake-section">
        <legend>
          <span>01</span> A little about your business
        </legend>
        <p>
          Only your name, business and email are required. Share what you know
          and leave the rest blank.
        </p>
        <div className="contact-form-grid">
          <div className="contact-field">
            <label htmlFor="migration-name">
              Name <span>(required)</span>
            </label>
            <input
              id="migration-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={120}
            />
          </div>
          <div className="contact-field">
            <label htmlFor="migration-business">
              Business <span>(required)</span>
            </label>
            <input
              id="migration-business"
              name="company"
              type="text"
              autoComplete="organization"
              required
              maxLength={160}
            />
          </div>
          <div className="contact-field">
            <label htmlFor="migration-email">
              Email <span>(required)</span>
            </label>
            <input
              id="migration-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </div>
          <div className="contact-field">
            <label htmlFor="migration-phone">
              Phone <span>(optional)</span>
            </label>
            <input
              id="migration-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={50}
            />
          </div>
          <div className="contact-field">
            <label htmlFor="migration-location">
              City and state <span>(optional)</span>
            </label>
            <input
              id="migration-location"
              name="location"
              type="text"
              maxLength={160}
            />
          </div>
          <div className="contact-field">
            <label htmlFor="migration-industry">
              Industry <span>(optional)</span>
            </label>
            <select id="migration-industry" name="industry" defaultValue="">
              <option value="">Choose if useful</option>
              {industries.map((industry) => (
                <option key={industry}>{industry}</option>
              ))}
            </select>
          </div>
          <div className="contact-field">
            <label htmlFor="migration-size">
              Company size <span>(optional)</span>
            </label>
            <select id="migration-size" name="company_size" defaultValue="">
              <option value="">Choose if useful</option>
              {[
                "1–4 people",
                "5–20 people",
                "21–50 people",
                "51–150 people",
                "More than 150 people",
                "Not sure",
              ].map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="migration-intake-section">
        <legend>
          <span>02</span> What are you trying to change?
        </legend>
        <div className="contact-field">
          <label htmlFor="migration-goal">
            What are you trying to accomplish? <span>(optional)</span>
          </label>
          <select
            id="migration-goal"
            name="goal"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          >
            <option value="">Choose the closest match</option>
            {goals.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="contact-field">
          <label htmlFor="migration-description">
            Tell us about the move <span>(optional)</span>
          </label>
          <textarea
            id="migration-description"
            name="project_description"
            rows={4}
            maxLength={4000}
            aria-describedby="migration-data-warning"
          />
          <p id="migration-data-warning" className="contact-field-hint">
            A brief description is enough. Please leave out passwords, financial
            account details and private customer, client or patient records.
            There is no need to upload business data.
          </p>
        </div>
        <div className="contact-form-grid">
          <div className="contact-field">
            <label htmlFor="migration-platform-choice">
              Do you know which new platform you want? <span>(optional)</span>
            </label>
            <select
              id="migration-platform-choice"
              name="replacement_selected"
              value={platformChoice}
              onChange={(event) => setPlatformChoice(event.target.value)}
            >
              <option value="">Choose if useful</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Evaluating options">Evaluating options</option>
            </select>
          </div>
          {(platformChoice === "Yes" ||
            platformChoice === "Evaluating options") && (
            <div className="contact-field">
              <label htmlFor="migration-platform">
                Which platform
                {platformChoice === "Evaluating options"
                  ? "s are you considering"
                  : " have you selected"}
                ? <span>(optional)</span>
              </label>
              <input
                id="migration-platform"
                name="replacement_platform"
                maxLength={240}
                type="text"
              />
            </div>
          )}
        </div>
        <p className="contact-field-hint">
          Your platform. Your data. Your choice. We work with your chosen
          software provider to understand what the migration needs.
        </p>
      </fieldset>

      <fieldset className="migration-intake-section">
        <legend>
          <span>03</span> What are you using today?
        </legend>
        <p>
          Not sure what’s running underneath your software? That’s fine. That’s
          part of what we figure out.
        </p>
        <div className="contact-field">
          <label htmlFor="migration-current">
            Software names, spreadsheets or systems <span>(optional)</span>
          </label>
          <textarea
            id="migration-current"
            name="current_environment"
            rows={3}
            maxLength={2000}
          />
        </div>
        <fieldset className="migration-system-choices">
          <legend>
            Any of these sound familiar? <span>(optional; choose any)</span>
          </legend>
          <div>
            {currentSystems.map((system) => (
              <label key={system}>
                <input
                  type="checkbox"
                  name={`uses_${system.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_")}`}
                  value={system}
                />
                {system}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="contact-field">
          <label htmlFor="migration-history">
            How much history might need to move? <span>(optional)</span>
          </label>
          <select id="migration-history" name="history" defaultValue="">
            <option value="">Choose if useful</option>
            {[
              "Less than 1 year",
              "1 to 5 years",
              "5 to 10 years",
              "10+ years",
              "Not sure",
            ].map((history) => (
              <option key={history}>{history}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="migration-intake-section">
        <legend>
          <span>04</span> What matters most?
        </legend>
        <div className="contact-field">
          <label htmlFor="migration-worries">
            What worries you most about the migration? <span>(optional)</span>
          </label>
          <textarea
            id="migration-worries"
            name="migration_concerns"
            rows={3}
            maxLength={2000}
          />
        </div>
        <div className="contact-field">
          <label htmlFor="migration-staff">
            What does your staff dislike about the existing system?{" "}
            <span>(optional)</span>
          </label>
          <textarea
            id="migration-staff"
            name="staff_challenges"
            rows={3}
            maxLength={2000}
          />
        </div>
        <div className="contact-field">
          <label htmlFor="migration-deadline">
            Is there a deadline? <span>(optional)</span>
          </label>
          <input
            id="migration-deadline"
            name="deadline"
            type="text"
            maxLength={240}
            aria-describedby="migration-deadline-hint"
          />
          <p id="migration-deadline-hint" className="contact-field-hint">
            A date, a vendor renewal or “just exploring” are all useful answers.
          </p>
        </div>
      </fieldset>
    </InquiryForm>
  );
}
