"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";

const FORMSPARK_ACTION_URL = "https://submit-form.com/5bzGZaPs6";
const SUBMISSION_TIMEOUT_MS = 15_000;

type SubmissionState = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const submissionInFlight = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (typeof window.fetch !== "function") return;

    event.preventDefault();

    if (submissionInFlight.current) return;
    submissionInFlight.current = true;

    const form = event.currentTarget;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), SUBMISSION_TIMEOUT_MS);

    setSubmissionState("submitting");

    try {
      const formData = new FormData(form);
      const response = await fetch(FORMSPARK_ACTION_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Formspark returned ${response.status}`);
      }

      form.reset();
      setSubmissionState("success");
    } catch {
      setSubmissionState("error");
    } finally {
      window.clearTimeout(timeout);
      submissionInFlight.current = false;
    }
  }

  const isSubmitting = submissionState === "submitting";

  return (
    <form
      action={FORMSPARK_ACTION_URL}
      className="contact-form"
      method="POST"
      onSubmit={handleSubmit}
    >
      <div className="contact-form-grid">
        <div className="contact-field">
          <label htmlFor="contact-name">Name</label>
          <input
            autoComplete="name"
            id="contact-name"
            maxLength={120}
            name="name"
            required
            type="text"
          />
        </div>

        <div className="contact-field">
          <label htmlFor="contact-email">Email</label>
          <input
            autoComplete="email"
            id="contact-email"
            maxLength={254}
            name="email"
            required
            type="email"
          />
        </div>

        <div className="contact-field">
          <label htmlFor="contact-company">Company <span>(optional)</span></label>
          <input
            autoComplete="organization"
            id="contact-company"
            maxLength={160}
            name="company"
            type="text"
          />
        </div>

        <div className="contact-field">
          <label htmlFor="contact-service">What can we help with?</label>
          <select defaultValue="" id="contact-service" name="service">
            <option value="">Choose one (optional)</option>
            <option value="Performance triage">Performance triage</option>
            <option value="Database health review">Database health review</option>
            <option value="Migration or upgrade">Migration or upgrade</option>
            <option value="Ongoing DBA support">Ongoing DBA support</option>
            <option value="Reporting or data engineering">Reporting or data engineering</option>
            <option value="Something else">Something else</option>
          </select>
        </div>
      </div>

      <div className="contact-field">
        <label htmlFor="contact-message">How can we help?</label>
        <textarea
          aria-describedby="contact-message-hint"
          id="contact-message"
          maxLength={4000}
          minLength={20}
          name="message"
          required
          rows={6}
        />
        <p className="contact-field-hint" id="contact-message-hint">
          Include the platform, symptoms or project, urgency, and approximate environment size if known.
        </p>
      </div>

      <input name="source" type="hidden" value="Netherwood Data Partners website" />
      <input
        aria-hidden="true"
        autoComplete="off"
        className="contact-honeypot"
        name="_honeypot"
        tabIndex={-1}
        type="checkbox"
      />

      <div className="contact-form-actions">
        <button className="button button-light" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Sending…" : "Send inquiry"}
        </button>
        <p className="contact-privacy">Your details are used only to respond to this inquiry.</p>
      </div>

      <div
        aria-live={submissionState === "error" ? "assertive" : "polite"}
        className={`contact-form-status contact-form-status--${submissionState}`}
        role={submissionState === "error" ? "alert" : "status"}
      >
        {submissionState === "success" && (
          <p>Thank you. Your message has been sent, and we will get back to you soon.</p>
        )}
        {submissionState === "error" && (
          <p>
            We could not send your message. Please try again or email us at{" "}
            <a href="mailto:contact@netherwooddatapartners.com">contact@netherwooddatapartners.com</a>.
          </p>
        )}
      </div>
    </form>
  );
}
