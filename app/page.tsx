import ChatWidget from "./ChatWidget";
import ContactForm from "./components/ContactForm";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { motionRelayRoutes } from "./content/motion-relay";
import "./community.css";
import "./editorial.css";

const services = [
  { id: "business-systems", title: "Software and data conversions", text: "Move records, history and relationships into the software you choose. Rehearse the import and reconcile what moved.", href: "/services/business-software-migration/" },
  { title: "Legacy application modernization", text: "Document the business rules in an older Access, FileMaker or SQL Server application before you repair or replace it.", href: "/services/legacy-application-modernization/" },
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
          <h1 id="main-content" tabIndex={-1}>Moving to<br /><span>new software?</span></h1>
          <p className="community-lede">Bring your data, reports and day-to-day workflows with you.</p>
          <p className="community-hero-body">Netherwood Data Partners works with your team and software vendor to clean up and map records, test imports, and check that your reports and daily work hold up before you switch.</p>
          <div className="studio-actions">
            <a className="button button-primary" href="#contact">Discuss your project <span aria-hidden="true">↗</span></a>
            <a className="studio-text-link" href="#services">See how we can help <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <figure className="community-hero-visual editorial-company-visual" id="community">
          <img src="/images/community/netherwood-station.webp" alt="Netherwood station in Plainfield, New Jersey" width={1536} height={1020} fetchPriority="high" />
          <figcaption>Netherwood, New Jersey. <a href="https://commons.wikimedia.org/wiki/File:NETHERWOOD_STATION,_UNION_COUNTY,_NJ.jpg">Photo: Jerrye &amp; Roy Klotz MD</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Resized for display.</figcaption>
        </figure>
      </section>
      <section className="community-section studio-wrap" id="services">
        <div className="community-section-heading" id="when-to-call-us"><div><p className="eyebrow">Services</p><h2>Replace, connect or<br />repair your software.</h2></div><p id="engagements">Start with a planned software change or a problem in the system you already use. We agree on the work and how to check the result before starting.</p></div>
        <div className="community-services">{services.map((service, index) => <article key={service.title} id={service.id}><span className="community-service-number">{String(index + 1).padStart(2, "0")}</span><h3>{service.title}</h3><p>{service.text}</p><a href={service.href} aria-label={`View service: ${service.title}`}>View service <span aria-hidden="true">↗</span></a></article>)}</div>
        <div className="studio-actions"><a className="studio-text-link" href="/services/">All services <span aria-hidden="true">↗</span></a></div>
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
        <div><p className="eyebrow">Contact</p><h2>Tell us about<br /><span>your project.</span></h2><p className="studio-contact-intro">Tell us what software you use today, what needs to change and any deadline you’re working toward. Product questions are welcome. For testing invitations, use the <a href={motionRelayRoutes.betaSignup}>Motion beta signup</a>.</p><div className="studio-contact-details"><span>New Jersey · Meetings by appointment</span><a href="mailto:contact@netherwooddatapartners.com">contact@netherwooddatapartners.com</a></div></div>
        <div className="contact-copy"><ContactForm /></div>
      </section>
      <SiteFooter /><ChatWidget />
    </main>
  );
}
