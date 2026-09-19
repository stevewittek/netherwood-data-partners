import ChatWidget from "./ChatWidget";
import ContactForm from "./components/ContactForm";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { SystemsIllustration } from "./components/SystemsIllustration";

const businessServices = [
  [
    "Software that fits the work",
    "Review the system you have, understand the bottlenecks, and compare practical next steps. Get help coordinating with your software provider.",
  ],
  [
    "A careful move to something new",
    "Plan exports, clean up records, map them to the new system, and test everyday tasks before the switch. Know what transfers and what does not.",
  ],
  [
    "Less copying. Clearer information.",
    "Untangle spreadsheets, reconcile reports, and look for useful ways to connect data or simplify repetitive work.",
  ],
];
const databaseServices = [
  [
    "Fractional DBA support",
    "Experienced database help without building a full-time DBA role. Agree the priorities, responsibilities, support schedule, and escalation path.",
  ],
  [
    "SQL Server performance",
    "Investigate execution plans, waits, blocking, Query Store, indexes, and workload changes. Find the cause before recommending a fix.",
  ],
  [
    "Recovery, migration & safer releases",
    "Review backups and restore readiness, plan upgrades and migrations, and bring more control to database changes and deployment.",
  ],
];
const scenarios = [
  {
    label: "The neighborhood business",
    title: "“Our order system is slowing us down.”",
    body: "A shop, restaurant, or service counter depends on software all day. Start by separating a software, data, or workflow problem from something the vendor needs to address.",
  },
  {
    label: "The next chapter",
    title: "“We’re changing software. What happens to our records?”",
    body: "A dry cleaner moving its tracking system online needs a plan for customer records, open orders, history, and staff training—not just a new login.",
  },
  {
    label: "The technical team",
    title: "“We need database depth, not another full-time hire.”",
    body: "Bring in hands-on SQL Server experience for a performance investigation, a recovery review, a migration, or a defined ongoing DBA engagement.",
  },
];
const steps = [
  [
    "Understand the work",
    "Show me what is happening, who it affects, and what a better day would look like.",
  ],
  [
    "Agree a useful plan",
    "Define the scope, priorities, cost, access, and responsibilities before making changes.",
  ],
  [
    "Make the change carefully",
    "Test important tasks, protect existing data, and plan the fallback before going live.",
  ],
  [
    "Leave you in control",
    "Check the result, document the setup, and agree who owns support from here.",
  ],
];
const questions = [
  [
    "Do I need to know what is wrong before contacting you?",
    "No. Tell me what is slow, confusing, unreliable, or taking too much time. The first step is to understand the problem and decide whether it is a good fit for my work.",
  ],
  [
    "Can you help us move to online software?",
    "Yes, with planning, data preparation, provider coordination, testing, and handover. What can move depends on the old system’s export options and the new provider’s import tools. We check those limits before promising a migration.",
  ],
  [
    "Can you work alongside our IT company or software vendor?",
    "Yes. I can focus on the database, data, or software project while your existing provider keeps responsibility for its services. We agree access, ownership, and the handoff so the work does not fall between people.",
  ],
  [
    "What does fractional DBA mean?",
    "It means a defined portion of experienced database help, rather than a full-time hire. The work might cover monitoring reviews, performance, recovery readiness, or planned changes. Hours, response expectations, and responsibilities are agreed for each engagement; this is not an automatic 24/7 service.",
  ],
  [
    "How do meetings, pricing, and support work?",
    "Start with an inquiry. We discuss the problem and agree the scope and pricing before paid work begins. Remote work and local meetings are arranged by appointment. Ongoing support is scoped separately, so you know what is included.",
  ],
];

