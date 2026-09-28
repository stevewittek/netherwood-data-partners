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
              I help businesses get their software, data and systems working
              better together. I’m a database engineer and DBA who is
              comfortable getting into an unfamiliar application, finding how
              the information fits together and working through the problem with
              the people who use it.
            </p>
            <p>
              I have worked in technology since 2009. Netherwood Data Partners
              brings experience with demanding production databases to smaller
              organizations that need personal help with a project or ongoing
              support.
            </p>
          </div>
          <a className="button button-primary" href="/#contact">
            Tell me what you need help with <span aria-hidden="true">↗</span>
          </a>
        </div>
        <figure className="community-about-visual">
          <img
            src="/images/community/netherwood-station.webp"
            alt="The historic Netherwood station building in Plainfield, New Jersey"
            width={1536}
            height={1020}
            fetchPriority="high"
          />
          <figcaption>
            Local roots: Netherwood station. Photo by{" "}
            <a href="https://commons.wikimedia.org/wiki/File:NETHERWOOD_STATION,_UNION_COUNTY,_NJ.jpg">
              Jerrye & Roy Klotz MD
            </a>
            ,{" "}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/">
              CC BY-SA 4.0
            </a>
            . Resized and cropped for display.
          </figcaption>
        </figure>
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
            problems without those teams. Customer records, jobs, invoices and
            reports deserve the same care, whatever the size of the business.
          </p>
          <p>
            Netherwood makes that technical capability available on a project
            basis, with ongoing support where agreed. You work directly with me
            to understand the problem, agree a plan and check the result. That
            might mean fixing an integration, tuning a database or helping you
            move into a new platform.
          </p>
        </div>
      </section>
      <section className="founder-experience" id="professional-experience">
        <div className="studio-wrap">
          <div className="founder-experience-heading">
            <p className="eyebrow">Selected professional experience</p>
            <h2>
              The depth behind
              <br />
              the hands-on help.
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
            <a className="button button-light" href="/#contact">
              Talk about your business <span aria-hidden="true">↗</span>
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
