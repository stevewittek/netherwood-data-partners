import ChatWidget from "./ChatWidget";
import ContactForm from "./components/ContactForm";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { motionRelayRoutes } from "./content/motion-relay";
import "./community.css";
import "./editorial.css";

const services = [
  { title: "Business software troubleshooting", text: "Trace errors, slow screens and mismatched records across the applications you use every day.", href: "/services/software-systems-support/" },
  { id: "business-systems", title: "Software and data conversions", text: "Move records, history and relationships into the software you choose. Rehearse the import and reconcile what moved.", href: "/services/business-software-migration/" },
  { title: "Reporting and integrations", text: "Rebuild reports, automate recurring imports and keep records in sync during a rollout.", href: "/services/workflow-automation/" },
  { id: "database-services", title: "SQL Server performance and recovery", text: "Investigate slow reports, database locking and failed transactions. Review backups and test recovery options.", href: "/services/database-engineering/" },
];

export default function Home() {
  return (
    <main className="studio-home community-home editorial-home">
      <SiteHeader />
      <section className="community-hero" id="top">
        <div className="community-hero-copy">
          <p className="eyebrow"><span className="location-dot" />Software and database consulting · New Jersey</p>
          <h1 id="main-content" tabIndex={-1}>Business software<br /><span>giving you trouble?</span></h1>
          <p className="community-lede">Get help fixing the software you use or moving to a new system.</p>
          <p className="community-hero-body">Netherwood Data Partners helps local businesses and software teams investigate application errors, sales and accounting mismatches, and slow SQL Server workloads. If you’re replacing a system, we can also move your data and test the switch.</p>
          <div className="studio-actions">
            <a className="button button-primary" href="#contact">Tell us what’s happening <span aria-hidden="true">↗</span></a>
            <a className="studio-text-link" href="/services/business-software-migration/">Planning a software move? <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <figure className="community-hero-visual editorial-company-visual" id="community">
          <img src="/images/community/netherwood-station.webp" alt="Netherwood station in Plainfield, New Jersey" width={1536} height={1020} fetchPriority="high" />
          <figcaption>Netherwood, New Jersey. <a href="https://commons.wikimedia.org/wiki/File:NETHERWOOD_STATION,_UNION_COUNTY,_NJ.jpg">Photo: Jerrye &amp; Roy Klotz MD</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Resized for display.</figcaption>
        </figure>
      </section>
      <section className="community-section studio-wrap" id="services">
        <div className="community-section-heading" id="when-to-call-us"><div><p className="eyebrow">Services</p><h2>Troubleshooting, tuning<br />and software conversions.</h2></div><p id="engagements">Start with one recurring problem or a planned software change. We agree on what to investigate and how to check the result.</p></div>
        <div className="community-services">{services.map((service, index) => <article key={service.title} id={service.id}><span className="community-service-number">{String(index + 1).padStart(2, "0")}</span><h3>{service.title}</h3><p>{service.text}</p><a href={service.href} aria-label={`View service: ${service.title}`}>View service <span aria-hidden="true">↗</span></a></article>)}</div>
        <div className="studio-actions"><a className="studio-text-link" href="/services/">All services <span aria-hidden="true">↗</span></a></div>
      </section>
      <section className="community-section studio-wrap community-working" id="troubleshooting-help">
        <div>
          <p className="eyebrow">Troubleshooting</p>
          <h2>Find where the problem starts.</h2>
          <p>Tell us what goes wrong and which systems are involved. We’ll look at what can be checked and whether a fix needs your software provider.</p>
          <a className="button button-primary" href="#contact">Ask about a software issue <span aria-hidden="true">↗</span></a>
        </div>
        <ul className="community-troubleshooting-list">
          <li><div><h3>Sales don’t match the books</h3><p>If a pizzeria’s register totals differ from its accounting records, we can compare sales, refunds and fees across the systems to find what accounts for the difference.</p></div></li>
          <li><div><h3>An app or integration keeps failing</h3><p>We can reproduce the error, review available logs and check where an import, sync or report breaks.</p></div></li>
          <li><div><h3>SQL Server is slowing the app down</h3><p>We investigate slow queries, blocking and timeouts, then test changes against the workload that’s affected.</p></div></li>
        </ul>
      </section>
      <section className="community-section studio-wrap community-working" id="conversion-help">
        <div>
          <p className="eyebrow">Planning a conversion</p>
          <h2>What needs to work<br />on day one?</h2>
          <p>If a new platform or go-live date is already set, tell us what still needs to move and where you need help.</p>
          <a className="button button-primary" href="#contact">Talk through your conversion <span aria-hidden="true">↗</span></a>
        </div>
        <ol>
          <li><div><h3>Map the records</h3><p>Identify what needs to move and preserve the links between accounts, transactions and documents.</p></div></li>
          <li><div><h3>Test the new system</h3><p>Compare balances and reports, then work with your staff to test tasks like taking an order or closing a reporting period.</p></div></li>
          <li><div><h3>Plan the switch</h3><p>Rehearse imports, account for records created during the transition and agree on when to fall back.</p></div></li>
        </ol>
      </section>
      <section className="community-people-band" id="products">
        <div className="community-section studio-wrap community-working">
          <div><p className="eyebrow">Products</p><h2>Apps and database tools.</h2><p>Explore the software, check current availability and find setup or testing information on each product page.</p><a className="studio-text-link" href="/products/">Browse products <span aria-hidden="true">↗</span></a></div>
          <ol>
            <li><span>01</span><div><h3><a href={motionRelayRoutes.product}>Motion Relay <span aria-hidden="true">↗</span></a></h3></div></li>
            <li><span>02</span><div><h3><a href="/products/queryvault/">QueryVault <span aria-hidden="true">↗</span></a></h3></div></li>
            <li><span>03</span><div><h3><a href="/products/sql-server-index-maintenance-visualizer/">PageMover <span aria-hidden="true">↗</span></a></h3></div></li>
          </ol>
        </div>
      </section>
      <section className="community-section studio-wrap community-working" id="about">
        <div><p className="eyebrow">About Netherwood</p><h2>Work directly with<br />the engineer.</h2></div>
        <div id="approach"><p>Work directly with a SQL Server engineer and software consultant who can handle the database work and coordinate the handoff with your software provider.</p><a className="studio-text-link" href="/about/">About the company <span aria-hidden="true">↗</span></a></div>
      </section>
      <section className="studio-insights studio-wrap" id="insights"><div><p className="eyebrow">Articles</p><h2>Notes from database work.</h2><p>SQL Server performance, recovery and migration decisions.</p></div><a className="studio-text-link" href="/articles/">Read articles <span aria-hidden="true">↗</span></a></section>
      <section className="contact studio-contact community-contact" id="contact">
        <div><p className="eyebrow">Contact</p><h2>Tell us about<br /><span>your project.</span></h2><p className="studio-contact-intro">Tell us which software you use and what goes wrong or needs to change. If there’s an error or a deadline, include it. Product questions are welcome. For testing invitations, use the <a href={motionRelayRoutes.betaSignup}>Motion beta signup</a>.</p><div className="studio-contact-details"><span>New Jersey · Meetings by appointment</span><a href="mailto:contact@netherwooddatapartners.com">contact@netherwooddatapartners.com</a></div></div>
        <div className="contact-copy"><ContactForm /></div>
      </section>
      <SiteFooter /><ChatWidget />
    </main>
  );
}
