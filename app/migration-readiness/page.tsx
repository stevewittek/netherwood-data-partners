import type { Metadata } from "next";
import MigrationReadiness from "../components/MigrationReadiness";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import "../migration-tools.css";

export const metadata: Metadata = {
  title: "Is Your Business Ready to Replace Its Old Software? | Netherwood",
  description:
    "A free migration readiness self-check for established businesses. Understand data, documents, vendor imports and recovery planning. No email required for results.",
  alternates: { canonical: "/migration-readiness/" },
  openGraph: {
    title: "Is Your Business Ready to Replace Its Old Software?",
    description:
      "A practical migration readiness self-check. Get your result without sharing contact details.",
    url: "/migration-readiness/",
  },
  twitter: {
    title: "Is Your Business Ready to Replace Its Old Software?",
    description:
      "A practical migration readiness self-check. Get your result without sharing contact details.",
  },
};

export default function MigrationReadinessPage() {
  return (
    <main className="migration-tool-page">
      <SiteHeader currentPage="readiness" />
      <section className="migration-tool-hero studio-wrap">
        <p className="eyebrow">Free migration readiness self-check</p>
        <h1>Is your business ready to replace its old software?</h1>
        <p>
          Fourteen plain-language questions to help you see what to investigate
          before moving your business data. You do not need to know what
          database runs underneath your software.
        </p>
        <p className="migration-small-print">
          See the full result without providing a name or email. This guide does
          not inspect your systems or replace a technical assessment.
        </p>
      </section>
      <section
        className="migration-tool-body studio-wrap"
        aria-label="Migration readiness questions and results"
      >
        <MigrationReadiness />
        <noscript>
          <p>
            The interactive self-check needs JavaScript. You can still{" "}
            <a href="/migration-intake/">describe your migration</a> or email{" "}
            <a href="mailto:contact@netherwooddatapartners.com">
              contact@netherwooddatapartners.com
            </a>
            .
          </p>
        </noscript>
      </section>
      <SiteFooter />
    </main>
  );
}
