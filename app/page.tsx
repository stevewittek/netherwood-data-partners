import ChatWidget from "./ChatWidget";
import ContactForm from "./components/ContactForm";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";

const services = [
  { number: "01", title: "Software setup & business transitions", items: [
    "Plan the technology side of buying or opening a business",
    "Set up new software and coordinate with its provider",
    "Test everyday tasks before staff make the switch",
  ] },
  { number: "02", title: "Legacy systems & data migration", items: [
    "Find out what can be exported from your old system",
    "Clean up and map records for the new software",
    "Check the transferred data and plan a fallback",
  ] },
  { number: "03", title: "System reviews & practical fixes", items: [
    "Review application versions, workflows and support gaps",
    "Investigate slow software, errors and unreliable reports",
    "Prioritize what needs fixing and what can stay",
  ] },
  { number: "04", title: "Ongoing help & useful reporting", items: [
    "Help staff use the system after the change",
    "Reduce spreadsheet work and connect business data",
    "Document routines and agree the support you need",
  ] },
];

const triggerSituations = [
  "You are buying a business and inheriting its software and records",
  "You are opening an office, shop or restaurant and need systems set up",
  "You want to switch software without leaving important data behind",
  "An older application needs an upgrade or a supported replacement",
  "Staff enter the same information into more than one system",
  "Reports or spreadsheets do not agree with each other",
  "Slow software or recurring errors are interrupting daily work",
  "You need to understand your backups, access and recovery options",
  "You want someone to help after the new system goes live",
];

const principles = [
  "Start with the work your staff need to get done",
  "Explain the options, costs and limits in plain language",
  "Test the change and agree a way back before going live",
  "Check the records and everyday tasks after the move",
  "Leave clear instructions and an agreed support handoff",
];

const aboutPoints = [
  "I remain directly involved from the first conversation through the final handoff.",
  "When a project needs another specialty, I discuss that scope with you before bringing additional expertise into the work.",
  "You get clear ownership of the work, the next steps, and the support handoff.",
];

const engagements = [
  { label: "Business technology review", body: "Understand your current software, everyday frustrations and the changes worth making. Start with a clear findings list and practical next steps." },
  { label: "New software or a business takeover", body: "Plan what you are inheriting, what needs to move and how your staff will use the new setup. Coordinate the details with your software provider." },
  { label: "A focused fix or data project", body: "Get help with a stalled import, unreliable report, recurring application error or manual task. Agree a defined piece of work and how to check the result." },
  { label: "Help after the handover", body: "Give staff a place to bring software questions and problems while the new setup settles in. Agree the support period, responsibilities and escalation path." },
];

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Small business software · data migration · hands-on support</p>
          <h1>Practical technology help for your small business.</h1>
          <p className="hero-lede">
            Taking over a business, switching software, or working around an old system?
            Netherwood helps you plan the change, move your records, fix the problems,
            and get your staff up and running.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contact">Tell me what you need help with</a>
            <a className="text-link" href="#services">See what we help with <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <aside className="diagnostic-panel" aria-label="Illustration of a small business software transition">
          <div className="diagnostic-heading">
            <span className="technical-label">YOUR NEXT SYSTEM / STEP BY STEP</span>
            <span className="status"><i aria-hidden="true" /> Illustrative</span>
          </div>
          <div className="diagnostic-flow">
            <div className="flow-node"><span className="node-index">01</span><strong>Review</strong><small>Current setup · needs</small></div>
            <span className="flow-line" aria-hidden="true" />
            <div className="flow-node"><span className="node-index">02</span><strong>Plan</strong><small>Records · next steps</small></div>
            <span className="flow-line" aria-hidden="true" />
            <div className="flow-node"><span className="node-index">03</span><strong>Move</strong><small>Test · make the switch</small></div>
            <span className="flow-line" aria-hidden="true" />
            <div className="flow-node"><span className="node-index">04</span><strong>Support</strong><small>Staff · clear handoff</small></div>
          </div>
          <p className="diagnostic-note">Know what is changing, check that it works, and know who to call afterward.</p>
        </aside>
      </section>

      <section className="proof-strip" aria-label="Core capabilities">
        <span>Software setup</span><span>Data migration</span><span>System reviews</span><span>Practical fixes</span><span>Staff support</span>
      </section>

      <section className="section services" id="services">
        <div className="section-heading">
          <p className="eyebrow">Where we help</p>
          <h2>Work that keeps a business operating.</h2>
          <p>For offices, shops and service businesses that need their technology to work together. Start with one problem, a planned move or a review of what you already have.</p>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.number}>
              <span className="service-number">{service.number}</span>
              <h3>{service.title}</h3>
              <ul className="service-list">
                {service.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="engagements-band" id="engagements">
        <div className="section engagements">
          <div className="compact-heading">
            <p className="eyebrow">How we can help</p>
            <h2>Start with the work you actually need.</h2>
          </div>
          <div className="engagement-list">
            {engagements.map((engagement, index) => (
              <article className="engagement-row" key={engagement.label}>
                <span className="service-number">0{index + 1}</span>
                <h3>{engagement.label}</h3>
                <p>{engagement.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section callout" id="when-to-call-us">
        <div className="section-heading compact-heading">
          <p className="eyebrow">When to call us</p>
          <h2>Common situations we step into.</h2>
        </div>
        <ul className="trigger-list" aria-label="Situations when clients call us">
          {triggerSituations.map((item) => (
            <li key={item}><span aria-hidden="true" />{item}</li>
          ))}
        </ul>
      </section>

      <section className="section approach" id="approach">
        <div className="approach-copy">
          <p className="eyebrow">How we work</p>
          <h2>A clear plan, a careful change, and help afterward.</h2>
          <p>
            You should know what needs to change, what it will affect and who is responsible.
            I work with you and your software providers, test the important tasks,
            and leave your staff with instructions they can use.
          </p>
        </div>
        <ol className="principles">
          {principles.map((principle, index) => (
            <li key={principle}><span>0{index + 1}</span>{principle}</li>
          ))}
        </ol>
      </section>

      <section className="section about" id="about">
        <div className="section-heading compact-heading">
          <p className="eyebrow">About</p>
          <h2>Work directly with the person doing the work.</h2>
        </div>
        <div className="about-panel">
          <p>
            I am Steven Wittek, founder of Netherwood Data Partners. My background in
            SQL Server, data migration and business systems gives me the technical depth
            to investigate what is happening beneath the software you use every day.
          </p>
          <ul>
            {aboutPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section insights" id="insights">
        <div className="insights-panel">
          <div>
            <p className="eyebrow">Insights</p>
            <h2>A closer look at the systems behind your business.</h2>
          </div>
          <p>
            Read practical notes on older software, moving data, backups and performance.
            Technical articles are available when you or your IT provider need the deeper detail.
          </p>
          <a className="article-read-link" href="/articles">Browse articles <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section className="contact" id="contact">
        <div>
          <p className="eyebrow">Start with the problem</p>
          <h2>Tell us what is getting in the way.</h2>
        </div>
        <div className="contact-copy">
          <p>
            Tell me about your business, the software you use and what you want to change.
            You do not need a technical diagnosis. Include your location and any important deadline,
            and I will explain the next practical step.
          </p>
          <ContactForm />
          <p className="contact-email-fallback">
            Prefer email? Write to{" "}
            <a href="mailto:contact@netherwooddatapartners.com">contact@netherwooddatapartners.com</a>.
          </p>
        </div>
      </section>

      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
