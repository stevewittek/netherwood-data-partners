import type { Metadata } from "next";
import { intakeMetadata } from "../content/site";
import MigrationIntake from "../components/MigrationIntake";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import "../migration-tools.css";

export const metadata: Metadata = {
  ...intakeMetadata,
  alternates: { canonical: "/migration-intake/" },
  openGraph: { ...intakeMetadata, url: "/migration-intake/" },
  twitter: { ...intakeMetadata },
};

export default function MigrationIntakePage() {
  return (
    <main className="migration-tool-page">
      <SiteHeader currentPage="contact" />
      <section className="migration-tool-hero studio-wrap">
        <p className="eyebrow">Migration or assessment</p>
        <h1>Describe the project.</h1>
        <p>
          Tell me what you use, what needs to change and what you know so far.
        </p>
      </section>
      <div className="migration-intake-layout studio-wrap">
        <aside className="migration-intake-aside">
          <h2>What happens next.</h2>
          <p>I review your inquiry to discuss scope and availability. Submitting this form does not start a paid engagement.</p>
          <p>New Jersey businesses and remote project inquiries are welcome.</p>
          <a href="/migration-readiness/" className="studio-text-link">
            Try the migration readiness self-check
          </a>
          <p className="migration-email-fallback">
            Prefer email?
            <br />
            <a href="mailto:contact@netherwooddatapartners.com">
              contact@netherwooddatapartners.com
            </a>
          </p>
        </aside>
        <section
          className="migration-intake-form"
          aria-label="Migration inquiry form"
        >
          <MigrationIntake />
          <noscript>
            <p>
              You can use this form’s direct submission or email{" "}
              <a href="mailto:contact@netherwooddatapartners.com">
                contact@netherwooddatapartners.com
              </a>
              . Include your chosen platform in the project description.
            </p>
          </noscript>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
