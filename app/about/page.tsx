import type { Metadata } from "next";
import ChatWidget from "../ChatWidget";
import { Portrait } from "../components/Portrait";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import "./about.css";

export const metadata: Metadata = {
  title: "About Steven Wittek | Netherwood Data Partners",
  description:
    "Meet Steven Wittek: database engineer, technology consultant, and founder of Netherwood. Hands-on experience since 2009, based in New Jersey.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Steven Wittek | Netherwood Data Partners",
    description:
      "Enterprise database experience. Personal, practical business technology help.",
    url: "/about",
  },
  twitter: {
    title: "About Steven Wittek | Netherwood Data Partners",
    description:
      "Enterprise database experience. Personal, practical business technology help.",
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
              I help people make sense of the systems their businesses depend
              on. Sometimes that means getting deep into a SQL execution plan.
              Sometimes it means helping an owner move years of records into
              software that better fits the way they work.
            </p>
            <p>
              I have worked in technology since 2009. Netherwood Data Partners
              brings that hands-on experience into a direct, personal consulting
              relationship.
            </p>
          </div>
          <a className="button button-primary" href="/#contact">
            Tell me what you’re working on <span aria-hidden="true">↗</span>
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
            Good technology help
            <br />
            should feel human.
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
            Those habits matter outside a large technology team, too. A
            neighborhood business still needs trustworthy records. An owner
            changing software still needs a sensible migration plan. A small
            development team still needs someone who understands the database
            underneath its application.
          </p>
          <p>
            I built Netherwood around that connection: technical depth,
            explained clearly, with the person doing the work directly involved.
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
              the day-to-day help.
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
            I can work alongside your existing IT company, software provider, or
            development team. If a problem needs a different specialist, I will
            explain the boundary and discuss the next step with you.
          </p>
          <p>
            Outside the technical work, I am a New Jersey local, a distance
            runner, and a family person. I value steady progress, clear
            communication, and finishing the work properly.
          </p>
          <a className="studio-text-link" href="/#services">
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
              Bring the slow system, the software change, the database question,
              or the setup you inherited. We can work out a useful starting
              point.
            </p>
            <a className="button button-light" href="/#contact">
              Let’s talk <span aria-hidden="true">↗</span>
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
