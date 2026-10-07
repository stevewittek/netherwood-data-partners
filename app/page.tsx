import ChatWidget from "./ChatWidget";
import ContactForm from "./components/ContactForm";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { motionRelayRoutes } from "./content/motion-relay";
import "./community.css";
import "./editorial.css";

const services = [
  { id: "database-services", title: "Database performance", text: "SQL Server investigations, query tuning, monitoring and recovery reviews.", href: "/services/database-engineering/" },
  { id: "business-systems", title: "Applications and integrations", text: "Investigate application problems and connect data between existing systems.", href: "/services/workflow-automation/" },
  { title: "Data migrations", text: "Map records, rehearse the move and check the result against agreed business rules.", href: "/services/data-migration/" },
  { title: "Systems assessments", text: "Understand an older application, its dependencies and the options for its next stage.", href: "/services/legacy-systems-assessment/" },
];

export default function Home() {
  return (
    <main className="studio-home community-home editorial-home">
      <SiteHeader />
      <section className="community-hero" id="top">
        <div className="community-hero-copy">
          <p className="eyebrow"><span className="location-dot" />Data &amp; software · New Jersey</p>
          <h1>Software built<br /><span>around data.</span></h1>
          <p className="community-lede">Apps, connected systems and the metrics that help explain how they work.</p>
          <p className="community-hero-body">Netherwood Data Partners develops apps and database tools, connects systems, and helps businesses improve how their data works.</p>
          <div className="studio-actions">
            <a className="button button-primary" href="/services/">Explore services <span aria-hidden="true">↗</span></a>
            <a className="studio-text-link" href="/products/">View products <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <figure className="community-hero-visual editorial-company-visual" id="community">
          <img src="/images/community/netherwood-station.webp" alt="Netherwood station in Plainfield, New Jersey" width={1536} height={1020} fetchPriority="high" />
          <figcaption>Netherwood, New Jersey. <a href="https://commons.wikimedia.org/wiki/File:NETHERWOOD_STATION,_UNION_COUNTY,_NJ.jpg">Photo: Jerrye &amp; Roy Klotz MD</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Resized for display.</figcaption>
        </figure>
      </section>
      <section className="community-section studio-wrap" id="services">
        <div className="community-section-heading" id="when-to-call-us"><div><p className="eyebrow">Services</p><h2>Connect systems.<br />Improve performance.</h2></div><p id="engagements">Focused software and data work for local businesses and technical teams. Scope, fees and availability are agreed before work begins.</p></div>
        <div className="community-services">{services.map((service, index) => <article key={service.title} id={service.id}><span className="community-service-number">{String(index + 1).padStart(2, "0")}</span><h3>{service.title}</h3><p>{service.text}</p><a href={service.href}>View service <span aria-hidden="true">↗</span></a></article>)}</div>
        <div className="studio-actions"><a className="studio-text-link" href="/services/">All services <span aria-hidden="true">↗</span></a></div>
      </section>
      <section className="community-people-band" id="products">
        <div className="community-section studio-wrap community-working">
          <div><p className="eyebrow">Products</p><h2>Apps and database tools.</h2><p>Explore the software, check current availability and find setup or testing information on each product page.</p><a className="studio-text-link" href="/products/">Browse products <span aria-hidden="true">↗</span></a></div>
          <ol>
            <li><span>01</span><div><h3><a href={motionRelayRoutes.product}>Motion Connect + Motion Relay <span aria-hidden="true">↗</span></a></h3></div></li>
            <li><span>02</span><div><h3><a href="/products/queryvault/">QueryVault <span aria-hidden="true">↗</span></a></h3></div></li>
            <li><span>03</span><div><h3><a href="/products/sql-server-index-maintenance-visualizer/">PageMover <span aria-hidden="true">↗</span></a></h3></div></li>
          </ol>
        </div>
      </section>
      <section className="community-section studio-wrap community-working" id="about">
        <div><p className="eyebrow">About Netherwood</p><h2>A foundation in data.<br />A focus on software.</h2></div>
        <div id="approach"><p>Based in New Jersey, Netherwood brings SQL Server and database engineering experience to app development, integrations and consulting.</p><p>The focus is practical: understand the system, connect the right information and measure what improves.</p><a className="studio-text-link" href="/about/">About the company <span aria-hidden="true">↗</span></a></div>
      </section>
      <section className="studio-insights studio-wrap" id="insights"><div><p className="eyebrow">Articles</p><h2>Notes from database work.</h2><p>SQL Server performance, recovery and migration decisions.</p></div><a className="studio-text-link" href="/articles/">Read articles <span aria-hidden="true">↗</span></a></section>
      <section className="contact studio-contact community-contact" id="contact">
        <div><p className="eyebrow">Contact</p><h2>App questions.<br /><span>Business inquiries.</span></h2><p className="studio-contact-intro">Ask about a product, report a problem, or describe a data project. For testing invitations, use the <a href={motionRelayRoutes.betaSignup}>Motion beta signup</a>.</p><div className="studio-contact-details"><span>New Jersey · Meetings by appointment</span><a href="mailto:contact@netherwooddatapartners.com">contact@netherwooddatapartners.com</a></div></div>
        <div className="contact-copy"><ContactForm /></div>
      </section>
      <SiteFooter /><ChatWidget />
    </main>
  );
}
