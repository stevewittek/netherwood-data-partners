import ChatWidget from "./ChatWidget";
import ContactForm from "./components/ContactForm";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import {
  MigrationDiagram,
  MigrationProcess,
} from "./components/MigrationDiagram";
import "./migration.css";

const services = [
  [
    "data-migration",
    "Data migration",
    "Extract, clean, map and move business records and documents. Test the imports and reconcile the result.",
  ],
  [
    "legacy-application-modernization",
    "Legacy application modernization",
    "Understand an Access database, SQL Server application, old Windows program or spreadsheet workflow. Decide what to repair, replace or retire.",
  ],
  [
    "business-software-migration",
    "Business software migration",
    "Already chose your new system? Get technical help with the old data, the vendor’s import process and the move into the new platform.",
  ],
  [
    "legacy-systems-assessment",
    "Legacy systems & migration assessment",
    "Find the data, dependencies and risks before committing to a move. Start with a scoped assessment and a practical roadmap.",
  ],
  [
    "database-engineering",
    "Database engineering",
    "Hands-on SQL Server performance, upgrades, design, backup and recovery, availability, ETL and reporting.",
  ],
  [
    "workflow-automation",
    "Workflow automation",
    "Connect applications, automate imports and reports, and help staff stop entering the same information twice.",
  ],
  [
    "practical-ai",
    "Practical AI",
    "Organize the business first. Then explore useful document extraction, knowledge search and workflow assistance.",
  ],
];
const scenarios = [
  "You’ve chosen new software, but years of information are trapped in the old system.",
  "Your Access database is mission-critical, and the person who built it has retired.",
  "Your vendor is discontinuing an application your staff still relies on.",
  "Your new vendor supplied a CSV template, but your information doesn’t match it.",
  "Customers, jobs, invoices and documents are scattered across databases and shared folders.",
  "You’re not sure what will break when you shut down the old server.",
  "Historical records are inconsistent, duplicated or hard to find.",
  "Your staff enters the same information in more than one system.",
];
const industries = [
  [
    "Professional firms",
    "Law firms, accountants and CPA firms moving client, matter, financial and document history.",
  ],
  [
    "Manufacturing & distribution",
    "Manufacturers, machine shops and wholesalers moving operational, inventory and order data into a new ERP or business system.",
  ],
  [
    "Contractors & field services",
    "Construction, roofing, HVAC, plumbing and electrical businesses moving customer, job and service history.",
  ],
  [
    "Practices & established businesses",
    "Dental, veterinary and private medical practices, property managers, print shops, automotive and family businesses replacing systems they’ve outgrown.",
  ],
];
const faqs = [
  [
    "Do we need to choose the new software first?",
    "No. An assessment can help identify the technical requirements a replacement must meet. If you have already chosen a platform, Netherwood can work with that provider to understand its import capabilities and plan the migration.",
  ],
  [
    "Do you sell the replacement software?",
    "Netherwood’s work is professional consulting and project delivery. Your software provider supplies the platform. You choose the product; Netherwood handles the migration and integration work around it. No proprietary replacement platform is required.",
  ],
  [
    "Can everything in the old system be moved?",
    "That depends on access to the old data, its quality and what the new system can accept. Discovery identifies what can migrate, what needs transformation and what may be better retained in a searchable archive. Those limits are agreed before cutover.",
  ],
  [
    "How do you know the migration worked?",
    "We agree acceptance checks with you: counts, totals, relationships, documents and real business tasks. Trial imports help uncover problems. Validation and reconciliation happen before approval to switch, with checks repeated after cutover.",
  ],
  [
    "Do you still offer SQL Server and DBA services?",
    "Yes. Database engineering is the foundation of the migration work. SQL Server troubleshooting, performance tuning, health checks, upgrades, recovery planning, reporting and scoped ongoing support remain available.",
  ],
  [
    "Where do you work, and how are projects priced?",
    "Netherwood is based in New Jersey, with a focus on Union, Somerset and Middlesex counties and the wider New Jersey, New York City and Tri-State region. Remote US projects are considered where practical. Scope and professional-services fees are agreed before paid work begins; ongoing support is optional and separately scoped.",
  ],
];

