const services = [
  {
    number: "01",
    title: "Database performance",
    body: "Find the bottleneck, fix the root cause, and give your team a faster, more predictable SQL Server environment.",
  },
  {
    number: "02",
    title: "Database operations",
    body: "Practical support for monitoring, reliability, recovery, upgrades, and the hard problems that interrupt real work.",
  },
  {
    number: "03",
    title: "Migrations & modernization",
    body: "Move data and modernize systems with a clear plan, careful validation, and fewer surprises at cutover.",
  },
  {
    number: "04",
    title: "Data engineering & reporting",
    body: "Turn scattered operational data into dependable pipelines, useful reporting, and better business decisions.",
  },
];

const principles = [
  "Senior expertise stays close to the work",
  "Plain answers before expensive solutions",
  "Improvements your team can operate afterward",
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
          <a href="#services">Services</a>
          <a href="#approach">Approach</a>
          <a className="nav-cta" href="#contact">Start a conversation</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Database engineering · performance · data services</p>
          <h1>Dependable data systems. <em>Clearer decisions.</em></h1>
          <p className="hero-lede">
            Netherwood Data Partners helps organizations solve difficult database problems,
            improve performance, and build data systems that hold up under real-world pressure.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contact">Discuss your project</a>
            <a className="text-link" href="#services">Explore our work <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <aside className="signal-card" aria-label="What clients can expect">
          <div className="signal-topline">
            <span>Operational signal</span>
            <span className="status"><i aria-hidden="true" /> Systems clear</span>
          </div>
          <div className="signal-visual" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
          </div>
          <div className="signal-stats">
            <div><strong>Fast</strong><span>Diagnosis</span></div>
            <div><strong>Practical</strong><span>Remediation</span></div>
            <div><strong>Durable</strong><span>Results</span></div>
          </div>
        </aside>
      </section>

      <section className="proof-strip" aria-label="Core capabilities">
        <span>SQL Server</span><span>Performance</span><span>Reliability</span><span>Migrations</span><span>Data engineering</span>
      </section>

      <section className="section services" id="services">
        <div className="section-heading">
          <p className="eyebrow">Where we help</p>
          <h2>Deep technical work, tied to the outcome.</h2>
          <p>From a slow production system to a full data transition, we bring structure to complex work and keep the business objective in view.</p>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.number}>
              <span className="service-number">{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section approach" id="approach">
        <div className="approach-copy">
          <p className="eyebrow">How we work</p>
          <h2>Calm, direct, and close to the details.</h2>
          <p>
            Good data consulting should reduce uncertainty. We start with the evidence,
            explain the tradeoffs plainly, and leave behind systems that are easier to understand and run.
          </p>
        </div>
        <ol className="principles">
          {principles.map((principle, index) => (
            <li key={principle}><span>0{index + 1}</span>{principle}</li>
          ))}
        </ol>
      </section>

      <section className="contact" id="contact">
        <div>
          <p className="eyebrow">Start with the problem</p>
          <h2>Tell us what is getting in the way.</h2>
        </div>
        <div className="contact-copy">
          <p>Share the system, the symptoms, and what a better outcome looks like. We’ll tell you candidly where we can help.</p>
          <a className="button button-light" href="mailto:contact@netherwooddatapartners.com">contact@netherwooddatapartners.com</a>
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
    </main>
  );
}
