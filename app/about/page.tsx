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

const experience = [
  { number: "01", title: "Database performance", body: "I have developed and tuned SQL for financial reporting and analytics. I investigate execution plans, workload patterns, waits and blocking to understand what changed before choosing a fix.", tools: "SQL Server · T-SQL · Query Store" },
  { number: "02", title: "Recovery and reliability", body: "My experience includes availability groups, geographic replicas, backups, encryption and restore testing. Recovery planning starts with how much downtime and data loss the business can accept.", tools: "Always On · Backup & restore · Recovery planning" },
  { number: "03", title: "Controlled changes", body: "I have used Git, Azure DevOps and database projects to make changes reviewable and traceable. That includes capturing existing database objects to establish a dependable source baseline.", tools: "Git · Azure DevOps · DACPAC" },
  { number: "04", title: "Tools and metrics", body: "I build reporting and investigation tools to make systems easier to understand. QueryVault preserves Query Store history for longer-term performance analysis.", tools: "QueryVault · Monitoring · Extended Events" },
];

export default function AboutPage() {
  return (
    <main className="founder-page">
      <SiteHeader currentPage="about" />
      <section className="about-hero studio-wrap">
        <div>
          <p className="eyebrow">The person behind Netherwood</p>
          <h1>Steven Wittek.</h1>
          <p className="about-role">Data professional.<br />Independent developer.<br />Runner.</p>
          <div className="long-form about-intro">
            <p>I build apps, work with databases and connect information between systems. SQL Server and database engineering are the foundation of my work.</p>
            <p>Netherwood Data Partners is my independent data and software business. My focus is building products that make data useful, from database investigation tools to a connection for live running readings.</p>
          </div>
          <a className="button button-primary" href="/products/">Explore my software <span aria-hidden="true">↗</span></a>
        </div>
        <figure className="community-about-visual">
          <img src="/images/community/netherwood-station.webp" alt="Netherwood station in Plainfield, New Jersey" width={1536} height={1020} fetchPriority="high" />
          <figcaption>The place behind the name. Photo by <a href="https://commons.wikimedia.org/wiki/File:NETHERWOOD_STATION,_UNION_COUNTY,_NJ.jpg">Jerrye &amp; Roy Klotz MD</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Resized and cropped for display.</figcaption>
        </figure>
      </section>
      <div className="founder-facts"><div className="studio-wrap"><span><strong>Since 2009</strong>Technology experience</span><span><strong>New Jersey</strong>Independently owned</span><span><strong>Direct contact</strong>Work with the developer</span></div></div>
      <section className="about-section studio-wrap">
        <div><p className="eyebrow">Why I build</p><h2>Follow the data.<br />Understand the system.</h2></div>
        <div className="long-form">
          <p>I’m interested in how systems behave: where information comes from, how it moves, and what the measurements tell us. That curiosity runs through my database work and app development.</p>
          <p>QueryVault began with a database problem: keeping query history available for later investigation. Motion Connect and Motion Relay began while I was using ChatGPT during a run and wanted the conversation to include readings from my Garmin.</p>
          <p>The questions are different, but the work has something in common: connect the right information, make its limits clear, and check what actually improves.</p>
          <a className="studio-text-link" href="/products/garmin-ai-connector/">The Motion story <span aria-hidden="true">↗</span></a>
        </div>
      </section>
      <section className="founder-experience" id="professional-experience"><div className="studio-wrap">
        <div className="founder-experience-heading"><p className="eyebrow">Professional background</p><h2>Experience behind the software.</h2><p>Examples from my engineering work and personal projects. These are not a list of Netherwood clients.</p></div>
        <div className="founder-experience-list">{experience.map(item=><article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><div><p>{item.body}</p><p className="founder-tools">{item.tools}</p></div></article>)}</div>
      </div></section>
      <section className="about-section studio-wrap">
        <div><p className="eyebrow">Consulting</p><h2>Focused work.<br />Direct involvement.</h2></div>
        <div className="long-form"><p>I also work with businesses on database performance, migrations and integrations. We agree on scope, fees and availability before starting, then define how to check the result.</p><p>You work directly with me. I explain findings, document changes and discuss vendor responsibilities or additional expertise when needed.</p><a className="studio-text-link" href="/services/">View consulting services <span aria-hidden="true">↗</span></a></div>
      </section>
      <section className="founder-contact"><div className="studio-wrap"><div><p className="eyebrow">Contact</p><h2>Questions about an app<br />or a data project?</h2></div><div><p>Product feedback, testing inquiries and local business questions are welcome.</p><a className="button button-light" href="/#contact">Contact Steven <span aria-hidden="true">↗</span></a><p className="founder-appointment">New Jersey · Meetings by appointment</p></div></div></section>
      <SiteFooter /><ChatWidget />
    </main>
  );
}
