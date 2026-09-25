import type { Metadata } from "next";
import ChatWidget from "../ChatWidget";
import { Portrait } from "../components/Portrait";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import "./about.css";

export const metadata: Metadata = {
  title: "About Steven Wittek | Netherwood Data Partners",
  description:
    "Steven Wittek brings senior database engineering experience to small business data migrations and legacy systems modernization. Based in New Jersey.",
  alternates: { canonical: "/about/" },
  openGraph: {
    title: "About Steven Wittek | Netherwood Data Partners",
    description:
      "Enterprise database experience for small businesses moving beyond aging systems.",
    url: "/about/",
  },
  twitter: {
    title: "About Steven Wittek | Netherwood Data Partners",
    description:
      "Enterprise database experience for small businesses moving beyond aging systems.",
  },
};

const experience = [
  {
    number: "01",
    title: "Making demanding databases work better",
    body: "I have developed and tuned SQL for financial reporting and analytics, translating business calculations into maintainable database code. My investigations go beyond adding an index: I look at execution plans, workload patterns, waits, blocking, statistics, and what changed.",
    tools: "SQL Server · T-SQL · Query Store · Execution plans",
  },
  {
    number: "02",
    title: "Planning for the day something fails",
    body: "My experience includes SQL Server availability groups, geographic replicas, backup strategies, encryption, and restore and failover testing. I start with how long the business can be down and how much data it can afford to lose, then work through what the design and recovery process need to support.",
    tools: "Always On · Backup & restore · Recovery planning · GCP",
  },
  {
    number: "03",
    title: "Bringing control to database changes",
    body: "I have worked with Git, Azure DevOps, database projects, deployment packages, and review-driven releases. In an environment without a dependable source baseline, I captured the existing database objects, compared the differences, and helped make subsequent changes more traceable.",
    tools: "Git · Azure DevOps · DACPAC · Change review",
  },
  {
    number: "04",
    title: "Giving teams evidence they can use",
    body: "I build reporting, monitoring, and investigation tools that make it easier to understand a system. My ongoing QueryVault project preserves query-performance history across test-environment refreshes, so changes can be compared without giving developers unrestricted production access.",
    tools: "QueryVault · DMVs · Extended Events · Monitoring",
  },
];

export default function AboutPage() {
  return (
    <main className="founder-page">
      <SiteHeader currentPage="about" />
      <section className="about-hero studio-wrap">
        <div>
          <p className="eyebrow">The person behind Netherwood</p>
          <h1>Steven Wittek.</h1>
          <p className="about-role">
            Database engineer.
            <br />
            Practical problem solver.
          </p>
          <div className="long-form about-intro">
            <p>
              I help established businesses move beyond aging software without
              leaving their important history behind. I’m a database engineer
              and DBA who is comfortable getting into a messy existing system,
              finding how its data fits together and working out a practical
              path forward.
            </p>
            <p>
              I have worked in technology since 2009. Netherwood Data Partners
              brings experience with demanding production databases to smaller
              organizations that need that capability for a project.
            </p>
          </div>
          <a className="button button-primary" href="/migration-intake/">
            Tell me what you’re trying to replace{" "}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <Portrait />
      </section>
      <div className="founder-facts">
        <div className="studio-wrap">
          <span>
            <strong>Since 2009</strong>Hands-on technology experience
          </span>
          <span>
            <strong>New Jersey</strong>Independent & founder-led
          </span>
          <span>
            <strong>Direct involvement</strong>From discovery through handoff
          </span>
        </div>
      </div>
      <section className="about-section studio-wrap">
        <div>
          <p className="eyebrow">Why Netherwood</p>
          <h2>
            Big-company database experience.
            <br />
            Small-business practicality.
          </h2>
        </div>
        <div className="long-form">
          <p>
            My career has included long-term consulting and enterprise database
            engineering, including systems used for financial data and
            analytics. That work taught me to take reliability, change control,
            and the details seriously.
          </p>
          <p>
            Large companies have DBAs, data engineers, architects and migration
            specialists. Small businesses often face the same kinds of data
            problems without those teams. Years of customers, jobs, invoices and
            documents still need to arrive correctly in the replacement system.
          </p>
          <p>
            Netherwood makes that technical capability available on a project
            basis. You work directly with me to understand what exists, prepare
            the data, test the move and check the result. You choose the new
            platform; I work with your software provider to help you get there.
          </p>
        </div>
      </section>
      <section className="founder-experience">
        <div className="studio-wrap">
          <div className="founder-experience-heading">
            <p className="eyebrow">Selected professional experience</p>
            <h2>
              The depth behind
              <br />
              the migration work.
            </h2>
            <p>
              Examples from my engineering background and personal projects.
              These describe my experience, not a list of Netherwood clients or
              promised results.
            </p>
          </div>
          <div className="founder-experience-list">
            {experience.map((item) => (
              <article key={item.number}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <div>
                  <p>{item.body}</p>
                  <p className="founder-tools">{item.tools}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="about-section studio-wrap">
        <div>
          <p className="eyebrow">What working together looks like</p>
          <h2>
            Careful with your systems.
            <br />
            Straight with you.
          </h2>
        </div>
        <div className="long-form">
          <p>
            I want you to understand what I found, what I recommend, and what
            happens next. Before changing a system, we agree the scope, who owns
            what, and how we will check the result.
          </p>
          <p>
            I work with the people who know the day-to-day business and the
            vendors who know the software. That means translating between an
            employee’s “these invoices don’t look right” and the tables,
            relationships and import rules underneath. If a project needs
            another specialty, we discuss that scope together.
          </p>
          <p>
            Outside the technical work, I am a New Jersey local, a distance
            runner, and a family person. I value steady progress, clear
            communication, and finishing the work properly.
          </p>
          <a className="studio-text-link" href="/services/">
            Explore how I can help <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
      <section className="founder-contact">
        <div className="studio-wrap">
          <div>
            <p className="eyebrow">Start with a conversation</p>
            <h2>
              You do not need
              <br />
              all the answers yet.
            </h2>
          </div>
          <div>
            <p>
              Bring the old application, the new software you’ve selected or the
              database nobody quite understands. We can work out a useful
              starting point. Based in New Jersey, serving the Tri-State region
              and remote US projects where practical.
            </p>
            <a className="button button-light" href="/migration-intake/">
              Talk about your migration <span aria-hidden="true">↗</span>
            </a>
            <p className="founder-appointment">
              Remote & local engagements · Meetings by appointment
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
