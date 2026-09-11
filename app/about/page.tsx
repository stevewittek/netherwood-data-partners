import type { Metadata } from "next";
import ChatWidget from "../ChatWidget";
import { Portrait } from "../components/Portrait";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import "./about.css";

export const metadata: Metadata = {
  title: "About Steven Wittek | Netherwood Data Partners",
  description: "Meet Steven Wittek, a New Jersey-based consultant helping small businesses with software changes, data migration, practical fixes and support.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Steven Wittek | Netherwood Data Partners",
    description: "Practical business systems and data support, grounded in more than 15 years of hands-on experience.",
    url: "/about",
  },
  twitter: {
    title: "About Steven Wittek | Netherwood Data Partners",
    description: "Practical business systems and data support, grounded in more than 15 years of hands-on experience.",
  },
};

const expertise = [
  { number: "01", title: "Software transitions", body: "Review an existing setup, plan new software, coordinate with providers, and test the everyday tasks your staff depend on." },
  { number: "02", title: "Data migration & reporting", body: "Data conversions, record validation, cleanup, integrations and reports that help a business understand its information." },
  { number: "03", title: "SQL Server & performance", body: "Execution plans, Query Store, waits, indexing, blocking and production troubleshooting when the database needs deeper investigation." },
  { number: "04", title: "Reliability & recovery", body: "Backup and recovery review, upgrade planning, monitoring and careful change sequencing for the systems behind your software." },
  { number: "05", title: "Support & handover", body: "Practical documentation, staff guidance, problem investigation and a clear plan for ongoing support or specialist escalation." },
];

export default function AboutPage() {
  return (
    <main>
      <SiteHeader currentPage="about" />

      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="eyebrow">About the founder</p>
          <h1>Steven Wittek</h1>
          <p className="about-role">Founder, Business Systems & Data Consultant</p>
          <div className="long-form about-intro">
            <p>
              I help business owners make sense of their software, move existing data into new systems, and sort out the problems that get in the way of daily work. I have worked in technology since 2009, with more than 15 years of hands-on experience supporting applications, databases and business systems.
            </p>
            <p>
              I started Netherwood Data Partners so an office, shop or service business could work directly with someone who understands both the technical detail and the need to keep the business operating. You can start with one problem, a software change or a review of the setup you inherited.
            </p>
          </div>
          <a className="button button-primary" href="/#contact">Work With Me</a>
        </div>
        <Portrait />
      </section>

      <section className="about-section about-background">
        <div className="about-section-title">
          <p className="eyebrow">Professional background</p>
          <h2>Technical depth behind practical business help</h2>
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
          <h2 id="expertise-title">From the first review to the support handoff.</h2>
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
              Netherwood Data Partners grew out of a simple idea: a small business should be able to get experienced technology help for a defined piece of work, with a clear explanation of what happens next.
            </p>
            <p>
              That might mean reviewing the software that comes with a business purchase, preparing records for a new application, fixing an unreliable report, or helping staff through a change. Sometimes it means investigating the SQL Server database underneath the application.
            </p>
            <p>
              I stay involved in the technical work and the handover. If a project needs networking, security, hardware or another specialty, I discuss the scope with you and coordinate with the appropriate provider. Responsibilities and any additional work are agreed before anyone starts.
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
          <h2>What would make your business easier to run?</h2>
        </div>
        <div className="about-contact-copy">
          <p>Tell me what you use today, what is getting in the way and what you want to change. You do not need to know which system is causing the problem.</p>
          <a className="button button-light" href="mailto:contact@netherwooddatapartners.com">Talk With Steven</a>
        </div>
      </section>

      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
