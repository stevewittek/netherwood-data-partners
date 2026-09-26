import ChatWidget from "./ChatWidget";
import ContactForm from "./components/ContactForm";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { CommunityPhoto, CommunityRoots } from "./components/Community";
import "./community.css";

const services = [
  {
    number: "01",
    title: "Software & systems support",
    text: "Work through application issues, awkward workarounds and vendor questions. Get a clear next step and hands-on help.",
    link: "/services/software-systems-support/",
    label: "Get your systems working",
    id: "business-systems",
  },
  {
    number: "02",
    title: "Data & database services",
    text: "Make sense of your records, improve SQL Server performance, review recovery plans and build reporting you can use.",
    link: "/services/database-engineering/",
    label: "Look after your data",
    id: "database-services",
  },
  {
    number: "03",
    title: "Connected workflows",
    text: "Help your applications talk to each other. Connect imports, reports and everyday processes so your staff can spend less time moving information.",
    link: "/services/workflow-automation/",
    label: "Connect the pieces",
  },
  {
    number: "04",
    title: "Migrations & modernization",
    text: "When it is time for something new, understand the old system, prepare the information and plan the move into your chosen platform.",
    link: "/services/data-migration/",
    label: "Plan a better move",
  },
];
const faqs = [
  [
    "Can you help with the software we already use?",
    "Yes. Start with what is getting in the way: application errors, inconsistent records, slow reports or a workflow that keeps breaking. We review the system and agree what Netherwood can take on, what belongs with your software vendor and what needs another specialist.",
  ],
  [
    "Do we have to replace our systems?",
    "No. The useful answer may be a repair, a cleaner process, an integration or a better report. Migration is one option when the existing system no longer fits.",
  ],
  [
    "Who will we work with?",
    "You work directly with Steven Wittek, Netherwood’s founder and database engineer. The scope, fees and any ongoing support are agreed before work begins. Additional specialties can be discussed when a project needs them.",
  ],
  [
    "Do you offer ongoing support?",
    "Yes, on an agreed scope. That can include database support, application troubleshooting, reporting or help after a system change. Availability, responsibilities and response expectations are set together.",
  ],
];