export default function Home() {
  return (
    <main className="studio-home">
      <SiteHeader />
      <section className="studio-hero studio-wrap" id="top">
        <div className="studio-hero-copy">
          <p className="eyebrow">
            <span className="location-dot" aria-hidden="true" /> New Jersey ·
            Independent technology consulting
          </p>
          <h1>
            Serious expertise.
            <br />
            <span>Down-to-earth</span>
            <br />
            help.
          </h1>
          <p className="studio-lede">
            Database engineering for demanding systems.
            <br className="desktop-break" /> Practical software help for the
            business down the street.
          </p>
          <div className="studio-actions">
            <a className="button button-primary" href="#contact">
              Let’s talk about your systems <span aria-hidden="true">↗</span>
            </a>
            <a className="studio-text-link" href="#services">
              Find your starting point <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="studio-hero-note">
            Work directly with Steven Wittek. From the first question to the
            handoff.
          </p>
        </div>
        <SystemsIllustration />
      </section>
      <div className="studio-capabilities" aria-label="Core capabilities">
        <div className="studio-wrap">
          <span>Business software</span>
          <i aria-hidden="true">✳</i>
          <span>Data migration</span>
          <i aria-hidden="true">✳</i>
          <span>SQL Server</span>
          <i aria-hidden="true">✳</i>
          <span>Fractional DBA</span>
          <i aria-hidden="true">✳</i>
          <span>Practical answers</span>
        </div>
      </div>
      <section className="studio-section studio-wrap" id="services">
        <div className="studio-section-heading">
          <p className="eyebrow">01 / Two ways to work together</p>
          <h2>
            Different businesses.
            <br />
            The same care.
          </h2>
          <p>
            You should not have to become a technology expert to get good help.
            And when the problem calls for one, you should know who is doing the
            work.
          </p>
        </div>
        <div className="studio-service-grid">
          <article
            className="studio-service studio-business"
            id="business-systems"
          >
            <div className="studio-service-top">
              <span className="studio-kicker">For business owners</span>
              <span className="studio-service-symbol" aria-hidden="true">
                ↗
              </span>
            </div>
            <h3>
              Your business.
              <br />
              Working better.
            </h3>
            <p className="studio-service-intro">
              For shops, offices, and service businesses ready to sort out their
              software, records, and everyday frustrations.
            </p>
            <dl>
              {businessServices.map(([title, body]) => (
                <div key={title}>
                  <dt>{title}</dt>
                  <dd>{body}</dd>
                </div>
              ))}
            </dl>
            <a className="studio-text-link" href="#contact">
              Let’s untangle the problem <span aria-hidden="true">↗</span>
            </a>
          </article>
          <article
            className="studio-service studio-databases"
            id="database-services"
          >
            <div className="studio-service-top">
              <span className="studio-kicker">For technology teams</span>
              <span className="studio-service-symbol" aria-hidden="true">
                ⌘
              </span>
            </div>
            <h3>
              Database depth.
              <br />
              When you need it.
            </h3>
            <p className="studio-service-intro">
              For teams that need hands-on SQL Server engineering, a second set
              of eyes, or ongoing database ownership.
            </p>
            <dl>
              {databaseServices.map(([title, body]) => (
                <div key={title}>
                  <dt>{title}</dt>
                  <dd>{body}</dd>
                </div>
              ))}
            </dl>
            <a className="studio-text-link" href="#contact">
              Talk through your database needs{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </article>
        </div>
      </section>
      <section className="studio-scenarios-band" id="when-to-call-us">
        <div className="studio-section studio-wrap">
          <div className="studio-section-heading">
            <p className="eyebrow">02 / Sound familiar?</p>
            <h2>
              Start with the thing
              <br />
              getting in your way.
            </h2>
            <p>
              These are examples of the situations we can discuss, not client
              case studies. You can bring one specific problem—not a perfectly
              written project brief.
            </p>
          </div>
          <div className="studio-scenarios">
            {scenarios.map((scenario, i) => (
              <article key={scenario.label}>
                <div className="studio-scenario-index">
                  0{i + 1}
                  <span>{scenario.label}</span>
                </div>
                <h3>{scenario.title}</h3>
                <p>{scenario.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        className="studio-section studio-wrap studio-process"
        id="approach"
      >
        <div>
          <p className="eyebrow">03 / The way I work</p>
          <h2>
            Clear thinking.
            <br />
            Careful changes.
            <br />
            <span className="studio-muted">No mystery.</span>
          </h2>
          <p className="studio-body">
            A database outage and a shop’s slow order screen look different.
            Both deserve someone who listens, investigates, explains the
            options, and follows through.
          </p>
        </div>
        <ol>
          {steps.map(([title, body], i) => (
            <li key={title}>
              <span>0{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="studio-engagement-band" id="engagements">
        <div className="studio-wrap studio-engagement">
          <p className="eyebrow">A sensible place to begin</p>
          <h2>
            One review. One project.
            <br />
            Or a longer-term partner.
          </h2>
          <p>
            Start with a system review, a focused fix, or a planned software
            move. If you need regular help, we can define an ongoing engagement
            with clear responsibilities. No need to decide everything on day
            one.
          </p>
          <a className="studio-text-link" href="#contact">
            Find the right scope <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
      <section className="studio-section studio-wrap studio-founder" id="about">
        <div className="studio-founder-mark" aria-hidden="true">
          <span>SW</span>
          <small>
            Steven Wittek
            <br />
            Founder & database engineer
          </small>
          <div className="studio-mark-rule" />
        </div>
        <div>
          <p className="eyebrow">04 / The person behind Netherwood</p>
          <h2>
            Hi, I’m Steven.
            <br />I get into the details
            <br />
            so you can move forward.
          </h2>
          <p className="studio-body">
            I have worked in technology since 2009, from hands-on consulting to
            production database engineering. My background includes financial
            data systems, SQL performance, recovery planning, and helping teams
            make safer changes.
          </p>
          <p className="studio-body">
            Netherwood brings that experience to work of a more personal scale:
            your business, your team, and the systems you depend on. You work
            directly with me—not a mystery queue.
          </p>
          <a className="studio-text-link" href="/about">
            Meet Steven & explore his experience{" "}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
      <section className="studio-section studio-wrap studio-faq">
        <div>
          <p className="eyebrow">A few good questions</p>
          <h2>Before we talk.</h2>
        </div>
        <div>
          {questions.map(([question, answer]) => (
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
          <h2>Go a little deeper.</h2>
          <p>
            Practical thinking on performance, data, recovery, and the systems
            behind a business.
          </p>
        </div>
        <a className="studio-text-link" href="/articles">
          Read articles & field notes <span aria-hidden="true">↗</span>
        </a>
      </section>
      <section className="contact studio-contact" id="contact">
        <div>
          <p className="eyebrow">Let’s make sense of it</p>
          <h2>
            Bring the problem.
            <br />
            <span>
              We’ll find the <br />
              next step.
            </span>
          </h2>
          <p className="studio-contact-intro">
            What is not working? What are you changing? Tell me a little about
            your business and we can start there.
          </p>
          <div className="studio-contact-details">
            <span>New Jersey · Remote & local engagements</span>
            <span>Meetings by appointment</span>
            <a href="mailto:contact@netherwooddatapartners.com">
              contact@netherwooddatapartners.com{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div className="contact-copy">
          <p>
            You do not need a technical diagnosis. Include the software you use,
            your location, and any important deadline.
          </p>
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
