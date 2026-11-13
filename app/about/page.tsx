import type { Metadata } from "next";
import ChatWidget from "../ChatWidget";
import { aboutMetadata } from "../content/site";
import "../community.css";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import "./about.css";

export const metadata: Metadata = {
  ...aboutMetadata,
  alternates: { canonical: "/about/" },
  openGraph: {
    title: "About Steven Wittek | Netherwood Data Partners",
    description: aboutMetadata.description,
    url: "/about/",
  },
  twitter: {
    title: "About Steven Wittek | Netherwood Data Partners",
    description: aboutMetadata.description,
  },
};

const capabilities = [
  { number: "01", title: "Software conversions", body: "Extract and map legacy records, resolve exceptions with your staff, and prepare trial imports with your vendor.", tools: "Access · FileMaker · SQL Server" },
  { number: "02", title: "Reporting and integrations", body: "Rebuild reports and the SQL behind them, reconcile key totals and automate recurring transfers between systems.", tools: "T-SQL · SSRS · Data imports and exports" },
  { number: "03", title: "SQL Server performance and recovery", body: "Trace slow reports and blocked transactions, validate proposed fixes, and review whether backups can support your recovery plan.", tools: "Query Store · Execution plans · Restore testing" },
];

export default function AboutPage() {
  return (
    <main className="founder-page">
      <SiteHeader currentPage="about" />
      <section className="about-hero studio-wrap">
        <div>
          <p className="eyebrow">The person behind Netherwood</p>
          <h1 id="main-content" tabIndex={-1}>Steven Wittek.</h1>
          <p className="about-role">SQL Server engineer.<br />Database developer.<br />Software consultant.</p>
          <div className="long-form about-intro">
            <p>Netherwood Data Partners is an independent New Jersey consultancy for software conversions, reporting and SQL Server troubleshooting.</p>
            <p>You work directly with me to define the job, coordinate with your software provider and check the result with the people who use the system.</p>
          </div>
          <a className="button button-primary" href="/#contact">Discuss your project <span aria-hidden="true">↗</span></a>
        </div>
        <figure className="community-about-visual">
          <img src="/images/community/netherwood-station.webp" alt="Netherwood station in Plainfield, New Jersey" width={1536} height={1020} fetchPriority="high" />
          <figcaption>The place behind the name. Photo by <a href="https://commons.wikimedia.org/wiki/File:NETHERWOOD_STATION,_UNION_COUNTY,_NJ.jpg">Jerrye &amp; Roy Klotz MD</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Resized and cropped for display.</figcaption>
        </figure>
      </section>
      <div className="founder-facts"><div className="studio-wrap"><span><strong>Since 2009</strong>Technology experience</span><span><strong>New Jersey</strong>Independently owned</span><span><strong>Direct contact</strong>Work with the developer</span></div></div>
      <section className="founder-experience" id="professional-experience"><div className="studio-wrap">
        <div className="founder-experience-heading"><p className="eyebrow">Capabilities</p><h2>What Netherwood can do for you.</h2></div>
        <div className="founder-experience-list">{capabilities.map(item=><article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><div><p>{item.body}</p><p className="founder-tools">{item.tools}</p></div></article>)}</div>
        <div className="studio-actions"><a className="studio-text-link" href="/services/">Explore consulting services <span aria-hidden="true">↗</span></a></div>
      </div></section>
      <section className="about-section studio-wrap">
        <div><p className="eyebrow">Consulting</p><h2>Focused work.<br />Direct involvement.</h2></div>
        <div className="long-form"><p>A project can start with a vendor’s import template, an aging database or a report that suddenly takes too long. We agree on scope, fees and availability, and define how we’ll check the result.</p><p>You work directly with me. I explain findings, document changes and discuss vendor responsibilities or additional expertise when needed.</p><a className="studio-text-link" href="/services/">View consulting services <span aria-hidden="true">↗</span></a></div>
      </section>
      <section className="founder-contact"><div className="studio-wrap"><div><p className="eyebrow">Contact</p><h2>Have a project<br />in mind?</h2></div><div><p>Tell me what you’re replacing, fixing or trying to connect.</p><a className="button button-light" href="/#contact">Contact Steven <span aria-hidden="true">↗</span></a><p className="founder-appointment">New Jersey · Meetings by appointment</p></div></div></section>
      <SiteFooter /><ChatWidget />
    </main>
  );
}
