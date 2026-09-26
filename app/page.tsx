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
            Good people.
            <br />
            <span>Better systems.</span>
          </h1>
          <p className="community-lede">
            Personal help with the software, data and systems your business runs
            on.
          </p>
          <p className="community-hero-body">
            From a stubborn application to a bigger change, get practical
            technical help from someone who takes the time to understand your
            work.
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
            name="business-collaboration"
            alt="Illustrative scene of business owners and a software specialist reviewing a laptop together"
            priority
          />
          <div className="community-photo-label">
            <span aria-hidden="true">↗</span>
            <p>
              Technology is personal.
              <br />
              <strong>So is the way we work.</strong>
            </p>
          </div>
          <span className="community-scene-note">
            AI-generated illustrative business scene
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
              <p className="eyebrow">
                For the businesses that make a neighborhood
              </p>
              <h2>
                Your people.
                <br />
                Your day-to-day.
                <br />
                <span>That’s the starting point.</span>
              </h2>
            </div>
            <p>
              The front office, the shop floor, the practice down the street.
              Different businesses, with software and information that need to
              work together.
            </p>
          </div>
          <div className="community-stories">
            <article>
              <CommunityPhoto
                name="local-business-handshake"
                alt="Illustrative scene of two business people smiling and shaking hands in a neighborhood workshop office"
              />
              <div>
                <p className="eyebrow">
                  Manufacturers, trades & family businesses
                </p>
                <h3>Less time fighting the system.</h3>
                <p>
                  Customer records, job history, inventory and invoices. Help
                  the office and the operation stay connected.
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
                name="software-support"
                alt="Illustrative scene of a practice manager and technology consultant working through an application together"
              />
              <div>
                <p className="eyebrow">Professional firms & practices</p>
                <h3>Someone to work through it with you.</h3>
                <p>
                  Application questions, reporting problems and information
                  scattered across systems. Start with the work your people need
                  to do.
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
            AI-generated scenes illustrate the kinds of businesses we support;
            the people shown are not actual clients or Netherwood staff.
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
