import ChatWidget from "./ChatWidget";

const services = [
  {
    number: "01",
    title: "SQL Server performance & troubleshooting",
    items: [
      "Slow queries and poor execution plans",
      "Blocking, waits, and deadlocks",
      "Index tuning and capacity pressure",
    ],
  },
  {
    number: "02",
    title: "Database administration & reliability",
    items: [
      "Monitoring, backups, and recovery review",
      "Configuration drift and stability issues",
      "Temporary DBA coverage and operational support",
    ],
  },
  {
    number: "03",
    title: "Migrations, upgrades & data conversions",
    items: [
      "Upgrade planning and cutover support",
      "Cross-system data movement and validation",
      "Low-risk change sequencing for production",
    ],
  },
  {
    number: "04",
    title: "Reporting & data engineering",
    items: [
      "Warehouse and reporting pipeline design",
      "Reporting workloads that affect production",
      "Operational data cleanup and quality checks",
    ],
  },
];

const triggerSituations = [
  "SQL Server suddenly became slow or unpredictable",
  "Application queries are timing out or resource contention is rising",
  "Blocking or deadlocks are affecting business users",
  "An upgrade or migration needs planning and validation",
  "Backups, restores, or recovery procedures need review",
  "Your internal DBA is absent or you need senior coverage",
  "Data needs to be converted between systems or formats",
  "Reporting workloads are putting pressure on production",
  "Your team needs ongoing database monitoring and support",
];

const principles = [
  "Investigate the evidence before changing the system",
  "Explain the findings clearly and in plain language",
  "Fix root causes instead of masking symptoms",
  "Document decisions so the team can maintain the work afterward",
  "Work with internal IT and development teams without unnecessary friction",
];

const aboutPoints = [
  "Senior database professionals remain close to the work.",
  "We help teams make informed technical decisions without the noise of large anonymous support queues.",
  "We keep the focus on the system, the risk, and the practical path forward.",
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Netherwood Data Partners home">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span className="brand-name">Netherwood <strong>Data Partners</strong></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#insights">Insights</a>
          <a href="#approach">Approach</a>
          <a className="nav-cta" href="#contact">Start a conversation</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">SQL Server performance · reliability · data services</p>
          <h1>Database problems solved by experienced senior hands.</h1>
          <p className="hero-lede">
            Netherwood Data Partners helps organizations keep SQL Server and data systems fast, reliable,
            and easier to manage when the business depends on them.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contact">Discuss your database challenge</a>
            <a className="text-link" href="#services">See what we help with <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <aside className="signal-card" aria-label="Database health review">
          <div className="signal-topline">
            <span>Database health review</span>
            <span className="status"><i aria-hidden="true" /> Active review</span>
          </div>
          <div className="signal-visual" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span /><span />
          </div>
          <ul className="signal-list" aria-label="Review areas">
            <li>Performance bottlenecks</li>
            <li>Blocking and waits</li>
            <li>Query plans</li>
            <li>Index strategy</li>
            <li>Backup/recovery</li>
            <li>Capacity</li>
            <li>Configuration</li>
            <li>Monitoring</li>
          </ul>
        </aside>
      </section>

      <section className="proof-strip" aria-label="Core capabilities">
        <span>SQL Server</span><span>Performance tuning</span><span>Database reliability</span><span>Migrations</span><span>Reporting</span>
      </section>

      <section className="section services" id="services">
        <div className="section-heading">
          <p className="eyebrow">Where we help</p>
          <h2>Work that keeps a business operating.</h2>
          <p>From a slow production system to a major data transition, we focus on the practical work that reduces business risk and gives teams clarity.</p>
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

      <section className="section callout" id="when-to-call-us">
        <div className="section-heading compact-heading">
          <p className="eyebrow">When to call us</p>
          <h2>Common situations we step into.</h2>
        </div>
        <ul className="trigger-list" aria-label="Situations when clients call us">
          {triggerSituations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section approach" id="approach">
        <div className="approach-copy">
          <p className="eyebrow">How we work</p>
          <h2>Senior technical judgment, without unnecessary noise.</h2>
          <p>
            We start with the evidence, explain what matters, and fix the actual cause of the problem.
            The goal is not a complicated workaround; it is a system that is easier to understand,
            operate, and trust going forward.
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
          <h2>Senior expertise, directly involved.</h2>
        </div>
        <div className="about-panel">
          <p>
            Work is performed by experienced database professionals who stay close to the technical detail,
            the business constraints, and the eventual operating model.
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
            <h2>Practical guidance for database and data teams.</h2>
          </div>
          <p>
            We will share concise, useful notes on SQL Server performance, reliability, migration planning,
            and operational decision-making when the next issue or opportunity is worth publishing.
          </p>
        </div>
      </section>

      <section className="contact" id="contact">
        <div>
          <p className="eyebrow">Start with the problem</p>
          <h2>Tell us what is getting in the way.</h2>
        </div>
        <div className="contact-copy">
          <p>
            Share the platform, the symptoms, and the urgency. If you have a rough size or timeline, include it.
            We will tell you candidly whether we can help and what makes the most sense next.
          </p>
          <div className="contact-meta">
            <a className="button button-light" href="mailto:contact@netherwooddatapartners.com">contact@netherwooddatapartners.com</a>
            <p>Helpful context: database platform, issue/project, urgency, approximate environment size if known.</p>
          </div>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span className="brand-name">Netherwood <strong>Data Partners</strong></span>
        </a>
        <p>Database engineering, performance & data services.</p>
        <p>© {new Date().getFullYear()} Netherwood Data Partners</p>
      </footer>
      <ChatWidget />
    </main>
  );
}