export default function Home() {
  return (
    <main className="studio-home migration-home">
      <SiteHeader />
      <section className="studio-hero studio-wrap migration-hero" id="top">
        <div className="studio-hero-copy">
          <p className="eyebrow">
            Small business data migration & systems modernization
          </p>
          <h1>
            Ready for better software?
            <br />
            <span>Don’t leave your data behind.</span>
          </h1>
          <p className="studio-lede">
            Your business chose the new system. We help you get there.
          </p>
          <p className="migration-hero-body">
            Move years of customer, operational and financial data from aging
            applications, databases, spreadsheets and servers into the modern
            platform you choose.
          </p>
          <div className="studio-actions">
            <a className="button button-primary" href="/migration-intake/">
              Talk about your migration <span aria-hidden="true">↗</span>
            </a>
            <a
              className="studio-text-link"
              href="/migration-intake/?intent=assessment"
            >
              Request a systems assessment <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="studio-hero-note">
            Database engineering at the core. Work directly with founder Steven
            Wittek.
          </p>
        </div>
        <MigrationDiagram />
      </section>
      <div
        className="studio-capabilities"
        role="group"
        aria-label="Core capabilities"
      >
        <div className="studio-wrap">
          <span>Understand the old system</span>
          <i aria-hidden="true">→</i>
          <span>Prepare the data</span>
          <i aria-hidden="true">→</i>
          <span>Prove the migration</span>
          <i aria-hidden="true">→</i>
          <span>Move with a plan</span>
        </div>
      </div>
      <section className="studio-section studio-wrap" id="business-systems">
        <div className="studio-section-heading">
          <p className="eyebrow">01 / The gap between old and new</p>
          <h2>
            The new software isn’t the hardest part.
            <br />
            Your old data is.
          </h2>
          <p>
            A software demo shows what’s possible. Getting ten or twenty years
            of business information into that system takes a different kind of
            work. That’s where Netherwood comes in.
          </p>
        </div>
        <div className="migration-boundary">
          <article>
            <span className="studio-kicker">Your business</span>
            <h3>You know the work.</h3>
            <p>
              You decide which records matter, how your team operates and what a
              successful move looks like.
            </p>
          </article>
          <article className="migration-boundary-center">
            <span className="studio-kicker">Netherwood</span>
            <h3>We handle the move.</h3>
            <p>
              Find, extract and prepare the data. Work through the vendor’s
              import requirements. Test, reconcile and document the result.
            </p>
          </article>
          <article>
            <span className="studio-kicker">Your software provider</span>
            <h3>They provide the platform.</h3>
            <p>
              Your chosen provider brings the new product and its capabilities.
              We work with them on the technical migration.
            </p>
          </article>
        </div>
        <p className="migration-choice">
          Your platform. Your data. Your choice.
        </p>
      </section>
      <section className="studio-scenarios-band" id="when-to-call-us">
        <div className="studio-section studio-wrap">
          <div className="studio-section-heading">
            <p className="eyebrow">02 / You may need us if…</p>
            <h2>
              Ready to move.
              <br />
              Not sure how.
            </h2>
            <p>
              You don’t need a technical project brief. If one of these sounds
              familiar, there’s a useful place to start.
            </p>
          </div>
          <ul className="migration-scenarios">
            {scenarios.map((scenario, index) => (
              <li key={scenario}>
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{scenario}</p>
              </li>
            ))}
          </ul>
          <a className="studio-text-link" href="/migration-readiness/">
            Check your migration readiness <span aria-hidden="true">↗</span>
          </a>
          <p className="migration-small-note">
            A practical starting point. No contact details required to see your
            result.
          </p>
        </div>
      </section>
      <section className="studio-section studio-wrap" id="services">
        <div className="studio-section-heading">
          <p className="eyebrow">
            03 / Professional migration & modernization services
          </p>
          <h2>
            From inherited systems
            <br />
            to a workable next step.
          </h2>
          <p>
            A focused assessment, a migration project or a defined piece of
            engineering. Get the expertise your project needs without building
            an in-house specialist team.
          </p>
        </div>
        <div className="migration-service-list">
          {services.map(([slug, title, body], index) => (
            <article
              key={slug}
              id={
                slug === "database-engineering"
                  ? "database-services"
                  : undefined
              }
            >
              <span className="migration-row-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>
                <a href={`/services/${slug}/`}>
                  {title}
                  <span aria-hidden="true">↗</span>
                </a>
              </h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="migration-process-band" id="approach">
        <div className="studio-section studio-wrap">
          <div className="studio-section-heading">
            <p className="eyebrow">04 / A migration you can account for</p>
            <h2>
              Know what moves.
              <br />
              Know how to check it.
            </h2>
            <p>
              Make the path visible. Agree what moves, prove the imports and
              know how to recover before switching the business over.
            </p>
          </div>
          <MigrationProcess />
          <p className="migration-process-note">
            Trial runs repeat the test, migrate and validate steps. Production
            cutover follows agreed acceptance checks, a backup and rollback
            plan, and your go-ahead. Critical checks repeat after the switch.
          </p>
        </div>
      </section>
      <section className="studio-engagement-band" id="engagements">
        <div className="studio-wrap studio-engagement">
          <p className="eyebrow">A practical first engagement</p>
          <h2>
            Know what you have.
            <br />
            Know what comes next.
          </h2>
          <p>
            A legacy systems & migration assessment maps your applications,
            databases, documents and dependencies. Get data-quality
            observations, risk areas, migration options and a preliminary plan.
            Agree the scope and fee before work begins.
          </p>
          <a
            className="studio-text-link"
            href="/services/legacy-systems-assessment/"
          >
            Explore the assessment <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
      <section
        className="studio-section studio-wrap migration-foundation"
        id="about"
      >
        <div>
          <p className="eyebrow">05 / The engineering underneath</p>
          <h2>
            Data migration is
            <br />
            database engineering.
          </h2>
          <p className="studio-body">
            Customer records have relationships. Invoices have totals. Documents
            have owners. Moving files is only part of the job; preserving what
            those records mean is what makes the new system useful.
          </p>
          <p className="studio-body">
            Steven Wittek’s background in demanding production database
            environments brings that discipline to your project: understand the
            schema, preserve relationships, reconcile results and plan the
            recovery path.
          </p>
          <a className="studio-text-link" href="/about/">
            Meet the engineer behind Netherwood{" "}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="migration-technical-panel">
          <p className="studio-kicker">Technical depth. Practical outcomes.</p>
          <dl>
            <div>
              <dt>Understand & extract</dt>
              <dd>
                SQL Server, relational schemas, keys, constraints, stored
                procedures, Access and Excel.
              </dd>
            </div>
            <div>
              <dt>Prepare & connect</dt>
              <dd>
                ETL, bulk loading, CSV, XML, JSON, APIs, field mapping and data
                types.
              </dd>
            </div>
            <div>
              <dt>Prove & protect</dt>
              <dd>
                Record relationships, financial totals, reporting, backup and
                recovery, performance and rollback planning.
              </dd>
            </div>
          </dl>
          <p>
            Working with your chosen SaaS provider, Microsoft 365, SharePoint or
            commercial business platform starts with checking its actual import
            and integration options.
          </p>
        </div>
      </section>
      <section className="studio-scenarios-band">
        <div className="studio-section studio-wrap">
          <div className="studio-section-heading">
            <p className="eyebrow">
              06 / Established businesses. Important history.
            </p>
            <h2>
              Your industry is specific.
              <br />
              Your data matters.
            </h2>
            <p>
              For established businesses of around 5–150 employees, and larger
              organizations where the project fits. These are examples of the
              situations we can help with.
            </p>
          </div>
          <div className="migration-industries">
            {industries.map(([title, body]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <p className="migration-region">
            Based in New Jersey, with a focus on Union, Somerset and Middlesex
            counties. Serving Central New Jersey, the wider state, New York City
            and the Tri-State region, with remote US projects where practical.
          </p>
        </div>
      </section>
      <section className="studio-section studio-wrap studio-faq">
        <div>
          <p className="eyebrow">Before we talk</p>
          <h2>A few useful answers.</h2>
        </div>
        <div>
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="studio-insights studio-wrap" id="insights">
        <div>
          <p className="eyebrow">Notes from the work</p>
          <h2>The details behind a better move.</h2>
          <p>
            Practical field notes on databases, recovery, performance and the
            engineering that keeps business information dependable.
          </p>
        </div>
        <a className="studio-text-link" href="/articles/">
          Read articles & field notes <span aria-hidden="true">↗</span>
        </a>
      </section>
      <section className="contact studio-contact" id="contact">
        <div>
          <p className="eyebrow">Tell us what you’re trying to replace</p>
          <h2>
            You don’t need to know
            <br />
            <span>what database you have.</span>
          </h2>
          <p className="studio-contact-intro">
            Tell us what you use today, what you’re trying to move to and what
            isn’t working. We’ll help determine the rest.
          </p>
          <div className="studio-actions">
            <a className="button button-light" href="/migration-intake/">
              Use the guided migration form <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="studio-contact-details">
            <span>New Jersey · Tri-State · Remote US projects</span>
            <span>Work directly with Steven · Meetings by appointment</span>
            <a href="mailto:contact@netherwooddatapartners.com">
              contact@netherwooddatapartners.com
            </a>
          </div>
        </div>
        <div className="contact-copy">
          <p>Have a quick question instead? Start here.</p>
          <ContactForm />
          <p className="contact-email-fallback">
            Prefer email? Write to{" "}
            <a href="mailto:contact@netherwooddatapartners.com">
              contact@netherwooddatapartners.com
            </a>
            .
          </p>
        </div>
      </section>
      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
