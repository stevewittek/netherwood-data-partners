import type { Metadata } from "next";
import MigrationIntake from "../components/MigrationIntake";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import "../migration-tools.css";

export const metadata: Metadata = {
  title: "Talk About Your Data Migration | Netherwood Data Partners",
  description:
    "Tell Netherwood what you are using, what you want to replace and what worries you. An approachable migration inquiry for small and midsize businesses.",
  alternates: { canonical: "/migration-intake/" },
  openGraph: {
    title: "Talk About Your Data Migration | Netherwood Data Partners",
    description:
      "You do not need to know what database you have. Tell us what you are trying to replace.",
    url: "/migration-intake/",
  },
  twitter: {
    title: "Talk About Your Data Migration | Netherwood Data Partners",
    description:
      "You do not need to know what database you have. Tell us what you are trying to replace.",
  },
};

export default function MigrationIntakePage() {
  return (
    <main className="migration-tool-page">
      <SiteHeader currentPage="contact" />
      <section className="migration-tool-hero studio-wrap">
        <p className="eyebrow">Talk about your migration</p>
        <h1>You don’t need to know what database you have.</h1>
        <p>
          Tell us what you use today, what you are trying to move to and what is
          getting in the way. We will help determine the rest.
        </p>
      </section>
      <div className="migration-intake-layout studio-wrap">
        <aside className="migration-intake-aside">
          <h2>A useful place to start.</h2>
          <p>
            Already bought the new software? Still working out how to replace
            the old system? Either is a good reason to talk.
          </p>
          <p>
            Netherwood reviews your inquiry and follows up to discuss the
            situation. Assessment and migration work are scoped as professional
            services; submitting this form does not start a paid engagement.
          </p>
          <p>
            Based in New Jersey, with an initial focus on Union, Somerset and
            Middlesex counties. Remote US projects are considered where
            practical.
          </p>
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
