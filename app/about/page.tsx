/* eslint-disable @next/next/no-html-link-for-pages */

import type { Metadata } from "next";
import ChatWidget from "../ChatWidget";
import { Portrait } from "../components/Portrait";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import "./about.css";

export const metadata: Metadata = {
  title: "About Steven Wittek | Netherwood Data Partners",
  description: "Meet Steven Wittek, founder, database engineer, and consultant at Netherwood Data Partners.",
  openGraph: {
    title: "About Steven Wittek | Netherwood Data Partners",
    description: "Practical database engineering and consulting grounded in more than 15 years of real-world systems work.",
  },
  twitter: {
    title: "About Steven Wittek | Netherwood Data Partners",
    description: "Practical database engineering and consulting grounded in more than 15 years of real-world systems work.",
  },
};

const expertise = [
  {
    number: "01",
    title: "SQL Server Performance",
    body: "Execution plans, Query Store, Extended Events, waits, indexing, blocking, query tuning, workload analysis and production troubleshooting.",
  },
  {
    number: "02",
    title: "Database Engineering",
    body: "Architecture, upgrades, migrations, automation, deployment processes, database development and production support.",
  },
  {
    number: "03",
    title: "Reliability",
    body: "Always On availability groups, replication, backup and recovery, disaster recovery, monitoring and operational resilience.",
  },
  {
    number: "04",
    title: "Data & Reporting",
    body: "T-SQL development, reporting systems, data conversions, integrations, data cleanup and database-backed applications.",
  },
  {
    number: "05",
    title: "Cloud & Modernization",
    body: "Microsoft Azure, Azure SQL, managed database environments, Google Cloud and modernization of older database systems.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <SiteHeader currentPage="about" />

      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="eyebrow">About the founder</p>
          <h1>Steven Wittek</h1>
          <p className="about-role">Founder, Database Engineer & Consultant</p>
          <div className="long-form about-intro">
            <p>
              I have spent more than 15 years working with databases, applications, and the systems businesses depend on every day. My background combines hands-on SQL Server engineering, performance tuning, production support, reporting, data migration, cloud systems, and long-term technology consulting.
            </p>
            <p>
              I founded Netherwood Data Partners to bring that experience directly to businesses that need practical help with their data without adding another layer of enterprise complexity.
            </p>
          </div>
          <a className="button button-primary" href="/#contact">Work With Me</a>
        </div>
        <Portrait />
      </section>

      <section className="about-section about-background">
        <div className="about-section-title">
          <p className="eyebrow">Professional background</p>
          <h2>Database Work Built Around Real Systems</h2>
        </div>
        <div className="long-form about-section-copy">
          <p>
            My career has covered both long-term technology consulting and enterprise database engineering. I have supported organizations with very different systems, budgets, workloads, and technical challenges, from smaller businesses needing direct hands-on assistance to financial technology platforms operating large production database environments.
          </p>
          <p>
            Much of my work has centered on Microsoft SQL Server: diagnosing performance problems, improving queries and indexes, designing reliable database environments, supporting high availability and disaster recovery, managing migrations and upgrades, developing reporting and data solutions, and helping application teams make better use of the database underneath their software.
          </p>
          <p>
            I have also worked with Microsoft Azure, Google Cloud, Windows and Linux database environments, monitoring platforms, automation, Git-based deployment processes, and the operational tools required to keep production systems reliable.
          </p>
        </div>
      </section>

      <section className="expertise-section" aria-labelledby="expertise-title">
        <div className="expertise-heading">
          <p className="eyebrow">Areas of expertise</p>
          <h2 id="expertise-title">The work behind reliable data systems.</h2>
        </div>
        <ol className="expertise-list">
          {expertise.map((area) => (
            <li key={area.number}>
              <span className="expertise-number">{area.number}</span>
              <h3>{area.title}</h3>
              <p>{area.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-section consulting-section">
        <div className="about-section-title">
          <p className="eyebrow">Consulting background</p>
          <h2>From Consulting to Enterprise Systems</h2>
        </div>
        <div className="long-form about-section-copy">
          <p>
            Before working inside larger financial technology environments, I spent many years consulting directly with businesses and organizations on their technology and data systems. That experience shaped the way I approach technical work today.
          </p>
          <p>
            A database problem is rarely just a database problem. It may be affecting an employee trying to finish a report, a customer waiting for an application to respond, an accounting process that cannot complete, or a business owner who simply needs the system to work.
          </p>
          <p>
            My more recent enterprise work has included institutional investment and high-volume application environments, where performance, reliability, and careful production operations matter every day.
          </p>
          <p className="pull-quote">I try to understand that larger problem first, then use the technology to solve it.</p>
        </div>
      </section>

      <section className="origin-section">
        <div className="origin-inner">
          <div>
            <p className="eyebrow">Why Netherwood</p>
            <h2>Why I Started Netherwood Data Partners</h2>
          </div>
          <div className="long-form origin-copy">
            <p>
              Netherwood Data Partners grew out of a simple idea: many businesses need experienced data and database help, but they do not necessarily need a large consulting firm, a long engagement, or another software platform.
            </p>
            <p>
              Sometimes a company needs someone to investigate why SQL Server is suddenly slow. Sometimes an old application needs its data converted. Sometimes reporting has become unreliable. Sometimes the business has simply accumulated years of databases, spreadsheets and files and needs help making sense of them.
            </p>
            <p>
              I wanted to create a consulting company that could handle those problems directly while also developing practical monitoring, analysis and database tools that make ongoing support more useful and affordable.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section personal-section">
        <div className="personal-marker" aria-hidden="true">
          <span>26.2</span>
          <small>miles</small>
        </div>
        <div className="about-section-title">
          <p className="eyebrow">Beyond the work</p>
          <h2>Beyond the Database</h2>
        </div>
        <div className="long-form about-section-copy">
          <p>
            I am based in New Jersey and have spent much of my career working with organizations throughout New Jersey, New York and the surrounding region, as well as with distributed teams across the country.
          </p>
          <p>
            Outside of technology, I am family-oriented, an avid distance runner, and someone who has always enjoyed understanding how things work, improving them and building useful things from the pieces available.
          </p>
          <p>
            That same curiosity has increasingly extended into artificial intelligence and the ways smaller organizations can use modern technology without losing ownership or control of their data.
          </p>
        </div>
      </section>

      <section className="about-contact" id="contact">
        <div>
          <p className="eyebrow">Start with the problem</p>
          <h2>Have a Data Problem?</h2>
        </div>
        <div className="about-contact-copy">
          <p>If a database is slow, a migration has stalled, reporting is unreliable, or you simply need an experienced second set of eyes, tell me what is happening.</p>
          <a className="button button-light" href="mailto:contact@netherwooddatapartners.com">Talk With Steven</a>
        </div>
      </section>

      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