export default function Home() {
  return (
    <main className="studio-home community-home">
      <SiteHeader />
      <section className="community-hero" id="top">
        <div className="community-hero-copy">
          <p className="eyebrow">
            <span className="location-dot" />
            Rooted in Netherwood. Here for your business.
          </p>
          <h1>
            Established business.
            <br />
            <span>Better systems.</span>
          </h1>
          <p className="community-lede">
            Your business has moved forward. Has your software?
          </p>
          <p className="community-hero-body">
            Green-screen terminals. Paper work orders. The same information
            entered twice. Get hands-on help supporting older systems, moving
            your data and connecting the next generation of software.
          </p>
          <div className="studio-actions">
            <a className="button button-primary" href="#contact">
              Let’s talk about your business <span aria-hidden="true">↗</span>
            </a>
            <a className="studio-text-link" href="#services">
              See how we can help <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="community-signoff">
            <span className="community-monogram" aria-hidden="true">
              SW
            </span>
            <p>
              Work directly with Steven Wittek.
              <br />
              <strong>Your local database & systems specialist.</strong>
            </p>
          </div>
        </div>
        <div className="community-hero-visual">
          <CommunityPhoto
            name="warehouse-systems"
            alt="Illustrative warehouse dispatch desk with a green-screen inventory terminal, dot-matrix printer and modern inventory tablet"
            priority
          />
          <div className="community-photo-label">
            <span aria-hidden="true">↗</span>
            <p>
              Warehouses & distribution
              <br />
              <strong>From pick lists to connected inventory.</strong>
            </p>
          </div>
          <span className="community-scene-note">
            AI-generated systems concept
          </span>
        </div>
      </section>
      <div className="community-signal-strip">
        <div className="studio-wrap">
          <span>Small-business care.</span>
          <span>Senior technical experience.</span>
          <span>Software · Data · Support</span>
          <a href="#community">
            Along the Raritan Valley Line <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
      <section
        className="community-section studio-wrap systems-transition"
        aria-labelledby="systems-transition-heading"
      >
        <div className="community-section-heading">
          <div>
            <p className="eyebrow">Recognize the old routine?</p>
            <h2 id="systems-transition-heading">
              Tab. Tab. Enter.
              <br />
              There’s a better next step.
            </h2>
          </div>
          <p>
            Start with the records and processes your business depends on. Clean
            up the data, connect the systems and introduce automation or AI
            assistance where it helps the work.
          </p>
        </div>
        <div className="systems-comparison">
          <div className="systems-legacy">
            <p className="systems-panel-label">01 / The familiar workaround</p>
            <pre aria-label="Illustrative legacy inventory screen">
              {
                "INVENTORY CONTROL\n\nPART NO:  1042\nBIN:      A-07\nON HAND:  0028\n\nF1 HELP   F3 SEARCH\nTAB NEXT  ENTER SAVE\n\n> PRINT PICK LIST_"
              }
            </pre>
            <p>Look up a code. Print a list. Re-enter it in another system.</p>
          </div>
          <div className="systems-modern">
            <p className="systems-panel-label">02 / A possible next workflow</p>
            <h3>
              Ask a question.
              <br />
              Work from connected records.
            </h3>
            <div className="systems-prompt">
              “Where is part 1042, and is there enough for this order?”
            </div>
            <p className="systems-answer">
              <strong>Illustrative assistant response</strong>
              <br />
              “Bin A-07 shows 28 on hand. Which order should I check?”
            </p>
            <p>
              Find the source record, check the answer and let a person approve
              the next action.
            </p>
          </div>
        </div>
        <p className="community-image-note">
          Example workflow with fictional data, not a live product or a
          completed client project. The right solution depends on your software,
          access controls and business process.
        </p>
      </section>
      <section className="community-section studio-wrap" id="services">
        <div className="community-section-heading">
          <div>
            <p className="eyebrow">A specialist in your corner</p>
            <h2>
              You know your business.
              <br />
              We get into the technology.
            </h2>
          </div>
          <p>
            Keep what works. Fix what gets in the way. Bring the pieces
            together—with clear explanations and a practical plan.
          </p>
        </div>
        <div className="community-services">
          {services.map((service) => (
            <article key={service.number} id={service.id}>
              <span className="community-service-number">
                {service.number}
                <span aria-hidden="true">↗</span>
              </span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <a href={service.link}>
                {service.label} <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="community-people-band" id="when-to-call-us">
        <div className="studio-wrap community-section">
          <div className="community-section-heading">
            <div>
              <p className="eyebrow">Built around the work you do</p>
              <h2>
                The shop floor.
                <br />
                The front office.
                <br />
                <span>The systems behind them.</span>
              </h2>
            </div>
            <p>
              Established manufacturers, distributors and medical practices
              carry years of records and routines. Modernization starts by
              understanding what must keep working.
            </p>
          </div>
          <div className="community-stories">
            <article>
              <CommunityPhoto
                name="manufacturing-systems"
                alt="Illustrative machine shop with an older work-order terminal and paper job travelers beside a modern shop-floor display"
              />
              <div>
                <p className="eyebrow">Manufacturing & production</p>
                <h3>From paper travelers to connected work orders.</h3>
                <p>
                  Job history in one system. Parts in another. Printed
                  instructions on the floor. Bring the records together, plan
                  the move and help staff use the new workflow.
                </p>
                <a
                  className="studio-text-link"
                  href="/services/workflow-automation/"
                >
                  Make everyday work easier <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
            <article>
              <CommunityPhoto
                name="medical-office-systems"
                alt="Illustrative medical reception with an older scheduling terminal, corded phone and paper appointment book beside modern administrative software"
              />
              <div>
                <p className="eyebrow">Medical offices & practices</p>
                <h3>From phone tag to an organized front office.</h3>
                <p>
                  Aging scheduling software, paper reminders and repeated entry.
                  Assess the administrative workflow, prepare records for your
                  chosen platform and explore reminders or assisted call routing
                  with your vendors.
                </p>
                <a
                  className="studio-text-link"
                  href="/services/software-systems-support/"
                >
                  Talk through the problem <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          </div>
          <p className="community-image-note">
            AI-generated industry concepts show possible old and new workflows,
            not actual client sites, product screenshots or guaranteed results.
          </p>
        </div>
      </section>
      <section
        className="community-section studio-wrap community-working"
        id="approach"
      >
        <div>
          <p className="eyebrow">A personal way of working</p>
          <h2>
            Start with a conversation.
            <br />
            Leave with a next step.
          </h2>
          <p>
            Explain it in your own words. You don’t need to know what database
            is underneath—or arrive with a technical brief.
          </p>
          <a className="studio-text-link" href="#contact">
            Tell Steven what’s happening <span aria-hidden="true">↗</span>
          </a>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Understand the business.</h3>
              <p>
                Listen to your people, look at the system and find where things
                are getting stuck.
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Agree on useful work.</h3>
              <p>
                A focused fix, a systems assessment, a project or ongoing
                support. Scope and fees come first.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Do the work. Explain the result.</h3>
              <p>
                Check it with you, document the important details and agree what
                support comes next.
              </p>
            </div>
          </li>
        </ol>
      </section>
      <CommunityRoots />
      <section
        className="community-section studio-wrap community-founder"
        id="about"
      >
        <div className="community-founder-card">
          <p className="eyebrow">The person behind Netherwood</p>
          <span className="community-founder-initials" aria-hidden="true">
            SW<span>↗</span>
          </span>
          <h3>Steven Wittek</h3>
          <p>
            Founder · Database engineer
            <br />
            New Jersey local · Family person
          </p>
          <a className="studio-text-link" href="/about/">
            Meet Steven <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div>
          <p className="eyebrow">Local roots. Serious technical depth.</p>
          <h2>
            A small shop.
            <br />A lot of care for
            <br />
            what keeps you going.
          </h2>
          <p>
            Netherwood is an independent, founder-led consultancy. You work
            directly with Steven, whose technology experience since 2009
            includes production databases, reporting, recovery, integrations and
            system changes.
          </p>
          <p>
            That experience belongs here, too—in the businesses, offices and
            workshops around us.
          </p>
          <div className="community-expertise">
            <span>SQL Server & Azure SQL</span>
            <span>Business applications</span>
            <span>Data & reporting</span>
            <span>Integration & recovery</span>
          </div>
          <a
            className="studio-text-link"
            href="/about/#professional-experience"
          >
            Explore Steven’s professional experience{" "}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
      <section className="community-assessment" id="engagements">
        <div className="studio-wrap">
          <div>
            <p className="eyebrow">When it’s time for a bigger change</p>
            <h2>Let’s work out what comes next.</h2>
            <p>
              A systems assessment gives you a clearer view of your software,
              data, dependencies and options. And when you’re ready to move,
              migration is one of our specialties.
            </p>
          </div>
          <div>
            <a
              className="button button-primary"
              href="/services/legacy-systems-assessment/"
            >
              Explore a systems assessment <span aria-hidden="true">↗</span>
            </a>
            <a className="studio-text-link" href="/migration-readiness/">
              Try the migration readiness check{" "}
              <span aria-hidden="true">↗</span>
            </a>
            <a className="studio-text-link" href="/migration-intake/">
              Tell us about a planned move <span aria-hidden="true">↗</span>
            </a>
          </div>
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
          <p className="eyebrow">Field notes</p>
          <h2>Useful thinking, shared openly.</h2>
          <p>
            Practical articles on databases, performance, recovery and the
            systems behind everyday business.
          </p>
        </div>
        <a className="studio-text-link" href="/articles/">
          Read the field notes <span aria-hidden="true">↗</span>
        </a>
      </section>
      <section
        className="contact studio-contact community-contact"
        id="contact"
      >
        <div>
          <p className="eyebrow">Your neighborhood technology conversation</p>
          <h2>
            Tell us what’s
            <br />
            <span>getting in the way.</span>
          </h2>
          <p className="studio-contact-intro">
            A software question. A report that doesn’t add up. A system you’ve
            outgrown. Start with what’s happening, and we’ll work out a useful
            next step.
          </p>
          <div className="studio-contact-details">
            <span>
              New Jersey · Tri-State · Remote projects where practical
            </span>
            <span>Work directly with Steven · Meetings by appointment</span>
            <a href="mailto:contact@netherwooddatapartners.com">
              contact@netherwooddatapartners.com
            </a>
          </div>
        </div>
        <div className="contact-copy">
          <p>A few details are all you need to start.</p>
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
